export interface SplitLike {
  distanceM: number;
  durationS: number;
  paceSPerKm: number;
}

export function computePaceSPerKm(distanceM: number, durationS: number): number {
  return durationS / (distanceM / 1000);
}

/** Population standard deviation of split paces, in seconds/km. No qualitative label attached — just the number. */
export function computePaceVariance(splits: SplitLike[]): number | null {
  if (splits.length < 2) return null;
  const paces = splits.map((s) => s.paceSPerKm);
  const mean = paces.reduce((sum, p) => sum + p, 0) / paces.length;
  const squaredDiffs = paces.map((p) => (p - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / paces.length;
  return Math.sqrt(variance);
}

/** Signed delta: positive means slower than target, negative means faster. */
export function computePaceDeltaVsTarget(actualPaceSPerKm: number, targetPaceSPerKm: number): number {
  return actualPaceSPerKm - targetPaceSPerKm;
}
