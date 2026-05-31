/**
 * Integration tests — firebaseService
 * -------------------------------------
 * Tests Firebase REST API wrappers by mocking global fetch.
 * Verifies correct URL construction, payload shape, and error handling
 * without making real network calls.
 */

import {
  firebaseEmailPassword,
  firebaseAnonymousSignIn,
  syncHistoryToFirestore,
  syncSettingsToFirestore,
  syncCouncilMetaToFirestore,
} from '../../services/firebaseService';
import { AppSettings, AuthSession, ScanHistoryEntry } from '../../types';

// ── Environment setup ─────────────────────────────────────────────────────────

beforeAll(() => {
  // Provide valid-looking env vars so assertFirebaseConfig() passes
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'test-api-key-1234';
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'ecosort-test-project';
});

afterAll(() => {
  delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetch(body: object, ok = true) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    json: async () => body,
  } as Response);
}

const MOCK_SESSION: AuthSession = {
  email: 'test@example.com',
  idToken: 'mock-id-token',
  localId: 'mock-local-id',
};

const MOCK_HISTORY: ScanHistoryEntry[] = [
  {
    id: 'entry-1',
    item: 'battery',
    ruleId: 'yarra-battery',
    council: 'Yarra Council',
    binLabel: 'Drop-off only',
    source: 'manual',
    timestamp: new Date().toISOString(),
    points: 18,
    co2EstimateKg: 0.25,
    storedData: 'Privacy note.',
  },
];

const MOCK_SETTINGS: AppSettings = {
  privacyMode: true,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: 'Yarra Council',
  notificationScheduledAt: null,
};

// ── firebaseEmailPassword ─────────────────────────────────────────────────────

describe('firebaseEmailPassword', () => {
  test('signUp — returns session with email and idToken on success', async () => {
    mockFetch({ email: 'user@test.com', idToken: 'tok123', localId: 'uid456' });
    const session = await firebaseEmailPassword('signUp', 'user@test.com', 'password1');
    expect(session.email).toBe('user@test.com');
    expect(session.idToken).toBe('tok123');
    expect(session.localId).toBe('uid456');
  });

  test('signInWithPassword — throws friendly error on INVALID_LOGIN_CREDENTIALS', async () => {
    mockFetch({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } }, false);
    await expect(
      firebaseEmailPassword('signInWithPassword', 'bad@test.com', 'wrong'),
    ).rejects.toThrow(/account/i);
  });

  test('throws friendly error on EMAIL_EXISTS during signUp', async () => {
    mockFetch({ error: { message: 'EMAIL_EXISTS' } }, false);
    await expect(
      firebaseEmailPassword('signUp', 'taken@test.com', 'password1'),
    ).rejects.toThrow(/already registered/i);
  });
});

// ── firebaseAnonymousSignIn ───────────────────────────────────────────────────

describe('firebaseAnonymousSignIn', () => {
  test('returns session with email "anonymous"', async () => {
    mockFetch({ idToken: 'anon-tok', localId: 'anon-uid' });
    const session = await firebaseAnonymousSignIn();
    expect(session.email).toBe('anonymous');
    expect(session.idToken).toBe('anon-tok');
  });

  test('throws if response is not ok', async () => {
    mockFetch({ error: { message: 'OPERATION_NOT_ALLOWED' } }, false);
    await expect(firebaseAnonymousSignIn()).rejects.toThrow();
  });
});

// ── syncHistoryToFirestore ────────────────────────────────────────────────────

describe('syncHistoryToFirestore', () => {
  test('resolves to an ISO date string on success', async () => {
    mockFetch({ writeResults: [] });
    const at = await syncHistoryToFirestore(MOCK_SESSION, MOCK_HISTORY);
    expect(() => new Date(at)).not.toThrow();
    expect(new Date(at).getTime()).not.toBeNaN();
  });

  test('calls fetch with the commit endpoint', async () => {
    mockFetch({ writeResults: [] });
    await syncHistoryToFirestore(MOCK_SESSION, MOCK_HISTORY);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/documents:commit');
    expect(url).toContain(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  });

  test('throws a friendly error when Firestore returns an error', async () => {
    mockFetch({ error: { message: 'PERMISSION_DENIED' } }, false);
    await expect(syncHistoryToFirestore(MOCK_SESSION, MOCK_HISTORY)).rejects.toThrow();
  });
});

// ── syncSettingsToFirestore ───────────────────────────────────────────────────

describe('syncSettingsToFirestore', () => {
  test('resolves to an ISO date string on success', async () => {
    mockFetch({ name: 'settings-doc', fields: {} });
    const at = await syncSettingsToFirestore(MOCK_SESSION, MOCK_SETTINGS);
    expect(new Date(at).getTime()).not.toBeNaN();
  });

  test('calls fetch with a PATCH request to the settings document', async () => {
    mockFetch({ name: 'settings-doc', fields: {} });
    await syncSettingsToFirestore(MOCK_SESSION, MOCK_SETTINGS);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain(`/users/${MOCK_SESSION.localId}/userData/settings`);
    expect(options.method).toBe('PATCH');
  });
});

// ── syncCouncilMetaToFirestore ────────────────────────────────────────────────

describe('syncCouncilMetaToFirestore', () => {
  test('resolves to an ISO date string on success', async () => {
    mockFetch({ name: 'councilMeta-doc', fields: {} });
    const at = await syncCouncilMetaToFirestore(MOCK_SESSION, 'Yarra Council');
    expect(new Date(at).getTime()).not.toBeNaN();
  });

  test('includes council name in request body', async () => {
    mockFetch({ name: 'councilMeta-doc', fields: {} });
    await syncCouncilMetaToFirestore(MOCK_SESSION, 'Melbourne City Council');
    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.fields.council.stringValue).toBe('Melbourne City Council');
  });
});
