// LocationScreen.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppSettings } from '../types';
import { theme } from '../theme/theme';
import { permissionErrorMessage } from '../utils/errorMessages';
import { getCouncilRuleSummary, resolveCouncilFromAddress, resolveCouncilFromCoordinates, SUPPORTED_COUNCILS } from '../data/councilRules';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

export function LocationScreen({
  settings,
  onChange,
  onBack,
}: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onBack: () => void;
}) {
  const { textScale } = useSettings();
  const [loading, setLoading] = useState(false);

  const selectCouncil = async (council: string) => {
    await onChange({ ...settings, locationCouncil: council });
  };

  const detect = async () => {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error(permissionErrorMessage('location'));

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let council = resolveCouncilFromCoordinates(position.coords.latitude, position.coords.longitude);

      try {
        const addresses = await Location.reverseGeocodeAsync(position.coords);
        const addressCouncil = resolveCouncilFromAddress(addresses[0]);
        if (addressCouncil) council = addressCouncil;
      } catch {
        // Coordinate geofence is already available as a fallback.
      }

      await onChange({ ...settings, locationCouncil: council });
      Alert.alert('Council updated', `EcoSort set the active council to ${council}.`);
    } catch (error) {
      Alert.alert('Location', error instanceof Error ? error.message : 'Location could not be detected.');
    } finally { setLoading(false); }
  };

  return (
    <Screen title="Council location" subtitle="Use device location or choose a council manually so Search and Scan can use local guidance.">
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
        <Text style={scaleTextStyle(styles.backButtonText, textScale)}>Back</Text>
      </Pressable>

      <Card>
        <Text style={scaleTextStyle(styles.label, textScale)}>Active council</Text>
        <Text style={scaleTextStyle(styles.value, textScale)}>{settings.locationCouncil || 'Not detected yet'}</Text>
        <Text style={scaleTextStyle(styles.text, textScale)}>EcoSort stores only the council label in settings. It does not save exact location details in scan history.</Text>
        <AppButton title="Detect council" onPress={detect} loading={loading} style={styles.button} />
      </Card>

      <Card muted>
        <Text style={scaleTextStyle(styles.sectionTitle, textScale)}>Manual council selection</Text>
        <Text style={scaleTextStyle(styles.text, textScale)}>Use this when you want to choose a council directly or when location detection is unavailable. Search and Scan will use the selected council guidance.</Text>
        <View style={styles.councilList}>
          {SUPPORTED_COUNCILS.map((council) => {
            const isActive = settings.locationCouncil === council;
            return (
              <Pressable
                key={council}
                style={({ pressed }) => [styles.councilRow, isActive && styles.councilRowActive, pressed && styles.pressed]}
                onPress={() => selectCouncil(council)}
                accessibilityRole="button"
                accessibilityLabel={`Use ${council}`}
              >
                <View style={styles.councilTextWrap}>
                  <Text style={[scaleTextStyle(styles.councilName, textScale), isActive && scaleTextStyle(styles.councilNameActive, textScale)]}>{council}</Text>
                  <Text style={scaleTextStyle(styles.councilMeta, textScale)}>{getCouncilRuleSummary(council)}</Text>
                </View>
                <Ionicons name={isActive ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isActive ? theme.colors.primaryDark : theme.colors.textSubtle} />
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backButtonText: { ...theme.typography.body, color: theme.colors.textMuted, marginLeft: 4, fontWeight: '600' },
  label: { ...theme.typography.label, color: theme.colors.textSubtle, textTransform: 'uppercase' },
  value: { ...theme.typography.h1, color: theme.colors.text, marginTop: 8 },
  text: { ...theme.typography.body, color: theme.colors.textMuted, marginTop: 10 },
  button: { marginTop: 18 },
  sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 2 },
  councilList: { gap: 10, marginTop: 16 },
  councilRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceRaised, padding: 14 },
  councilRowActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryTint },
  pressed: { opacity: 0.75 },
  councilTextWrap: { flex: 1 },
  councilName: { ...theme.typography.body, color: theme.colors.text, fontWeight: '800' },
  councilNameActive: { color: theme.colors.primaryDark },
  councilMeta: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 2 },
});
