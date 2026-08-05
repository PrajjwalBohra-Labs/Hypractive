import { computeTrend, trendLinePoints } from '../../app/services/trendService';

describe('computeTrend', () => {
  test('returns null with fewer than 2 points', () => {
    expect(computeTrend([{ x: '2026-07-01', y: 100 }])).toBeNull();
  });

  test('detects an upward trend', () => {
    const points = [
      { x: '2026-07-01', y: 100 },
      { x: '2026-07-08', y: 110 },
      { x: '2026-07-15', y: 120 },
      { x: '2026-07-22', y: 130 },
    ];
    const result = computeTrend(points);
    expect(result).not.toBeNull();
    expect(result!.direction).toBe('up');
    expect(result!.slope).toBeGreaterThan(0);
  });

  test('detects a downward trend', () => {
    const points = [
      { x: '2026-07-01', y: 130 },
      { x: '2026-07-08', y: 120 },
      { x: '2026-07-15', y: 110 },
      { x: '2026-07-22', y: 100 },
    ];
    const result = computeTrend(points);
    expect(result!.direction).toBe('down');
    expect(result!.slope).toBeLessThan(0);
  });

  test('detects a flat trend when values barely change', () => {
    const points = [
      { x: '2026-07-01', y: 100 },
      { x: '2026-07-08', y: 100.1 },
      { x: '2026-07-15', y: 99.9 },
      { x: '2026-07-22', y: 100 },
    ];
    const result = computeTrend(points);
    expect(result!.direction).toBe('flat');
  });
});

describe('trendLinePoints', () => {
  test('produces one output point per input point', () => {
    const points = [
      { x: '2026-07-01', y: 100 },
      { x: '2026-07-08', y: 110 },
      { x: '2026-07-15', y: 120 },
    ];
    const trend = computeTrend(points)!;
    const line = trendLinePoints(points, trend);
    expect(line.length).toBe(points.length);
  });
});
