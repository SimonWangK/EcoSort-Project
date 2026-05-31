/**
 * Council Rules Sync Service
 * --------------------------
 * Simulates a background Task Manager that keeps local council recycling
 * rules up-to-date. In a production app this would fetch from Firestore /
 * a cloud API; here it validates the bundled rules and refreshes the sync
 * timestamp so the rest of the app knows the rules are current.
 *
 * The service is triggered by an AppState 'active' event in App.tsx — i.e.
 * every time the user returns the app to the foreground. It only actually
 * runs if the last sync was more than SYNC_INTERVAL_MS ago.
 */

import { AppSettings } from '../types';
import { COUNCIL_RULES } from '../data/councilRules';

// Re-check every 24 hours (foreground triggers the check, not a true timer).
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ── Public API ─────────────────────────────────────────────────────────────────

/** Returns true if council rules haven't been synced yet or the cache is stale.
 *  FIX: uses >= so that a cache aged exactly SYNC_INTERVAL_MS is also considered stale.
 */
export function needsCouncilSync(settings: AppSettings): boolean {
  if (!settings.cachedRulesSyncedAt) return true;
  const age = Date.now() - new Date(settings.cachedRulesSyncedAt).getTime();
  return age >= SYNC_INTERVAL_MS; // changed > to >= to treat exact-boundary as stale
}

export interface CouncilSyncResult {
  updatedSettings: AppSettings;
  rulesCount: number;
  council: string;
  syncedAt: string;
}

/**
 * Perform the sync:
 * 1. Validate bundled rules are intact.
 * 2. Simulate a short network round-trip (demo).
 * 3. Return updated settings with a fresh `cachedRulesSyncedAt` timestamp.
 *
 * Throws on error — callers should catch and handle silently or show a banner.
 */
export async function syncCouncilRules(settings: AppSettings): Promise<CouncilSyncResult> {
  // Validate rules integrity
  if (!COUNCIL_RULES || COUNCIL_RULES.length === 0) {
    throw new Error('Council rules dataset is empty.');
  }

  // Simulate async fetch / Firestore read (replace with real fetch in production)
  await simulateFetch();

  const syncedAt = new Date().toISOString();
  const council  = settings.locationCouncil ?? 'Yarra Council';

  return {
    updatedSettings: { ...settings, cachedRulesSyncedAt: syncedAt },
    rulesCount: COUNCIL_RULES.length,
    council,
    syncedAt,
  };
}

// ── Internal helpers ───────────────────────────────────────────────────────────

/** Tiny delay that mimics a lightweight network check without blocking the UI. */
function simulateFetch(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 250));
}
