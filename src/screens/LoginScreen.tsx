import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppButton } from '../components/AppButton';
import { BrandMark } from '../components/BrandMark';
import { TextField } from '../components/TextField';
import { AuthSession } from '../types';
import { createLocalAnonymousSession, firebaseAnonymousSignIn, firebaseEmailPassword } from '../services/firebaseService';
import { theme } from '../theme/theme';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

export function LoginScreen({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const { textScale } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const authEmail = async (action: 'signUp' | 'signInWithPassword') => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please enter your email and password.');
    }
    setLoading(true);
    try {
      const session = await firebaseEmailPassword(action, email.trim(), password);
      onLogin({ ...session, mode: 'firebase' });
    } catch (error) {
      Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const authAnonymous = async () => {
        onLogin(createLocalAnonymousSession());
  };

  const authFirebaseAnonymous = async () => {
    setLoading(true);
    try {
      const session = await firebaseAnonymousSignIn();
      onLogin({ ...session, mode: 'firebase' });
    } catch (error) {
      Alert.alert('Could not continue', error instanceof Error ? error.message : 'We could not start this sign-in option. Use without sign-in or try email sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>

        {/* ── Brand header ── */}
        <View style={styles.top}>
          <BrandMark />
          <Text style={scaleTextStyle(styles.title, textScale)}>Sign in to EcoSort</Text>
          <Text style={scaleTextStyle(styles.body, textScale)}>
            Start right away, or sign in to keep your history and preferences available on another device.
          </Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>
          <Text style={scaleTextStyle(styles.fieldLabel, textScale)}>Email</Text>
          <TextField
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Text style={[scaleTextStyle(styles.fieldLabel, textScale), { marginTop: 14 }]}>Password</Text>
          <TextField
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
          />
          <View style={styles.emailActions}>
            <AppButton
              title="Sign in"
              onPress={() => authEmail('signInWithPassword')}
              loading={loading}
              style={styles.halfBtn}
            />
            <AppButton
              title="Create account"
              variant="secondary"
              onPress={() => authEmail('signUp')}
              loading={loading}
              style={styles.halfBtn}
            />
          </View>
        </View>

        {/* ── Anonymous option ── */}
        <View style={styles.anonSection}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={scaleTextStyle(styles.orLabel, textScale)}>or</Text>
            <View style={styles.line} />
          </View>
          <AppButton
            title="Use without sign-in"
            variant="ghost"
            onPress={authAnonymous}
            loading={loading}
          />
          <AppButton
            title="Continue with private account"
            variant="secondary"
            onPress={authFirebaseAnonymous}
            loading={loading}
          />
          <Text style={scaleTextStyle(styles.anonHint, textScale)}>
            Start now without setup. Sign in anytime to keep your data available on another device.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.canvas },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  top: { gap: 14 },
  title: { ...theme.typography.display, color: theme.colors.text, marginTop: 14 },
  body: { ...theme.typography.body, color: theme.colors.textMuted, maxWidth: 355 },
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    gap: 0,
    ...theme.shadow.card,
  },
  fieldLabel: {
    ...theme.typography.label,
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  emailActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  halfBtn: { flex: 1 },
  anonSection: { gap: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orLabel: { ...theme.typography.caption, color: theme.colors.textSubtle },
  anonHint: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    textAlign: 'center',
    marginTop: -2,
  },
});
