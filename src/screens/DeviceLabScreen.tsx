import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Battery from 'expo-battery';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

interface DeviceLabScreenProps {
  onBack: () => void;
}

export function DeviceLabScreen({ onBack }: DeviceLabScreenProps) {
  const { textScale } = useSettings();
  const [battery, setBattery] = useState<number | null>(null);
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    Battery.getBatteryLevelAsync().then(setBattery).catch(() => setBattery(null));
    Accelerometer.setUpdateInterval(900);
    Gyroscope.setUpdateInterval(900);
    const a = Accelerometer.addListener(setAccel);
    const g = Gyroscope.addListener(setGyro);
    return () => { a.remove(); g.remove(); };
  }, []);

  return (
    <Screen title="Device health" subtitle="See how EcoSort adapts to your device for a lighter experience.">
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
        <Text style={scaleTextStyle(styles.backButtonText, textScale)}>Back</Text>
      </Pressable>

      <Metric textScale={textScale} title="Battery" value={battery === null ? 'Unavailable' : `${Math.round(battery * 100)}%`} detail="Helps EcoSort reduce camera use when power is low." />
      <Metric textScale={textScale} title="Motion" value={`${accel.x.toFixed(2)} · ${accel.y.toFixed(2)} · ${accel.z.toFixed(2)}`} detail="Movement readings update while this screen is open." />
      <Metric textScale={textScale} title="Rotation" value={`${gyro.x.toFixed(2)} · ${gyro.y.toFixed(2)} · ${gyro.z.toFixed(2)}`} detail="Rotation readings update while this screen is open." />
    </Screen>
  );
}

function Metric({ title, value, detail, textScale }: { title: string; value: string; detail: string; textScale: number }) {
  return (
    <Card>
      <View style={styles.row}>
        <Text style={scaleTextStyle(styles.title, textScale)}>{title}</Text>
        <Text style={scaleTextStyle(styles.value, textScale)}>{value}</Text>
      </View>
      <Text style={scaleTextStyle(styles.detail, textScale)}>{detail}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backButtonText: { ...theme.typography.body, color: theme.colors.textMuted, marginLeft: 4, fontWeight: '600' },
  row: { gap: 8 },
  title: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase' },
  value: { ...theme.typography.h2, color: theme.colors.text },
  detail: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 8 },
});