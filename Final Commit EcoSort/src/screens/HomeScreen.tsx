import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppScreen, ScanHistoryEntry, AppSettings } from '../types';
import { calculateTotalCo2, calculateTotalPoints, formatKg } from '../services/scoringService';
import { theme } from '../theme/theme';

// ── helpers ────────────────────────────────────────────────────────────────────

/** Maps a bin label to a relevant MaterialCommunityIcons icon name. */
function iconForBin(binLabel: string): React.ComponentProps<typeof MaterialCommunityIcons>['name'] {
  const label = binLabel.toLowerCase();
  if (label.includes('glass'))    return 'bottle-wine-outline';
  if (label.includes('recycle'))  return 'recycle';
  if (label.includes('compost'))  return 'leaf-circle-outline';
  if (label.includes('drop-off')) return 'map-marker-outline';
  if (label.includes('general'))  return 'trash-can-outline';
  return 'help-circle-outline';
}

// ── RecentCheckCard ────────────────────────────────────────────────────────────

/**
 * Shows the most recent scan history entry, or a friendly placeholder
 * when history is empty. Tapping "View all" navigates to History screen.
 */
function RecentCheckCard({
  entry,
  onViewAll,
}: {
  entry: ScanHistoryEntry | null;
  onViewAll: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent check</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {entry ? (
        /* Real data: show the most recent scan result */
        <View style={styles.recentItemRow}>
          <View style={styles.itemIconWrapper}>
            <MaterialCommunityIcons
              name={iconForBin(entry.binLabel)}
              size={24}
              color="#2E6C4C"
            />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>
              {entry.item}
            </Text>
            <View style={styles.itemTags}>
              <Text style={styles.tagGreen} numberOfLines={1}>
                {entry.binLabel}
              </Text>
              <View style={styles.tagDot} />
              <Text style={styles.tagGray}>{entry.council}</Text>
            </View>
          </View>
        </View>
      ) : (
        /* Empty state: no history yet */
        <View style={styles.recentItemRow}>
          <View style={styles.itemIconWrapper}>
            <MaterialCommunityIcons name="magnify" size={24} color="#8E928F" />
          </View>
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: '#8E928F' }]}>No checks yet</Text>
            <View style={styles.itemTags}>
              <Text style={styles.tagGray}>Search or scan an item to start</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function HomeScreen({
  navigate,
  history,
  settings,
}: {
  navigate: (screen: AppScreen) => void;
  history: ScanHistoryEntry[];
  settings: AppSettings;
}) {
  const points = calculateTotalPoints(history);
  const co2    = calculateTotalCo2(history);
  const councilLabel = settings.locationCouncil || 'Yarra Council (demo)';

  // Most recent scan entry (null when history is empty)
  const latestEntry = history.length > 0 ? history[0] : null;

  const locationHeaderNode = (
    <Pressable
      style={styles.locationPill}
      onPress={() => navigate('location')}
      accessibilityRole="button"
      accessibilityLabel={`Current location is ${councilLabel}. Tap to change.`}
    >
      <Text style={styles.locationLabel} numberOfLines={1}>
        {councilLabel}
      </Text>
      <View style={styles.locationDivider} />
      <Text style={styles.locationAction}>Change</Text>
    </Pressable>
  );

  return (
    <Screen title="" headerRight={locationHeaderNode}>

      <View style={styles.bgDecorCircleSmall} />
      <View style={styles.bgDecorCircleLarge} />

      <View style={styles.customHeader}>
        <Text style={styles.titleBlack}>Sort with</Text>
        <Text style={styles.titleGreen}>confidence.</Text>
        <Text style={styles.subtitle}>
          Find the right bin in seconds.{'\n'}For a cleaner tomorrow.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.searchRow}>

          <TouchableOpacity
            style={styles.searchInputContainer}
            activeOpacity={0.8}
            onPress={() => navigate('search')}
          >
            <Feather name="search" size={20} color="#1A1C1A" />
            <View pointerEvents="none" style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search an item"
                placeholderTextColor="#8E928F"
                editable={false}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanButtonSquare}
            onPress={() => navigate('search')}
          >
            <MaterialCommunityIcons name="barcode-scan" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.scanItemButton}
          onPress={() => navigate('scan')}
        >
          <Feather name="camera" size={20} color="#2E6C4C" />
          <Text style={styles.scanItemText}>Scan an item</Text>
          <Feather name="chevron-right" size={20} color="#1A1C1A" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* Recent check — now powered by real history data */}
      <RecentCheckCard entry={latestEntry} onViewAll={() => navigate('history')} />

      {/* Your Impact — calculated from real history */}
      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <MaterialCommunityIcons name="leaf" size={16} color="#2E6C4C" />
          <Text style={styles.impactTitle}>Your impact</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Feather name="clock" size={18} color="#2E6C4C" style={styles.statIcon} />
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Items checked</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Feather name="star" size={18} color="#2E6C4C" style={styles.statIcon} />
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Eco points</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Feather name="cloud" size={18} color="#2E6C4C" style={styles.statIcon} />
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {formatKg(co2)} <Text style={styles.statUnit}></Text>
            </Text>
            <Text style={styles.statLabel}>CO₂ saved</Text>
          </View>
        </View>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1C1A',
    maxWidth: 110,
  },
  locationDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginHorizontal: 8,
  },
  locationAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E928F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bgDecorCircleLarge: {
    position: 'absolute',
    top: 60,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#EBF4EE',
    opacity: 0.8,
    zIndex: -1,
  },
  bgDecorCircleSmall: {
    position: 'absolute',
    top: 50,
    right: 140,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#D1E6D8',
    zIndex: -1,
  },

  customHeader: {
    marginBottom: 12,
    marginTop: -60,
  },
  titleBlack: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1C1A',
    letterSpacing: -1,
  },
  titleGreen: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2E6C4C',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E928F',
    lineHeight: 22,
    fontWeight: '500',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1A1C1A',
    fontWeight: '500',
  },
  scanButtonSquare: {
    width: 56,
    height: 56,
    backgroundColor: '#347A5A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8E928F',
    fontSize: 14,
  },
  scanItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  scanItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1A',
    marginLeft: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1A',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E6C4C',
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1A',
    marginBottom: 4,
  },
  itemTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagGreen: {
    fontSize: 13,
    fontWeight: '600',
    color: '#347A5A',
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5D2',
    marginHorizontal: 8,
  },
  tagGray: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E928F',
  },

  // Your Impact card
  impactCard: {
    backgroundColor: '#F0F6F2',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1A',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statBox: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#DCE6E0',
    marginHorizontal: 10,
    marginTop: 10,
  },
  statIcon: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1C1A',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E928F',
  },
});
