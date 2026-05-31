/**
 * Manual mock for expo-sqlite used during Jest tests.
 * Simulates the async SQLite API with an in-memory store.
 */

type Row = Record<string, unknown>;

class MockDB {
  private tables: Record<string, Row[]> = {};

  async execAsync(sql: string): Promise<void> {
    // Handle CREATE TABLE statements — initialise an empty table array
    const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
    if (match) {
      const table = match[1];
      if (!this.tables[table]) this.tables[table] = [];
    }
  }

  async runAsync(sql: string, params: unknown[] = []): Promise<void> {
    if (/INSERT OR REPLACE INTO scan_history/i.test(sql)) {
      const [id, item, ruleId, council, binLabel, source, timestamp, points, co2EstimateKg, storedData] = params as [string, string, string, string, string, string, string, number, number, string];
      const rows = this.tables['scan_history'] ?? [];
      const idx = rows.findIndex((r) => r.id === id);
      const entry = { id, item, ruleId, council, binLabel, source, timestamp, points, co2EstimateKg, storedData };
      if (idx >= 0) rows[idx] = entry; else rows.push(entry);
      this.tables['scan_history'] = rows;
    } else if (/DELETE FROM scan_history/i.test(sql)) {
      this.tables['scan_history'] = [];
    }
  }

  async getAllAsync<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const rows: Row[] = this.tables['scan_history'] ?? [];
    if (/WHERE council = \?/i.test(sql)) {
      return rows.filter((r) => r.council === params[0]) as unknown as T[];
    }
    // Sort newest-first by timestamp string (ISO format sorts lexicographically)
    return [...rows].sort((a, b) =>
      String(b.timestamp).localeCompare(String(a.timestamp)),
    ) as unknown as T[];
  }

  async getFirstAsync<T>(sql: string): Promise<T | null> {
    if (/COUNT/i.test(sql)) {
      const count = (this.tables['scan_history'] ?? []).length;
      return { count } as unknown as T;
    }
    return null;
  }

  async closeAsync(): Promise<void> {
    // no-op in tests
  }
}

const mockDB = new MockDB();

export const openDatabaseAsync = jest.fn(async (_name: string) => mockDB);
