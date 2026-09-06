import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import { nowIso } from '@/utils/dateUtils';
import type { User, UnitPreference } from '@/types/entities';

function rowToUser(row: any): User {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    passwordHash: row.password_hash,
    isLoggedIn: !!row.is_logged_in,
    unitPreference: row.unit_preference as UnitPreference,
    createdAt: row.created_at,
    appLockEnabled: !!row.app_lock_enabled,
    weeklyDistanceGoalM: row.weekly_distance_goal_m,
    weeklyVolumeGoalKg: row.weekly_volume_goal_kg,
    weeklySessionsGoal: row.weekly_sessions_goal,
  };
}

/** Returns the currently logged-in local user, or null if no one is logged in right now. */
export async function getCurrentUser(): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM users WHERE is_logged_in = 1 LIMIT 1;');
  return row ? rowToUser(row) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM users WHERE lower(email) = lower(?);', [email.trim()]);
  return row ? rowToUser(row) : null;
}

export interface CreateAccountInput {
  email: string;
  passwordHash: string;
  displayName: string;
  unitPreference: UnitPreference;
}

/** Creates a new local account, logged in immediately. */
export async function createAccount(input: CreateAccountInput): Promise<User> {
  const db = await getDb();
  const user: User = {
    id: generateId(),
    displayName: input.displayName,
    email: input.email.trim(),
    passwordHash: input.passwordHash,
    isLoggedIn: true,
    unitPreference: input.unitPreference,
    createdAt: nowIso(),
    appLockEnabled: false,
  };
  await db.runAsync(
    `INSERT INTO users (id, display_name, email, password_hash, is_logged_in, unit_preference, created_at, app_lock_enabled)
     VALUES (?, ?, ?, ?, 1, ?, ?, 0);`,
    [user.id, user.displayName, user.email, user.passwordHash, user.unitPreference, user.createdAt]
  );
  return user;
}

export async function setLoggedIn(userId: string, isLoggedIn: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE users SET is_logged_in = ? WHERE id = ?;', [isLoggedIn ? 1 : 0, userId]);
}

export async function updateUnitPreference(userId: string, unitPreference: UnitPreference): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE users SET unit_preference = ? WHERE id = ?;', [unitPreference, userId]);
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE users SET display_name = ? WHERE id = ?;', [displayName, userId]);
}

export interface WeeklyGoals {
  weeklyDistanceGoalM: number | null;
  weeklyVolumeGoalKg: number | null;
  weeklySessionsGoal: number | null;
}

export async function updateWeeklyGoals(userId: string, goals: WeeklyGoals): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE users SET weekly_distance_goal_m = ?, weekly_volume_goal_kg = ?, weekly_sessions_goal = ? WHERE id = ?;',
    [goals.weeklyDistanceGoalM, goals.weeklyVolumeGoalKg, goals.weeklySessionsGoal, userId]
  );
}