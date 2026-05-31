import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from './BrandMark';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';

export function Screen({
  title,
  subtitle,
  children,
  headerRight,
  hideBrandRow = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  hideBrandRow?: boolean;
}) {
  // Read textScale from the global settings context so the Aa selector
  // in Settings > Reading size actually scales rendered text app-wide.
  const { textScale } = useSettings();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Conditionally render the top row */}
      {!hideBrandRow && (
        <View style={styles.brandRow}>
          <BrandMark compact />
          {headerRight ? (
            headerRight
          ) : (
            <View style={styles.statusPill}>
              <Text style={[styles.statusText, { fontSize: styles.statusText.fontSize * textScale }]}>
                Local-first
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.header}>
        {/* Apply textScale to screen-level title and subtitle text */}
        <Text style={[styles.title, { fontSize: styles.title.fontSize * textScale, lineHeight: styles.title.lineHeight * textScale }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { fontSize: styles.subtitle.fontSize * textScale, lineHeight: styles.subtitle.lineHeight * textScale }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 112,
    gap: theme.spacing.md
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  statusPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryTint,
    borderWidth: 1,
    borderColor: '#D7E3DA',
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDark,
    fontWeight: '700'
  },
  header: {
    marginBottom: theme.spacing.xs
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    maxWidth: 350,
    lineHeight: 22,
  },
});
