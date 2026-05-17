import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppSettings, AppScreen } from '../types';
import { theme } from '../theme/theme';

export function SettingsScreen({ settings, onChange, navigate, onScheduleReminder }: { settings: AppSettings; onChange: (settings: AppSettings) => void; navigate: (screen: AppScreen) => void; onScheduleReminder?: () => void }) {
  return (
    <Screen title="Settings" subtitle="Control privacy, accessibility and app context.">
      <Card>
        <SettingRow title="Privacy-first mode" text="Keep raw photos and exact GPS coordinates out of local history." value={settings.privacyMode} onValueChange={(value) => onChange({ ...settings, privacyMode: value })} />
        <SettingRow title="Offline demo mode" text="Use cached guidance without relying on live network access." value={settings.offlineDemo} onValueChange={(value) => onChange({ ...settings, offlineDemo: value })} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Text size</Text>
        <View style={styles.segmented}>
          {[0.95, 1, 1.12].map((scale) => (
            <TouchableOpacity key={scale} accessibilityRole="button" accessibilityState={{ selected: settings.textScale === scale }} style={[styles.segment, settings.textScale === scale && styles.segmentActive]} onPress={() => onChange({ ...settings, textScale: scale })}>
              <Text style={[styles.segmentText, settings.textScale === scale && styles.segmentTextActive]}>{scale === 0.95 ? 'A' : scale === 1 ? 'A+' : 'A++'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card muted>
        <Text style={styles.sectionTitle}>Tools</Text>
        <View style={styles.tools}>
          <AppButton title="Location" variant="secondary" onPress={() => navigate('location')} style={styles.toolButton} />
          <AppButton title="Device Lab" variant="secondary" onPress={() => navigate('device')} style={styles.toolButton} />
          <AppButton title="Account" variant="secondary" onPress={() => navigate('account')} style={styles.toolButton} />
        </View>
        {onScheduleReminder ? <AppButton title="Schedule reminder" onPress={onScheduleReminder} style={{ marginTop: 12 }} /> : null}
        <Text style={styles.meta}>Last notification: {settings.notificationScheduledAt ? new Date(settings.notificationScheduledAt).toLocaleString() : 'Not scheduled yet'}</Text>
      </Card>
    </Screen>
  );
}

function SettingRow({ title, text, value, onValueChange }: { title: string; text: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingText}>{text}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#D8D2C7', true: theme.colors.primarySoft }} thumbColor={value ? theme.colors.primary : '#FFFFFF'} />
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingVertical: 10 },
  settingTitle: { fontSize: 16, fontWeight: '900', color: theme.colors.text, marginBottom: 4 },
  settingText: { ...theme.typography.small, color: theme.colors.textMuted },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 12 },
  segmented: { flexDirection: 'row', backgroundColor: theme.colors.surfaceMuted, borderRadius: 18, padding: 4 },
  segment: { flex: 1, minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: theme.colors.primary },
  segmentText: { fontWeight: '900', color: theme.colors.textMuted },
  segmentTextActive: { color: theme.colors.white },
  tools: { flexDirection: 'row', gap: 8 },
  toolButton: { flex: 1 },
  meta: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 12 },
});
