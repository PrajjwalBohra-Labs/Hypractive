import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import { nowIso } from '@/utils/dateUtils';
import type { Exercise } from '@/types/entities';

function rowToExercise(row: any): Exercise {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    equipment: row.equipment,
    notes: row.notes,
    createdAt: row.created_at,
    archived: !!row.archived,
  };
}

export interface CreateExerciseInput {
  userId: string;
  name: string;
  category?: string | null;
  equipment?: string | null;
  notes?: string | null;
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const db = await getDb();
  const exercise: Exercise = {
    id: generateId(),
    userId: input.userId,
    name: input.name.trim(),
    category: input.category ?? null,
    equipment: input.equipment ?? null,
    notes: input.notes ?? null,
    createdAt: nowIso(),
    archived: false,
  };
  await db.runAsync(
    `INSERT INTO exercises (id, user_id, name, category, equipment, notes, created_at, archived)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
    [exercise.id, exercise.userId, exercise.name, exercise.category, exercise.equipment, exercise.notes, exercise.createdAt]
  );
  return exercise;
}

export async function updateExercise(id: string, updates: Partial<CreateExerciseInput>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name.trim()); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.equipment !== undefined) { fields.push('equipment = ?'); values.push(updates.equipment); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  if (!fields.length) return;
  values.push(id);
  await db.runAsync(`UPDATE exercises SET ${fields.join(', ')} WHERE id = ?;`, values);
}

export async function archiveExercise(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE exercises SET archived = 1 WHERE id = ?;', [id]);
}

/**
 * Hard-deletes only if no history exists for this exercise, per the
 * "delete blocked / archive instead" rule (architecture 7.8/7.11).
 * Returns false (and does not delete) if history exists.
 */
export async function deleteExerciseIfUnused(id: string): Promise<boolean> {
  const db = await getDb();
  const historyCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_history_entries WHERE exercise_id = ?;',
    [id]
  );
  if (historyCount && historyCount.count > 0) return false;
  await db.runAsync('DELETE FROM exercises WHERE id = ?;', [id]);
  return true;
}

export async function listExercises(userId: string, opts?: { includeArchived?: boolean; search?: string }): Promise<Exercise[]> {
  const db = await getDb();
  let query = 'SELECT * FROM exercises WHERE user_id = ?';
  const params: any[] = [userId];
  if (!opts?.includeArchived) query += ' AND archived = 0';
  if (opts?.search) {
    query += ' AND (name LIKE ? OR category LIKE ? OR equipment LIKE ?)';
    const term = `%${opts.search}%`;
    params.push(term, term, term);
  }
  query += ' ORDER BY name ASC;';
  const rows = await db.getAllAsync<any>(query, params);
  return rows.map(rowToExercise);
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM exercises WHERE id = ?;', [id]);
  return row ? rowToExercise(row) : null;
}
