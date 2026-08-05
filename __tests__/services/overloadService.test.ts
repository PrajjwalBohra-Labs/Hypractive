import { classifyDelta, computeOverload } from '../../app/services/overloadService';

describe('classifyDelta', () => {
  test('returns first_time when no previous best exists', () => {
    expect(classifyDelta(100, null)).toEqual({ classification: 'first_time', delta: null });
  });

  test('returns increase when new value is higher', () => {
    expect(classifyDelta(105, 100)).toEqual({ classification: 'increase', delta: 5 });
  });

  test('returns equal when new value matches previous best', () => {
    expect(classifyDelta(100, 100)).toEqual({ classification: 'equal', delta: 0 });
  });

  test('returns decrease when new value is lower', () => {
    expect(classifyDelta(95, 100)).toEqual({ classification: 'decrease', delta: -5 });
  });
});

describe('computeOverload', () => {
  test('bodyweight set (null weight) reports first_time for weight regardless of volume history', () => {
    const result = computeOverload(null, 0, 50, 200);
    expect(result.weightClassification).toBe('first_time');
    expect(result.weightDeltaKg).toBeNull();
  });

  test('weighted set compares both weight and volume independently', () => {
    const result = computeOverload(105, 105 * 8, 100, 100 * 8);
    expect(result.weightClassification).toBe('increase');
    expect(result.weightDeltaKg).toBe(5);
    expect(result.volumeClassification).toBe('increase');
    expect(result.volumeDeltaKg).toBe(40);
  });

  test('first ever entry for an exercise reports first_time for both metrics', () => {
    const result = computeOverload(60, 60 * 10, null, null);
    expect(result.weightClassification).toBe('first_time');
    expect(result.volumeClassification).toBe('first_time');
  });
});
