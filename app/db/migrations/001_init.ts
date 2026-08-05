import type { SQLiteDatabase } from 'expo-sqlite';
import { applyMigration002 } from './002_add_login_fields';

const SCHEMA_VERSION = 2;

const CREATE_STATEMENTS = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  password_hash TEXT,
  is_logged_in INTEGER NOT NULL DEFAULT 0,
  unit_preference TEXT NOT NULL DEFAULT 'metric',
  created_at TEXT NOT NULL,
  app_lock_enabled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS friend_group_members (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS running_plans (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  created_at TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS planned_run_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  plan_id TEXT NOT NULL REFERENCES running_plans(id) ON DELETE CASCADE,
  planned_date TEXT NOT NULL,
  target_distance_m REAL,
  target_duration_s INTEGER,
  target_pace_s_per_km REAL,
  notes TEXT,
  linked_run_session_id TEXT REFERENCES run_sessions(id),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS run_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  distance_m REAL NOT NULL,
  duration_s INTEGER NOT NULL,
  avg_pace_s_per_km REAL NOT NULL,
  notes TEXT,
  planned_session_id TEXT REFERENCES planned_run_sessions(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pace_splits (
  id TEXT PRIMARY KEY NOT NULL,
  run_session_id TEXT NOT NULL REFERENCES run_sessions(id) ON DELETE CASCADE,
  split_index INTEGER NOT NULL,
  distance_m REAL NOT NULL,
  duration_s INTEGER NOT NULL,
  pace_s_per_km REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_programs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS program_template_entries (
  id TEXT PRIMARY KEY NOT NULL,
  program_id TEXT NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES custom_workout_templates(id),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS custom_workout_templates (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS template_exercise_entries (
  id TEXT PRIMARY KEY NOT NULL,
  template_id TEXT NOT NULL REFERENCES custom_workout_templates(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  target_sets INTEGER,
  target_reps INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  category TEXT,
  equipment TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  source_template_id TEXT REFERENCES custom_workout_templates(id),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS logged_sets (
  id TEXT PRIMARY KEY NOT NULL,
  workout_session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  set_index INTEGER NOT NULL,
  weight_kg REAL,
  reps INTEGER NOT NULL,
  rpe REAL,
  completed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_history_entries (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  logged_set_id TEXT NOT NULL REFERENCES logged_sets(id),
  date TEXT NOT NULL,
  weight_kg REAL,
  reps INTEGER NOT NULL,
  volume_kg REAL NOT NULL,
  is_pr_weight INTEGER NOT NULL DEFAULT 0,
  is_pr_volume INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS progress_records (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  metric TEXT NOT NULL,
  value REAL NOT NULL,
  achieved_date TEXT NOT NULL,
  source_history_entry_id TEXT NOT NULL REFERENCES exercise_history_entries(id),
  UNIQUE(exercise_id, metric)
);

CREATE TABLE IF NOT EXISTS rest_timer_presets (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  label TEXT NOT NULL,
  duration_s INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_exercise_history_exercise ON exercise_history_entries(exercise_id, date);
CREATE INDEX IF NOT EXISTS idx_logged_sets_session ON logged_sets(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_run_sessions_user_date ON run_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date);
`;

/**
 * Applies the schema if it hasn't been applied yet, tracked via a single
 * row in schema_version. Additional migrations (002, 003, ...) should be
 * added as new files and chained here in order.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);`);
  const row = await db.getFirstAsync<{ version: number }>('SELECT version FROM schema_version LIMIT 1;');

  if (!row) {
    await db.execAsync(CREATE_STATEMENTS);
    await db.runAsync('INSERT INTO schema_version (version) VALUES (?);', [SCHEMA_VERSION]);
    return;
  }

  if (row.version < 2) {
    await applyMigration002(db);
    await db.runAsync('UPDATE schema_version SET version = 2;');
  }
}
