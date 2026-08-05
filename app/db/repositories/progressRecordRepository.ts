import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import type { ProgressRecord, ProgressMetric } from '@/types/entities';

function rowToRecord(row: any): ProgressRecord {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    metric: row.metric as ProgressMetric,
    value: row.value,
    achievedDate: row.achieved_date,
    sourceHistoryEntryId: row.source_history_entry_id,
  };
}

export async function getProgressRecord(exerciseId: string, metric: ProgressMetric): Promise<ProgressRecord | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM progress_records WHERE exercise_id = ? AND metric = ?;',
    [exerciseId, metric]
  );
  return row ? rowToRecord(row) : null;
}

export async function listProgressRecordsForExercise(exerciseId: string): Promise<ProgressRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM progress_records WHERE exercise_id = ?;', [exerciseId]);
  return rows.map(rowToRecord);
}

export async function upsertProgressRecord(
  userId: string,
  exerciseId: string,
  metric: ProgressMetric,
  value: number,
  achievedDate: string,
  sourceHistoryEntryId: string
): Promise<void> {
  const db = await getDb();
  const existing = await getProgressRecord(exerciseId, metric);
  if (existing) {
    await db.runAsync(
      'UPDATE progress_records SET value = ?, achieved_date = ?, source_history_entry_id = ? WHERE id = ?;',
      [value, achievedDate, sourceHistoryEntryId, existing.id]
    );
  } else {
    await db.runAsync(
      `INSERT INTO progress_records (id, user_id, exercise_id, metric, value, achieved_date, source_history_entry_id)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [generateId(), userId, exerciseId, metric, value, achievedDate, sourceHistoryEntryId]
    );
  }
}
