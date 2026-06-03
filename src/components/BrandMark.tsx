import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

interface BrandMarkProps {
  compact?: boolean;
  style?: ViewStyle;
}

export function BrandMark({ compact = false, style }: BrandMarkProps) {
  const { textScale } = useSettings();
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.logoShell}>
        <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
      </View>
      {!compact ? (
        <View>
          <Text style={scaleTextStyle(styles.name, textScale)}>EcoSort</Text>
          <Text style={scaleTextStyle(styles.tagline, textScale)}>Smart recycling guide</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logoShell: {
    width: 48,
    height: 48,

    borderRadius: 18,

    backgroundColor: theme.colors.primaryTint,

    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 32,
    height: 32,
  },

  name: {
    fontSize: 19,
    lineHeight: 22,

    fontWeight: '800',

    letterSpacing: -0.4,

    color: theme.colors.text,
  },

  tagline: {
    fontSize: 12,
    lineHeight: 16,

    marginTop: 2,

    color: theme.colors.textMuted,
  },
});