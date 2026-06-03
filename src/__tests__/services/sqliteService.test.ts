/**
 * Integration tests — sqliteService
 * -----------------------------------
 * Tests SQLite CRUD operations using the in-memory mock defined in
 * src/__mocks__/expo-sqlite.ts.  Verifies that initSQLiteDB, insertScanEntry,
 * loadScanHistory, countScanEntries, loadScanHistoryByCouncil, and
 * clearScanHistory all behave correctly without touching the real filesystem.
 */

jest.mock('expo-sqlite');

import {
  initSQLiteDB,
  insertScanEntry,
  loadScanHistory,
  clearScanHistory,
  countScanEntries,
  loadScanHistoryByCouncil,
} from '../../services/sqliteService';
import { ScanHistoryEntry } from '../../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeEntry(id: string, council = 'Yarra Council'): ScanHistoryEntry {
  return {
    id,
    item: 'glass bottle',
    ruleId: 'yarra-glass-bottle',
    council,
    binLabel: 'Glass recycling',
    source: 'manual',
    timestamp: new Date().toISOString(),
    points: 12,
    co2EstimateKg: 0.18,
    storedData: 'Privacy note.',
  };
}

// ── Setup & teardown ──────────────────────────────────────────────────────────

beforeEach(async () => {
  // Reset the mock DB between tests by re-initialising
  await initSQLiteDB();
  await clearScanHistory();
});

// ── initSQLiteDB ──────────────────────────────────────────────────────────────

describe('initSQLiteDB', () => {
  test('resolves without throwing', async () => {
    await expect(initSQLiteDB()).resolves.not.toThrow();
  });
});

// ── insertScanEntry & loadScanHistory ─────────────────────────────────────────

describe('insertScanEntry + loadScanHistory', () => {
  test('inserted entry is returned by loadScanHistory', async () => {
    const entry = makeEntry('entry-1');
    await insertScanEntry(entry);
    const rows = await loadScanHistory();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('entry-1');
  });

  test('multiple entries are all returned', async () => {
    await insertScanEntry(makeEntry('a'));
    await insertScanEntry(makeEntry('b'));
    await insertScanEntry(makeEntry('c'));
    const rows = await loadScanHistory();
    expect(rows).toHaveLength(3);
  });

  test('duplicate id replaces existing row (INSERT OR REPLACE)', async () => {
    const original = makeEntry('dup-id');
    const updated  = { ...original, item: 'battery', binLabel: 'Drop-off only' };
    await insertScanEntry(original);
    await insertScanEntry(updated);
    const rows = await loadScanHistory();
    expect(rows).toHaveLength(1);
    expect(rows[0].item).toBe('battery');
  });
});

// ── countScanEntries ──────────────────────────────────────────────────────────

describe('countScanEntries', () => {
  test('returns 0 when table is empty', async () => {
    expect(await countScanEntries()).toBe(0);
  });

  test('returns correct count after inserts', async () => {
    await insertScanEntry(makeEntry('x1'));
    await insertScanEntry(makeEntry('x2'));
    expect(await countScanEntries()).toBe(2);
  });
});

// ── loadScanHistoryByCouncil ──────────────────────────────────────────────────

describe('loadScanHistoryByCouncil', () => {
  test('returns only entries matching the council', async () => {
    await insertScanEntry(makeEntry('y1', 'Yarra Council'));
    await insertScanEntry(makeEntry('m1', 'Melbourne City Council'));
    await insertScanEntry(makeEntry('y2', 'Yarra Council'));
    const yarraRows = await loadScanHistoryByCouncil('Yarra Council');
    expect(yarraRows).toHaveLength(2);
    yarraRows.forEach((r) => expect(r.council).toBe('Yarra Council'));
  });

  test('returns empty array for unknown council', async () => {
    await insertScanEntry(makeEntry('y1', 'Yarra Council'));
    const rows = await loadScanHistoryByCouncil('Unknown Council');
    expect(rows).toHaveLength(0);
  });
});

// ── clearScanHistory ──────────────────────────────────────────────────────────

describe('clearScanHistory', () => {
  test('removes all rows from the table', async () => {
    await insertScanEntry(makeEntry('z1'));
    await insertScanEntry(makeEntry('z2'));
    await clearScanHistory();
    const rows = await loadScanHistory();
    expect(rows).toHaveLength(0);
  });

  test('is safe to call on an already-empty table', async () => {
    await expect(clearScanHistory()).resolves.not.toThrow();
  });
});
