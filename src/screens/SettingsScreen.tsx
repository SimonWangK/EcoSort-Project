  // SettingsScreen.tsx
  import React from 'react';
  import { StyleSheet, Switch, Text, Pressable, View } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';

  import { Screen } from '../components/Screen';
  import { Card } from '../components/Card';
  import { AppSettings, AppScreen } from '../types';
  import { theme } from '../theme/theme';
  import { useSettings } from '../utils/settingsContext';
  import { scaleTextStyle } from '../utils/scaledStyles';

  interface SettingsScreenProps {
    settings: AppSettings;
    onChange: (settings: AppSettings) => void;
    navigate: (screen: AppScreen) => void;
    onScheduleReminder?: () => void;
  }

  export function SettingsScreen({
    settings,
    onChange,
    navigate,
    onScheduleReminder,
  }: SettingsScreenProps) {

    const { textScale } = useSettings();
    const reminderSubtitle = settings.notificationScheduledAt
      ? new Date(settings.notificationScheduledAt).toLocaleDateString()
      : 'Not scheduled yet';

    return (
      <Screen 
        title="Controls" 
        subtitle="Manage privacy, reading comfort, reminders, and device options in one simple place."
      >
        {/* ── Privacy & guidance toggles (Top Row) ── */}
        <Card style={styles.topRowCard}>
          <View style={styles.topRowHalf}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F2E8' }]}>
              <Ionicons name="shield-checkmark-outline" size={26} color="#1A3D24" />
            </View>
            <Text style={scaleTextStyle(styles.topRowTitle, textScale)}>Privacy</Text>
            <Text style={scaleTextStyle(styles.topRowSubtitle, textScale)}>No photo files saved</Text>
            <View >
              <Switch
                value={settings.privacyMode}
                onValueChange={(value) => onChange({ ...settings, privacyMode: value })}
                trackColor={{ false: '#E2E2E2', true: '#4A785E' }}
                thumbColor="#FFFFFF"
                style={styles.switch}
              />
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.topRowHalf}>
            <View style={[styles.iconBox, { backgroundColor: '#F7EFE6' }]}>
              <Ionicons name="cloud-download-outline" size={26} color="#8A5A29" />
            </View>
            <Text style={scaleTextStyle(styles.topRowTitle, textScale)}>Local rules</Text>
            <Text style={scaleTextStyle(styles.topRowSubtitle, textScale)}>On-device guide</Text>
            <View >
              <Switch
                value={settings.offlineDemo}
                onValueChange={(value) => onChange({ ...settings, offlineDemo: value })}
                trackColor={{ false: '#E2E2E2', true: '#4A785E' }}
                thumbColor="#FFFFFF"
                style={styles.switch}
              />
            </View>
          </View>
        </Card>

        {/* ── Reading size ── */}
        <Card>
          <View style={styles.readingHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F2E8', borderRadius: 14, width: 50, height: 50 }]}>
              <Text style={scaleTextStyle(styles.aaText, textScale)}>Aa</Text>
            </View>
            <View style={styles.readingHeaderText}>
              <Text style={scaleTextStyle(styles.itemTitle, textScale)}>Reading size</Text>
              <Text style={scaleTextStyle(styles.itemSubtitle, textScale)}>Choose a comfortable density.</Text>
            </View>
          </View>

          <View style={styles.segmentedContainer}>
            {[0.95, 1, 1.12].map((scale, index) => {
              const labels = ['A', 'A+', 'A++'];
              const isActive = settings.textScale === scale;
              return (
                <Pressable
                  key={scale}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => onChange({ ...settings, textScale: scale })}
                >
                  <Text style={[scaleTextStyle(styles.segmentBtnText, textScale), isActive && scaleTextStyle(styles.segmentBtnTextActive, textScale)]}>
                    {labels[index]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* ── Preferences ── */}
        <Card>
          <Text style={scaleTextStyle(styles.sectionTitle, textScale)}>Preferences</Text>
          <PreferenceRow
            textScale={textScale}
            icon={<Ionicons name="location-outline" size={20} color="#1A3D24" />}
            iconBg="#E8F2E8"
            title="Location"
            subtitle="Council settings"
            onPress={() => navigate('location' as AppScreen)}
          />
          <View style={styles.itemDivider} />
          <PreferenceRow
            textScale={textScale}
            icon={<Ionicons name="phone-portrait-outline" size={20} color="#8A5A29" />}
            iconBg="#F7EFE6"
            title="Device"
            subtitle="Device health"
            onPress={() => navigate('device' as AppScreen)}
          />
          <View style={styles.itemDivider} />
          <PreferenceRow
            textScale={textScale}
            icon={<Ionicons name="person-outline" size={20} color="#1A3D24" />}
            iconBg="#E8F2E8"
            title="Account"
            subtitle="Saved data"
            onPress={() => navigate('account' as AppScreen)}
          />
        </Card>

        {/* ── Reminder ── */}
        <Card style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F2E8', width: 42, height: 42 }]}>
              <Ionicons name="notifications-outline" size={22} color="#1A3D24" />
            </View>
            <View style={styles.reminderText}>
              <Text style={scaleTextStyle(styles.itemTitle, textScale)}>Reminder</Text>
              <Text style={scaleTextStyle(styles.itemSubtitle, textScale)}>{reminderSubtitle}</Text>
            </View>
            <Pressable style={styles.addBtn} onPress={onScheduleReminder} accessibilityRole="button" accessibilityLabel="Add reminder">
              <Ionicons name="add" size={22} color="#1A3D24" />
            </Pressable>
          </View>
        </Card>
      </Screen>
    );
  }

  function PreferenceRow({
    icon, iconBg, title, subtitle, onPress, textScale,
  }: {
    icon: React.ReactNode; iconBg: string; title: string; subtitle: string; onPress: () => void; textScale: number;
  }) {
    return (
      <Pressable style={styles.prefRow} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: iconBg, width: 40, height: 40, marginBottom: 0 }]}>
          {icon}
        </View>
        <View style={styles.prefTextContainer}>
          <Text style={scaleTextStyle(styles.itemTitle, textScale)}>{title}</Text>
          <Text style={scaleTextStyle(styles.itemSubtitle, textScale)}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
      </Pressable>
    );
  }

  const styles = StyleSheet.create({
    topRowCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, paddingVertical: 24 },
    topRowHalf: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
    verticalDivider: { width: 1, height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.04)' },
    iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    topRowTitle: { ...theme.typography.h3, color: theme.colors.text, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
    topRowSubtitle: { ...theme.typography.small, color: theme.colors.textMuted, marginBottom: 16, textAlign: 'center' },

    switch: { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] },
    readingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    aaText: { fontSize: 22, fontWeight: '700', color: '#1A3D24' },
    readingHeaderText: { marginLeft: 16 },
    segmentedContainer: { flexDirection: 'row', backgroundColor: '#F4EFE6', borderRadius: 16, padding: 6 },
    segmentBtn: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    segmentBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
    segmentBtnText: { fontWeight: '600', color: '#8D8A82', fontSize: 16 },
    segmentBtnTextActive: { fontWeight: '800', color: '#1A3D24' },
    sectionTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 16, fontWeight: '700' },
    prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    prefTextContainer: { flex: 1, marginLeft: 16 },
    itemTitle: { ...theme.typography.h3, color: theme.colors.text, fontWeight: '700', marginBottom: 2 },
    itemSubtitle: { ...theme.typography.small, color: theme.colors.textMuted },
    itemDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 4 },
    reminderCard: { paddingVertical: 18 },
    reminderRow: { flexDirection: 'row', alignItems: 'center' },
    reminderText: { flex: 1, marginLeft: 16 },
    addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F2E8', alignItems: 'center', justifyContent: 'center' },
  });