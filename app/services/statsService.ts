import { getDb } from '@/db/client';
import { isoWeekStart, isoMonthStart } from '@/utils/dateUtils';
import type { ChartPoint } from '@/types/entities';

export type Granularity = 'day' | 'week' | 'month';

function bucketDate(date: string, granularity: Granularity): string {
  if (granularity === 'week') return isoWeekStart(date);
  if (granularity === 'month') return isoMonthStart(date);
  return date;
}

// ---------- Running Statistics (6.6) ----------

export interface RunningStatsSummary {
  totalDistanceM: number;
  weightedAvgPaceSPerKm: number | null;
  runCount: number;
  longestRunM: number;
}

export async function getRunningStatsSummary(userId: string, dateFrom: string, dateTo: string): Promise<RunningStatsSummary> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total_distance: number; total_duration: number; run_count: number; longest: number }>(
    `SELECT
       COALESCE(SUM(distance_m), 0) as total_distance,
       COALESCE(SUM(duration_s), 0) as total_duration,
       COUNT(*) as run_count,
       COALESCE(MAX(distance_m), 0) as longest
     FROM run_sessions WHERE user_id = ? AND date BETWEEN ? AND ?;`,
    [userId, dateFrom, dateTo]
  );
  const totalDistanceM = row?.total_distance ?? 0;
  const totalDurationS = row?.total_duration ?? 0;
  return {
    totalDistanceM,
    weightedAvgPaceSPerKm: totalDistanceM > 0 ? totalDurationS / (totalDistanceM / 1000) : null,
    runCount: row?.run_count ?? 0,
    longestRunM: row?.longest ?? 0,
  };
}

export async function getPaceOverTime(userId: string, dateFrom: string, dateTo: string): Promise<ChartPoint[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string; avg_pace_s_per_km: number }>(
    `SELECT date, avg_pace_s_per_km FROM run_sessions
     WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC;`,
    [userId, dateFrom, dateTo]
  );
  return rows.map((r) => ({ x: r.date, y: r.avg_pace_s_per_km }));
}

export async function getDistanceOverTime(
  userId: string,
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): Promise<ChartPoint[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string; distance_m: number }>(
    `SELECT date, distance_m FROM run_sessions WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC;`,
    [userId, dateFrom, dateTo]
  );
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = bucketDate(row.date, granularity);
    buckets.set(key, (buckets.get(key) ?? 0) + row.distance_m);
  }
  return [...buckets.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([x, y]) => ({ x, y }));
}

export interface PlannedVsActual {
  plannedCount: number;
  completedCount: number;
}

export async function getPlannedVsActual(planId: string): Promise<PlannedVsActual> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ planned_count: number; completed_count: number }>(
    `SELECT COUNT(*) as planned_count,
            SUM(CASE WHEN linked_run_session_id IS NOT NULL THEN 1 ELSE 0 END) as completed_count
     FROM planned_run_sessions WHERE plan_id = ?;`,
    [planId]
  );
  return { plannedCount: row?.planned_count ?? 0, completedCount: row?.completed_count ?? 0 };
}

// ---------- Workout Statistics (6.7) ----------

export interface WorkoutStatsSummary {
  totalVolumeKg: number;
  sessionCount: number;
  setCount: number;
}

export async function getWorkoutStatsSummary(userId: string, dateFrom: string, dateTo: string): Promise<WorkoutStatsSummary> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total_volume: number; session_count: number; set_count: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN ls.weight_kg IS NULL THEN 0 ELSE ls.weight_kg * ls.reps END), 0) as total_volume,
       COUNT(DISTINCT ws.id) as session_count,
       COUNT(ls.id) as set_count
     FROM workout_sessions ws
     LEFT JOIN logged_sets ls ON ls.workout_session_id = ws.id
     WHERE ws.user_id = ? AND ws.finished_at IS NOT NULL AND ws.date BETWEEN ? AND ?;`,
    [userId, dateFrom, dateTo]
  );
  return {
    totalVolumeKg: row?.total_volume ?? 0,
    sessionCount: row?.session_count ?? 0,
    setCount: row?.set_count ?? 0,
  };
}

export interface ExerciseFrequency {
  exerciseId: string;
  exerciseName: string;
  setCount: number;
}

export async function getMostTrainedExercises(
  userId: string,
  dateFrom: string,
  dateTo: string,
  limit: number = 5
): Promise<ExerciseFrequency[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ exercise_id: string; name: string; set_count: number }>(
    `SELECT e.id as exercise_id, e.name as name, COUNT(ls.id) as set_count
     FROM logged_sets ls
     JOIN workout_sessions ws ON ws.id = ls.workout_session_id
     JOIN exercises e ON e.id = ls.exercise_id
     WHERE ws.user_id = ? AND ws.finished_at IS NOT NULL AND ws.date BETWEEN ? AND ?
     GROUP BY e.id ORDER BY set_count DESC LIMIT ?;`,
    [userId, dateFrom, dateTo, limit]
  );
  return rows.map((r) => ({ exerciseId: r.exercise_id, exerciseName: r.name, setCount: r.set_count }));
}

export async function getWorkoutFrequencyOverTime(
  userId: string,
  dateFrom: string,
  dateTo: string,
  granularity: Granularity
): Promise<ChartPoint[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT date FROM workout_sessions WHERE user_id = ? AND finished_at IS NOT NULL AND date BETWEEN ? AND ?;`,
    [userId, dateFrom, dateTo]
  );
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = bucketDate(row.date, granularity);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([x, y]) => ({ x, y }));
}

export async function getPrCountOverTime(userId: string, dateFrom: string, dateTo: string): Promise<ChartPoint[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT date FROM exercise_history_entries
     WHERE user_id = ? AND (is_pr_weight = 1 OR is_pr_volume = 1) AND date BETWEEN ? AND ?;`,
    [userId, dateFrom, dateTo]
  );
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const key = isoMonthStart(row.date);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([x, y]) => ({ x, y }));
}

// ---------- Per-exercise charts (used from Exercise History Detail) ----------

export async function getExerciseWeightOverTime(exerciseId: string): Promise<ChartPoint[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string; weight_kg: number | null }>(
    `SELECT date, weight_kg FROM exercise_history_entries
     WHERE exercise_id = ? AND weight_kg IS NOT NULL ORDER BY date ASC;`,
    [exerciseId]
  );
  return rows.map((r) => ({ x: r.date, y: r.weight_kg as number }));
}

export async function getExerciseVolumeOverTime(exerciseId: string): Promise<ChartPoint[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ date: string; volume_kg: number }>(
    `SELECT date, volume_kg FROM exercise_history_entries WHERE exercise_id = ? ORDER BY date ASC;`,
    [exerciseId]
  );
  return rows.map((r) => ({ x: r.date, y: r.volume_kg }));
}

// ---------- Combined recent activity (Home dashboard) ----------

export type RecentActivityEntry =
  | { type: 'run'; id: string; date: string; distanceM: number; avgPaceSPerKm: number }
  | { type: 'workout'; id: string; date: string; exerciseCount: number; totalVolumeKg: number };

/**
 * Runs and finished workout sessions, interleaved by date (most recent
 * first), for the Home dashboard's horizontal "recent activity" row.
 * Raw data only -- the screen formats it for the user's unit preference.
 */
export async function getRecentActivity(userId: string, limit: number): Promise<RecentActivityEntry[]> {
  const db = await getDb();

  const runRows = await db.getAllAsync<{ id: string; date: string; distance_m: number; avg_pace_s_per_km: number; created_at: string }>(
    `SELECT id, date, distance_m, avg_pace_s_per_km, created_at FROM run_sessions
     WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT ?;`,
    [userId, limit]
  );
  const workoutRows = await db.getAllAsync<{ id: string; date: string; started_at: string }>(
    `SELECT id, date, started_at FROM workout_sessions
     WHERE user_id = ? AND finished_at IS NOT NULL ORDER BY date DESC, started_at DESC LIMIT ?;`,
    [userId, limit]
  );

  const runs: (RecentActivityEntry & { sortKey: string })[] = runRows.map((r) => ({
    type: 'run',
    id: r.id,
    date: r.date,
    distanceM: r.distance_m,
    avgPaceSPerKm: r.avg_pace_s_per_km,
    sortKey: `${r.date}T${r.created_at}`,
  }));

  const workouts: (RecentActivityEntry & { sortKey: string })[] = [];
  for (const w of workoutRows) {
    const summary = await db.getFirstAsync<{ exercise_count: number; total_volume: number }>(
      `SELECT COUNT(DISTINCT exercise_id) as exercise_count,
              COALESCE(SUM(CASE WHEN weight_kg IS NULL THEN 0 ELSE weight_kg * reps END), 0) as total_volume
       FROM logged_sets WHERE workout_session_id = ?;`,
      [w.id]
    );
    workouts.push({
      type: 'workout',
      id: w.id,
      date: w.date,
      exerciseCount: summary?.exercise_count ?? 0,
      totalVolumeKg: summary?.total_volume ?? 0,
      sortKey: `${w.date}T${w.started_at}`,
    });
  }

  return [...runs, ...workouts]
    .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1))
    .slice(0, limit)
    .map(({ sortKey, ...entry }) => entry as RecentActivityEntry);
}
