import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AppButton({ title, onPress, variant = 'primary', disabled, loading, style, accessibilityLabel, accessibilityHint }: AppButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? theme.colors.white : theme.colors.primary} /> : (
        <Text style={[styles.text, variant !== 'primary' && styles.textSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  primary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.primaryTint, borderColor: '#D7E3DA' },
  ghost: { backgroundColor: 'transparent', borderColor: theme.colors.borderStrong },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  disabled: { opacity: 0.48 },
  text: { color: theme.colors.white, fontSize: 15, fontWeight: '800', letterSpacing: -0.05 },
  textSecondary: { color: theme.colors.primaryDark },
});
