import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, Search, Scan, Clock, Settings } from 'lucide-react-native'; 

import { AppScreen } from '../types';
import { tabAccessibilityLabel } from '../utils/accessibility';


interface Item {
  key: AppScreen; 
  label: string;
  icon?: string;
}

const renderIcon = (key: string, active: boolean) => {
  const color = active ? '#1B3B2B' : '#72777A'; 
  const size = 24;
  const strokeWidth = 2;

  switch (key.toLowerCase()) {
    case 'home':
      return <Home color={color} size={size} strokeWidth={strokeWidth} />;
    case 'search':
      return <Search color={color} size={size} strokeWidth={strokeWidth} />;
    case 'scan':
      return <Scan color={color} size={size} strokeWidth={strokeWidth} />;
    case 'history':
      return <Clock color={color} size={size} strokeWidth={strokeWidth} />;
    case 'settings':
      return <Settings color={color} size={size} strokeWidth={strokeWidth} />;
    default:
      return null;
  }
};


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
              <View style={styles.iconWrapper}>
                {renderIcon(item.key as string, active)}
              </View>

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
    paddingHorizontal: 16,
    paddingBottom: 24, 
    paddingTop: 8,
    backgroundColor: '#FAFAFA', 
  },

  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 32,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3, 
  },

  item: {
    flex: 1,
    minHeight: 64, 
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  active: {
    backgroundColor: '#F0F5EC', 

  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },

  iconWrapper: {
    marginBottom: 4, 
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#72777A', 
    letterSpacing: 0,
  },

  activeLabel: {
    color: '#1B3B2B', 
    fontWeight: '700',
  },
});