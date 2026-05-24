import { ScanHistoryEntry } from '../types';

export function calculateTotalPoints(history: ScanHistoryEntry[]): number {
  return history.reduce((sum, entry) => sum + entry.points, 0);
}

export function calculateTotalCo2(history: ScanHistoryEntry[]): number {
  return Number(history.reduce((sum, entry) => sum + entry.co2EstimateKg, 0).toFixed(2));
}

export function formatKg(value: number): string {
  return `${value.toFixed(2)} kg`;
}
