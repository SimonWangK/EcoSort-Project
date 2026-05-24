import { COUNCIL_RULES } from '../data/councilRules';
import { CouncilRule } from '../types';

export const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export function matchCouncilRule(query: string, rules: CouncilRule[] = COUNCIL_RULES): CouncilRule | null {
  const term = normalizeText(query);
  if (!term) return null;

  const exact = rules.find((rule) => normalizeText(rule.item) === term || rule.aliases.some((alias) => normalizeText(alias) === term));
  if (exact) return exact;

  return rules.find((rule) => {
    const item = normalizeText(rule.item);
    const aliases = rule.aliases.map(normalizeText);
    return item.includes(term) || term.includes(item) || aliases.some((alias) => alias.includes(term) || term.includes(alias));
  }) || null;
}
