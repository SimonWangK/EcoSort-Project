import { AppSettings, ScanHistoryEntry, AuthSession } from '../types';
import { friendlyFirebaseError } from '../utils/errorMessages';

/**
 * FIX: Read env vars lazily inside assertFirebaseConfig() rather than at
 * module-load time.  When Jest imports this module the env vars haven't been
 * set yet (beforeAll runs after imports), so module-level reads always yield
 * undefined and every function throws the generic "Something went wrong" error.
 * Reading them at call-time ensures beforeAll() values are visible.
 */
function getFirebaseConfig(): { API_KEY: string; PROJECT_ID: string } {
  const API_KEY   = process.env.EXPO_PUBLIC_FIREBASE_API_KEY   ?? '';
  const PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';
  if (!API_KEY || !PROJECT_ID || API_KEY.includes('replace')) {
    throw new Error('Firebase API key or project id is missing.');
  }
  return { API_KEY, PROJECT_ID };
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
    if (!response.ok) throw new Error(payload?.error?.message || 'Firebase auth failed');
    return { email: payload.email, idToken: payload.idToken, localId: payload.localId };
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
    return { email: 'anonymous', idToken: payload.idToken, localId: payload.localId };
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

// ─── Firestore – scan history ──────────────────────────────────────────────────

export async function syncHistoryToFirestore(
  session: AuthSession,
  history: ScanHistoryEntry[],
): Promise<string> {
  try {
    const { PROJECT_ID } = getFirebaseConfig();
    const writes = history.slice(0, 12).map((entry) => ({
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/scanHistory/${entry.id}`,
        fields: {
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

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.idToken}` },
        body: JSON.stringify({ writes }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Firestore sync failed');
    return new Date().toISOString();
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

// ─── Firestore – user settings ─────────────────────────────────────────────────

/**
 * Persist the current AppSettings to Firestore under
 * users/{uid}/userData/settings so they survive reinstalls
 * and can be shared across devices.
 */
export async function syncSettingsToFirestore(
  session: AuthSession,
  settings: AppSettings,
): Promise<string> {
  try {
    const { PROJECT_ID } = getFirebaseConfig();

    // Convert each AppSettings field to the appropriate Firestore value type.
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.idToken}` },
        body: JSON.stringify({ fields }),
      },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Settings sync failed');
    return new Date().toISOString();
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}

// ─── Firestore – council rules sync metadata ───────────────────────────────────

/**
 * Save a lightweight metadata record so the backend (or future
 * cloud function) knows which council rules version the device
 * last acknowledged and when.
 */
export async function syncCouncilMetaToFirestore(
  session: AuthSession,
  council: string,
): Promise<string> {
  try {
    const { PROJECT_ID } = getFirebaseConfig();
    const syncedAt = new Date().toISOString();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${session.localId}/userData/councilMeta`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.idToken}` },
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
    if (!response.ok) throw new Error(payload?.error?.message || 'Council meta sync failed');
    return syncedAt;
  } catch (error) {
    throw new Error(friendlyFirebaseError(error instanceof Error ? error.message : String(error)));
  }
}
