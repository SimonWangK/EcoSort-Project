import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ScanHistoryEntry } from '../types';
import { theme } from '../theme/theme';

export function HistoryScreen({ history, onClear }: { history: ScanHistoryEntry[]; onClear: () => void }) {
  return (
    <Screen title="History" subtitle="A lightweight local record of recent checks. Sensitive raw data stays out of the list by default.">
      {history.length === 0 ? (
        <Card muted>
          <Text style={styles.emptyTitle}>No saved checks yet</Text>
          <Text style={styles.emptyText}>Search or scan an item, then save the result to build your local EcoSort history.</Text>
        </Card>
      ) : (
        <>
          {history.map((entry) => (
            <Card key={entry.id} style={styles.item}>
              <View style={styles.row}>
                <View style={styles.dot} />
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{entry.item}</Text>
                  <Text style={styles.bin}>{entry.binLabel}</Text>
                </View>
                <Text style={styles.points}>+{entry.points}</Text>
              </View>
              <Text style={styles.meta}>{entry.council} · {new Date(entry.timestamp).toLocaleString()}</Text>
              <Text style={styles.privacy}>{entry.storedData}</Text>
            </Card>
          ))}
          <AppButton title="Clear history" variant="ghost" onPress={onClear} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 6 },
  emptyText: { ...theme.typography.body, color: theme.colors.textMuted },
  item: { gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 10, backgroundColor: theme.colors.primary },
  itemText: { flex: 1 },
  itemTitle: { ...theme.typography.h3, color: theme.colors.text, textTransform: 'capitalize' },
  points: { color: theme.colors.success, fontWeight: '800', backgroundColor: theme.colors.primaryTint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.pill, overflow: 'hidden' },
  bin: { ...theme.typography.small, color: theme.colors.primaryDark, marginTop: 2 },
  meta: { ...theme.typography.small, color: theme.colors.textMuted },
  privacy: { ...theme.typography.caption, color: theme.colors.textSubtle },
});
