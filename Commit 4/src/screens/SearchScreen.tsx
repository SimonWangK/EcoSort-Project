import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ResultCard } from '../components/ResultCard';
import { QUICK_ITEMS } from '../data/councilRules';
import { matchCouncilRule } from '../services/ruleMatcher';
import { theme } from '../theme/theme';
import { CouncilRule, SearchSource } from '../types';

export function SearchScreen({ onSaveResult }: { onSaveResult: (rule: CouncilRule, source: SearchSource) => void }) {
  const [query, setQuery] = useState('coffee cup');
  const [submitted, setSubmitted] = useState(false);
  const result = useMemo(() => submitted ? matchCouncilRule(query) : null, [query, submitted]);
  const runSearch = () => setSubmitted(true);

  return (
    <Screen title="Search an item" subtitle="Use a simple item name. EcoSort matches it against cached local recycling rules.">
      <Card>
        <Text style={styles.label}>Waste item</Text>
        <TextField value={query} onChangeText={(value) => { setQuery(value); setSubmitted(false); }} returnKeyType="search" onSubmitEditing={runSearch} placeholder="Try battery, pizza box, or glass bottle" />
        <AppButton title="Check rule" onPress={runSearch} style={styles.button} accessibilityHint="Search local recycling rules" />
        <Text style={styles.groupTitle}>Popular checks</Text>
        <View style={styles.chips}>
          {QUICK_ITEMS.map((item) => (
            <Pressable key={item} style={({ pressed }) => [styles.chip, pressed && styles.pressed]} onPress={() => { setQuery(item); setSubmitted(true); }} accessibilityRole="button" accessibilityLabel={`Search ${item}`}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {submitted && !result ? (
        <Card muted>
          <Text style={styles.emptyTitle}>Manual review needed</Text>
          <Text style={styles.emptyText}>EcoSort could not confidently match this item. Try a simpler item name or confirm with your local council.</Text>
        </Card>
      ) : null}
      {result ? <ResultCard rule={result} onSave={() => onSaveResult(result, 'manual')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { ...theme.typography.label, color: theme.colors.textSubtle, marginBottom: 8, textTransform: 'uppercase' },
  button: { marginTop: 12 },
  groupTitle: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 18, marginBottom: 10, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: theme.radius.pill, backgroundColor: theme.colors.canvasSoft, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 13, paddingVertical: 9 },
  pressed: { opacity: 0.72 },
  chipText: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  emptyTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 6 },
  emptyText: { ...theme.typography.body, color: theme.colors.textMuted },
});
