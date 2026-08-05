import { detectSplitTrend, comparePaceToPriorRun } from '../../app/services/runningAnalysisService';

describe('detectSplitTrend', () => {
  test('returns not_enough_data with fewer than 2 splits', () => {
    expect(detectSplitTrend([{ distanceM: 1000, durationS: 300, paceSPerKm: 300 }])).toBe('not_enough_data');
  });

  test('detects a negative split (second half faster)', () => {
    const splits = [
      { distanceM: 1000, durationS: 320, paceSPerKm: 320 },
      { distanceM: 1000, durationS: 310, paceSPerKm: 310 },
      { distanceM: 1000, durationS: 290, paceSPerKm: 290 },
      { distanceM: 1000, durationS: 280, paceSPerKm: 280 },
    ];
    expect(detectSplitTrend(splits)).toBe('negative_split');
  });

  test('detects a positive split (second half slower)', () => {
    const splits = [
      { distanceM: 1000, durationS: 280, paceSPerKm: 280 },
      { distanceM: 1000, durationS: 290, paceSPerKm: 290 },
      { distanceM: 1000, durationS: 310, paceSPerKm: 310 },
      { distanceM: 1000, durationS: 320, paceSPerKm: 320 },
    ];
    expect(detectSplitTrend(splits)).toBe('positive_split');
  });

  test('detects even split when both halves match exactly', () => {
    const splits = [
      { distanceM: 1000, durationS: 300, paceSPerKm: 300 },
      { distanceM: 1000, durationS: 300, paceSPerKm: 300 },
    ];
    expect(detectSplitTrend(splits)).toBe('even');
  });
});

describe('comparePaceToPriorRun', () => {
  test('reports no prior run when none was found', () => {
    const result = comparePaceToPriorRun(300, null);
    expect(result.hasPriorRun).toBe(false);
    expect(result.paceDeltaSPerKm).toBeNull();
  });

  test('computes a positive delta when current pace is slower than prior', () => {
    const result = comparePaceToPriorRun(310, 300);
    expect(result.hasPriorRun).toBe(true);
    expect(result.paceDeltaSPerKm).toBe(10);
  });

  test('computes a negative delta when current pace is faster than prior', () => {
    const result = comparePaceToPriorRun(290, 300);
    expect(result.paceDeltaSPerKm).toBe(-10);
  });
});
