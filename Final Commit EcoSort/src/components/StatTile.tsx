import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { 
    flex: 1, 
    backgroundColor: theme.colors.surfaceRaised, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(0, 0, 0, 0.04)', 
    padding: 16, 
    minHeight: 112, 
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  label: { 
    ...theme.typography.label, 
    color: theme.colors.textSubtle, 
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  value: { 
    fontSize: 28, 
    lineHeight: 34, 
    color: theme.colors.text, 
    fontWeight: '800', 
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  hint: { 
    ...theme.typography.caption, 
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});