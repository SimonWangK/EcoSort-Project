import { COUNCIL_RULES, getRulesForCouncil, normaliseCouncil } from '../data/councilRules';
import { CouncilRule } from '../types';

export const normalizeText = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ');

function normalizeBarcode(value: string) {
  return value.trim().replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
}

function scoreRule(term: string, rule: CouncilRule): number {
  const item = normalizeText(rule.item);
  const aliases = rule.aliases.map(normalizeText);
  const searchable = [item, ...aliases];

  if (searchable.some((value) => value === term)) return 100;
  if (searchable.some((value) => value.startsWith(term))) return 88;
  if (searchable.some((value) => value.includes(term) || term.includes(value))) return 76;

  const tokens = term.split(' ').filter(Boolean);
  if (tokens.length > 0 && searchable.some((value) => tokens.every((token) => value.includes(token)))) return 68;

  return 0;
}

export function matchCouncilRule(query: string, rules: CouncilRule[] = COUNCIL_RULES): CouncilRule | null {
  const term = normalizeText(query);
  if (!term) return null;

  const ranked = rules
    .map((rule, index) => ({ rule, index, score: scoreRule(term, rule) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.rule.confidence - a.rule.confidence || a.index - b.index);

  return ranked[0]?.rule ?? null;
}

export function matchCouncilRuleForCouncil(query: string, council?: string | null): CouncilRule | null {
  const activeCouncil = normaliseCouncil(council);
  return matchCouncilRule(query, getRulesForCouncil(activeCouncil));
}

export function classifyBarcodeScan(data: string | undefined, council?: string | null): CouncilRule | null {
  const raw = data?.trim() || '';
  if (!raw) return null;

  const text = normalizeText(raw);
  const barcode = normalizeBarcode(raw);
  const candidates = getRulesForCouncil(council);

  const barcodeMatch = candidates.find((rule) =>
    rule.barcodeValues?.some((value) => normalizeBarcode(value) === barcode),
  );
  if (barcodeMatch) return barcodeMatch;

  const hintMatch = candidates.find((rule) => {
    const searchable = [rule.item, ...rule.aliases, ...(rule.barcodeHints || [])].map(normalizeText);
    return searchable.some((value) => value && (text.includes(value) || value.includes(text)));
  });
  if (hintMatch) return hintMatch;

  // QR codes often contain item words rather than numeric product IDs, so pass
  // the whole scanned payload through the normal council rule matcher.
  return matchCouncilRule(text, candidates);
}

// Backwards-compatible export name used by older screen code/tests.
export const classifyBarcodeHint = classifyBarcodeScan;
