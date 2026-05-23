import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from './BrandMark';
import { theme } from '../theme/theme';

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.brandRow}>
        <BrandMark compact />
        <View style={styles.statusPill}><Text style={styles.statusText}>Local-first</Text></View>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: 112, gap: theme.spacing.md },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  statusPill: { borderRadius: theme.radius.pill, backgroundColor: theme.colors.primaryTint, borderWidth: 1, borderColor: '#D7E3DA', paddingHorizontal: 12, paddingVertical: 7 },
  statusText: { ...theme.typography.caption, color: theme.colors.primaryDark, fontWeight: '700' },
  header: { marginBottom: theme.spacing.xs },
  title: { ...theme.typography.h1, color: theme.colors.text },
  subtitle: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: theme.spacing.xs, maxWidth: 350 },
});
