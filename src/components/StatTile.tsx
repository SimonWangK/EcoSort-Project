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
  tile: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, padding: 16, minHeight: 112 },
  label: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase' },
  value: { fontSize: 26, lineHeight: 32, color: theme.colors.text, fontWeight: '900', marginTop: 10 },
  hint: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 6 },
});
