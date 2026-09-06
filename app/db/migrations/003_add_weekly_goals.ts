import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Adds optional weekly-goal columns to `users`, for progress rings.
 * All nullable -- a null goal means "no target set," which is a valid
 * state, not a missing one: rings simply don't render until the user
 * sets a real target, per the design spec.
 */
export async function applyMigration003(db: SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(users);`);
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has('weekly_distance_goal_m')) {
    await db.execAsync(`ALTER TABLE users ADD COLUMN weekly_distance_goal_m REAL;`);
  }
  if (!columnNames.has('weekly_volume_goal_kg')) {
    await db.execAsync(`ALTER TABLE users ADD COLUMN weekly_volume_goal_kg REAL;`);
  }
  if (!columnNames.has('weekly_sessions_goal')) {
    await db.execAsync(`ALTER TABLE users ADD COLUMN weekly_sessions_goal INTEGER;`);
  }
}
