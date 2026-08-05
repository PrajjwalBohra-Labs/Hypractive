import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import { nowIso, todayIsoDate } from '@/utils/dateUtils';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import type { WorkoutSession, LoggedSet } from '@/types/entities';

function rowToSession(row: any): WorkoutSession {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    sourceTemplateId: row.source_template_id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    notes: row.notes,
  };
}

function rowToLoggedSet(row: any): LoggedSet {
  return {
    id: row.id,
    workoutSessionId: row.workout_session_id,
    exerciseId: row.exercise_id,
    setIndex: row.set_index,
    weightKg: row.weight_kg,
    reps: row.reps,
    rpe: row.rpe,
    completedAt: row.completed_at,
  };
}

export async function createSession(userId: string, sourceTemplateId: string | null): Promise<WorkoutSession> {
  const db = await getDb();
  const session: WorkoutSession = {
    id: generateId(),
    userId,
    date: todayIsoDate(),
    sourceTemplateId,
    startedAt: nowIso(),
    finishedAt: null,
    notes: null,
  };
  await db.runAsync(
    'INSERT INTO workout_sessions (id, user_id, date, source_template_id, started_at, finished_at, notes) VALUES (?, ?, ?, ?, ?, NULL, NULL);',
    [session.id, session.userId, session.date, session.sourceTemplateId, session.startedAt]
  );
  return session;
}

export async function finishSession(sessionId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE workout_sessions SET finished_at = ? WHERE id = ?;', [nowIso(), sessionId]);
}

export async function getSession(sessionId: string): Promise<WorkoutSession | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM workout_sessions WHERE id = ?;', [sessionId]);
  return row ? rowToSession(row) : null;
}

export async function listSessions(userId: string, opts?: { limit?: number }): Promise<WorkoutSession[]> {
  const db = await getDb();
  let query = 'SELECT * FROM workout_sessions WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY date DESC, started_at DESC';
  const params: any[] = [userId];
  if (opts?.limit) {
    query += ' LIMIT ?';
    params.push(opts.limit);
  }
  const rows = await db.getAllAsync<any>(query + ';', params);
  return rows.map(rowToSession);
}

export async function addLoggedSet(
  workoutSessionId: string,
  exerciseId: string,
  weightKg: number | null,
  reps: number,
  rpe: number | null
): Promise<LoggedSet> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM logged_sets WHERE workout_session_id = ? AND exercise_id = ?;',
    [workoutSessionId, exerciseId]
  );
  const set: LoggedSet = {
    id: generateId(),
    workoutSessionId,
    exerciseId,
    setIndex: (countRow?.count ?? 0) + 1,
    weightKg,
    reps,
    rpe,
    completedAt: nowIso(),
  };
  await db.runAsync(
    'INSERT INTO logged_sets (id, workout_session_id, exercise_id, set_index, weight_kg, reps, rpe, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    [set.id, set.workoutSessionId, set.exerciseId, set.setIndex, set.weightKg, set.reps, set.rpe, set.completedAt]
  );
  return set;
}

export async function updateLoggedSet(
  setId: string,
  updates: { weightKg?: number | null; reps?: number; rpe?: number | null }
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.weightKg !== undefined) { fields.push('weight_kg = ?'); values.push(updates.weightKg); }
  if (updates.reps !== undefined) { fields.push('reps = ?'); values.push(updates.reps); }
  if (updates.rpe !== undefined) { fields.push('rpe = ?'); values.push(updates.rpe); }
  if (!fields.length) return;
  values.push(setId);
  await db.runAsync(`UPDATE logged_sets SET ${fields.join(', ')} WHERE id = ?;`, values);
}

export async function deleteLoggedSet(setId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM logged_sets WHERE id = ?;', [setId]);
}

export async function getLoggedSetsForSession(sessionId: string): Promise<LoggedSet[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM logged_sets WHERE workout_session_id = ? ORDER BY exercise_id, set_index ASC;',
    [sessionId]
  );
  return rows.map(rowToLoggedSet);
}

export async function getLoggedSetsForExerciseInSession(sessionId: string, exerciseId: string): Promise<LoggedSet[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM logged_sets WHERE workout_session_id = ? AND exercise_id = ? ORDER BY set_index ASC;',
    [sessionId, exerciseId]
  );
  return rows.map(rowToLoggedSet);
}

/** Distinct exercise IDs that have at least one logged set in this session, in first-logged order. */
export async function getSessionExerciseIds(sessionId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ exercise_id: string }>(
    'SELECT DISTINCT exercise_id, MIN(completed_at) as first_at FROM logged_sets WHERE workout_session_id = ? GROUP BY exercise_id ORDER BY first_at ASC;',
    [sessionId]
  );
  return rows.map((r) => r.exercise_id);
}



export interface WorkoutSessionSummary {
  exerciseNames: string[];
  totalSets: number;
  totalVolumeKg: number;
}

/** Composes a display-ready summary (exercise names, set count, total volume) for one session. */
export async function getSessionSummary(sessionId: string): Promise<WorkoutSessionSummary> {
  const sets = await getLoggedSetsForSession(sessionId);
  const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
  const names: string[] = [];
  for (const id of exerciseIds) {
    const ex = await exerciseRepository.getExercise(id);
    if (ex) names.push(ex.name);
  }
  const totalVolumeKg = sets.reduce((sum, s) => sum + (s.weightKg !== null ? s.weightKg * s.reps : 0), 0);
  return { exerciseNames: names, totalSets: sets.length, totalVolumeKg };
}

/** Sessions whose exercise names match the search term (case-insensitive substring), for Workout History filtering. */
export async function searchSessionsByExerciseName(userId: string, searchTerm: string): Promise<WorkoutSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT DISTINCT ws.* FROM workout_sessions ws
     JOIN logged_sets ls ON ls.workout_session_id = ws.id
     JOIN exercises ex ON ex.id = ls.exercise_id
     WHERE ws.user_id = ? AND ws.finished_at IS NOT NULL AND ex.name LIKE ?
     ORDER BY ws.date DESC, ws.started_at DESC;`,
    [userId, `%${searchTerm}%`]
  );
  return rows.map(rowToSession);
}
