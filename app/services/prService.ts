export interface PrCheckResult {
  isPrWeight: boolean;
  isPrVolume: boolean;
}

/**
 * A PR is strictly "new value greater than the best seen before this
 * entry" — equal values are not PRs. Bodyweight sets (weightKg === null)
 * never set a weight PR; volume is 0 for them by convention (see
 * ExerciseHistoryEntry.volumeKg), so volume PR is effectively inert too,
 * and reps-at-bodyweight is tracked as a separate metric by the caller.
 */
export function checkPr(
  newWeightKg: number | null,
  newVolumeKg: number,
  previousBestWeightKg: number | null,
  previousBestVolumeKg: number | null
): PrCheckResult {
  const isPrWeight = newWeightKg !== null && (previousBestWeightKg === null || newWeightKg > previousBestWeightKg);
  const isPrVolume = previousBestVolumeKg === null || newVolumeKg > previousBestVolumeKg;
  return { isPrWeight, isPrVolume };
}
