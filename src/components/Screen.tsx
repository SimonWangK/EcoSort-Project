import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: 112, gap: theme.spacing.md },
  header: { marginBottom: theme.spacing.xs },
  title: { ...theme.typography.h1, color: theme.colors.text },
  subtitle: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: theme.spacing.xs },
});
