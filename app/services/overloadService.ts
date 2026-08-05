import * as exerciseHistoryRepository from '@/db/repositories/exerciseHistoryRepository';

export type OverloadClassification = 'increase' | 'equal' | 'decrease' | 'first_time';

export interface OverloadResult {
  weightClassification: OverloadClassification;
  volumeClassification: OverloadClassification;
  weightDeltaKg: number | null;
  volumeDeltaKg: number | null;
}

/**
 * Pure comparison — no target suggestion is generated, only a factual
 * classification of the new value against the user's own prior best.
 */
export function classifyDelta(newValue: number, previousBest: number | null): { classification: OverloadClassification; delta: number | null } {
  if (previousBest === null) return { classification: 'first_time', delta: null };
  const delta = newValue - previousBest;
  if (delta > 0) return { classification: 'increase', delta };
  if (delta === 0) return { classification: 'equal', delta };
  return { classification: 'decrease', delta };
}

export function computeOverload(
  newWeightKg: number | null,
  newVolumeKg: number,
  previousBestWeightKg: number | null,
  previousBestVolumeKg: number | null
): OverloadResult {
  const weightResult =
    newWeightKg === null
      ? { classification: 'first_time' as OverloadClassification, delta: null }
      : classifyDelta(newWeightKg, previousBestWeightKg);
  const volumeResult = classifyDelta(newVolumeKg, previousBestVolumeKg);

  return {
    weightClassification: weightResult.classification,
    volumeClassification: volumeResult.classification,
    weightDeltaKg: weightResult.delta,
    volumeDeltaKg: volumeResult.delta,
  };
}

/**
 * Fetches the user's prior best for this exercise and classifies a
 * candidate new set against it. Used live while logging (architecture 3.5).
 */
export async function getOverloadForNewSet(
  exerciseId: string,
  weightKg: number | null,
  reps: number
): Promise<OverloadResult> {
  const best = await exerciseHistoryRepository.getBestForExercise(exerciseId);
  const volumeKg = weightKg === null ? 0 : weightKg * reps;
  return computeOverload(weightKg, volumeKg, best.maxWeightKg, best.maxVolumeKg);
}
