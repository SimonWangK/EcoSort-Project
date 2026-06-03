/**
 * Component tests — AccountScreen
 * ----------------------------------
 * Tests profile display, sync button calls, and sign-out behaviour.
 * Firebase calls are mocked so no real network requests are made.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccountScreen } from '../../screens/AccountScreen';
import { AppSettings, AuthSession, ScanHistoryEntry } from '../../types';

// ── Mock Firebase service ─────────────────────────────────────────────────────

jest.mock('../../services/firebaseService', () => ({
  syncHistoryToFirestore:  jest.fn().mockResolvedValue(new Date().toISOString()),
  syncSettingsToFirestore: jest.fn().mockResolvedValue(new Date().toISOString()),
  syncCouncilMetaToFirestore: jest.fn().mockResolvedValue(new Date().toISOString()),
  isLocalAuthSession: jest.fn(() => false),
}));

import {
  syncHistoryToFirestore,
  syncSettingsToFirestore,
  syncCouncilMetaToFirestore,
} from '../../services/firebaseService';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SESSION: AuthSession = {
  email: 'eco@test.com',
  idToken: 'tok-123',
  localId: 'uid-abc',
};

const ANON_SESSION: AuthSession = {
  email: 'anonymous',
  idToken: 'anon-tok',
  localId: 'anon-uid',
};

const SETTINGS: AppSettings = {
  privacyMode: true,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: 'Yarra Council',
  notificationScheduledAt: null,
};

const HISTORY: ScanHistoryEntry[] = [
  {
    id: 'e1',
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

function renderAccount(opts: {
  session?: AuthSession | null;
  settings?: AppSettings;
  history?: ScanHistoryEntry[];
  onSignOut?: jest.Mock;
  onBack?: jest.Mock;
} = {}) {
  const onSignOut = opts.onSignOut ?? jest.fn();
  const onBack = opts.onBack ?? jest.fn();
  return {
    ...render(
      <AccountScreen
        session={opts.session ?? SESSION}
        settings={opts.settings ?? SETTINGS}
        history={opts.history ?? HISTORY}
        onSignOut={onSignOut}
        onBack={onBack}
      />,
    ),
    onSignOut,
    onBack,
  };
}

// ── Render tests ──────────────────────────────────────────────────────────────

describe('AccountScreen — render', () => {
  test('shows the account email for a signed-in user', () => {
    const { getByText } = renderAccount({ session: SESSION });
    expect(getByText('eco@test.com')).toBeTruthy();
  });

  test('shows "Private account" for a private user', () => {
    const { getAllByText } = renderAccount({ session: ANON_SESSION });
    const matches = getAllByText('Private account');
    expect(matches.length).toBeGreaterThan(0);
  });

  test('renders all three sync buttons', () => {
    const { getByText } = renderAccount();
    expect(getByText('Back up history')).toBeTruthy();
    expect(getByText('Save preferences')).toBeTruthy();
    expect(getByText('Update guidance')).toBeTruthy();
  });

  test('renders Sign out button', () => {
    const { getByText } = renderAccount();
    expect(getByText('Sign out')).toBeTruthy();
  });

  test('renders Back button', () => {
    const { getByText } = renderAccount();
    expect(getByText('Back')).toBeTruthy();
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('AccountScreen — navigation', () => {
  test('pressing Back calls onBack', () => {
    const { onBack, getByText } = renderAccount();
    fireEvent.press(getByText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('pressing Sign out calls onSignOut', () => {
    const { onSignOut, getByText } = renderAccount();
    fireEvent.press(getByText('Sign out'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

// ── Sync operations ───────────────────────────────────────────────────────────

describe('AccountScreen — sync history', () => {
  beforeEach(() => jest.clearAllMocks());

  test('pressing Back up history calls syncHistoryToFirestore', async () => {
    const { getByText } = renderAccount();
    fireEvent.press(getByText('Back up history'));
    await waitFor(() => {
      expect(syncHistoryToFirestore).toHaveBeenCalledWith(SESSION, HISTORY);
    });
  });

  test('history backup updates status text to include records count', async () => {
    const { getByText } = renderAccount();
    fireEvent.press(getByText('Back up history'));
    await waitFor(() => {
      expect(getByText(/1 records backed up/i)).toBeTruthy();
    });
  });
});

describe('AccountScreen — sync settings', () => {
  beforeEach(() => jest.clearAllMocks());

  test('pressing Save preferences calls syncSettingsToFirestore', async () => {
    const { getByText } = renderAccount();
    fireEvent.press(getByText('Save preferences'));
    await waitFor(() => {
      expect(syncSettingsToFirestore).toHaveBeenCalledWith(SESSION, SETTINGS);
    });
  });

  test('saving preferences updates status text', async () => {
    const { getByText } = renderAccount();
    fireEvent.press(getByText('Save preferences'));
    await waitFor(() => {
      expect(getByText(/saved at/i)).toBeTruthy();
    });
  });
});

describe('AccountScreen — sync council data', () => {
  beforeEach(() => jest.clearAllMocks());

  test('pressing Update guidance calls syncCouncilMetaToFirestore', async () => {
    const { getByText } = renderAccount();
    fireEvent.press(getByText('Update guidance'));
    await waitFor(() => {
      expect(syncCouncilMetaToFirestore).toHaveBeenCalledWith(SESSION, 'Yarra Council');
    });
  });
});

// ── No session guard ──────────────────────────────────────────────────────────

describe('AccountScreen — no session', () => {
  test('renders without crashing when session is null', () => {
    expect(() => renderAccount({ session: null })).not.toThrow();
  });
});
