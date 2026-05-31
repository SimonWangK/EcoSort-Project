import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { AppButton } from './AppButton';
import { CouncilRule } from '../types';
import { theme } from '../theme/theme';

export function ResultCard({ rule, onSave }: { rule: CouncilRule; onSave?: () => void }) {
  return (
    <Card style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.council}>{rule.council}</Text>
        <Text style={styles.confidence}>{Math.round(rule.confidence * 100)}% match</Text>
      </View>
      <Text style={styles.item}>{rule.item}</Text>
      <View style={styles.binPanel}>
        <Text style={styles.binLabel}>Recommended stream</Text>
        <Text style={styles.binText}>{rule.binLabel}</Text>
        <Text style={styles.binColor}>{rule.binColorName}</Text>
      </View>
      <Text style={styles.instruction}>{rule.instruction}</Text>
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Before you dispose</Text>
        <Text style={styles.note}>{rule.risk}</Text>
      </View>
      {onSave ? <AppButton title="Save to history" onPress={onSave} style={styles.button} accessibilityHint="Save this recycling guidance locally" /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  council: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase', flex: 1 },
  confidence: { ...theme.typography.caption, color: theme.colors.primaryDark, backgroundColor: theme.colors.primaryTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radius.pill, overflow: 'hidden' },
  item: { ...theme.typography.h2, color: theme.colors.text, textTransform: 'capitalize' },
  binPanel: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg, padding: 18, gap: 4 },
  binLabel: { ...theme.typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  binText: { fontSize: 25, lineHeight: 31, color: theme.colors.white, fontWeight: '800', letterSpacing: -0.35 },
  binColor: { ...theme.typography.small, color: '#D9E8E0' },
  instruction: { ...theme.typography.body, color: theme.colors.textMuted },
  noteBox: { backgroundColor: theme.colors.sandSoft, borderWidth: 1, borderColor: '#E5DCCB', borderRadius: theme.radius.md, padding: 14 },
  noteTitle: { ...theme.typography.caption, color: theme.colors.warning, fontWeight: '800', marginBottom: 4 },
  note: { ...theme.typography.small, color: theme.colors.textMuted },
  button: { marginTop: 2 },
});
