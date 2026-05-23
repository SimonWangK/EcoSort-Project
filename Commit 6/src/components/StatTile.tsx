import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: 15, minHeight: 108, justifyContent: 'space-between' },
  label: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase' },
  value: { fontSize: 25, lineHeight: 31, color: theme.colors.text, fontWeight: '800', letterSpacing: -0.45 },
  hint: { ...theme.typography.caption, color: theme.colors.textMuted },
});
