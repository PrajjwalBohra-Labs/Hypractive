import type { SplitLike } from '@/services/paceService';

export type SplitTrend = 'negative_split' | 'positive_split' | 'even' | 'not_enough_data';

/**
 * Negative split = second half of the run was run at a faster average pace
 * than the first half. This is a factual label describing the data, not a
 * value judgment — no "good/bad" text is attached by this function.
 */
export function detectSplitTrend(splits: SplitLike[]): SplitTrend {
  if (splits.length < 2) return 'not_enough_data';

  const midpoint = Math.floor(splits.length / 2);
  const firstHalf = splits.slice(0, midpoint);
  const secondHalf = splits.slice(midpoint);

  const avg = (arr: SplitLike[]) => arr.reduce((sum, s) => sum + s.paceSPerKm, 0) / arr.length;
  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);

  if (secondAvg < firstAvg) return 'negative_split';
  if (secondAvg > firstAvg) return 'positive_split';
  return 'even';
}

export interface PriorRunComparison {
  hasPriorRun: boolean;
  paceDeltaSPerKm: number | null;
}

/** Compares this run's average pace to a prior comparable run's average pace, if one was found. */
export function comparePaceToPriorRun(
  currentAvgPaceSPerKm: number,
  priorAvgPaceSPerKm: number | null
): PriorRunComparison {
  if (priorAvgPaceSPerKm === null) {
    return { hasPriorRun: false, paceDeltaSPerKm: null };
  }
  return { hasPriorRun: true, paceDeltaSPerKm: currentAvgPaceSPerKm - priorAvgPaceSPerKm };
}
