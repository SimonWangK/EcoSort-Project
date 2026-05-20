import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

export function Card({ children, style, muted = false }: { children: ReactNode; style?: ViewStyle; muted?: boolean }) {
  return <View style={[styles.card, muted && styles.muted, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  muted: {
    backgroundColor: theme.colors.canvasSoft,
    borderColor: theme.colors.border,
    ...theme.shadow.none,
  },
});
