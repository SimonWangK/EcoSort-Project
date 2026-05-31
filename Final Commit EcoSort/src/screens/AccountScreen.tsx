// AccountScreen.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppSettings, AuthSession, ScanHistoryEntry } from '../types';
import { theme } from '../theme/theme';
import {
  syncCouncilMetaToFirestore,
  syncHistoryToFirestore,
  syncSettingsToFirestore,
} from '../services/firebaseService';

interface AccountScreenProps {
  settings: AppSettings;
  session: AuthSession | null;
  onSignOut: () => void;
  history: ScanHistoryEntry[];
  onBack: () => void;
}

export function AccountScreen({
  settings,
  session,
  onSignOut,
  history,
  onBack,
}: AccountScreenProps) {
  const [syncLoading, setSyncLoading] = useState(false);
  const [historySyncStatus, setHistorySyncStatus] = useState('Not synced yet');
  const [settingsSyncStatus, setSettingsSyncStatus] = useState('Not synced yet');
  const [councilSyncStatus, setCouncilSyncStatus] = useState('Not synced yet');

  const isAnonymous = session?.email === 'anonymous';
  const accountLabel = session
    ? isAnonymous ? 'Anonymous session' : session.email
    : 'Not signed in';

  const syncHistory = async () => {
    if (!session) {
      Alert.alert('Cannot Sync', 'No active session detected. Please sign in first.');
      return;
    }
    setSyncLoading(true);
    try {
      const at = await syncHistoryToFirestore(session, history);
      setHistorySyncStatus(`${history.length} records synced at ${new Date(at).toLocaleString()}`);
    } catch (e) {
      Alert.alert('Sync error', e instanceof Error ? e.message : 'History sync failed.');
    } finally { setSyncLoading(false); }
  };

  const syncSettings = async () => {
    if (!session) {
      Alert.alert('Cannot Sync', 'No active session detected. Please sign in first.');
      return;
    }
    setSyncLoading(true);
    try {
      const at = await syncSettingsToFirestore(session, settings);
      setSettingsSyncStatus(`Synced at ${new Date(at).toLocaleString()}`);
    } catch (e) {
      Alert.alert('Sync error', e instanceof Error ? e.message : 'Settings sync failed.');
    } finally { setSyncLoading(false); }
  };

  const syncCouncil = async () => {
    if (!session) {
      Alert.alert('Cannot Sync', 'No active session detected. Please sign in first.');
      return;
    }
    setSyncLoading(true);
    try {
      const council = settings.locationCouncil || 'Yarra Council demo set';
      const at = await syncCouncilMetaToFirestore(session, council);
      setCouncilSyncStatus(`"${council}" at ${new Date(at).toLocaleString()}`);
    } catch (e) {
      Alert.alert('Sync error', e instanceof Error ? e.message : 'Council sync failed.');
    } finally { setSyncLoading(false); }
  };

  return (
    <Screen title="Account" subtitle="Manage your sync and profile.">
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <Card>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.accountLabel}>
          {isAnonymous ? 'Anonymous session' : `${accountLabel}`}
        </Text>

        <Text style={styles.syncLabel}>Scan history</Text>
        <Text style={styles.syncStatus}>{historySyncStatus}</Text>
        <AppButton title="Sync history" onPress={syncHistory} loading={syncLoading} style={styles.syncBtn} />

        <Text style={[styles.syncLabel, { marginTop: 14 }]}>App settings</Text>
        <Text style={styles.syncStatus}>{settingsSyncStatus}</Text>
        <AppButton title="Sync settings" variant="secondary" onPress={syncSettings} loading={syncLoading} style={styles.syncBtn} />

        <Text style={[styles.syncLabel, { marginTop: 14 }]}>Council rules metadata</Text>
        <Text style={styles.syncStatus}>{councilSyncStatus}</Text>
        <AppButton title="Sync council data" variant="secondary" onPress={syncCouncil} loading={syncLoading} style={styles.syncBtn} />

        <View style={styles.itemDivider} />
        <AppButton title="Sign out" variant="ghost" onPress={onSignOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backButtonText: { ...theme.typography.body, color: theme.colors.textMuted, marginLeft: 4, fontWeight: '600' },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 16, fontWeight: '700' },
  accountLabel: { ...theme.typography.body, color: theme.colors.text, marginBottom: 14 },
  syncLabel: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase', marginBottom: 4 },
  syncStatus: { ...theme.typography.small, color: theme.colors.textMuted, marginBottom: 6 },
  syncBtn: { marginTop: 2 },
  itemDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 14 },
});