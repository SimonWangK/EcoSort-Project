import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppSettings } from '../types';
import { theme } from '../theme/theme';
import { permissionErrorMessage } from '../utils/errorMessages';

export function LocationScreen({ settings, onChange }: { settings: AppSettings; onChange: (settings: AppSettings) => void }) {
  const [loading, setLoading] = useState(false);
  const detect = async () => {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error(permissionErrorMessage('location'));
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const council = position.coords.latitude < -33 ? 'Yarra Council' : 'Melbourne City Council';
      await onChange({ ...settings, locationCouncil: council });
    } catch (error) {
      Alert.alert('Location', error instanceof Error ? error.message : 'Location could not be detected.');
    } finally { setLoading(false); }
  };

  return (
    <Screen title="Location context" subtitle="Use approximate location to keep recycling guidance aligned with local council rules.">
      <Card>
        <Text style={styles.label}>Active council</Text>
        <Text style={styles.value}>{settings.locationCouncil || 'Not detected yet'}</Text>
        <Text style={styles.text}>EcoSort only stores the council label in settings, not exact coordinates in scan history.</Text>
        <AppButton title="Detect council" onPress={detect} loading={loading} style={styles.button} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase' },
  value: { ...theme.typography.h1, color: theme.colors.text, marginTop: 8 },
  text: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: 10 },
  button: { marginTop: 18 },
});
