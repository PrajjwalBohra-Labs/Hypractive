import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Adds the columns needed for local (cosmetic, no-backend) email/password
 * login to an existing `users` table. Fresh installs already get these
 * columns via 001_init's CREATE TABLE; this migration only matters for
 * databases created before this feature existed.
 */
export async function applyMigration002(db: SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(users);`);
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has('email')) {
    await db.execAsync(`ALTER TABLE users ADD COLUMN email TEXT;`);
  }
  if (!columnNames.has('password_hash')) {
    await db.execAsync(`ALTER TABLE users ADD COLUMN password_hash TEXT;`);
  }
  if (!columnNames.has('is_logged_in')) {
    await db.execAsync(`ALTER TABLE users ADD COLUMN is_logged_in INTEGER NOT NULL DEFAULT 0;`);
    // Existing installs had no login concept at all -- treat any existing
    // profile as already "logged in" so upgrading the app doesn't lock
    // out someone's existing local data.
    await db.execAsync(`UPDATE users SET is_logged_in = 1;`);
  }
}
