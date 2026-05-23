import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface BrandMarkProps {
  compact?: boolean;
  style?: ViewStyle;
}

export function BrandMark({ compact = false, style }: BrandMarkProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.logoShell}>
        <Image source={require('../../assets/logo-mark.png')} style={styles.logo} resizeMode="contain" />
      </View>
      {!compact ? (
        <View>
          <Text style={styles.name}>EcoSort</Text>
          <Text style={styles.tagline}>Smart recycling guide</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoShell: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryTint,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 30, height: 30 },
  name: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.2 },
  tagline: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 1 },
});
