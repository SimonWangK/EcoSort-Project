import { buildSearchHistoryEntry } from '../../services/historyWorkflowService';
import { calculateTotalCo2, calculateTotalPoints } from '../../services/scoringService';
import { clearScanHistory, initSQLiteDB, insertScanEntry, loadScanHistory } from '../../services/sqliteService';

jest.mock('expo-sqlite');

describe('history persistence integration', () => {
  beforeEach(async () => {
    await initSQLiteDB();
    await clearScanHistory();
  });

  test('matched item is converted to history, stored in SQLite, and included in score totals', async () => {
    const entry = buildSearchHistoryEntry('battery', 'manual', true);
    expect(entry).not.toBeNull();

    await insertScanEntry(entry!);
    const rows = await loadScanHistory();

    expect(rows).toHaveLength(1);
    expect(rows[0].item).toBe('battery');
    expect(calculateTotalPoints(rows)).toBeGreaterThan(0);
    expect(calculateTotalCo2(rows)).toBeGreaterThanOrEqual(0);
  });
});
