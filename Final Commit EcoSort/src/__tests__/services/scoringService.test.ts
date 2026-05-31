/**
 * Unit tests — scoringService
 * ----------------------------
 * Tests calculateTotalPoints, calculateTotalCo2, and formatKg
 * using plain in-memory ScanHistoryEntry objects (no mocks needed).
 */

import {
  calculateTotalCo2,
  calculateTotalPoints,
  formatKg,
} from '../../services/scoringService';
import { ScanHistoryEntry } from '../../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<ScanHistoryEntry> = {}): ScanHistoryEntry {
  return {
    id: 'test-id',
    item: 'glass bottle',
    ruleId: 'yarra-glass-bottle',
    council: 'Yarra Council',
    binLabel: 'Glass recycling',
    source: 'manual',
    timestamp: new Date().toISOString(),
    points: 10,
    co2EstimateKg: 0.18,
    storedData: 'Only item metadata stored.',
    ...overrides,
  };
}

// ── calculateTotalPoints ──────────────────────────────────────────────────────

describe('calculateTotalPoints', () => {
  test('returns 0 for an empty history', () => {
    expect(calculateTotalPoints([])).toBe(0);
  });

  test('sums points from a single entry', () => {
    expect(calculateTotalPoints([makeEntry({ points: 12 })])).toBe(12);
  });

  test('sums points across multiple entries', () => {
    const history = [
      makeEntry({ points: 8 }),
      makeEntry({ points: 12 }),
      makeEntry({ points: 18 }),
    ];
    expect(calculateTotalPoints(history)).toBe(38);
  });

  test('handles entries with zero points', () => {
    const history = [makeEntry({ points: 0 }), makeEntry({ points: 5 })];
    expect(calculateTotalPoints(history)).toBe(5);
  });
});

// ── calculateTotalCo2 ─────────────────────────────────────────────────────────

describe('calculateTotalCo2', () => {
  test('returns 0 for an empty history', () => {
    expect(calculateTotalCo2([])).toBe(0);
  });

  test('sums co2 values and rounds to 2 decimal places', () => {
    const history = [
      makeEntry({ co2EstimateKg: 0.18 }),
      makeEntry({ co2EstimateKg: 0.06 }),
      makeEntry({ co2EstimateKg: 0.25 }),
    ];
    // 0.18 + 0.06 + 0.25 = 0.49
    expect(calculateTotalCo2(history)).toBe(0.49);
  });

  test('result is a number, not a string', () => {
    expect(typeof calculateTotalCo2([makeEntry()])).toBe('number');
  });

  test('precision: 0.1 + 0.2 rounds correctly', () => {
    const history = [makeEntry({ co2EstimateKg: 0.1 }), makeEntry({ co2EstimateKg: 0.2 })];
    expect(calculateTotalCo2(history)).toBe(0.3);
  });
});

// ── formatKg ─────────────────────────────────────────────────────────────────

describe('formatKg', () => {
  test('formats 0 as "0.00 kg"', () => {
    expect(formatKg(0)).toBe('0.00 kg');
  });

  test('formats 1.5 as "1.50 kg"', () => {
    expect(formatKg(1.5)).toBe('1.50 kg');
  });

  test('formats 0.123456 to 2 decimal places', () => {
    expect(formatKg(0.123456)).toBe('0.12 kg');
  });

  test('formats large numbers correctly', () => {
    expect(formatKg(99.999)).toBe('100.00 kg');
  });
});
