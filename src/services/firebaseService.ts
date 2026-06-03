import { AppSettings, ScanHistoryEntry, AuthSession, SearchSource } from '../types';
import { friendlyFirebaseError } from '../utils/errorMessages';

function getFirebaseConfig(): { API_KEY: string; PROJECT_ID: string } {
  const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';
  const PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';
  if (!API_KEY || !PROJECT_ID || API_KEY.includes('replace')) {
    throw new Error('Online account setup is unavailable right now.');
  }
  return { API_KEY, PROJECT_ID };
}

const FIRESTORE_SETTINGS_DEFAULTS: AppSettings = {
  privacyMode: true,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: null,
  notificationScheduledAt: null,
};

export function createLocalAnonymousSession(): AuthSession {
  return {
    email: 'local-anonymous',
    idToken: 'local-only',
    localId: 'local-user',
    mode: 'local',
  };
}

export function isLocalAuthSession(session: AuthSession | null | undefined): boolean {
  return session?.mode === 'local' || session?.idToken === 'local-only';
}

function assertCloudSession(session: AuthSession): void {
  if (isLocalAuthSession(session)) {
    throw new Error('This guest profile is saved on this device only. Sign in to keep your data available on another device.');
  }
}

// ─── Authentication ────────────────────────────────────────────────────────────

export async function firebaseEmailPassword(
  action: 'signUp' | 'signInWithPassword',
  email: string,
  password: string,
): Promise<AuthSession> {
  try {
    const { API_KEY } = getFirebaseConfig();
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Sign-in failed');
    return { email: payload.email, idToken: payload.idToken, localId: payload.localId, mode: 'firebase' };
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

/** Sign in anonymously – no email or password required. */
export async function firebaseAnonymousSignIn(): Promise<AuthSession> {
  try {
    const { API_KEY } = getFirebaseConfig();
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Anonymous sign-in failed');
    return { email: 'anonymous', idToken: payload.idToken, localId: payload.localId, mode: 'firebase' };
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

// ─── Firestore value helpers ───────────────────────────────────────────────────

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string | number;
  doubleValue?: number | string;
  booleanValue?: boolean;
  nullValue?: null;
};

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  updateTime?: string;
  createTime?: string;
};

function valueToString(value: FirestoreValue | undefined, fallback = ''): string {
  if (!value) return fallback;
  if (typeof value.stringValue === 'string') return value.stringValue;
  if (typeof value.integerValue !== 'undefined') return String(value.integerValue);
  if (typeof value.doubleValue !== 'undefined') return String(value.doubleValue);
  if (typeof value.booleanValue === 'boolean') return String(value.booleanValue);
  return fallback;
}

function valueToNumber(value: FirestoreValue | undefined, fallback = 0): number {
  if (!value) return fallback;
  const raw = value.doubleValue ?? value.integerValue;
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function valueToBoolean(value: FirestoreValue | undefined, fallback = false): boolean {
  if (!value) return fallback;
  if (typeof value.booleanValue === 'boolean') return value.booleanValue;
  if (typeof value.stringValue === 'string') return value.stringValue.toLowerCase() === 'true';
  return fallback;
}

function valueToNullableString(value: FirestoreValue | undefined): string | null {
  if (!value || 'nullValue' in value) return null;
  const parsed = valueToString(value, '').trim();
  return parsed ? parsed : null;
}

function valueToThemeMode(value: FirestoreValue | undefined): 'light' | 'dark' {
  return valueToString(value, FIRESTORE_SETTINGS_DEFAULTS.themeMode) === 'dark' ? 'dark' : 'light';
}

function valueToSource(value: FirestoreValue | undefined): SearchSource {
  const parsed = valueToString(value, 'manual');
  return parsed === 'camera' || parsed === 'location' || parsed === 'location-demo' ? parsed : 'manual';
}

function readHistoryDocument(doc: FirestoreDocument): ScanHistoryEntry | null {
  const fields = doc.fields ?? {};
  const idFromName = doc.name?.split('/').pop();
  const id = valueToString(fields.id, idFromName || '').trim();
  const item = valueToString(fields.item).trim();
  const ruleId = valueToString(fields.ruleId).trim();
  const council = valueToString(fields.council).trim();
  const binLabel = valueToString(fields.binLabel).trim();
  const timestamp = valueToString(fields.timestamp, doc.updateTime || doc.createTime || new Date().toISOString()).trim();

  if (!id || !item || !ruleId || !council || !binLabel) return null;

  return {
    id,
    item,
    ruleId,
    council,
    binLabel,
    source: valueToSource(fields.source),
    timestamp,
    points: Math.round(valueToNumber(fields.points, 0)),
    co2EstimateKg: valueToNumber(fields.co2EstimateKg, 0),
    storedData: valueToString(fields.storedData, ''),
  };
}

function settingsFromFields(fields: Record<string, FirestoreValue> | undefined): AppSettings | null {
  if (!fields) return null;
  return {
    ...FIRESTORE_SETTINGS_DEFAULTS,
    privacyMode: valueToBoolean(fields.privacyMode, FIRESTORE_SETTINGS_DEFAULTS.privacyMode),
    offlineDemo: valueToBoolean(fields.offlineDemo, FIRESTORE_SETTINGS_DEFAULTS.offlineDemo),
    themeMode: valueToThemeMode(fields.themeMode),
    textScale: valueToNumber(fields.textScale, FIRESTORE_SETTINGS_DEFAULTS.textScale),
    cachedRulesSyncedAt: valueToNullableString(fields.cachedRulesSyncedAt),
    locationCouncil: valueToNullableString(fields.locationCouncil),
    notificationScheduledAt: valueToNullableString(fields.notificationScheduledAt),
  };
}

function firestoreHeaders(session: AuthSession): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.idToken}` };
}

// ─── Firestore – scan history ──────────────────────────────────────────────────

export function mergeScanHistories(
  localHistory: ScanHistoryEntry[],
  remoteHistory: ScanHistoryEntry[],
  limit = 20,
): ScanHistoryEntry[] {
  const byId = new Map<string, ScanHistoryEntry>();
  [...remoteHistory, ...localHistory].forEach((entry) => {
    if (!entry?.id) return;
    const existing = byId.get(entry.id);
    if (!existing || new Date(entry.timestamp).getTime() >= new Date(existing.timestamp).getTime()) {
      byId.set(entry.id, entry);
    }
  });

  return Array.from(byId.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function syncHistoryToFirestore(
  session: AuthSession,
  history: ScanHistoryEntry[],
): Promise<string> {
  try {
    assertCloudSession(session);
    const { PROJECT_ID } = getFirebaseConfig();
    const writes = history.slice(0, 20).map((entry) => ({
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/scanHistory/${entry.id}`,
        fields: {
          id:            { stringValue:  entry.id },
          item:          { stringValue:  entry.item },
          ruleId:        { stringValue:  entry.ruleId },
          council:       { stringValue:  entry.council },
          binLabel:      { stringValue:  entry.binLabel },
          source:        { stringValue:  entry.source },
          timestamp:     { stringValue:  entry.timestamp },
          points:        { integerValue: entry.points },
          co2EstimateKg: { doubleValue:  entry.co2EstimateKg },
          storedData:    { stringValue:  entry.storedData },
        },
      },
    }));

    if (writes.length === 0) return new Date().toISOString();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: firestoreHeaders(session),
        body: JSON.stringify({ writes }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Backup failed');
    return new Date().toISOString();
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

export async function loadHistoryFromFirestore(session: AuthSession): Promise<ScanHistoryEntry[]> {
  try {
    assertCloudSession(session);
    const { PROJECT_ID } = getFirebaseConfig();
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/scanHistory?pageSize=20&orderBy=timestamp%20desc`,
      { method: 'GET', headers: firestoreHeaders(session) },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Saved history could not be restored');

    return (Array.isArray(payload?.documents) ? payload.documents : [])
      .map((doc: FirestoreDocument) => readHistoryDocument(doc))
      .filter((entry: ScanHistoryEntry | null): entry is ScanHistoryEntry => Boolean(entry));
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

// ─── Firestore – user settings ─────────────────────────────────────────────────

export async function syncSettingsToFirestore(
  session: AuthSession,
  settings: AppSettings,
): Promise<string> {
  try {
    assertCloudSession(session);
    const { PROJECT_ID } = getFirebaseConfig();

    const fields: Record<string, unknown> = {};
    (Object.entries(settings) as [string, unknown][]).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (typeof value === 'number') {
        fields[key] = { doubleValue: value };
      } else if (value === null || value === undefined) {
        fields[key] = { nullValue: null };
      } else {
        fields[key] = { stringValue: String(value) };
      }
    });

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/userData/settings`,
      {
        method: 'PATCH',
        headers: firestoreHeaders(session),
        body: JSON.stringify({ fields }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Preferences could not be saved');
    return new Date().toISOString();
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

export async function loadSettingsFromFirestore(session: AuthSession): Promise<AppSettings | null> {
  try {
    assertCloudSession(session);
    const { PROJECT_ID } = getFirebaseConfig();
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/userData/settings`,
      { method: 'GET', headers: firestoreHeaders(session) },
    );
    const payload = await response.json();
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(payload?.error?.message || 'Settings restore failed');
    return settingsFromFields(payload?.fields);
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

// ─── Firestore – council rules sync metadata ───────────────────────────────────

export async function syncCouncilMetaToFirestore(
  session: AuthSession,
  council: string,
): Promise<string> {
  try {
    assertCloudSession(session);
    const { PROJECT_ID } = getFirebaseConfig();
    const syncedAt = new Date().toISOString();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/userData/councilMeta`,
      {
        method: 'PATCH',
        headers: firestoreHeaders(session),
        body: JSON.stringify({
          fields: {
            council:      { stringValue: council },
            syncedAt:     { stringValue: syncedAt },
            rulesVersion: { stringValue: '1.0' },
          },
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Guidance update failed');
    return syncedAt;
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}
