import { validateExercise, validateRunEntry, validateLoggedSet } from '../../app/utils/validation';

describe('validateExercise', () => {
  test('fails when name is empty', () => {
    const result = validateExercise({ name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  test('passes with a non-empty name', () => {
    const result = validateExercise({ name: 'Back Squat' });
    expect(result.valid).toBe(true);
  });
});

describe('validateRunEntry', () => {
  test('fails when distance is zero', () => {
    const result = validateRunEntry({ date: '2026-07-29', distanceM: 0, durationS: 1000 });
    expect(result.valid).toBe(false);
    expect(result.errors.distanceM).toBeDefined();
  });

  test('fails with malformed date', () => {
    const result = validateRunEntry({ date: '29/07/2026', distanceM: 5000, durationS: 1500 });
    expect(result.valid).toBe(false);
    expect(result.errors.date).toBeDefined();
  });

  test('passes with valid values', () => {
    const result = validateRunEntry({ date: '2026-07-29', distanceM: 5000, durationS: 1500 });
    expect(result.valid).toBe(true);
  });
});

describe('validateLoggedSet', () => {
  test('fails when reps is not a positive integer', () => {
    expect(validateLoggedSet({ reps: 0 }).valid).toBe(false);
    expect(validateLoggedSet({ reps: 8.5 }).valid).toBe(false);
  });

  test('fails when weight is negative', () => {
    const result = validateLoggedSet({ reps: 8, weightKg: -5 });
    expect(result.valid).toBe(false);
    expect(result.errors.weightKg).toBeDefined();
  });

  test('passes for bodyweight set with null weight', () => {
    const result = validateLoggedSet({ reps: 12, weightKg: null });
    expect(result.valid).toBe(true);
  });
});
