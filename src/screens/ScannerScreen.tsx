import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Battery from 'expo-battery';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ResultCard } from '../components/ResultCard';
import { classifyBarcodeScan } from '../services/ruleMatcher';
import { classifyWasteImageWithVisionApi, formatVisionConfidence, VisionPrediction } from '../services/visionRecognitionService';
import { AppScreen, AppSettings, CouncilRule } from '../types';
import { theme } from '../theme/theme';
import { permissionErrorMessage } from '../utils/errorMessages';
import { normaliseCouncil } from '../data/councilRules';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

const LOW_BATTERY_THRESHOLD = 0.10; // 10 %

export function ScannerScreen({
  onSaveResult,
  settings,
  navigate,
}: {
  onSaveResult: (rule: CouncilRule, source: 'camera') => void;
  settings: AppSettings;
  navigate: (screen: AppScreen) => void;
}) {
  const { textScale } = useSettings();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState('Point the camera at an item or product code.');
  const [result, setResult] = useState<CouncilRule | null>(null);
  const [visionPrediction, setVisionPrediction] = useState<VisionPrediction | null>(null);
  const [analysingPhoto, setAnalysingPhoto] = useState(false);

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

  const activeCouncil = normaliseCouncil(settings.locationCouncil);
  const batteryPct = batteryLevel === null ? null : Math.round(batteryLevel * 100);
  const batteryText = batteryPct === null ? 'Battery: unavailable' : `Battery: ${batteryPct}%`;
  const powerModeText = lowPowerMode === null ? '' : `  ·  Low power mode: ${lowPowerMode ? 'on' : 'off'}`;
  const isBatteryLow = batteryLevel !== null && batteryLevel < LOW_BATTERY_THRESHOLD;

  const openManualSearch = () => navigate('search');

  const resetScan = () => {
    setScanned(false);
    setBarcode(null);
    setResult(null);
    setVisionPrediction(null);
    setScanMessage('Point the camera at an item or product code.');
  };

  const handleBarcode = (data?: string) => {
    const scannedData = data?.trim() || '';
    setScanned(true);
    setBarcode(scannedData || 'No readable code');
    setVisionPrediction(null);

    const rule = classifyBarcodeScan(scannedData, activeCouncil);
    if (rule) {
      setResult(rule);
      setScanMessage(`Product code matched to ${rule.item} for ${rule.council}.`);
      return;
    }

    setResult(null);
    setScanMessage('Code detected, but no matching item guide was found. Try photo check or manual search.');
  };

  const analyseCurrentFrame = async () => {
    if (!cameraRef.current || analysingPhoto) return;

    setAnalysingPhoto(true);
    setScanned(true);
    setBarcode(null);
    setResult(null);
    setVisionPrediction(null);
    setScanMessage('Checking your item photo...');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.55,
        base64: true,
        exif: false,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        throw new Error('The photo could not be read. Try again.');
      }

      const classification = await classifyWasteImageWithVisionApi({
        imageBase64: photo.base64,
        mimeType: 'image/jpeg',
        council: activeCouncil,
      });

      setVisionPrediction(classification.prediction);
      if (classification.rule) {
        setResult(classification.rule);
        setScanMessage(
          `Photo check found ${classification.prediction.item} (${formatVisionConfidence(
            classification.prediction.confidence,
          )}) and matched it to ${classification.rule.council} guidance.`,
        );
      } else {
        setResult(null);
        setScanMessage(
          `Photo check found ${classification.prediction.item || 'an item'}, but no local guidance is available yet. Try manual search with a simpler item name.`,
        );
      }
    } catch (error) {
      setScanMessage('Photo check could not be completed. Try again with a clearer photo.');
    } finally {
      setAnalysingPhoto(false);
    }
  };

  if (!permission) {
    return (
      <Screen title="Scanner" subtitle="Preparing scanner...">
        <Card><Text style={scaleTextStyle(styles.text, textScale)}>Getting the scanner ready.</Text></Card>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen title="Scanner" subtitle="Camera scanning is optional. Manual search remains available.">
        <Card>
          <Text style={scaleTextStyle(styles.title, textScale)}>Allow camera access</Text>
          <Text style={scaleTextStyle(styles.text, textScale)}>{permissionErrorMessage('camera')}</Text>
          <AppButton title="Allow camera" onPress={requestPermission} style={styles.button} />
          <AppButton title="Use manual search" variant="secondary" onPress={openManualSearch} style={styles.button} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Scanner" subtitle={`Scan a product code or take an item photo for guidance from ${activeCouncil}. Photos are not saved to your history.`}>
      <View style={[styles.deviceBanner, isBatteryLow && styles.deviceBannerLow]}>
        <Text style={scaleTextStyle(styles.deviceText, textScale)}>
          🔋<Text style={[scaleTextStyle(styles.deviceValue, textScale), isBatteryLow && scaleTextStyle(styles.deviceValueLow, textScale)]}>{batteryText}</Text>
          <Text style={scaleTextStyle(styles.deviceMuted, textScale)}>{powerModeText}</Text>
        </Text>
      </View>

      {isBatteryLow ? (
        <Card style={styles.lowBatteryCard}>
          <Text style={scaleTextStyle(styles.lowBatteryIcon, textScale)}>⚠️</Text>
          <Text style={scaleTextStyle(styles.lowBatteryTitle, textScale)}>Camera disabled</Text>
          <Text style={scaleTextStyle(styles.lowBatteryBody, textScale)}>
            Battery is below 10%{batteryPct !== null ? ` (${batteryPct}%)` : ''}. The camera scanner is
            turned off to conserve power. Charge your device or use Manual Search instead.
          </Text>
          <AppButton
            title="Use manual search"
            variant="secondary"
            onPress={openManualSearch}
            style={styles.button}
          />
        </Card>
      ) : (
        <>
          <View style={styles.cameraFrame}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
              onBarcodeScanned={scanned || analysingPhoto ? undefined : ({ data }) => handleBarcode(data)}
            />
            <View pointerEvents="none" style={styles.overlay}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            {analysingPhoto ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={scaleTextStyle(styles.loadingText, textScale)}>Checking photo...</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <AppButton
              title={analysingPhoto ? 'Checking...' : 'Check item photo'}
              onPress={analyseCurrentFrame}
              disabled={analysingPhoto}
              style={styles.actionButton}
            />
            <AppButton title="Reset" variant="secondary" onPress={resetScan} style={styles.actionButton} />
          </View>

          <Card muted>
            <Text style={scaleTextStyle(styles.text, textScale)}>Scanned code: {barcode || 'No product code scanned yet'}</Text>
            <Text style={scaleTextStyle(styles.helperText, textScale)}>{scanMessage}</Text>
            {visionPrediction ? (
              <View style={styles.visionBox}>
                <Text style={scaleTextStyle(styles.visionTitle, textScale)}>Photo check</Text>
                <Text style={scaleTextStyle(styles.visionText, textScale)}>Item found: {visionPrediction.item || 'Unknown item'}</Text>
                <Text style={scaleTextStyle(styles.visionText, textScale)}>Match strength: {formatVisionConfidence(visionPrediction.confidence)}</Text>
                {visionPrediction.category ? <Text style={scaleTextStyle(styles.visionText, textScale)}>Material type: {visionPrediction.category}</Text> : null}
                {visionPrediction.labels.length ? <Text style={scaleTextStyle(styles.visionText, textScale)}>Photo clues: {visionPrediction.labels.join(', ')}</Text> : null}
                {visionPrediction.provider ? <Text style={scaleTextStyle(styles.visionText, textScale)}>Image check: Complete</Text> : null}
              </View>
            ) : null}
            {scanned && !result ? (
              <View style={styles.buttonRow}>
                <AppButton title="Try again" onPress={resetScan} style={styles.rowButton} />
                <AppButton title="Use manual search" variant="secondary" onPress={openManualSearch} style={styles.rowButton} />
              </View>
            ) : null}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: { ...theme.typography.body, color: '#FFFFFF', fontWeight: '700' },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: '#E8F2EB' },
  topLeft: { top: 24, left: 24, borderLeftWidth: 2, borderTopWidth: 2, borderTopLeftRadius: 12 },
  topRight: { top: 24, right: 24, borderRightWidth: 2, borderTopWidth: 2, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 24, left: 24, borderLeftWidth: 2, borderBottomWidth: 2, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 24, right: 24, borderRightWidth: 2, borderBottomWidth: 2, borderBottomRightRadius: 12 },
  title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 8 },
  text: { ...theme.typography.body, color: theme.colors.textMuted },
  helperText: { ...theme.typography.small, color: theme.colors.textSubtle, marginTop: 8 },
  visionBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  visionTitle: { ...theme.typography.small, color: theme.colors.text, fontWeight: '800', marginBottom: 4 },
  visionText: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 2 },
  button: { marginTop: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rowButton: { flex: 1 },
});
