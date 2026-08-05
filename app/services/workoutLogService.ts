import * as workoutSessionRepository from '@/db/repositories/workoutSessionRepository';
import * as exerciseHistoryRepository from '@/db/repositories/exerciseHistoryRepository';
import * as progressRecordRepository from '@/db/repositories/progressRecordRepository';
import { checkPr } from '@/services/prService';
import type { LoggedSet } from '@/types/entities';

export interface PrHitSummary {
  exerciseId: string;
  metric: 'max_weight' | 'max_volume_single_set';
  value: number;
}

/**
 * Runs once when a workout session is finished. For every logged set in
 * the session (processed in the order they were logged, per exercise),
 * creates one ExerciseHistoryEntry and updates the exercise's
 * ProgressRecord if the set is a new all-time best. Returns the list of
 * PRs hit, for display on the Workout Summary screen.
 *
 * Sets within the same session are compared against each other in order
 * (a later set in the same session can be a PR over an earlier one in
 * that same session), matching a natural reading of "best so far."
 */
export async function finishWorkoutAndRecordHistory(sessionId: string, userId: string): Promise<PrHitSummary[]> {
  await workoutSessionRepository.finishSession(sessionId);

  const allSets = await workoutSessionRepository.getLoggedSetsForSession(sessionId);
  const session = await workoutSessionRepository.getSession(sessionId);
  const date = session?.date ?? new Date().toISOString().slice(0, 10);

  const setsByExercise = new Map<string, LoggedSet[]>();
  for (const set of allSets) {
    const list = setsByExercise.get(set.exerciseId) ?? [];
    list.push(set);
    setsByExercise.set(set.exerciseId, list);
  }

  const prsHit: PrHitSummary[] = [];

  for (const [exerciseId, sets] of setsByExercise) {
    const startingBest = await exerciseHistoryRepository.getBestForExercise(exerciseId);
    let runningBestWeight = startingBest.maxWeightKg;
    let runningBestVolume = startingBest.maxVolumeKg;

    for (const set of sets.sort((a, b) => a.setIndex - b.setIndex)) {
      const volumeKg = set.weightKg === null ? 0 : set.weightKg * set.reps;
      const { isPrWeight, isPrVolume } = checkPr(set.weightKg, volumeKg, runningBestWeight, runningBestVolume);

      const entry = await exerciseHistoryRepository.createHistoryEntry({
        userId,
        exerciseId,
        loggedSetId: set.id,
        date,
        weightKg: set.weightKg,
        reps: set.reps,
        volumeKg,
        isPrWeight,
        isPrVolume,
      });

      if (isPrWeight && set.weightKg !== null) {
        runningBestWeight = set.weightKg;
        await progressRecordRepository.upsertProgressRecord(userId, exerciseId, 'max_weight', set.weightKg, date, entry.id);
        prsHit.push({ exerciseId, metric: 'max_weight', value: set.weightKg });
      }
      if (isPrVolume) {
        runningBestVolume = volumeKg;
        await progressRecordRepository.upsertProgressRecord(userId, exerciseId, 'max_volume_single_set', volumeKg, date, entry.id);
        prsHit.push({ exerciseId, metric: 'max_volume_single_set', value: volumeKg });
      }
    }
  }

  return prsHit;
}
