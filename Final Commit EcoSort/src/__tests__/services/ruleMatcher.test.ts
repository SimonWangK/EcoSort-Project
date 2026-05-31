/**
 * Unit tests — ruleMatcher
 * -------------------------
 * Tests the matchCouncilRule function and normalizeText helper.
 * Uses a controlled in-memory rule set to keep tests deterministic
 * and independent of changes to councilRules.ts.
 */

import { matchCouncilRule, normalizeText } from '../../services/ruleMatcher';
import { CouncilRule } from '../../types';

// ── Controlled rule set (subset of real data) ─────────────────────────────────

const TEST_RULES: CouncilRule[] = [
  {
    id: 'test-glass',
    council: 'Test Council',
    item: 'glass bottle',
    aliases: ['wine bottle', 'jar'],
    binLabel: 'Glass recycling',
    binColorName: 'Purple',
    instruction: 'Place in glass bin.',
    confidence: 0.94,
    risk: '',
    points: 12,
    co2EstimateKg: 0.18,
  },
  {
    id: 'test-battery',
    council: 'Test Council',
    item: 'battery',
    aliases: ['aa battery', 'lithium battery'],
    binLabel: 'Drop-off only',
    binColorName: 'Special',
    instruction: 'Take to drop-off point.',
    confidence: 0.97,
    risk: 'Never bin.',
    points: 18,
    co2EstimateKg: 0.25,
  },
  {
    id: 'test-pizza',
    council: 'Test Council',
    item: 'pizza box',
    aliases: ['cardboard box'],
    binLabel: 'Recycling or compost',
    binColorName: 'Yellow',
    instruction: 'Clean sections to recycling.',
    confidence: 0.78,
    risk: '',
    points: 10,
    co2EstimateKg: 0.12,
  },
];

// ── normalizeText ─────────────────────────────────────────────────────────────

describe('normalizeText', () => {
  test('trims leading and trailing whitespace', () => {
    expect(normalizeText('  glass  ')).toBe('glass');
  });

  test('lowercases the input', () => {
    expect(normalizeText('BATTERY')).toBe('battery');
  });

  test('collapses multiple internal spaces', () => {
    expect(normalizeText('pizza   box')).toBe('pizza box');
  });

  test('handles already-normalised input unchanged', () => {
    expect(normalizeText('glass bottle')).toBe('glass bottle');
  });
});

// ── matchCouncilRule — exact matches ──────────────────────────────────────────

describe('matchCouncilRule — exact item name', () => {
  test('matches exact item name (glass bottle)', () => {
    const result = matchCouncilRule('glass bottle', TEST_RULES);
    expect(result?.id).toBe('test-glass');
  });

  test('matches item name case-insensitively', () => {
    const result = matchCouncilRule('BATTERY', TEST_RULES);
    expect(result?.id).toBe('test-battery');
  });

  test('matches exact alias (wine bottle)', () => {
    const result = matchCouncilRule('wine bottle', TEST_RULES);
    expect(result?.id).toBe('test-glass');
  });

  test('matches alias case-insensitively', () => {
    const result = matchCouncilRule('AA Battery', TEST_RULES);
    expect(result?.id).toBe('test-battery');
  });
});

// ── matchCouncilRule — fuzzy / partial matches ────────────────────────────────

describe('matchCouncilRule — partial matches', () => {
  test('matches when query is substring of item (pizza)', () => {
    const result = matchCouncilRule('pizza', TEST_RULES);
    expect(result?.id).toBe('test-pizza');
  });

  test('matches when item is substring of query', () => {
    const result = matchCouncilRule('recycled glass bottle container', TEST_RULES);
    expect(result?.id).toBe('test-glass');
  });

  test('matches partial alias (cardboard)', () => {
    const result = matchCouncilRule('cardboard', TEST_RULES);
    expect(result?.id).toBe('test-pizza');
  });
});

// ── matchCouncilRule — no match ───────────────────────────────────────────────

describe('matchCouncilRule — no match', () => {
  test('returns null for an empty string', () => {
    expect(matchCouncilRule('', TEST_RULES)).toBeNull();
  });

  test('returns null for a whitespace-only string', () => {
    expect(matchCouncilRule('   ', TEST_RULES)).toBeNull();
  });

  test('returns null for an unrecognised item', () => {
    expect(matchCouncilRule('alien artefact', TEST_RULES)).toBeNull();
  });
});

// ── matchCouncilRule — real rule set smoke test ───────────────────────────────

describe('matchCouncilRule — real council rules', () => {
  test('finds "battery" in the real bundled rules', () => {
    const result = matchCouncilRule('battery');
    expect(result).not.toBeNull();
    expect(result?.binLabel).toBe('Drop-off only');
  });

  test('finds "coffee cup" in the real bundled rules', () => {
    const result = matchCouncilRule('coffee cup');
    expect(result).not.toBeNull();
    expect(result?.binLabel).toBe('General waste');
  });

  test('finds "glass bottle" via alias "jar"', () => {
    const result = matchCouncilRule('jar');
    expect(result).not.toBeNull();
    expect(result?.item).toBe('glass bottle');
  });
});
