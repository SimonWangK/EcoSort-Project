import { buildSearchHistoryEntry } from '../../services/historyWorkflowService';
import { matchCouncilRule } from '../../services/ruleMatcher';
import { calculateTotalCo2, calculateTotalPoints } from '../../services/scoringService';
import { clearScanHistory, initSQLiteDB, insertScanEntry, loadScanHistory } from '../../services/sqliteService';

jest.mock('expo-sqlite');

describe('EcoSort end-to-end recycling decision flow', () => {
  beforeEach(async () => {
    await initSQLiteDB();
    await clearScanHistory();
  });

  test('user searches an item, saves the result, reviews impact totals, then clears history', async () => {
    const rule = matchCouncilRule('glass bottle');
    expect(rule?.binLabel).toMatch(/glass/i);

    const entry = buildSearchHistoryEntry('glass bottle', 'manual', true);
    expect(entry?.storedData).toMatch(/Raw photo/i);

    await insertScanEntry(entry!);
    const saved = await loadScanHistory();

    expect(saved[0].item).toBe('glass bottle');
    expect(calculateTotalPoints(saved)).toBe(entry!.points);
    expect(calculateTotalCo2(saved)).toBe(entry!.co2EstimateKg);

    await clearScanHistory();
    await expect(loadScanHistory()).resolves.toEqual([]);
  });
});
