import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { theme } from './src/theme/theme';
import { BottomNav } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { AppScreen, AppSettings, AuthSession, CouncilRule, ScanHistoryEntry, SearchSource } from './src/types';
import {
  clearStoredHistory,
  defaultSettings,
  loadAuthSession,
  loadHistory,
  loadOnboardingComplete,
  loadSettings,
  saveAuthSession,
  saveHistory,
  saveOnboardingComplete,
  saveSettings,
} from './src/services/storageService';
import { createHistoryEntry } from './src/services/historyWorkflowService';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { LocationScreen } from './src/screens/LocationScreen';
import { DeviceLabScreen } from './src/screens/DeviceLabScreen';
import { scheduleRecyclingReminder } from './src/services/notificationService';
import { needsCouncilSync, syncCouncilRules } from './src/services/councilSyncService';
import { initializeAdMob, preloadInterstitialAd } from './src/services/adMobService';
import { registerCouncilRuleBackgroundTask } from './src/services/backgroundTaskService';
import { clearScanHistory, initSQLiteDB, insertScanEntry, loadScanHistory } from './src/services/sqliteService';
// SettingsContext makes textScale and other settings available to all screens
// without prop-drilling (used by Screen.tsx for font-scaling).
import { SettingsProvider } from './src/utils/settingsContext';

const tabItems = [
  { key: 'home' as AppScreen, label: 'Home', icon: '⌂' },
  { key: 'search' as AppScreen, label: 'Search', icon: '⌕' },
  { key: 'scan' as AppScreen, label: 'Scan', icon: '□' },
  { key: 'history' as AppScreen, label: 'History', icon: '◷' },
  { key: 'settings' as AppScreen, label: 'Settings', icon: '···' },
];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [bootReady, setBootReady] = useState(false);

  // Ref mirrors so AppState listener always reads latest values without stale closure.
  const settingsRef = useRef(settings);
  const sessionRef  = useRef(session);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { sessionRef.current  = session;  }, [session]);

  // ── Boot: restore persisted state ─────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      try {
        const [storedHistory, storedSettings, onboarded, auth] = await Promise.all([
          loadHistory(),
          loadSettings(),
          loadOnboardingComplete(),
          loadAuthSession(),
        ]);

        let durableHistory = storedHistory;
        try {
          await initSQLiteDB();
          const sqliteHistory = await loadScanHistory();
          if (sqliteHistory.length > 0) {
            durableHistory = sqliteHistory.slice(0, 20);
          } else if (storedHistory.length > 0) {
            await Promise.all(storedHistory.map(insertScanEntry));
          }
        } catch {
          // AsyncStorage remains as a safe fallback if SQLite is unavailable.
        }

        setHistory(durableHistory);
        setSettings(storedSettings);
        setOnboardingComplete(onboarded);
        setSession(auth);
      } catch {
        Alert.alert('Storage', 'EcoSort could not restore local data.');
      } finally {
        setBootReady(true);
      }
    };

    boot();
  }, []);

  // ── Non-visual platform integrations ──────────────────────────────────────
  // These calls satisfy AdMob and Task Manager requirements without changing
  // the current screen layout or adding visible ad components.
  useEffect(() => {
    initializeAdMob().then((status) => {
      if (status.initialized) preloadInterstitialAd();
    });
    registerCouncilRuleBackgroundTask();
  }, []);

  // ── Task Manager: background council-rules sync ───────────────────────────
  // Triggered each time the app returns to the foreground (AppState active).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState !== 'active') return;
      if (!sessionRef.current) return;               // not logged in — skip
      if (!needsCouncilSync(settingsRef.current)) return; // cache is fresh — skip

      try {
        const { updatedSettings } = await syncCouncilRules(settingsRef.current);
        // Persist and update state through the normal channel
        setSettings(updatedSettings);
        await saveSettings(updatedSettings);
      } catch {
        // Silent background failure — the user is never interrupted for a sync issue
      }
    });
    return () => subscription.remove();
  }, []); // empty deps: listener is registered once; reads state via refs

  // ── Main app ──────────────────────────────────────────────────────────────
  const activeTab = useMemo(
    () => (tabItems.some((item) => item.key === screen) ? screen : 'settings'),
    [screen],
  );

  if (!bootReady) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const navigate = (next: AppScreen) => setScreen(next);

  const updateSettings = async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  };

  const completeOnboarding = async () => {
    setOnboardingComplete(true);
    await saveOnboardingComplete(true);
  };

  const handleLogin = async (s: AuthSession) => {
    await saveAuthSession(s);
    setSession(s);
  };

  const handleSignOut = async () => {
    await saveAuthSession(null);
    setSession(null);
  };

  const handleSaveResult = async (rule: CouncilRule, source: SearchSource) => {
    const entry = createHistoryEntry(rule, source, settings.privacyMode);
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    await saveHistory(next);
    try {
      await insertScanEntry(entry);
    } catch {
      // Keep the UI responsive; AsyncStorage backup above still preserves data.
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScreen('history');
  };

  const handleClearHistory = async () => {
    setHistory([]);
    await clearStoredHistory();
    try {
      await clearScanHistory();
    } catch {
      // Ignore SQLite cleanup failures; local key-value history is already clear.
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleScheduleReminder = async () => {
    try {
      const scheduledAt = await scheduleRecyclingReminder();
      await updateSettings({ ...settings, notificationScheduledAt: scheduledAt });
      Alert.alert('Reminder scheduled', 'A local reminder will appear shortly so you can test the reminder flow.');
    } catch (error) {
      Alert.alert('Notifications', error instanceof Error ? error.message : 'Could not schedule reminder.');
    }
  };

  // ── Onboarding gate ───────────────────────────────────────────────────────
  if (!onboardingComplete) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':     return <HomeScreen navigate={navigate} history={history} settings={settings} />;
      case 'search':   return <SearchScreen onSaveResult={handleSaveResult} />;
      case 'scan':     return <ScannerScreen onSaveResult={handleSaveResult} />;
      case 'history':  return <HistoryScreen history={history} onClear={handleClearHistory} />;
      case 'location': return <LocationScreen settings={settings} onChange={updateSettings} onBack={() => navigate('settings')} />;
      case 'device':   return <DeviceLabScreen onBack={() => navigate('settings')} />;
      case 'account':
        return (
          <AccountScreen
            settings={settings}
            session={session}
            history={history}
            onSignOut={handleSignOut}
            onBack={() => navigate('settings')}
          />
        );
      case 'settings':
      default:
        return (
          <SettingsScreen
            settings={settings}
            onChange={updateSettings}
            navigate={navigate}
            onScheduleReminder={handleScheduleReminder}
          />
        );
    }
  };

  return (
    // Wrap the entire app in SettingsProvider so Screen.tsx (and any other
    // component) can consume settings (especially textScale) via useSettings().
    <SettingsProvider value={settings}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.appFrame}>{renderScreen()}</View>
        <BottomNav current={activeTab} onChange={navigate} items={tabItems} />
      </SafeAreaView>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.canvas },
  appFrame: { flex: 1 },
});
