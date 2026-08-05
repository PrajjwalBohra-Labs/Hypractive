import { validateBackupBundle } from '../../app/services/exportImportService';

describe('validateBackupBundle', () => {
  const validBundle = {
    version: 1,
    exportedAt: '2026-08-03T00:00:00.000Z',
    tables: {
      users: [], friend_group_members: [], exercises: [], rest_timer_presets: [],
      custom_workout_templates: [], template_exercise_entries: [], workout_programs: [],
      program_template_entries: [], running_plans: [], run_sessions: [], planned_run_sessions: [],
      pace_splits: [], workout_sessions: [], logged_sets: [], exercise_history_entries: [], progress_records: [],
    },
  };

  test('accepts a well-formed bundle', () => {
    expect(validateBackupBundle(validBundle)).toBe(true);
  });

  test('rejects null', () => {
    expect(validateBackupBundle(null)).toBe(false);
  });

  test('rejects a plain object with no tables key', () => {
    expect(validateBackupBundle({ version: 1 })).toBe(false);
  });

  test('rejects a bundle missing one required table array', () => {
    const { progress_records, ...rest } = validBundle.tables;
    const broken = { ...validBundle, tables: rest };
    expect(validateBackupBundle(broken)).toBe(false);
  });

  test('rejects a bundle where a table field is not an array', () => {
    const broken = { ...validBundle, tables: { ...validBundle.tables, exercises: 'not an array' } };
    expect(validateBackupBundle(broken)).toBe(false);
  });

  test('rejects a bundle with a non-numeric version', () => {
    const broken = { ...validBundle, version: '1' };
    expect(validateBackupBundle(broken)).toBe(false);
  });
});
