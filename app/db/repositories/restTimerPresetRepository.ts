import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import type { RestTimerPreset } from '@/types/entities';

function rowToPreset(row: any): RestTimerPreset {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    durationS: row.duration_s,
    sortOrder: row.sort_order,
  };
}

export async function listPresets(userId: string): Promise<RestTimerPreset[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM rest_timer_presets WHERE user_id = ? ORDER BY sort_order ASC;',
    [userId]
  );
  return rows.map(rowToPreset);
}

export async function createPreset(userId: string, label: string, durationS: number): Promise<RestTimerPreset> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM rest_timer_presets WHERE user_id = ?;',
    [userId]
  );
  const preset: RestTimerPreset = {
    id: generateId(),
    userId,
    label,
    durationS,
    sortOrder: countRow?.count ?? 0,
  };
  await db.runAsync(
    'INSERT INTO rest_timer_presets (id, user_id, label, duration_s, sort_order) VALUES (?, ?, ?, ?, ?);',
    [preset.id, preset.userId, preset.label, preset.durationS, preset.sortOrder]
  );
  return preset;
}

export async function deletePreset(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM rest_timer_presets WHERE id = ?;', [id]);
}
