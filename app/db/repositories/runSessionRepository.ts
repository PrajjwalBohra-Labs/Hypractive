import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import { nowIso } from '@/utils/dateUtils';
import type { RunSession, PaceSplit } from '@/types/entities';

function rowToRunSession(row: any): RunSession {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    distanceM: row.distance_m,
    durationS: row.duration_s,
    avgPaceSPerKm: row.avg_pace_s_per_km,
    notes: row.notes,
    plannedSessionId: row.planned_session_id,
    createdAt: row.created_at,
  };
}

function rowToPaceSplit(row: any): PaceSplit {
  return {
    id: row.id,
    runSessionId: row.run_session_id,
    splitIndex: row.split_index,
    distanceM: row.distance_m,
    durationS: row.duration_s,
    paceSPerKm: row.pace_s_per_km,
  };
}

export interface CreateRunSessionInput {
  userId: string;
  date: string;
  distanceM: number;
  durationS: number;
  notes?: string | null;
  plannedSessionId?: string | null;
}

export async function createRunSession(input: CreateRunSessionInput): Promise<RunSession> {
  const db = await getDb();
  const avgPaceSPerKm = input.durationS / (input.distanceM / 1000);
  const session: RunSession = {
    id: generateId(),
    userId: input.userId,
    date: input.date,
    distanceM: input.distanceM,
    durationS: input.durationS,
    avgPaceSPerKm,
    notes: input.notes ?? null,
    plannedSessionId: input.plannedSessionId ?? null,
    createdAt: nowIso(),
  };
  await db.runAsync(
    `INSERT INTO run_sessions (id, user_id, date, distance_m, duration_s, avg_pace_s_per_km, notes, planned_session_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      session.id,
      session.userId,
      session.date,
      session.distanceM,
      session.durationS,
      session.avgPaceSPerKm,
      session.notes,
      session.plannedSessionId,
      session.createdAt,
    ]
  );
  return session;
}

export async function updateRunSession(
  id: string,
  updates: { date?: string; distanceM?: number; durationS?: number; notes?: string | null }
): Promise<void> {
  const db = await getDb();
  const existing = await getRunSession(id);
  if (!existing) return;
  const distanceM = updates.distanceM ?? existing.distanceM;
  const durationS = updates.durationS ?? existing.durationS;
  const avgPaceSPerKm = durationS / (distanceM / 1000);
  await db.runAsync(
    `UPDATE run_sessions SET date = ?, distance_m = ?, duration_s = ?, avg_pace_s_per_km = ?, notes = ? WHERE id = ?;`,
    [
      updates.date ?? existing.date,
      distanceM,
      durationS,
      avgPaceSPerKm,
      updates.notes !== undefined ? updates.notes : existing.notes,
      id,
    ]
  );
}

export async function getRunSession(id: string): Promise<RunSession | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM run_sessions WHERE id = ?;', [id]);
  return row ? rowToRunSession(row) : null;
}

export async function listRunSessions(
  userId: string,
  opts?: { limit?: number; dateFrom?: string; dateTo?: string }
): Promise<RunSession[]> {
  const db = await getDb();
  let query = 'SELECT * FROM run_sessions WHERE user_id = ?';
  const params: any[] = [userId];
  if (opts?.dateFrom) {
    query += ' AND date >= ?';
    params.push(opts.dateFrom);
  }
  if (opts?.dateTo) {
    query += ' AND date <= ?';
    params.push(opts.dateTo);
  }
  query += ' ORDER BY date DESC, created_at DESC';
  if (opts?.limit) {
    query += ' LIMIT ?';
    params.push(opts.limit);
  }
  const rows = await db.getAllAsync<any>(query + ';', params);
  return rows.map(rowToRunSession);
}

/**
 * Most recent prior run within +/-10% distance of the given one, excluding
 * the run itself. Used for the "compare to prior run" part of Running
 * Analysis (architecture 6.5). Returns null if none exists.
 */
export async function findComparableRun(
  userId: string,
  distanceM: number,
  excludeRunId: string,
  beforeDate: string
): Promise<RunSession | null> {
  const db = await getDb();
  const lowerBound = distanceM * 0.9;
  const upperBound = distanceM * 1.1;
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM run_sessions
     WHERE user_id = ? AND id != ? AND distance_m BETWEEN ? AND ?
       AND (date < ? OR (date = ? AND created_at < (SELECT created_at FROM run_sessions WHERE id = ?)))
     ORDER BY date DESC, created_at DESC LIMIT 1;`,
    [userId, excludeRunId, lowerBound, upperBound, beforeDate, beforeDate, excludeRunId]
  );
  return row ? rowToRunSession(row) : null;
}

export async function addPaceSplit(
  runSessionId: string,
  splitIndex: number,
  distanceM: number,
  durationS: number
): Promise<PaceSplit> {
  const db = await getDb();
  const split: PaceSplit = {
    id: generateId(),
    runSessionId,
    splitIndex,
    distanceM,
    durationS,
    paceSPerKm: durationS / (distanceM / 1000),
  };
  await db.runAsync(
    `INSERT INTO pace_splits (id, run_session_id, split_index, distance_m, duration_s, pace_s_per_km)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [split.id, split.runSessionId, split.splitIndex, split.distanceM, split.durationS, split.paceSPerKm]
  );
  return split;
}

export async function listPaceSplits(runSessionId: string): Promise<PaceSplit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM pace_splits WHERE run_session_id = ? ORDER BY split_index ASC;',
    [runSessionId]
  );
  return rows.map(rowToPaceSplit);
}
