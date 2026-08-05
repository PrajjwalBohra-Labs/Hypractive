import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations/001_init';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton SQLite database handle, running migrations on
 * first access. All repositories go through this function rather than
 * opening their own connection.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync('hybrid_fitness.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  dbInstance = db;
  return dbInstance;
}

/** Test-only: forces a fresh in-memory database. */
export async function getTestDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(':memory:');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  return db;
}
