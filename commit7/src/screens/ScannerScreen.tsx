import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ResultCard } from '../components/ResultCard';
import { matchCouncilRule } from '../services/ruleMatcher';
import { CouncilRule } from '../types';
import { theme } from '../theme/theme';
import { permissionErrorMessage } from '../utils/errorMessages';

export function ScannerScreen({ onSaveResult }: { onSaveResult: (rule: CouncilRule, source: 'camera') => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [result, setResult] = useState<CouncilRule | null>(null);

  if (!permission) return <Screen title="Scanner" subtitle="Checking camera access..."><Card><Text style={styles.text}>Loading camera status.</Text></Card></Screen>;

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
        <AppButton title={scanned ? 'Scan again' : 'Demo capture'} onPress={() => { setScanned(false); classifyDemo(); }} style={styles.button} />
      </Card>
      {result ? <ResultCard rule={result} onSave={() => onSaveResult(result, 'camera')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraFrame: { height: 330, borderRadius: theme.radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.black },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: '#E8F2EB' },
  topLeft: { top: 24, left: 24, borderLeftWidth: 2, borderTopWidth: 2, borderTopLeftRadius: 12 },
  topRight: { top: 24, right: 24, borderRightWidth: 2, borderTopWidth: 2, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 24, left: 24, borderLeftWidth: 2, borderBottomWidth: 2, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 24, right: 24, borderRightWidth: 2, borderBottomWidth: 2, borderBottomRightRadius: 12 },
  title: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 8 },
  text: { ...theme.typography.body, color: theme.colors.textMuted },
  button: { marginTop: 14 },
});
