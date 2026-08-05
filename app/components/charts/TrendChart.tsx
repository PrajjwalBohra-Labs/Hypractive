import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { computeTrend, trendLinePoints } from '@/services/trendService';
import type { ChartPoint } from '@/types/entities';

interface TrendChartProps {
  points: ChartPoint[];
  yLabel: string;
  showTrendLine?: boolean;
  formatY?: (y: number) => string;
  formatX?: (x: string) => string;
}

const screenWidth = Dimensions.get('window').width;

export function TrendChart({ points, yLabel, showTrendLine, formatY, formatX }: TrendChartProps) {
  if (points.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={type.bodyMuted}>Not enough data yet</Text>
      </View>
    );
  }

  const trend = showTrendLine ? computeTrend(points) : null;
  const trendPoints = trend ? trendLinePoints(points, trend) : null;

  // Subsample x-axis labels so they don't overlap on a narrow phone screen.
  const labelEvery = Math.max(1, Math.ceil(points.length / 5));
  const labels = points.map((p, i) => (i % labelEvery === 0 ? (formatX ? formatX(p.x) : p.x.slice(5)) : ''));

  const datasets = [
    {
      data: points.map((p) => p.y),
      color: () => colors.accent,
      strokeWidth: 2,
    },
  ];
  if (trendPoints) {
    datasets.push({
      data: trendPoints.map((p) => p.y),
      color: () => colors.textMuted,
      strokeWidth: 1,
    });
  }

  return (
    <View>
      <LineChart
        data={{ labels, datasets }}
        width={screenWidth - spacing.lg * 2 - spacing.lg * 2}
        height={200}
        withInnerLines={false}
        withOuterLines={false}
        withDots={points.length <= 20}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: () => colors.textSecondary,
          labelColor: () => colors.textMuted,
          propsForBackgroundLines: { stroke: colors.border },
        }}
        bezier
        style={{ borderRadius: radius.md }}
        formatYLabel={(y) => (formatY ? formatY(Number(y)) : y)}
      />
      <Text style={[type.caption, { marginTop: spacing.xs, textAlign: 'center' }]}>{yLabel}</Text>
      {trend && (
        <Text style={[type.caption, { textAlign: 'center', marginTop: 2 }]}>
          Trend: {trend.direction === 'up' ? '↑ rising' : trend.direction === 'down' ? '↓ falling' : '→ flat'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
