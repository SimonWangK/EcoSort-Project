export function scaledFont(baseSize: number, scale: number): number {
  const safeScale = Math.min(Math.max(scale, 0.92), 1.2);
  return Math.round(baseSize * safeScale);
}

export function minTouchTarget(size: number): number {
  return Math.max(size, 44);
}

export function tabAccessibilityLabel(label: string, active: boolean): string {
  return `${label} tab${active ? ', selected' : ''}`;
}
