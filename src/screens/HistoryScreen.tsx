import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ScanHistoryEntry } from '../types';
import { theme } from '../theme/theme';

export function HistoryScreen({ history, onClear }: { history: ScanHistoryEntry[]; onClear: () => void }) {
  return (
    <Screen title="History" subtitle="A lightweight local record of your recent recycling checks.">
      {history.length === 0 ? (
        <Card muted>
          <Text style={styles.emptyTitle}>No saved checks yet</Text>
          <Text style={styles.emptyText}>Search or scan an item, then save the result to build your EcoSort history.</Text>
        </Card>
      ) : (
        <>
          {history.map((entry) => (
            <Card key={entry.id} style={styles.item}>
              <View style={styles.row}>
                <Text style={styles.itemTitle}>{entry.item}</Text>
                <Text style={styles.points}>+{entry.points}</Text>
              </View>
              <Text style={styles.bin}>{entry.binLabel}</Text>
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
  item: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { ...theme.typography.h2, color: theme.colors.text, textTransform: 'capitalize' },
  points: { color: theme.colors.success, fontWeight: '900', backgroundColor: '#E4F4EA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  bin: { fontSize: 15, fontWeight: '800', color: theme.colors.primaryDark },
  meta: { ...theme.typography.small, color: theme.colors.textMuted },
  privacy: { ...theme.typography.small, color: theme.colors.textSubtle, marginTop: 5 },
});
