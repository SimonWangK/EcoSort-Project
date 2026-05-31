import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ScanHistoryEntry } from '../types';
import { COUNCIL_RULES } from '../data/councilRules';
import { theme } from '../theme/theme';

// ── helpers ────────────────────────────────────────────────────────────────────

function getConfidence(ruleId: string): number | null {
  const rule = COUNCIL_RULES.find((r) => r.id === ruleId);
  return rule ? rule.confidence : null;
}

function sourceLabel(source: ScanHistoryEntry['source']): string {
  if (source === 'camera') return 'Camera scan';
  if (source === 'location-demo') return 'Location demo';
  return 'Manual search';
}

// ── Detail modal ───────────────────────────────────────────────────────────────

function DetailModal({
  entry,
  onClose,
}: {
  entry: ScanHistoryEntry;
  onClose: () => void;
}) {
  const confidence = getConfidence(entry.ruleId);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modal.backdrop} />
      </TouchableWithoutFeedback>

      <View style={modal.sheet}>
        {/* drag handle */}
        <View style={modal.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modal.content}>
          {/* header */}
          <View style={modal.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={modal.itemTitle}>{entry.item}</Text>
              <Text style={modal.binLabel}>{entry.binLabel}</Text>
            </View>
            <Text style={modal.points}>+{entry.points} pts</Text>
          </View>

          <View style={modal.divider} />

          {/* detail rows */}
          <DetailRow label="Council" value={entry.council} />
          <DetailRow label="Source" value={sourceLabel(entry.source)} />
          <DetailRow
            label="Timestamp"
            value={new Date(entry.timestamp).toLocaleString()}
          />
          {confidence !== null && (
            <DetailRow
              label="Confidence"
              value={`${Math.round(confidence * 100)}%`}
              valueColor={
                confidence >= 0.9
                  ? theme.colors.success
                  : confidence >= 0.75
                  ? theme.colors.warning
                  : theme.colors.danger
              }
            />
          )}
          <DetailRow label="CO₂ estimate" value={`${entry.co2EstimateKg} kg`} />

          <View style={modal.divider} />

          {/* privacy note */}
          <Text style={modal.privacyLabel}>Privacy note</Text>
          <Text style={modal.privacyText}>{entry.storedData}</Text>
        </ScrollView>

        <AppButton title="Close" variant="ghost" onPress={onClose} style={modal.closeBtn} />
      </View>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={modal.row}>
      <Text style={modal.rowLabel}>{label}</Text>
      <Text style={[modal.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function HistoryScreen({
  history,
  onClear,
}: {
  history: ScanHistoryEntry[];
  onClear: () => void;
}) {
  const [selected, setSelected] = useState<ScanHistoryEntry | null>(null);

  return (
    <Screen
      title="History"
      subtitle="Tap any record to see full details. Sensitive raw data stays out of the list by default."
    >
      {history.length === 0 ? (
        <Card muted>
          <Text style={styles.emptyTitle}>No saved checks yet</Text>
          <Text style={styles.emptyText}>
            Search or scan an item, then save the result to build your local EcoSort history.
          </Text>
        </Card>
      ) : (
        <>
          {history.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => setSelected(entry)}
              accessibilityRole="button"
              accessibilityHint="Tap to view full details"
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Card style={styles.item}>
                <View style={styles.row}>
                  <View style={styles.dot} />
                  <View style={styles.itemText}>
                    <Text style={styles.itemTitle}>{entry.item}</Text>
                    <Text style={styles.bin}>{entry.binLabel}</Text>
                  </View>
                  <View style={styles.rightCol}>
                    <Text style={styles.points}>+{entry.points}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </View>
                <Text style={styles.meta}>
                  {entry.council} · {new Date(entry.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.privacy}>{entry.storedData}</Text>
              </Card>
            </Pressable>
          ))}
          <AppButton title="Clear history" variant="ghost" onPress={onClear} />
        </>
      )}

      {selected ? (
        <DetailModal entry={selected} onClose={() => setSelected(null)} />
      ) : null}
    </Screen>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  emptyTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 6 },
  emptyText: { ...theme.typography.body, color: theme.colors.textMuted },
  item: { gap: 9 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.988 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 10, backgroundColor: theme.colors.primary },
  itemText: { flex: 1 },
  itemTitle: { ...theme.typography.h3, color: theme.colors.text, textTransform: 'capitalize' },
  points: {
    color: theme.colors.success,
    fontWeight: '800',
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  chevron: { fontSize: 18, color: theme.colors.textSubtle, fontWeight: '300' },
  bin: { ...theme.typography.small, color: theme.colors.primaryDark, marginTop: 2 },
  meta: { ...theme.typography.small, color: theme.colors.textMuted },
  privacy: { ...theme.typography.caption, color: theme.colors.textSubtle },
});

const modal = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 33, 29, 0.45)',
  },
  sheet: {
    backgroundColor: theme.colors.canvas,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxHeight: '78%',
    ...theme.shadow.card,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.borderStrong,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  content: { paddingTop: 12, paddingBottom: 8, gap: 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: theme.colors.text,
    textTransform: 'capitalize',
    letterSpacing: -0.2,
  },
  binLabel: { ...theme.typography.body, color: theme.colors.primaryDark, marginTop: 4 },
  points: {
    ...theme.typography.h3,
    color: theme.colors.success,
    backgroundColor: theme.colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  rowLabel: { ...theme.typography.small, color: theme.colors.textSubtle, fontWeight: '600' },
  rowValue: { ...theme.typography.small, color: theme.colors.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  privacyLabel: {
    ...theme.typography.label,
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  privacyText: { ...theme.typography.small, color: theme.colors.textMuted, lineHeight: 20 },
  closeBtn: { marginTop: 16 },
});
