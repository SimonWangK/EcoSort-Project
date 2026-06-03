import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ResultCard } from '../components/ResultCard';
import { getCouncilRuleSummary, getQuickItemsForCouncil, normaliseCouncil } from '../data/councilRules';
import { matchCouncilRuleForCouncil } from '../services/ruleMatcher';
import { theme } from '../theme/theme';
import { AppSettings, CouncilRule, SearchSource } from '../types';
import { useSettings } from '../utils/settingsContext';
import { scaleTextStyle } from '../utils/scaledStyles';

export function SearchScreen({
  onSaveResult,
  settings,
}: {
  onSaveResult: (rule: CouncilRule, source: SearchSource) => void;
  settings: AppSettings;
}) {
  const { textScale } = useSettings();
  const [query, setQuery] = useState('coffee cup');
  const [submitted, setSubmitted] = useState(false);

  const activeCouncil = normaliseCouncil(settings.locationCouncil);
  const quickItems = useMemo(() => getQuickItemsForCouncil(activeCouncil), [activeCouncil]);
  const councilSummary = useMemo(() => getCouncilRuleSummary(activeCouncil), [activeCouncil]);
  const result = useMemo(
    () => submitted ? matchCouncilRuleForCouncil(query, activeCouncil) : null,
    [query, submitted, activeCouncil],
  );

  const runSearch = () => setSubmitted(true);

  return (
    <Screen title="Search an item" subtitle="EcoSort checks the selected council guidance and shows the best disposal stream for supported items.">
      <Card>
        <View style={styles.contextBox}>
          <Text style={scaleTextStyle(styles.contextLabel, textScale)}>Active council guide</Text>
          <Text style={scaleTextStyle(styles.contextValue, textScale)}>{councilSummary}</Text>
        </View>

        <Text style={scaleTextStyle(styles.label, textScale)}>Waste item</Text>
        <TextField
          value={query}
          onChangeText={(value) => { setQuery(value); setSubmitted(false); }}
          returnKeyType="search"
          onSubmitEditing={runSearch}
          placeholder="Try battery, pizza box, or glass bottle"
        />
        <AppButton title="Check rule" onPress={runSearch} style={styles.button} accessibilityHint="Search council recycling rules" />

        <Text style={scaleTextStyle(styles.groupTitle, textScale)}>Popular checks for {activeCouncil}</Text>
        <View style={styles.chips}>
          {quickItems.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              onPress={() => { setQuery(item); setSubmitted(true); }}
              accessibilityRole="button"
              accessibilityLabel={`Search ${item}`}
            >
              <Text style={scaleTextStyle(styles.chipText, textScale)}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {submitted && !result ? (
        <Card muted>
          <Text style={scaleTextStyle(styles.emptyTitle, textScale)}>Manual review needed</Text>
          <Text style={scaleTextStyle(styles.emptyText, textScale)}>EcoSort could not confidently match this item for {activeCouncil}. Try a simpler item name, use a quick check above, or confirm unusual items with your council.</Text>
        </Card>
      ) : null}
      {result ? <ResultCard rule={result} onSave={() => onSaveResult(result, 'manual')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  contextBox: { backgroundColor: theme.colors.canvasSoft, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, marginBottom: 16 },
  contextLabel: { ...theme.typography.caption, color: theme.colors.textSubtle, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 },
  contextValue: { ...theme.typography.small, color: theme.colors.textMuted },
  label: { ...theme.typography.label, color: theme.colors.textSubtle, marginBottom: 8, textTransform: 'uppercase' },
  button: { marginTop: 12, color: '#347A5A' },
  groupTitle: { ...theme.typography.caption, color: theme.colors.textMuted, marginTop: 18, marginBottom: 10, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: theme.radius.pill, backgroundColor: theme.colors.canvasSoft, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 13, paddingVertical: 9 },
  pressed: { opacity: 0.72 },
  chipText: { color: theme.colors.primaryDark, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  emptyTitle: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 6 },
  emptyText: { ...theme.typography.body, color: theme.colors.textMuted },
});
