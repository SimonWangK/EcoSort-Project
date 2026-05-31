/**
 * Component tests — SettingsScreen
 * ----------------------------------
 * Verifies that all Settings modules render correctly and that
 * user interactions trigger the expected callbacks.
 *
 * Native modules (Switch, Pressable, icons) are handled by the
 * jest-expo preset and @testing-library/react-native.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../../screens/SettingsScreen';
import { AppSettings } from '../../types';

// ── Fixture ───────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  privacyMode: false,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: null,
  notificationScheduledAt: null,
};

function renderSettings(overrides: {
  settings?: Partial<AppSettings>;
  onChange?: jest.Mock;
  navigate?: jest.Mock;
  onScheduleReminder?: jest.Mock;
} = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...overrides.settings };
  const onChange = overrides.onChange ?? jest.fn();
  const navigate = overrides.navigate ?? jest.fn();
  const onScheduleReminder = overrides.onScheduleReminder ?? jest.fn();

  return {
    ...render(
      <SettingsScreen
        settings={settings}
        onChange={onChange}
        navigate={navigate}
        onScheduleReminder={onScheduleReminder}
      />,
    ),
    onChange,
    navigate,
    onScheduleReminder,
  };
}

// ── Render tests ──────────────────────────────────────────────────────────────

describe('SettingsScreen — render', () => {
  test('renders the screen title', () => {
    const { getByText } = renderSettings();
    expect(getByText('Controls')).toBeTruthy();
  });

  test('renders Privacy and Offline toggles', () => {
    const { getByText } = renderSettings();
    expect(getByText('Privacy')).toBeTruthy();
    expect(getByText('Offline')).toBeTruthy();
  });

  test('renders text scale section', () => {
    const { getByText } = renderSettings();
    expect(getByText('Reading size')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
    expect(getByText('A+')).toBeTruthy();
    expect(getByText('A++')).toBeTruthy();
  });

  test('renders Preferences section with all three items', () => {
    const { getByText } = renderSettings();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Device')).toBeTruthy();
    expect(getByText('Account')).toBeTruthy();
  });

  test('renders Reminder row', () => {
    const { getByText } = renderSettings();
    expect(getByText('Reminder')).toBeTruthy();
  });

  test('shows "Not scheduled yet" when no reminder is set', () => {
    const { getByText } = renderSettings({ settings: { notificationScheduledAt: null } });
    expect(getByText('Not scheduled yet')).toBeTruthy();
  });

  test('shows formatted date when a reminder is scheduled', () => {
    const isoDate = '2026-06-01T09:00:00.000Z';
    const { queryByText } = renderSettings({ settings: { notificationScheduledAt: isoDate } });
    // The formatted date should NOT be "Not scheduled yet"
    expect(queryByText('Not scheduled yet')).toBeNull();
  });
});

// ── Privacy toggle ────────────────────────────────────────────────────────────

describe('SettingsScreen — Privacy toggle', () => {
  test('calls onChange with privacyMode toggled to true', () => {
    const { onChange, getAllByRole } = renderSettings({ settings: { privacyMode: false } });
    // The first Switch is the Privacy toggle
    const switches = getAllByRole('switch');
    fireEvent(switches[0], 'onValueChange', true);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ privacyMode: true }));
  });

  test('calls onChange with privacyMode toggled to false', () => {
    const { onChange, getAllByRole } = renderSettings({ settings: { privacyMode: true } });
    const switches = getAllByRole('switch');
    fireEvent(switches[0], 'onValueChange', false);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ privacyMode: false }));
  });
});

// ── Offline toggle ────────────────────────────────────────────────────────────

describe('SettingsScreen — Offline toggle', () => {
  test('calls onChange with offlineDemo toggled to true', () => {
    const { onChange, getAllByRole } = renderSettings({ settings: { offlineDemo: false } });
    const switches = getAllByRole('switch');
    fireEvent(switches[1], 'onValueChange', true);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ offlineDemo: true }));
  });
});

// ── Text scale segment control ────────────────────────────────────────────────

describe('SettingsScreen — Text scale', () => {
  test('pressing A+ calls onChange with textScale 1', () => {
    const { onChange, getByText } = renderSettings({ settings: { textScale: 0.95 } });
    fireEvent.press(getByText('A+'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ textScale: 1 }));
  });

  test('pressing A++ calls onChange with textScale 1.12', () => {
    const { onChange, getByText } = renderSettings();
    fireEvent.press(getByText('A++'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ textScale: 1.12 }));
  });

  test('pressing A calls onChange with textScale 0.95', () => {
    const { onChange, getByText } = renderSettings({ settings: { textScale: 1 } });
    fireEvent.press(getByText('A'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ textScale: 0.95 }));
  });
});

// ── Navigation callbacks ──────────────────────────────────────────────────────

describe('SettingsScreen — navigation', () => {
  test('pressing Location row navigates to "location"', () => {
    const { navigate, getByText } = renderSettings();
    fireEvent.press(getByText('Location'));
    expect(navigate).toHaveBeenCalledWith('location');
  });

  test('pressing Device row navigates to "device"', () => {
    const { navigate, getByText } = renderSettings();
    fireEvent.press(getByText('Device'));
    expect(navigate).toHaveBeenCalledWith('device');
  });

  test('pressing Account row navigates to "account"', () => {
    const { navigate, getByText } = renderSettings();
    fireEvent.press(getByText('Account'));
    expect(navigate).toHaveBeenCalledWith('account');
  });
});

// ── Reminder callback ─────────────────────────────────────────────────────────

describe('SettingsScreen — reminder button', () => {
  test('pressing the add button calls onScheduleReminder', () => {
    const { onScheduleReminder, getByRole } = renderSettings();
    // Target the reminder add button by its accessibilityLabel (avoids
    // ambiguity with A++ which also contains a "+" character).
    const addBtn = getByRole('button', { name: /add reminder/i });
    fireEvent.press(addBtn);
    expect(onScheduleReminder).toHaveBeenCalledTimes(1);
  });

  test('onScheduleReminder prop is a function', () => {
    const { onScheduleReminder } = renderSettings();
    expect(typeof onScheduleReminder).toBe('function');
  });
});
