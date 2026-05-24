import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Battery from 'expo-battery';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';

export function DeviceLabScreen() {
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
    <Screen title="Device signals" subtitle="A compact view of the mobile capabilities EcoSort can use responsibly.">
      <Metric title="Battery" value={battery === null ? 'Unavailable' : `${Math.round(battery * 100)}%`} detail="Useful for lightweight, energy-aware experiences." />
      <Metric title="Accelerometer" value={`${accel.x.toFixed(2)} · ${accel.y.toFixed(2)} · ${accel.z.toFixed(2)}`} detail="Motion values update gently for demonstration." />
      <Metric title="Gyroscope" value={`${gyro.x.toFixed(2)} · ${gyro.y.toFixed(2)} · ${gyro.z.toFixed(2)}`} detail="Rotation data confirms sensor access." />
    </Screen>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <Card><View style={styles.row}><Text style={styles.title}>{title}</Text><Text style={styles.value}>{value}</Text></View><Text style={styles.detail}>{detail}</Text></Card>;
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  title: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase' },
  value: { ...theme.typography.h2, color: theme.colors.text },
  detail: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 8 },
});
