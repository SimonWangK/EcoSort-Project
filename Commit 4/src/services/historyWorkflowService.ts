import { matchCouncilRule } from './ruleMatcher';
import { CouncilRule, ScanHistoryEntry, SearchSource } from '../types';

export function createHistoryEntry(rule: CouncilRule, source: SearchSource, privacyMode: boolean): ScanHistoryEntry {
  return {
    id: `${rule.id}-${Date.now()}`,
    item: rule.item,
    ruleId: rule.id,
    council: rule.council,
    binLabel: rule.binLabel,
    source,
    timestamp: new Date().toISOString(),
    points: rule.points,
    co2EstimateKg: rule.co2EstimateKg,
    storedData: privacyMode
      ? 'Only item, bin result, council and timestamp are stored. Raw photo and exact GPS are not saved.'
      : 'Demo mode stores item metadata only. Raw media is still excluded from this prototype.',
  };
}

export function buildSearchHistoryEntry(query: string, source: SearchSource, privacyMode: boolean): ScanHistoryEntry | null {
  const rule = matchCouncilRule(query);
  if (!rule) return null;
  return createHistoryEntry(rule, source, privacyMode);
}
