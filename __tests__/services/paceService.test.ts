import { computePaceSPerKm, computePaceVariance, computePaceDeltaVsTarget } from '../../app/services/paceService';

describe('computePaceSPerKm', () => {
  test('computes seconds per km for a 5km run in 25 minutes', () => {
    expect(computePaceSPerKm(5000, 1500)).toBe(300); // 5:00/km
  });
});

describe('computePaceVariance', () => {
  test('returns null with fewer than 2 splits', () => {
    expect(computePaceVariance([{ distanceM: 1000, durationS: 300, paceSPerKm: 300 }])).toBeNull();
  });

  test('returns 0 for perfectly even splits', () => {
    const splits = [
      { distanceM: 1000, durationS: 300, paceSPerKm: 300 },
      { distanceM: 1000, durationS: 300, paceSPerKm: 300 },
      { distanceM: 1000, durationS: 300, paceSPerKm: 300 },
    ];
    expect(computePaceVariance(splits)).toBe(0);
  });

  test('returns a positive number for uneven splits', () => {
    const splits = [
      { distanceM: 1000, durationS: 280, paceSPerKm: 280 },
      { distanceM: 1000, durationS: 320, paceSPerKm: 320 },
    ];
    const variance = computePaceVariance(splits);
    expect(variance).toBeGreaterThan(0);
  });
});

describe('computePaceDeltaVsTarget', () => {
  test('positive delta means slower than target', () => {
    expect(computePaceDeltaVsTarget(310, 300)).toBe(10);
  });

  test('negative delta means faster than target', () => {
    expect(computePaceDeltaVsTarget(290, 300)).toBe(-10);
  });
});
