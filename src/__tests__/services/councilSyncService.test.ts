/**
 * Integration tests — councilSyncService
 * ----------------------------------------
 * Verifies that needsCouncilSync detects stale caches correctly and
 * that syncCouncilRules returns a valid, updated-settings object.
 * Uses Jest fake timers to control Date.now() without waiting.
 */

import { needsCouncilSync, syncCouncilRules } from '../../services/councilSyncService';
import { AppSettings } from '../../types';

// ── Fixture ───────────────────────────────────────────────────────────────────

const BASE_SETTINGS: AppSettings = {
  privacyMode: true,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: 'Yarra Council',
  notificationScheduledAt: null,
};

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 h

// ── needsCouncilSync ──────────────────────────────────────────────────────────

describe('needsCouncilSync', () => {
  test('returns true when cachedRulesSyncedAt is null', () => {
    expect(needsCouncilSync({ ...BASE_SETTINGS, cachedRulesSyncedAt: null })).toBe(true);
  });

  test('returns false when synced less than 24 h ago', () => {
    const recentSync = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 h ago
    expect(needsCouncilSync({ ...BASE_SETTINGS, cachedRulesSyncedAt: recentSync })).toBe(false);
  });

  test('returns true when synced more than 24 h ago', () => {
    const oldSync = new Date(Date.now() - SYNC_INTERVAL_MS - 1000).toISOString();
    expect(needsCouncilSync({ ...BASE_SETTINGS, cachedRulesSyncedAt: oldSync })).toBe(true);
  });

  test('returns true when cachedRulesSyncedAt is exactly the threshold', () => {
    // edge: exactly at boundary is stale
    const boundary = new Date(Date.now() - SYNC_INTERVAL_MS).toISOString();
    expect(needsCouncilSync({ ...BASE_SETTINGS, cachedRulesSyncedAt: boundary })).toBe(true);
  });
});

// ── syncCouncilRules ──────────────────────────────────────────────────────────

describe('syncCouncilRules', () => {
  test('resolves without throwing', async () => {
    await expect(syncCouncilRules(BASE_SETTINGS)).resolves.not.toThrow();
  });

  test('returns a rulesCount greater than 0', async () => {
    const result = await syncCouncilRules(BASE_SETTINGS);
    expect(result.rulesCount).toBeGreaterThan(0);
  });

  test('updatedSettings has a fresh cachedRulesSyncedAt timestamp', async () => {
    const before = Date.now();
    const result = await syncCouncilRules(BASE_SETTINGS);
    const after = Date.now();

    const syncedTime = new Date(result.updatedSettings.cachedRulesSyncedAt!).getTime();
    expect(syncedTime).toBeGreaterThanOrEqual(before);
    expect(syncedTime).toBeLessThanOrEqual(after);
  });

  test('other settings fields remain unchanged after sync', async () => {
    const result = await syncCouncilRules(BASE_SETTINGS);
    expect(result.updatedSettings.privacyMode).toBe(BASE_SETTINGS.privacyMode);
    expect(result.updatedSettings.textScale).toBe(BASE_SETTINGS.textScale);
    expect(result.updatedSettings.locationCouncil).toBe(BASE_SETTINGS.locationCouncil);
  });

  test('council in result matches locationCouncil in settings', async () => {
    const result = await syncCouncilRules({ ...BASE_SETTINGS, locationCouncil: 'Melbourne City Council' });
    expect(result.council).toBe('Melbourne City Council');
  });

  test('uses fallback council when locationCouncil is null', async () => {
    const result = await syncCouncilRules({ ...BASE_SETTINGS, locationCouncil: null });
    expect(result.council).toBe('Yarra Council');
  });
});
