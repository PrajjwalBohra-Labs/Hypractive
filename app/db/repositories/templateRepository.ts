import { getDb } from '@/db/client';
import { generateId } from '@/utils/idGenerator';
import { nowIso } from '@/utils/dateUtils';
import type { CustomWorkoutTemplate, TemplateExerciseEntry } from '@/types/entities';

function rowToTemplate(row: any): CustomWorkoutTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    notes: row.notes,
    createdAt: row.created_at,
    archived: !!row.archived,
  };
}

function rowToEntry(row: any): TemplateExerciseEntry {
  return {
    id: row.id,
    templateId: row.template_id,
    exerciseId: row.exercise_id,
    targetSets: row.target_sets,
    targetReps: row.target_reps,
    sortOrder: row.sort_order,
  };
}

export async function createTemplate(userId: string, name: string, notes?: string | null): Promise<CustomWorkoutTemplate> {
  const db = await getDb();
  const template: CustomWorkoutTemplate = {
    id: generateId(),
    userId,
    name: name.trim(),
    notes: notes ?? null,
    createdAt: nowIso(),
    archived: false,
  };
  await db.runAsync(
    'INSERT INTO custom_workout_templates (id, user_id, name, notes, created_at, archived) VALUES (?, ?, ?, ?, ?, 0);',
    [template.id, template.userId, template.name, template.notes, template.createdAt]
  );
  return template;
}

export async function updateTemplate(id: string, updates: { name?: string; notes?: string | null }): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name.trim()); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  if (!fields.length) return;
  values.push(id);
  await db.runAsync(`UPDATE custom_workout_templates SET ${fields.join(', ')} WHERE id = ?;`, values);
}

export async function archiveTemplate(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE custom_workout_templates SET archived = 1 WHERE id = ?;', [id]);
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM template_exercise_entries WHERE template_id = ?;', [id]);
  await db.runAsync('DELETE FROM custom_workout_templates WHERE id = ?;', [id]);
}

export async function listTemplates(userId: string, opts?: { includeArchived?: boolean }): Promise<CustomWorkoutTemplate[]> {
  const db = await getDb();
  let query = 'SELECT * FROM custom_workout_templates WHERE user_id = ?';
  if (!opts?.includeArchived) query += ' AND archived = 0';
  query += ' ORDER BY created_at DESC;';
  const rows = await db.getAllAsync<any>(query, [userId]);
  return rows.map(rowToTemplate);
}

export async function getTemplate(id: string): Promise<CustomWorkoutTemplate | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM custom_workout_templates WHERE id = ?;', [id]);
  return row ? rowToTemplate(row) : null;
}

export async function listTemplateExercises(templateId: string): Promise<TemplateExerciseEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM template_exercise_entries WHERE template_id = ? ORDER BY sort_order ASC;',
    [templateId]
  );
  return rows.map(rowToEntry);
}

export async function addTemplateExercise(
  templateId: string,
  exerciseId: string,
  targetSets: number | null,
  targetReps: number | null
): Promise<TemplateExerciseEntry> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM template_exercise_entries WHERE template_id = ?;',
    [templateId]
  );
  const entry: TemplateExerciseEntry = {
    id: generateId(),
    templateId,
    exerciseId,
    targetSets,
    targetReps,
    sortOrder: countRow?.count ?? 0,
  };
  await db.runAsync(
    'INSERT INTO template_exercise_entries (id, template_id, exercise_id, target_sets, target_reps, sort_order) VALUES (?, ?, ?, ?, ?, ?);',
    [entry.id, entry.templateId, entry.exerciseId, entry.targetSets, entry.targetReps, entry.sortOrder]
  );
  return entry;
}

export async function removeTemplateExercise(entryId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM template_exercise_entries WHERE id = ?;', [entryId]);
}

export async function reorderTemplateExercises(orderedEntryIds: string[]): Promise<void> {
  const db = await getDb();
  for (let i = 0; i < orderedEntryIds.length; i++) {
    await db.runAsync('UPDATE template_exercise_entries SET sort_order = ? WHERE id = ?;', [i, orderedEntryIds[i]]);
  }
}

export async function updateTemplateExerciseTargets(
  entryId: string,
  targetSets: number | null,
  targetReps: number | null
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE template_exercise_entries SET target_sets = ?, target_reps = ? WHERE id = ?;', [
    targetSets,
    targetReps,
    entryId,
  ]);
}
