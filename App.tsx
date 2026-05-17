import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { theme } from './src/theme/theme';
import { BottomNav } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AppScreen, AppSettings, AuthSession, CouncilRule, ScanHistoryEntry, SearchSource } from './src/types';
import { clearStoredHistory, defaultSettings, loadAuthSession, loadHistory, loadOnboardingComplete, loadSettings, saveHistory, saveOnboardingComplete, saveSettings } from './src/services/storageService';
import { createHistoryEntry } from './src/services/historyWorkflowService';

const scheduleRecyclingReminder = async () => new Date().toISOString();
const tabItems = [
  { key: 'home' as AppScreen, label: 'Home', icon: '⌂' },
  { key: 'search' as AppScreen, label: 'Search', icon: '⌕' },
  { key: 'scan' as AppScreen, label: 'Scan', icon: '□' },
  { key: 'history' as AppScreen, label: 'History', icon: '◷' },
  { key: 'settings' as AppScreen, label: 'More', icon: '···' },
];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    Promise.all([loadHistory(), loadSettings(), loadOnboardingComplete(), loadAuthSession()])
      .then(([storedHistory, storedSettings, onboarded, auth]) => {
        setHistory(storedHistory);
        setSettings(storedSettings);
        if (false) setOnboardingComplete(onboarded);
        setSession(auth);
      })
      .catch(() => Alert.alert('Storage', 'EcoSort could not restore local data.'));
  }, []);

  const navigate = (next: AppScreen) => setScreen(next);

  const updateSettings = async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  };

  const completeOnboarding = async () => {
    setOnboardingComplete(true);
    await saveOnboardingComplete(true);
  };

  const handleSaveResult = async (rule: CouncilRule, source: SearchSource) => {
    const entry = createHistoryEntry(rule, source, settings.privacyMode);
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    await saveHistory(next);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScreen('history');
  };

  const handleClearHistory = async () => {
    setHistory([]);
    await clearStoredHistory();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleScheduleReminder = async () => {
    try {
      const scheduledAt = await scheduleRecyclingReminder();
      await updateSettings({ ...settings, notificationScheduledAt: scheduledAt });
      Alert.alert('Reminder scheduled', 'A local reminder will appear shortly for assessment demonstration.');
    } catch (error) {
      Alert.alert('Notifications', error instanceof Error ? error.message : 'Could not schedule reminder.');
    }
  };

  const activeTab = useMemo(() => tabItems.some((item) => item.key === screen) ? screen : 'settings', [screen]);

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen navigate={navigate} history={history} settings={settings} />;
      case 'search': return <SearchScreen navigate={navigate} />;
      case 'scan': return <SearchScreen navigate={navigate} />;
      case 'history': return <HistoryScreen history={history} onClear={handleClearHistory} />;
      case 'location': return <SettingsScreen settings={settings} onChange={updateSettings} navigate={navigate} />;
      case 'device': return <SettingsScreen settings={settings} onChange={updateSettings} navigate={navigate} />;
      case 'account': return <SettingsScreen settings={settings} onChange={updateSettings} navigate={navigate} />;
      case 'settings':
      default: return <SettingsScreen settings={settings} onChange={updateSettings} navigate={navigate} onScheduleReminder={undefined} />;
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appFrame}>{renderScreen()}</View>
      <BottomNav current={activeTab} onChange={navigate} items={tabItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.canvas },
  appFrame: { flex: 1 },
});
