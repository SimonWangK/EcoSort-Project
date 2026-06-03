import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

export function TextField(props: TextInputProps) {
  const { textScale } = useSettings();
  return <TextInput {...props} placeholderTextColor={theme.colors.textSubtle} style={[scaleTextStyle(styles.input, textScale), props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.canvasSoft,
    paddingHorizontal: 16,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
});
