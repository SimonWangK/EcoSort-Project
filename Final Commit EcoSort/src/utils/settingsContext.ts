/**
 * SettingsContext
 * ---------------
 * Provides a React context so deeply-nested components can read AppSettings
 * (especially textScale and offlineDemo) without explicit prop-drilling.
 *
 * Usage:
 *   // In App.tsx root:
 *   <SettingsProvider value={settings}>…</SettingsProvider>
 *
 *   // In any component:
 *   const { textScale } = useSettings();
 *
 * NOTE: The fallback value is defined inline here (not imported from
 * storageService) to avoid pulling in AsyncStorage as a transitive
 * dependency when this module is loaded during Jest tests.
 */

import { createContext, useContext } from 'react';
import { AppSettings } from '../types';

/** Fallback used when no SettingsProvider is present (e.g. in unit tests). */
const SETTINGS_FALLBACK: AppSettings = {
  privacyMode: true,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: null,
  notificationScheduledAt: null,
};

const SettingsContext = createContext<AppSettings>(SETTINGS_FALLBACK);

/** Wrap the component tree to make settings available via `useSettings()`. */
export const SettingsProvider = SettingsContext.Provider;

/** Read current AppSettings from context (falls back to SETTINGS_FALLBACK if no provider). */
export function useSettings(): AppSettings {
  return useContext(SettingsContext);
}
