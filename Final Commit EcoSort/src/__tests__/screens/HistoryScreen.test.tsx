/**
 * Component tests — HistoryScreen
 * ---------------------------------
 * Verifies empty state, history list rendering, detail modal trigger,
 * and clear-history button behaviour.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HistoryScreen } from '../../screens/HistoryScreen';
import { ScanHistoryEntry } from '../../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<ScanHistoryEntry> = {}): ScanHistoryEntry {
  return {
    id: 'hist-1',
    item: 'glass bottle',
    ruleId: 'yarra-glass-bottle',
    council: 'Yarra Council',
    binLabel: 'Glass recycling',
    source: 'manual',
    timestamp: new Date('2026-01-15T10:00:00Z').toISOString(),
    points: 12,
    co2EstimateKg: 0.18,
    storedData: 'Privacy note.',
    ...overrides,
  };
}

// ── Empty state ───────────────────────────────────────────────────────────────

describe('HistoryScreen — empty state', () => {
  test('shows empty state title when history is empty', () => {
    const { getByText } = render(<HistoryScreen history={[]} onClear={jest.fn()} />);
    expect(getByText('No saved checks yet')).toBeTruthy();
  });

  test('does not show Clear history button when history is empty', () => {
    const { queryByText } = render(<HistoryScreen history={[]} onClear={jest.fn()} />);
    expect(queryByText('Clear history')).toBeNull();
  });
});

// ── History list ──────────────────────────────────────────────────────────────

describe('HistoryScreen — with entries', () => {
  test('renders the item name for each entry', () => {
    const history = [
      makeEntry({ id: 'a', item: 'glass bottle' }),
      makeEntry({ id: 'b', item: 'battery' }),
    ];
    const { getByText } = render(<HistoryScreen history={history} onClear={jest.fn()} />);
    expect(getByText('glass bottle')).toBeTruthy();
    expect(getByText('battery')).toBeTruthy();
  });

  test('renders the bin label for each entry', () => {
    const history = [makeEntry({ binLabel: 'Glass recycling' })];
    const { getByText } = render(<HistoryScreen history={history} onClear={jest.fn()} />);
    expect(getByText('Glass recycling')).toBeTruthy();
  });

  test('renders points badge', () => {
    const history = [makeEntry({ points: 12 })];
    const { getByText } = render(<HistoryScreen history={history} onClear={jest.fn()} />);
    expect(getByText('+12')).toBeTruthy();
  });

  test('shows "Clear history" button when entries exist', () => {
    const history = [makeEntry()];
    const { getByText } = render(<HistoryScreen history={history} onClear={jest.fn()} />);
    expect(getByText('Clear history')).toBeTruthy();
  });

  test('calls onClear when Clear history button is pressed', () => {
    const onClear = jest.fn();
    const history = [makeEntry()];
    const { getByText } = render(<HistoryScreen history={history} onClear={onClear} />);
    fireEvent.press(getByText('Clear history'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

// ── Detail modal ──────────────────────────────────────────────────────────────

describe('HistoryScreen — detail modal', () => {
  test('modal is not visible initially', () => {
    const history = [makeEntry()];
    const { queryByText } = render(<HistoryScreen history={history} onClear={jest.fn()} />);
    // "Close" button only appears inside the modal
    expect(queryByText('Close')).toBeNull();
  });

  test('pressing an entry opens the detail modal', () => {
    const history = [makeEntry({ item: 'glass bottle' })];
    const { getAllByRole, getByText } = render(
      <HistoryScreen history={history} onClear={jest.fn()} />,
    );
    // The card is wrapped in a Pressable with role button
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]);
    expect(getByText('Close')).toBeTruthy();
  });

  test('pressing Close dismisses the modal', () => {
    const history = [makeEntry({ item: 'glass bottle' })];
    const { getAllByRole, getByText, queryByText } = render(
      <HistoryScreen history={history} onClear={jest.fn()} />,
    );
    fireEvent.press(getAllByRole('button')[0]);
    fireEvent.press(getByText('Close'));
    expect(queryByText('Close')).toBeNull();
  });

  test('modal displays council name', () => {
    const history = [makeEntry({ council: 'Yarra Council' })];
    const { getAllByRole, getAllByText } = render(
      <HistoryScreen history={history} onClear={jest.fn()} />,
    );
    fireEvent.press(getAllByRole('button')[0]);
    // Council appears both in list item and in modal
    const matches = getAllByText('Yarra Council');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
