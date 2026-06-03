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
      ? 'Only item, bin result, council and time are stored. Photo files and exact location are not saved.'
      : 'EcoSort saves item details for your history. Photo files are not saved.',
  };
}

export function buildSearchHistoryEntry(query: string, source: SearchSource, privacyMode: boolean): ScanHistoryEntry | null {
  const rule = matchCouncilRule(query);
  if (!rule) return null;
  return createHistoryEntry(rule, source, privacyMode);
}
