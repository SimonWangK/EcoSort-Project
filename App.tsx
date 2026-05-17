import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from './src/styles/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View>
          <Text style={styles.logo}>EcoSort</Text>
          <Text style={styles.title}>Smart recycling guide</Text>
          <Text style={styles.description}>
            Search local recycling rules, check disposal guidance, and keep a simple
            history of your recycling actions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Built for everyday sorting</Text>
          <Text style={styles.cardText}>
            EcoSort helps users make quicker decisions about common waste items,
            with a focus on privacy-aware and offline-friendly guidance.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 28,
  },
  title: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.muted,
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});