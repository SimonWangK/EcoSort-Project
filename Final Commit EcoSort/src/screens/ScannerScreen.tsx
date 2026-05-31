import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Battery from 'expo-battery';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ResultCard } from '../components/ResultCard';
import { matchCouncilRule } from '../services/ruleMatcher';
import { CouncilRule } from '../types';
import { theme } from '../theme/theme';
import { permissionErrorMessage } from '../utils/errorMessages';

const LOW_BATTERY_THRESHOLD = 0.10; // 10 %

export function ScannerScreen({ onSaveResult }: { onSaveResult: (rule: CouncilRule, source: 'camera') => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [result, setResult] = useState<CouncilRule | null>(null);

  // ── Battery / device info ─────────────────────────────────────────────────
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lowPowerMode, setLowPowerMode] = useState<boolean | null>(null);

  useEffect(() => {
    Battery.getBatteryLevelAsync()
      .then(setBatteryLevel)
      .catch(() => setBatteryLevel(null));
    Battery.isLowPowerModeEnabledAsync()
      .then(setLowPowerMode)
      .catch(() => setLowPowerMode(null));
  }, []);

  const batteryPct = batteryLevel === null ? null : Math.round(batteryLevel * 100);
  const batteryText = batteryPct === null ? 'Battery: unavailable' : `Battery: ${batteryPct}%`;
  const powerModeText = lowPowerMode === null ? '' : `  ·  Low power mode: ${lowPowerMode ? 'on' : 'off'}`;

  // ── Low-battery gate ──────────────────────────────────────────────────────
  const isBatteryLow = batteryLevel !== null && batteryLevel < LOW_BATTERY_THRESHOLD;

  // ── Permission checks ─────────────────────────────────────────────────────
  if (!permission) {
    return (
      <Screen title="Scanner" subtitle="Checking camera access...">
        <Card><Text style={styles.text}>Loading camera status.</Text></Card>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen title="Scanner" subtitle="Camera scanning is optional. Manual search remains available.">
        <Card>
          <Text style={styles.title}>Allow camera access</Text>
          <Text style={styles.text}>{permissionErrorMessage('camera')}</Text>
          <AppButton title="Allow camera" onPress={requestPermission} style={styles.button} />
        </Card>
      </Screen>
    );
  }

  const classifyDemo = (data?: string) => {
    const sample = data?.toLowerCase().includes('battery') ? 'battery' : 'glass bottle';
    const rule = matchCouncilRule(sample);
    if (!rule) return Alert.alert('No match', 'Try manual search for this item.');
    setResult(rule);
  };

  return (
    <Screen title="Scanner" subtitle="Use the camera workflow or demo capture. Raw photos are not saved to history.">

      {/* ── Device / battery info bar ── */}
      <View style={[styles.deviceBanner, isBatteryLow && styles.deviceBannerLow]}>
        <Text style={styles.deviceText}>
          🔋<Text style={[styles.deviceValue, isBatteryLow && styles.deviceValueLow]}>{batteryText}</Text>
          <Text style={styles.deviceMuted}>{powerModeText}</Text>
        </Text>
      </View>

      {/* ── Low battery warning — camera + scan disabled ── */}
      {isBatteryLow ? (
        <Card style={styles.lowBatteryCard}>
          <Text style={styles.lowBatteryIcon}>⚠️</Text>
          <Text style={styles.lowBatteryTitle}>Camera disabled</Text>
          <Text style={styles.lowBatteryBody}>
            Battery is below 10%{batteryPct !== null ? ` (${batteryPct}%)` : ''}. The camera scanner is
            turned off to conserve power. Charge your device or use Manual Search instead.
          </Text>
          <AppButton
            title="Use manual search"
            variant="secondary"
            onPress={() => Alert.alert('Tip', 'Navigate to the Search tab to look up items manually.')}
            style={styles.button}
          />
        </Card>
      ) : (
        <>
          {/* ── Camera viewfinder ── */}
          <View style={styles.cameraFrame}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'] }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => { setScanned(true); setBarcode(data); classifyDemo(data); }}
            />
            <View pointerEvents="none" style={styles.overlay}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <Card muted>
            <Text style={styles.text}>Barcode: {barcode || 'No barcode scanned yet'}</Text>
            <AppButton
              title={scanned ? 'Scan again' : 'Demo capture'}
              onPress={() => { setScanned(false); classifyDemo(); }}
              style={styles.button}
            />
          </Card>

          {result ? <ResultCard rule={result} onSave={() => onSaveResult(result, 'camera')} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  deviceBanner: {
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deviceBannerLow: {
    backgroundColor: '#FDF1EE',
    borderColor: '#E8B4AC',
  },
  deviceText: { ...theme.typography.small, color: theme.colors.textMuted },
  deviceValue: { ...theme.typography.small, color: theme.colors.text, fontWeight: '700' },
  deviceValueLow: { color: theme.colors.danger },
  deviceMuted: { ...theme.typography.small, color: theme.colors.textSubtle },
  lowBatteryCard: {
    backgroundColor: '#FDF1EE',
    borderColor: '#E8B4AC',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  lowBatteryIcon: { fontSize: 34 },
  lowBatteryTitle: { ...theme.typography.h2, color: theme.colors.danger, textAlign: 'center' },
  lowBatteryBody: { ...theme.typography.body, color: theme.colors.textMuted, textAlign: 'center', maxWidth: 310 },
  cameraFrame: {
    height: 330,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.black,
  },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: '#E8F2EB' },
  topLeft:    { top: 24,    left: 24,  borderLeftWidth: 2, borderTopWidth: 2,    borderTopLeftRadius: 12 },
  topRight:   { top: 24,    right: 24, borderRightWidth: 2, borderTopWidth: 2,   borderTopRightRadius: 12 },
  bottomLeft: { bottom: 24, left: 24,  borderLeftWidth: 2, borderBottomWidth: 2, borderBottomLeftRadius: 12 },
  bottomRight:{ bottom: 24, right: 24, borderRightWidth: 2, borderBottomWidth: 2,borderBottomRightRadius: 12 },
  title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 8 },
  text: { ...theme.typography.body, color: theme.colors.textMuted },
  button: { marginTop: 14 },
});
