import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import type { ExerciseHistoryEntry } from '@/types/entities';

function rowToEntry(row: any): ExerciseHistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    loggedSetId: row.logged_set_id,
    date: row.date,
    weightKg: row.weight_kg,
    reps: row.reps,
    volumeKg: row.volume_kg,
    isPrWeight: !!row.is_pr_weight,
    isPrVolume: !!row.is_pr_volume,
  };
}

export interface CreateHistoryEntryInput {
  userId: string;
  exerciseId: string;
  loggedSetId: string;
  date: string;
  weightKg: number | null;
  reps: number;
  volumeKg: number;
  isPrWeight: boolean;
  isPrVolume: boolean;
}

export async function createHistoryEntry(input: CreateHistoryEntryInput): Promise<ExerciseHistoryEntry> {
  const db = await getDb();
  const entry: ExerciseHistoryEntry = { id: generateId(), ...input };
  await db.runAsync(
    `INSERT INTO exercise_history_entries
      (id, user_id, exercise_id, logged_set_id, date, weight_kg, reps, volume_kg, is_pr_weight, is_pr_volume)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      entry.id,
      entry.userId,
      entry.exerciseId,
      entry.loggedSetId,
      entry.date,
      entry.weightKg,
      entry.reps,
      entry.volumeKg,
      entry.isPrWeight ? 1 : 0,
      entry.isPrVolume ? 1 : 0,
    ]
  );
  return entry;
}

/** Best weight/volume across all history for this exercise (used before inserting new entries for a session). */
export async function getBestForExercise(
  exerciseId: string
): Promise<{ maxWeightKg: number | null; maxVolumeKg: number | null; maxReps: number | null }> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ max_weight: number | null; max_volume: number | null; max_reps: number | null }>(
    'SELECT MAX(weight_kg) as max_weight, MAX(volume_kg) as max_volume, MAX(reps) as max_reps FROM exercise_history_entries WHERE exercise_id = ?;',
    [exerciseId]
  );
  return {
    maxWeightKg: row?.max_weight ?? null,
    maxVolumeKg: row?.max_volume ?? null,
    maxReps: row?.max_reps ?? null,
  };
}

export async function listHistoryForExercise(exerciseId: string): Promise<ExerciseHistoryEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM exercise_history_entries WHERE exercise_id = ? ORDER BY date DESC, id DESC;',
    [exerciseId]
  );
  return rows.map(rowToEntry);
}

export async function countHistoryForExercise(exerciseId: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_history_entries WHERE exercise_id = ?;',
    [exerciseId]
  );
  return row?.count ?? 0;
}
