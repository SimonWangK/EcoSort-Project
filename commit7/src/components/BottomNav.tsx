import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import { AppScreen } from '../types';
import { tabAccessibilityLabel } from '../utils/accessibility';

interface Item {
  key: AppScreen;
  label: string;
  icon?: string;
}

export function BottomNav({
  current,
  onChange,
  items,
}: {
  current: AppScreen;
  onChange: (screen: AppScreen) => void;
  items: Item[];
}) {
  return (
    <View style={styles.outer}>
      <View style={styles.wrap}>
        {items.map((item) => {
          const active = current === item.key;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tabAccessibilityLabel(item.label, active)}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.item,
                active && styles.active,
                pressed && styles.pressed,
              ]}
            >


              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(245, 242, 236, 0.84)',
  },

  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 254, 251, 0.96)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(28, 49, 39, 0.08)',
    padding: 6,
    ...theme.shadow.soft,
  },

  item: {
    flex: 1,
    minHeight: 58,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  active: {
    backgroundColor: '#EEF5EF',
    borderWidth: 1,
    borderColor: 'rgba(20, 88, 59, 0.08)',
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  activeGlow: {
    position: 'absolute',
    top: 8,
    left: 14,
    right: 14,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },


  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    letterSpacing: -0.08,
  },

  activeLabel: {
    color: theme.colors.primaryDark,
    fontWeight: '900',
  },
});