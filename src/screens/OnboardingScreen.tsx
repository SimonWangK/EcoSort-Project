import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppButton } from '../components/AppButton';
import { BrandMark } from '../components/BrandMark';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { textScale } = useSettings();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.top}>
          <BrandMark />
          <Text style={scaleTextStyle(styles.title, textScale)}>Recycling guidance that respects your context.</Text>
          <Text style={scaleTextStyle(styles.body, textScale)}>EcoSort uses optional camera and location access to make sorting decisions quicker, while keeping your history lightweight and privacy-aware.</Text>
        </View>
        <View style={styles.cardStack}>
          <InfoRow textScale={textScale} title="Camera" text="Scan a product code or use manual search anytime." />
          <InfoRow textScale={textScale} title="Location" text="Set your local council so guidance can match nearby rules." />
          <InfoRow textScale={textScale} title="Storage" text="Save only the result details needed for history and feedback." />
        </View>
        <AppButton title="Continue" onPress={onComplete} accessibilityHint="Finish onboarding and open EcoSort" />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ title, text, textScale }: { title: string; text: string; textScale: number }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoDot} />
      <View style={{ flex: 1 }}>
        <Text style={scaleTextStyle(styles.infoTitle, textScale)}>{title}</Text>
        <Text style={scaleTextStyle(styles.infoText, textScale)}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.canvas },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28, justifyContent: 'space-between' },
  top: { gap: 18 },
  title: { ...theme.typography.display, color: theme.colors.text, marginTop: 12 },
  body: { ...theme.typography.body, color: theme.colors.textMuted, maxWidth: 355 },
  cardStack: { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, padding: 18, gap: 16, ...theme.shadow.card },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoDot: { width: 9, height: 9, borderRadius: 9, backgroundColor: theme.colors.primary, marginTop: 7 },
  infoTitle: { ...theme.typography.h3, color: theme.colors.text },
  infoText: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 3 },
});
