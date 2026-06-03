/**
 * Council Rules Sync Service
 * --------------------------
 * Keeps the bundled council rule cache observable and refreshable without
 * requiring a server. The app uses the local dataset for Search/Scan, while
 * this service validates the active rules and updates the sync timestamp so
 * foreground and background workers have a real state change to persist.
 */

import { AppSettings } from '../types';
import { COUNCIL_RULES, getRulesForCouncil, normaliseCouncil } from '../data/councilRules';

// Re-check every 24 hours (foreground/background triggers the check, not a true timer).
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ── Public API ─────────────────────────────────────────────────────────────────

/** Returns true if council rules haven't been synced yet or the rule sync state is stale. */
export function needsCouncilSync(settings: AppSettings): boolean {
  // The Local rules switch now has a concrete effect: when enabled, the app uses
  // the bundled on-device guide and skips refresh checks/background cloud meta.
  if (settings.offlineDemo) return false;
  if (!settings.cachedRulesSyncedAt) return true;
  const syncedTime = new Date(settings.cachedRulesSyncedAt).getTime();
  if (!Number.isFinite(syncedTime)) return true;
  const age = Date.now() - syncedTime;
  return age >= SYNC_INTERVAL_MS;
}

export interface CouncilSyncResult {
  updatedSettings: AppSettings;
  rulesCount: number;
  council: string;
  syncedAt: string;
}

/**
 * Perform the sync:
 * 1. Validate the full bundled rules dataset is present.
 * 2. Validate the selected council has rules available.
 * 3. Return updated settings with a fresh `cachedRulesSyncedAt` timestamp.
 */
export async function syncCouncilRules(settings: AppSettings): Promise<CouncilSyncResult> {
  if (!COUNCIL_RULES || COUNCIL_RULES.length === 0) {
    throw new Error('Council rules dataset is empty.');
  }

  const council = normaliseCouncil(settings.locationCouncil);
  const councilRules = getRulesForCouncil(council);
  if (councilRules.length === 0) {
    throw new Error(`No council rules are available for ${council}.`);
  }

  await simulateFetch();

  const syncedAt = new Date().toISOString();

  return {
    updatedSettings: {
      ...settings,
      locationCouncil: council,
      cachedRulesSyncedAt: syncedAt,
    },
    rulesCount: councilRules.length,
    council,
    syncedAt,
  };
}

// ── Internal helpers ───────────────────────────────────────────────────────────

/** Tiny delay that mimics a lightweight cache-refresh operation without blocking the UI. */
function simulateFetch(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 120));
}
