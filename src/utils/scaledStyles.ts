import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { scaledFont } from './accessibility';

const MIN_SCALE = 0.92;
const MAX_SCALE = 1.2;

function safeScale(scale: number): number {
  return Math.min(Math.max(Number.isFinite(scale) ? scale : 1, MIN_SCALE), MAX_SCALE);
}

export function scaleTextStyle<T extends TextStyle | ViewStyle | ImageStyle>(style: T, scale: number): T {
  const ratio = safeScale(scale);
  const next: Record<string, unknown> = { ...(style as Record<string, unknown>) };

  if (typeof next.fontSize === 'number') {
    next.fontSize = scaledFont(next.fontSize, ratio);
  }
  if (typeof next.lineHeight === 'number') {
    next.lineHeight = Math.round(next.lineHeight * ratio);
  }

  return next as T;
}
