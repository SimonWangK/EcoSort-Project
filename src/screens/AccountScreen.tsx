// AccountScreen.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppSettings, AuthSession, ScanHistoryEntry } from '../types';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';
import {
  syncCouncilMetaToFirestore,
  syncHistoryToFirestore,
  syncSettingsToFirestore,
  isLocalAuthSession,
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
  const { textScale } = useSettings();
  const [syncLoading, setSyncLoading] = useState(false);
  const [historySyncStatus, setHistorySyncStatus] = useState('Not backed up yet');
  const [settingsSyncStatus, setSettingsSyncStatus] = useState('Not saved yet');
  const [councilSyncStatus, setCouncilSyncStatus] = useState('Not updated yet');

  const isLocal = isLocalAuthSession(session);
  const isAnonymous = session?.email === 'anonymous';
  const accountLabel = session
    ? isLocal ? 'Guest profile' : isAnonymous ? 'Private account' : session.email
    : 'Not signed in';

  const syncHistory = async () => {
    if (!session || isLocal) {
      Alert.alert('Sign-in needed', isLocal ? 'This guest profile is saved on this device only. Sign in to keep your data available on another device.' : 'Please sign in first.');
      return;
    }
    setSyncLoading(true);
    try {
      const at = await syncHistoryToFirestore(session, history);
      setHistorySyncStatus(`${history.length} records backed up at ${new Date(at).toLocaleString()}`);
    } catch (e) {
      Alert.alert('Could not complete', e instanceof Error ? e.message : 'History backup failed. Try again.');
    } finally { setSyncLoading(false); }
  };

  const syncSettings = async () => {
    if (!session || isLocal) {
      Alert.alert('Sign-in needed', isLocal ? 'This guest profile is saved on this device only. Sign in to keep your data available on another device.' : 'Please sign in first.');
      return;
    }
    setSyncLoading(true);
    try {
      const at = await syncSettingsToFirestore(session, settings);
      setSettingsSyncStatus(`Saved at ${new Date(at).toLocaleString()}`);
    } catch (e) {
      Alert.alert('Could not complete', e instanceof Error ? e.message : 'Preferences could not be saved. Try again.');
    } finally { setSyncLoading(false); }
  };

  const syncCouncil = async () => {
    if (!session || isLocal) {
      Alert.alert('Sign-in needed', isLocal ? 'This guest profile is saved on this device only. Sign in to keep your data available on another device.' : 'Please sign in first.');
      return;
    }
    setSyncLoading(true);
    try {
      const council = settings.locationCouncil || 'Yarra Council';
      const at = await syncCouncilMetaToFirestore(session, council);
      setCouncilSyncStatus(`${council} updated at ${new Date(at).toLocaleString()}`);
    } catch (e) {
      Alert.alert('Could not complete', e instanceof Error ? e.message : 'Guidance update failed. Try again.');
    } finally { setSyncLoading(false); }
  };

  return (
    <Screen title="Account" subtitle="Manage your profile and saved data.">
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
        <Text style={scaleTextStyle(styles.backButtonText, textScale)}>Back</Text>
      </Pressable>

      <Card>
        <Text style={scaleTextStyle(styles.sectionTitle, textScale)}>Profile</Text>
        <Text style={scaleTextStyle(styles.accountLabel, textScale)}>
          {accountLabel}
        </Text>

        {isLocal ? <Text style={scaleTextStyle(styles.localHint, textScale)}>Guest mode keeps history and settings on this device. Sign in to keep them available on another device.</Text> : null}

        <Text style={scaleTextStyle(styles.syncLabel, textScale)}>Scan history</Text>
        <Text style={scaleTextStyle(styles.syncStatus, textScale)}>{historySyncStatus}</Text>
        <AppButton title="Back up history" onPress={syncHistory} loading={syncLoading} disabled={isLocal} style={styles.syncBtn} />

        <Text style={[scaleTextStyle(styles.syncLabel, textScale), { marginTop: 14 }]}>App settings</Text>
        <Text style={scaleTextStyle(styles.syncStatus, textScale)}>{settingsSyncStatus}</Text>
        <AppButton title="Save preferences" variant="secondary" onPress={syncSettings} loading={syncLoading} disabled={isLocal} style={styles.syncBtn} />

        <Text style={[scaleTextStyle(styles.syncLabel, textScale), { marginTop: 14 }]}>Local guidance</Text>
        <Text style={scaleTextStyle(styles.syncStatus, textScale)}>{councilSyncStatus}</Text>
        <AppButton title="Update guidance" variant="secondary" onPress={syncCouncil} loading={syncLoading} disabled={isLocal} style={styles.syncBtn} />

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
  localHint: { ...theme.typography.small, color: theme.colors.textMuted, backgroundColor: theme.colors.canvasSoft, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 12, marginBottom: 14 },
  syncLabel: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase', marginBottom: 4 },
  syncStatus: { ...theme.typography.small, color: theme.colors.textMuted, marginBottom: 6 },
  syncBtn: { marginTop: 2 },
  itemDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 14 },
});