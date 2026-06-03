import { getRulesForCouncil } from '../data/councilRules';
import { CouncilRule } from '../types';
import { matchCouncilRule, normalizeText } from './ruleMatcher';

export interface VisionPrediction {
  item: string;
  category?: string;
  confidence: number;
  labels: string[];
  provider?: string;
  notes?: string;
}

export interface VisionClassificationResult {
  prediction: VisionPrediction;
  rule: CouncilRule | null;
  matchedTerm: string | null;
}

interface HuggingFaceLabel {
  label: string;
  score: number;
}

const configuredEndpoint = () => process.env.EXPO_PUBLIC_VISION_API_ENDPOINT?.trim() ?? '';
const configuredProxyToken = () => process.env.EXPO_PUBLIC_VISION_API_TOKEN?.trim() ?? '';
const configuredHfToken = () => process.env.EXPO_PUBLIC_HF_API_TOKEN?.trim() ?? '';
const configuredHfBase = () =>
  process.env.EXPO_PUBLIC_HF_API_BASE?.trim() || 'https://router.huggingface.co/hf-inference/models';
const configuredHfModels = () =>
  (process.env.EXPO_PUBLIC_HF_MODEL_IDS?.trim() ||
    'google/vit-base-patch16-224,facebook/convnext-tiny-224,microsoft/resnet-50')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function clampConfidence(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric > 1) return Math.max(0, Math.min(1, numeric / 100));
  return Math.max(0, Math.min(1, numeric));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 8);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const outputLength = Math.floor((clean.length * 3) / 4) - padding;
  const bytes = new Uint8Array(Math.max(0, outputLength));

  let buffer = 0;
  let bits = 0;
  let index = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (char === '=') break;
    const value = BASE64_ALPHABET.indexOf(char);
    if (value < 0) continue;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      if (index < bytes.length) {
        bytes[index] = (buffer >> bits) & 0xff;
        index += 1;
      }
    }
  }

  return bytes;
}

function readPrediction(payload: any): VisionPrediction {
  const item =
    payload?.item ||
    payload?.detectedItem ||
    payload?.label ||
    payload?.object ||
    payload?.prediction?.item ||
    payload?.prediction?.label ||
    payload?.result?.item ||
    payload?.result?.label ||
    '';

  const category = payload?.category || payload?.prediction?.category || payload?.result?.category;
  const labels = [
    ...toStringArray(payload?.labels),
    ...toStringArray(payload?.prediction?.labels),
    ...toStringArray(payload?.result?.labels),
  ];

  const confidence = clampConfidence(
    payload?.confidence ?? payload?.score ?? payload?.prediction?.confidence ?? payload?.result?.confidence,
  );

  const provider = payload?.provider || payload?.model || payload?.prediction?.provider || payload?.result?.provider;
  const notes = payload?.notes || payload?.reasoning || payload?.prediction?.notes || payload?.result?.notes;

  return {
    item: String(item || '').trim(),
    category: category ? String(category).trim() : undefined,
    confidence,
    labels: Array.from(new Set(labels)),
    provider: provider ? String(provider).trim() : undefined,
    notes: notes ? String(notes).trim() : undefined,
  };
}

const WASTE_LABEL_MAP: Array<{ item: string; category: string; keywords: string[] }> = [
  {
    item: 'plastic bottle',
    category: 'plastic',
    keywords: ['water bottle', 'pop bottle', 'soda bottle', 'plastic bottle', 'pet bottle', 'sports bottle'],
  },
  {
    item: 'glass bottle',
    category: 'glass',
    keywords: ['beer bottle', 'wine bottle', 'glass bottle', 'jar', 'water jug'],
  },
  {
    item: 'aluminium can',
    category: 'metal',
    keywords: ['can', 'tin can', 'soda can', 'beer can', 'aluminum can', 'aluminium can'],
  },
  {
    item: 'cardboard',
    category: 'paper',
    keywords: ['cardboard', 'carton', 'box', 'packet', 'shipping box', 'pizza box'],
  },
  {
    item: 'paper',
    category: 'paper',
    keywords: ['paper towel', 'newspaper', 'envelope', 'book jacket', 'paper', 'comic book', 'magazine'],
  },
  {
    item: 'battery',
    category: 'hazardous',
    keywords: ['battery', 'cell', 'power bank'],
  },
  {
    item: 'coffee cup',
    category: 'packaging',
    keywords: ['coffee cup', 'paper cup', 'cup', 'drinking cup'],
  },
  {
    item: 'soft plastic',
    category: 'plastic film',
    keywords: ['plastic bag', 'shopping bag', 'wrapper', 'packet', 'film'],
  },
  {
    item: 'food scraps',
    category: 'organic',
    keywords: ['banana', 'apple', 'orange', 'broccoli', 'vegetable', 'fruit', 'food'],
  },
  {
    item: 'general waste',
    category: 'general',
    keywords: ['trash', 'garbage', 'rubbish', 'waste'],
  },
];

function mapHfLabelsToWastePrediction(labels: HuggingFaceLabel[], model: string): VisionPrediction {
  const sorted = labels
    .filter((entry) => entry && typeof entry.label === 'string')
    .map((entry) => ({ label: entry.label.trim(), score: clampConfidence(entry.score) }))
    .filter((entry) => entry.label)
    .sort((a, b) => b.score - a.score);

  for (const candidate of sorted) {
    const normalisedLabel = normalizeText(candidate.label);
    for (const mapping of WASTE_LABEL_MAP) {
      if (mapping.keywords.some((keyword) => normalisedLabel.includes(normalizeText(keyword)))) {
        return {
          item: mapping.item,
          category: mapping.category,
          confidence: candidate.score,
          labels: sorted.slice(0, 5).map((entry) => entry.label),
          provider: 'EcoSort photo check',
          notes: `Matched photo clue "${candidate.label}" to EcoSort item "${mapping.item}".`,
        };
      }
    }
  }

  const top = sorted[0];
  return {
    item: top?.label ?? '',
    category: undefined,
    confidence: top?.score ?? 0,
    labels: sorted.slice(0, 5).map((entry) => entry.label),
    provider: 'EcoSort photo check',
    notes: top ? 'No EcoSort guide matched this photo clue.' : 'EcoSort could not find clear photo clues.',
  };
}

async function classifyWithProxy({
  endpoint,
  imageBase64,
  council,
  mimeType,
}: {
  endpoint: string;
  imageBase64: string;
  council?: string | null;
  mimeType: string;
}): Promise<VisionPrediction> {
  const token = configuredProxyToken();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      council,
      task: 'classify-waste-item',
      responseFormat: {
        item: 'string',
        category: 'string',
        confidence: 'number between 0 and 1',
        labels: 'string[]',
        notes: 'short explanation',
      },
    }),
  });

  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('Photo check is temporarily unavailable. Try again later or use manual search.');
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Photo check is temporarily unavailable. Try again later or use manual search.';
    const details = Array.isArray(payload?.details) ? payload.details.filter(Boolean).join(' | ') : '';
    throw new Error(details ? `${String(message)}: ${details}` : String(message));
  }

  return readPrediction(payload);
}

async function classifyWithDirectHuggingFace({
  imageBase64,
  mimeType,
}: {
  imageBase64: string;
  mimeType: string;
}): Promise<VisionPrediction> {
  const token = configuredHfToken();
  if (!token) {
    throw new Error(
      'Photo check is not available right now. Use manual search for this item.',
    );
  }

  const base = configuredHfBase().replace(/\/$/, '');
  const models = configuredHfModels();
  const imageBytes = base64ToUint8Array(imageBase64);
  const errors: string[] = [];

  for (const model of models) {
    const url = `${base}/${model}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
          Accept: 'application/json',
        },
        body: imageBytes.buffer as any,
      });

      const text = await response.text();
      let payload: any = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        errors.push(`${model}: non-JSON response`);
        continue;
      }

      if (!response.ok) {
        errors.push(`${model}: ${payload?.error || payload?.message || `HTTP ${response.status}`}`);
        continue;
      }

      const labels: HuggingFaceLabel[] = Array.isArray(payload)
        ? payload.map((entry) => ({ label: String(entry?.label ?? ''), score: clampConfidence(entry?.score) }))
        : Array.isArray(payload?.labels)
          ? payload.labels.map((entry: any) => ({ label: String(entry?.label ?? entry ?? ''), score: clampConfidence(entry?.score) }))
          : [];

      if (!labels.length) {
        errors.push(`${model}: no labels returned`);
        continue;
      }

      return mapHfLabelsToWastePrediction(labels, model);
    } catch (error) {
      errors.push(`${model}: ${error instanceof Error ? error.message : 'request failed'}`);
    }
  }

  throw new Error('Photo check is temporarily unavailable. Use manual search for this item.');
}

function findCouncilRuleFromPrediction(prediction: VisionPrediction, council?: string | null) {
  const rules = getRulesForCouncil(council);
  const terms = [prediction.item, prediction.category, ...prediction.labels]
    .map((value) => normalizeText(value || ''))
    .filter(Boolean);

  for (const term of terms) {
    const rule = matchCouncilRule(term, rules);
    if (rule) return { rule, matchedTerm: term };
  }

  return { rule: null, matchedTerm: null };
}

export async function classifyWasteImageWithVisionApi({
  imageBase64,
  council,
  mimeType = 'image/jpeg',
}: {
  imageBase64: string;
  council?: string | null;
  mimeType?: string;
}): Promise<VisionClassificationResult> {
  const endpoint = configuredEndpoint();
  const prediction = endpoint
    ? await classifyWithProxy({ endpoint, imageBase64, council, mimeType })
    : await classifyWithDirectHuggingFace({ imageBase64, mimeType });

  if (!prediction.item && prediction.labels.length === 0) {
    throw new Error('EcoSort could not identify the item from this photo. Try a clearer photo or use manual search.');
  }

  const { rule, matchedTerm } = findCouncilRuleFromPrediction(prediction, council);
  return { prediction, rule, matchedTerm };
}

export function formatVisionConfidence(confidence: number) {
  if (!Number.isFinite(confidence) || confidence <= 0) return 'not enough detail';
  return `${Math.round(confidence * 100)}%`;
}
