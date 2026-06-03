import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { AppButton } from './AppButton';
import { CouncilRule } from '../types';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

function MetaList({ title, values }: { title: string; values?: string[] }) {
  const { textScale } = useSettings();
  if (!values || values.length === 0) return null;
  return (
    <View style={styles.metaList}>
      <Text style={scaleTextStyle(styles.metaTitle, textScale)}>{title}</Text>
      {values.slice(0, 3).map((value) => (
        <Text key={value} style={scaleTextStyle(styles.metaItem, textScale)}>• {value}</Text>
      ))}
    </View>
  );
}

export function ResultCard({ rule, onSave }: { rule: CouncilRule; onSave?: () => void }) {
  const { textScale } = useSettings();
  return (
    <Card style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={scaleTextStyle(styles.council, textScale)}>{rule.council}</Text>
        <Text style={scaleTextStyle(styles.confidence, textScale)}>{Math.round(rule.confidence * 100)}% match</Text>
      </View>
      <Text style={scaleTextStyle(styles.item, textScale)}>{rule.item}</Text>
      <View style={styles.binPanel}>
        <Text style={scaleTextStyle(styles.binLabel, textScale)}>Recommended stream</Text>
        <Text style={scaleTextStyle(styles.binText, textScale)}>{rule.binLabel}</Text>
        <Text style={scaleTextStyle(styles.binColor, textScale)}>{rule.binColorName}</Text>
      </View>
      <Text style={scaleTextStyle(styles.instruction, textScale)}>{rule.instruction}</Text>

      <View style={styles.metaGrid}>
        <MetaList title="Accepted" values={rule.acceptedIn} />
        <MetaList title="Not for" values={rule.rejectedIn} />
      </View>

      <View style={styles.noteBox}>
        <Text style={scaleTextStyle(styles.noteTitle, textScale)}>Before you dispose</Text>
        <Text style={scaleTextStyle(styles.note, textScale)}>{rule.risk}</Text>
      </View>

      <View style={styles.sourceBox}>
        <Text style={scaleTextStyle(styles.sourceText, textScale)}>{rule.sourceName || 'EcoSort council guide'}</Text>
        {rule.lastReviewedAt ? <Text style={scaleTextStyle(styles.sourceText, textScale)}>Reviewed {rule.lastReviewedAt}</Text> : null}
      </View>

      {onSave ? <AppButton title="Save to history" onPress={onSave} style={styles.button} accessibilityHint="Save this result on this device" /> : null}
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
  metaGrid: { flexDirection: 'row', gap: 10 },
  metaList: { flex: 1, backgroundColor: theme.colors.canvasSoft, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 12 },
  metaTitle: { ...theme.typography.caption, color: theme.colors.textSubtle, textTransform: 'uppercase', fontWeight: '800', marginBottom: 6 },
  metaItem: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 2 },
  noteBox: { backgroundColor: theme.colors.sandSoft, borderWidth: 1, borderColor: '#E5DCCB', borderRadius: theme.radius.md, padding: 14 },
  noteTitle: { ...theme.typography.caption, color: theme.colors.warning, fontWeight: '800', marginBottom: 4 },
  note: { ...theme.typography.small, color: theme.colors.textMuted },
  sourceBox: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 10, gap: 2 },
  sourceText: { ...theme.typography.caption, color: theme.colors.textSubtle },
  button: { marginTop: 2 },
});
