/**
 * SQLite Service — EcoSort
 * ------------------------
 * Provides a persistent, queryable local store for scan history using
 * expo-sqlite (Expo SDK 54 / expo-sqlite v15 async API).
 *
 * The table mirrors the ScanHistoryEntry shape so Firestore sync and
 * local SQLite reads return compatible data structures.
 *
 * Usage:
 *   await initSQLiteDB();                         // called once on boot
 *   await insertScanEntry(entry);                 // add a record
 *   const rows = await loadScanHistory();         // read all records
 *   await clearScanHistory();                     // delete all records
 */

import * as SQLite from 'expo-sqlite';
import { ScanHistoryEntry } from '../types';

// Database name — version suffix allows clean migration if schema changes.
const DB_NAME = 'ecosort_v1.db';

// ── Internal helpers ───────────────────────────────────────────────────────────

/** Lazily opened DB handle — reused across calls. */
let _db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return _db;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Create the scan_history table if it doesn't already exist.
 * Call once during app boot (before any reads/writes).
 */
export async function initSQLiteDB(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id            TEXT PRIMARY KEY,
      item          TEXT NOT NULL,
      ruleId        TEXT NOT NULL,
      council       TEXT NOT NULL,
      binLabel      TEXT NOT NULL,
      source        TEXT NOT NULL,
      timestamp     TEXT NOT NULL,
      points        INTEGER NOT NULL DEFAULT 0,
      co2EstimateKg REAL    NOT NULL DEFAULT 0,
      storedData    TEXT    NOT NULL DEFAULT ''
    );
  `);
}

/**
 * Insert a single scan history entry into SQLite.
 * Uses INSERT OR REPLACE so duplicate IDs are safely overwritten.
 */
export async function insertScanEntry(entry: ScanHistoryEntry): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO scan_history
       (id, item, ruleId, council, binLabel, source, timestamp, points, co2EstimateKg, storedData)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.item,
      entry.ruleId,
      entry.council,
      entry.binLabel,
      entry.source,
      entry.timestamp,
      entry.points,
      entry.co2EstimateKg,
      entry.storedData,
    ],
  );
}

/**
 * Return all scan history rows, newest first (by timestamp DESC).
 * Returns an empty array if no records exist.
 */
export async function loadScanHistory(): Promise<ScanHistoryEntry[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<ScanHistoryEntry>(
    `SELECT * FROM scan_history ORDER BY timestamp DESC`,
  );
  return rows;
}

/**
 * Delete every row from the scan_history table.
 * Mirrors the behaviour of clearStoredHistory() in storageService.
 */
export async function clearScanHistory(): Promise<void> {
  const db = await getDB();
  await db.runAsync(`DELETE FROM scan_history`);
}

/**
 * Return the total count of scan entries stored in SQLite.
 * Useful for dashboard stats without loading the full dataset.
 */
export async function countScanEntries(): Promise<number> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM scan_history`,
  );
  return result?.count ?? 0;
}

/**
 * Return entries filtered by a specific council label.
 * Demonstrates parameterised queries for data retrieval.
 */
export async function loadScanHistoryByCouncil(council: string): Promise<ScanHistoryEntry[]> {
  const db = await getDB();
  return db.getAllAsync<ScanHistoryEntry>(
    `SELECT * FROM scan_history WHERE council = ? ORDER BY timestamp DESC`,
    [council],
  );
}

/** Close the database connection (call on app teardown in tests). */
export async function closeSQLiteDB(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
