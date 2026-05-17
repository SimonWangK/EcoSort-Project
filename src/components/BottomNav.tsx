import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme/theme';
import { AppScreen } from '../types';
import { tabAccessibilityLabel } from '../utils/accessibility';

interface Item { key: AppScreen; label: string; icon: string; }

export function BottomNav({ current, onChange, items }: { current: AppScreen; onChange: (screen: AppScreen) => void; items: Item[] }) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = current === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={tabAccessibilityLabel(item.label, active)}
            activeOpacity={0.84}
            onPress={() => onChange(item.key)}
            style={[styles.item, active && styles.active]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 18, right: 18, bottom: 18, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 26, borderWidth: 1, borderColor: theme.colors.border, padding: 6, ...theme.shadow.soft },
  item: { flex: 1, minHeight: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 2 },
  active: { backgroundColor: theme.colors.primary },
  icon: { fontSize: 18 },
  label: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted },
  activeLabel: { color: theme.colors.white },
});
