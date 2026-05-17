import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
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
    <TouchableOpacity
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? theme.colors.white : theme.colors.primary} /> : (
        <Text style={[styles.text, variant !== 'primary' && styles.textSecondary]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: '#C9DED2' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
  disabled: { opacity: 0.55 },
  text: { color: theme.colors.white, fontSize: 16, fontWeight: '800' },
  textSecondary: { color: theme.colors.primaryDark },
});
