import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { StatTile } from '../components/StatTile';
import { BrandMark } from '../components/BrandMark';
import { theme } from '../theme/theme';
import { AppScreen, ScanHistoryEntry, AppSettings } from '../types';
import { calculateTotalCo2, calculateTotalPoints, formatKg } from '../services/scoringService';

export function HomeScreen({ navigate, history, settings }: { navigate: (screen: AppScreen) => void; history: ScanHistoryEntry[]; settings: AppSettings }) {
  const points = calculateTotalPoints(history);
  const co2 = calculateTotalCo2(history);
  return (
    <Screen title="Smart recycling, without the guesswork." subtitle="Check local disposal guidance, keep a clean history, and stay in control of what is stored.">
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <BrandMark />
          <View style={styles.pill}><Text style={styles.pillText}>Privacy-first</Text></View>
        </View>
        <Text style={styles.heroTitle}>Know the right bin in under a minute.</Text>
        <Text style={styles.heroBody}>Search common items, scan a barcode, or use location context for council-aware guidance.</Text>
        <View style={styles.actions}>
          <AppButton title="Search item" onPress={() => navigate('search')} style={styles.actionButton} accessibilityHint="Open manual item search" />
          <AppButton title="Open scanner" variant="secondary" onPress={() => navigate('scan')} style={styles.actionButton} accessibilityHint="Open camera scanner" />
        </View>
      </Card>

      <View style={styles.statsRow}>
        <StatTile label="Checks" value={String(history.length)} hint="saved locally" />
        <StatTile label="Points" value={String(points)} hint="eco score" />
        <StatTile label="CO₂" value={formatKg(co2)} hint="estimated" />
      </View>

      <Card muted>
        <View style={styles.contextHeader}>
          <Text style={styles.sectionTitle}>Current context</Text>
          <Text style={styles.statusDot}>{settings.offlineDemo ? 'Cached' : 'Ready'}</Text>
        </View>
        <Text style={styles.meta}>Council rules: {settings.locationCouncil || 'Yarra Council demo set'}</Text>
        <Text style={styles.meta}>Storage: {settings.privacyMode ? 'No raw photos or exact GPS in history' : 'Prototype metadata only'}</Text>
      </Card>

      <View style={styles.grid}>
        <QuickAction title="Location" text="Adjust council context" onPress={() => navigate('location')} />
        <QuickAction title="Device" text="Battery and sensors" onPress={() => navigate('device')} />
        <QuickAction title="Account" text="Cloud sync options" onPress={() => navigate('account')} />
      </View>
    </Screen>
  );
}

function QuickAction({ title, text, onPress }: { title: string; text: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 20, gap: 16, backgroundColor: theme.colors.surfaceRaised },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  pill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: theme.radius.pill, backgroundColor: theme.colors.primaryTint, borderWidth: 1, borderColor: '#D7E3DA' },
  pillText: { ...theme.typography.caption, color: theme.colors.primaryDark, fontWeight: '700' },
  heroTitle: { fontSize: 31, lineHeight: 37, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5, marginTop: 4 },
  heroBody: { ...theme.typography.body, color: theme.colors.textMuted, maxWidth: 330 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  actionButton: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  contextHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text },
  statusDot: { ...theme.typography.caption, color: theme.colors.primaryDark, backgroundColor: theme.colors.primaryTint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.pill, overflow: 'hidden' },
  meta: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: 3 },
  grid: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, minHeight: 100, backgroundColor: theme.colors.surfaceRaised, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 14, justifyContent: 'space-between' },
  pressed: { opacity: 0.78 },
  quickTitle: { ...theme.typography.h3, color: theme.colors.text },
  quickText: { ...theme.typography.caption, color: theme.colors.textMuted },
});
