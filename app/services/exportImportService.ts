import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';

const BACKUP_VERSION = 1;

/**
 * Raw-row shape (snake_case, matching SQLite columns directly) rather than
 * the camelCase entity types — export/import round-trips the database
 * verbatim rather than going through the repository mapping layer, so nothing
 * is lost or reinterpreted between export and import.
 */
export interface BackupBundle {
  version: number;
  exportedAt: string;
  tables: {
    users: any[];
    friend_group_members: any[];
    exercises: any[];
    rest_timer_presets: any[];
    custom_workout_templates: any[];
    template_exercise_entries: any[];
    workout_programs: any[];
    program_template_entries: any[];
    running_plans: any[];
    run_sessions: any[];
    planned_run_sessions: any[];
    pace_splits: any[];
    workout_sessions: any[];
    logged_sets: any[];
    exercise_history_entries: any[];
    progress_records: any[];
  };
}

// ---------- Export ----------

export async function buildBackupBundle(userId: string): Promise<BackupBundle> {
  const db = await getDb();

  const users = await db.getAllAsync<any>('SELECT * FROM users WHERE id = ?;', [userId]);
  const friend_group_members = await db.getAllAsync<any>(
    'SELECT * FROM friend_group_members WHERE owner_user_id = ?;',
    [userId]
  );
  const exercises = await db.getAllAsync<any>('SELECT * FROM exercises WHERE user_id = ?;', [userId]);
  const rest_timer_presets = await db.getAllAsync<any>('SELECT * FROM rest_timer_presets WHERE user_id = ?;', [userId]);
  const custom_workout_templates = await db.getAllAsync<any>(
    'SELECT * FROM custom_workout_templates WHERE user_id = ?;',
    [userId]
  );
  const template_exercise_entries = await db.getAllAsync<any>(
    `SELECT tee.* FROM template_exercise_entries tee
     JOIN custom_workout_templates t ON t.id = tee.template_id WHERE t.user_id = ?;`,
    [userId]
  );
  const workout_programs = await db.getAllAsync<any>('SELECT * FROM workout_programs WHERE user_id = ?;', [userId]);
  const program_template_entries = await db.getAllAsync<any>(
    `SELECT pte.* FROM program_template_entries pte
     JOIN workout_programs p ON p.id = pte.program_id WHERE p.user_id = ?;`,
    [userId]
  );
  const running_plans = await db.getAllAsync<any>('SELECT * FROM running_plans WHERE user_id = ?;', [userId]);
  const run_sessions = await db.getAllAsync<any>('SELECT * FROM run_sessions WHERE user_id = ?;', [userId]);
  const planned_run_sessions = await db.getAllAsync<any>(
    `SELECT prs.* FROM planned_run_sessions prs
     JOIN running_plans rp ON rp.id = prs.plan_id WHERE rp.user_id = ?;`,
    [userId]
  );
  const pace_splits = await db.getAllAsync<any>(
    `SELECT ps.* FROM pace_splits ps
     JOIN run_sessions rs ON rs.id = ps.run_session_id WHERE rs.user_id = ?;`,
    [userId]
  );
  const workout_sessions = await db.getAllAsync<any>('SELECT * FROM workout_sessions WHERE user_id = ?;', [userId]);
  const logged_sets = await db.getAllAsync<any>(
    `SELECT ls.* FROM logged_sets ls
     JOIN workout_sessions ws ON ws.id = ls.workout_session_id WHERE ws.user_id = ?;`,
    [userId]
  );
  const exercise_history_entries = await db.getAllAsync<any>(
    'SELECT * FROM exercise_history_entries WHERE user_id = ?;',
    [userId]
  );
  const progress_records = await db.getAllAsync<any>('SELECT * FROM progress_records WHERE user_id = ?;', [userId]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tables: {
      users,
      friend_group_members,
      exercises,
      rest_timer_presets,
      custom_workout_templates,
      template_exercise_entries,
      workout_programs,
      program_template_entries,
      running_plans,
      run_sessions,
      planned_run_sessions,
      pace_splits,
      workout_sessions,
      logged_sets,
      exercise_history_entries,
      progress_records,
    },
  };
}

/** Writes the backup to a file and opens the native share sheet so the user can save it wherever they like. */
export async function exportAndShare(userId: string): Promise<void> {
  const bundle = await buildBackupBundle(userId);
  const fileName = `hybrid-fitness-backup-${bundle.exportedAt.slice(0, 10)}.json`;
  const fileUri = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(bundle, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device. The backup file was saved but could not be shared.');
  }
  await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Save your backup' });
}

// ---------- Import ----------

const REQUIRED_TABLE_KEYS: (keyof BackupBundle['tables'])[] = [
  'users', 'friend_group_members', 'exercises', 'rest_timer_presets',
  'custom_workout_templates', 'template_exercise_entries', 'workout_programs',
  'program_template_entries', 'running_plans', 'run_sessions', 'planned_run_sessions',
  'pace_splits', 'workout_sessions', 'logged_sets', 'exercise_history_entries', 'progress_records',
];

export function validateBackupBundle(raw: unknown): raw is BackupBundle {
  if (typeof raw !== 'object' || raw === null) return false;
  const candidate = raw as any;
  if (typeof candidate.version !== 'number') return false;
  if (typeof candidate.tables !== 'object' || candidate.tables === null) return false;
  return REQUIRED_TABLE_KEYS.every((key) => Array.isArray(candidate.tables[key]));
}

export async function readBackupFile(fileUri: string): Promise<BackupBundle> {
  const text = await FileSystem.readAsStringAsync(fileUri);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON and could not be read as a backup.');
  }
  if (!validateBackupBundle(parsed)) {
    throw new Error('This file does not match the expected backup format.');
  }
  return parsed;
}

export type ImportMode = 'replace' | 'merge';

/**
 * Deletes all of the current user's data, in an order that respects every
 * foreign key in the schema (children before parents; a couple of tables
 * rely on ON DELETE CASCADE, noted inline).
 */
async function clearUserData(userId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM progress_records WHERE user_id = ?;', [userId]);
  await db.runAsync('DELETE FROM exercise_history_entries WHERE user_id = ?;', [userId]);
  await db.runAsync('DELETE FROM workout_sessions WHERE user_id = ?;', [userId]); // cascades logged_sets
  await db.runAsync('DELETE FROM running_plans WHERE user_id = ?;', [userId]); // cascades planned_run_sessions
  await db.runAsync('DELETE FROM run_sessions WHERE user_id = ?;', [userId]); // cascades pace_splits
  await db.runAsync('DELETE FROM custom_workout_templates WHERE user_id = ?;', [userId]); // cascades template_exercise_entries
  await db.runAsync('DELETE FROM workout_programs WHERE user_id = ?;', [userId]); // cascades program_template_entries
  await db.runAsync('DELETE FROM exercises WHERE user_id = ?;', [userId]);
  await db.runAsync('DELETE FROM rest_timer_presets WHERE user_id = ?;', [userId]);
  await db.runAsync('DELETE FROM friend_group_members WHERE owner_user_id = ?;', [userId]);
}

function insertRow(table: string, row: Record<string, any>): { sql: string; params: any[] } {
  const columns = Object.keys(row);
  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders});`;
  return { sql, params: columns.map((c) => row[c]) };
}

/**
 * Imports a validated bundle into the CURRENT local user (not the
 * exported user id) — every row's user_id/owner_user_id is remapped to
 * `currentUserId`, so a backup restores correctly whether it's the same
 * device or a fresh install. Runs inside a single transaction: if
 * anything fails, nothing is committed (architecture 7.11).
 */
export async function importBackup(bundle: BackupBundle, currentUserId: string, mode: ImportMode): Promise<void> {
  const db = await getDb();
  const t = bundle.tables;

  // Build an id-remap so every row consistently points at currentUserId
  // instead of whatever user id the export was originally taken under.
  const exportedUserId = t.users[0]?.id;

  try {
    await db.execAsync('BEGIN;');

    if (mode === 'replace') {
      await clearUserData(currentUserId);
    }

    const remapUser = (row: any, key: string = 'user_id') =>
      exportedUserId && row[key] === exportedUserId ? { ...row, [key]: currentUserId } : row;

    for (const row of t.exercises) {
      const r = insertRow('exercises', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.rest_timer_presets) {
      const r = insertRow('rest_timer_presets', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.friend_group_members) {
      const r = insertRow('friend_group_members', remapUser(row, 'owner_user_id'));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.custom_workout_templates) {
      const r = insertRow('custom_workout_templates', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.template_exercise_entries) {
      const r = insertRow('template_exercise_entries', row);
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.workout_programs) {
      const r = insertRow('workout_programs', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.program_template_entries) {
      const r = insertRow('program_template_entries', row);
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.running_plans) {
      const r = insertRow('running_plans', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    // Insert run_sessions with planned_session_id nulled first -- avoids a
    // circular FK with planned_run_sessions, which doesn't exist yet.
    const deferredPlannedLinks: { runSessionId: string; plannedSessionId: string }[] = [];
    for (const row of t.run_sessions) {
      const remapped = remapUser(row);
      if (remapped.planned_session_id) {
        deferredPlannedLinks.push({ runSessionId: remapped.id, plannedSessionId: remapped.planned_session_id });
      }
      const r = insertRow('run_sessions', { ...remapped, planned_session_id: null });
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.planned_run_sessions) {
      const r = insertRow('planned_run_sessions', row);
      await db.runAsync(r.sql, r.params);
    }
    for (const link of deferredPlannedLinks) {
      await db.runAsync('UPDATE run_sessions SET planned_session_id = ? WHERE id = ?;', [
        link.plannedSessionId,
        link.runSessionId,
      ]);
    }
    for (const row of t.pace_splits) {
      const r = insertRow('pace_splits', row);
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.workout_sessions) {
      const r = insertRow('workout_sessions', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.logged_sets) {
      const r = insertRow('logged_sets', row);
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.exercise_history_entries) {
      const r = insertRow('exercise_history_entries', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }
    for (const row of t.progress_records) {
      // Merge mode may hit the UNIQUE(exercise_id, metric) constraint on a
      // record that already exists — INSERT OR IGNORE handles that safely.
      const r = insertRow('progress_records', remapUser(row));
      await db.runAsync(r.sql, r.params);
    }

    await db.execAsync('COMMIT;');
  } catch (err) {
    await db.execAsync('ROLLBACK;');
    throw err;
  }
}
