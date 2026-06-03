import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

export function Card({ children, style, muted = false }: { children: ReactNode; style?: ViewStyle; muted?: boolean }) {
  return <View style={[styles.card, muted && styles.muted, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)', // Subtle hairline border
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  muted: {
    backgroundColor: theme.colors.canvasSoft,
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});