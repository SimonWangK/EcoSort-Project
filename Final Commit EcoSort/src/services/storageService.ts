import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ScanHistoryEntry, AuthSession } from '../types';

const KEYS = {
  history: 'ecosort.scanHistory.v2',
  settings: 'ecosort.settings.v2',
  onboarding: 'ecosort.onboardingComplete.v2',
  auth: 'ecosort.authSession.v2',
};

export const defaultSettings: AppSettings = {
  privacyMode: true,
  offlineDemo: false,
  themeMode: 'light',
  textScale: 1,
  cachedRulesSyncedAt: null,
  locationCouncil: null,
  notificationScheduledAt: null,
};

export async function loadHistory(): Promise<ScanHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.history);
  return raw ? JSON.parse(raw) : [];
}

export async function saveHistory(history: ScanHistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(history));
}

export async function clearStoredHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.history);
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function loadOnboardingComplete(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.onboarding);
  return raw === 'true';
}

export async function saveOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarding, String(value));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(KEYS.auth);
  return raw ? JSON.parse(raw) : null;
}

export async function saveAuthSession(session: AuthSession | null): Promise<void> {
  if (!session) await AsyncStorage.removeItem(KEYS.auth);
  else await AsyncStorage.setItem(KEYS.auth, JSON.stringify(session));
}
