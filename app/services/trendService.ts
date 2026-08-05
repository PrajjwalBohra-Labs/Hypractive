import { daysBetween } from '@/utils/dateUtils';
import type { ChartPoint } from '@/types/entities';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface TrendResult {
  slope: number;
  direction: TrendDirection;
}

/**
 * Linear direction over the given points only — not a forecast, not
 * advice, just describes which way the line the chart is already
 * drawing is leaning. x is converted to a day-index relative to the
 * first point since dates aren't evenly spaced.
 */
export function computeTrend(points: ChartPoint[]): TrendResult | null {
  if (points.length < 2) return null;

  const xs = points.map((p) => daysBetween(points[0].x, p.x));
  const ys = points.map((p) => p.y);
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - meanX) * (ys[i] - meanY);
    denominator += (xs[i] - meanX) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;

  const yRange = Math.max(...ys) - Math.min(...ys);
  const epsilon = yRange * 0.01;
  const direction: TrendDirection = Math.abs(slope) < epsilon ? 'flat' : slope > 0 ? 'up' : 'down';

  return { slope, direction };
}

/** Produces a straight trend line as a second series, for overlaying on a chart. */
export function trendLinePoints(points: ChartPoint[], trend: TrendResult): ChartPoint[] {
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const xs = points.map((p) => daysBetween(points[0].x, p.x));
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const intercept = meanY - trend.slope * meanX;

  return points.map((p, i) => ({ x: p.x, y: intercept + trend.slope * xs[i] }));
}
