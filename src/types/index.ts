export type AppScreen = 'home' | 'search' | 'scan' | 'history' | 'settings' | 'onboarding' | 'location' | 'device' | 'account';
export type SearchSource = 'manual' | 'camera' | 'location' | 'location-demo';

export interface CouncilRule {
  id: string;
  council: string;
  item: string;
  aliases: string[];
  binLabel: string;
  binColorName: string;
  instruction: string;
  confidence: number;
  risk: string;
  points: number;
  co2EstimateKg: number;
  /** Optional product-like metadata used by the UI. Kept optional so tests and existing callers remain stable. */
  acceptedIn?: string[];
  rejectedIn?: string[];
  disposalType?: 'kerbside' | 'drop-off' | 'special' | 'compost' | 'general';
  sourceName?: string;
  lastReviewedAt?: string;
  barcodeHints?: string[];
  barcodeValues?: string[];
}

export interface ScanHistoryEntry {
  id: string;
  item: string;
  ruleId: string;
  council: string;
  binLabel: string;
  source: SearchSource;
  timestamp: string;
  points: number;
  co2EstimateKg: number;
  storedData: string;
}

export interface AppSettings {
  privacyMode: boolean;
  offlineDemo: boolean;
  themeMode: 'light' | 'dark';
  textScale: number;
  cachedRulesSyncedAt?: string | null;
  locationCouncil?: string | null;
  notificationScheduledAt?: string | null;
}

export interface AuthSession {
  email: string;
  idToken: string;
  localId: string;
  /** 'local' sessions unlock product features without requiring Firebase .env setup. */
  mode?: 'firebase' | 'local';
}
