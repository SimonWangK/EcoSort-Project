import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { StatTile } from '../components/StatTile';
import { theme } from '../theme/theme';
import { AppScreen, ScanHistoryEntry, AppSettings } from '../types';
import { calculateTotalCo2, calculateTotalPoints, formatKg } from '../services/scoringService';

export function HomeScreen({ navigate, history, settings }: { navigate: (screen: AppScreen) => void; history: ScanHistoryEntry[]; settings: AppSettings }) {
  const points = calculateTotalPoints(history);
  const co2 = calculateTotalCo2(history);
  return (
    <Screen title="EcoSort" subtitle="Clear local recycling guidance, designed for quick everyday decisions.">
      <Card style={styles.hero}>
        <Text style={styles.heroKicker}>Today’s sorting assistant</Text>
        <Text style={styles.heroTitle}>Find the right bin before you throw it away.</Text>
        <Text style={styles.heroBody}>Use manual search, camera scanning, or council context to check disposal instructions with a privacy-first history.</Text>
        <View style={styles.actions}>
          <AppButton title="Search item" onPress={() => navigate('search')} style={styles.actionButton} accessibilityHint="Open manual item search" />
          <AppButton title="Scan" variant="secondary" onPress={() => navigate('scan')} style={styles.actionButton} accessibilityHint="Open camera scanner" />
        </View>
      </Card>

      <View style={styles.statsRow}>
        <StatTile label="Checked" value={String(history.length)} hint="saved items" />
        <StatTile label="Points" value={String(points)} hint="eco score" />
        <StatTile label="CO₂ saved" value={formatKg(co2)} hint="estimate" />
      </View>

      <Card muted>
        <Text style={styles.sectionTitle}>Current context</Text>
        <Text style={styles.meta}>Council: {settings.locationCouncil || 'Yarra Council demo rules'}</Text>
        <Text style={styles.meta}>Mode: {settings.offlineDemo ? 'Offline demo' : 'Online-ready'}</Text>
        <Text style={styles.meta}>Privacy: {settings.privacyMode ? 'Raw photos and exact GPS are not stored' : 'Prototype metadata only'}</Text>
      </Card>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigate('location')} accessibilityRole="button"><Text style={styles.quickTitle}>Location</Text><Text style={styles.quickText}>Check council context</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigate('device')} accessibilityRole="button"><Text style={styles.quickTitle}>Device Lab</Text><Text style={styles.quickText}>Battery and sensors</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigate('account')} accessibilityRole="button"><Text style={styles.quickTitle}>Account</Text><Text style={styles.quickText}>Firebase sync</Text></TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.colors.primaryDark, borderColor: '#315E4A' },
  heroKicker: { ...theme.typography.label, color: '#BAD7C9', textTransform: 'uppercase' },
  heroTitle: { fontSize: 30, lineHeight: 36, fontWeight: '900', color: theme.colors.white, marginTop: 8 },
  heroBody: { ...theme.typography.body, color: '#D9E8E0', marginTop: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionButton: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 8 },
  meta: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: '31.8%', minHeight: 104, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 22, padding: 14, justifyContent: 'space-between' },
  quickTitle: { fontSize: 15, fontWeight: '900', color: theme.colors.text },
  quickText: { fontSize: 12, lineHeight: 17, color: theme.colors.textMuted },
});
