import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { GlossSheen } from '@/components/common/GlossSheen';
import { SkeletonStatCard } from '@/components/common/SkeletonStatCard';
import { TrendChart } from '@/components/charts/TrendChart';
import { useUserStore } from '@/state/userStore';
import * as statsService from '@/services/statsService';
import type { RunningStatsSummary } from '@/services/statsService';
import { metersToDisplayDistance, distanceUnitLabel, formatPace } from '@/services/unitConversionService';
import { todayIsoDate, addDays } from '@/utils/dateUtils';
import { ensureMinimumElapsed } from '@/utils/timing';
import type { ChartPoint } from '@/types/entities';

type RangeFilter = '30d' | '90d' | 'all';

const EARLIEST_DATE = '2000-01-01';

export function RunningStatisticsScreen() {
  const user = useUserStore((s) => s.user);
  const [range, setRange] = useState<RangeFilter>('30d');
  const [summary, setSummary] = useState<RunningStatsSummary | null>(null);
  const [pacePoints, setPacePoints] = useState<ChartPoint[]>([]);
  const [distancePoints, setDistancePoints] = useState<ChartPoint[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const start = Date.now();
    const today = todayIsoDate();
    const dateFrom = range === '30d' ? addDays(today, -30) : range === '90d' ? addDays(today, -90) : EARLIEST_DATE;

    const [runningSummary, pace, distance] = await Promise.all([
      statsService.getRunningStatsSummary(user.id, dateFrom, today),
      statsService.getPaceOverTime(user.id, dateFrom, today),
      statsService.getDistanceOverTime(user.id, dateFrom, today, 'week'),
    ]);
    await ensureMinimumElapsed(start);
    setSummary(runningSummary);
    setPacePoints(pace);
    setDistancePoints(distance);
  }, [user, range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;
  const unit = user.unitPreference;

  if (!summary) {
    return (
      <View style={[styles.container, { padding: spacing.lg }]}>
        <Text style={type.display}>Running Statistics</Text>
        <View style={{ marginTop: spacing.lg }}>
          <SkeletonStatCard />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>Running Statistics</Text>

      <View style={styles.filterRow}>
        {(['30d', '90d', 'all'] as RangeFilter[]).map((r) => (
          <Pressable
            key={r}
            style={[styles.filterButton, range === r && styles.filterButtonActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[type.body, range === r && { color: colors.background }]}>
              {r === '30d' ? 'Last 30 days' : r === '90d' ? 'Last 90 days' : 'All time'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={{ marginTop: spacing.lg, overflow: 'hidden' }}>
        <GlossSheen />
        <View style={styles.statRow}>
          <View>
            <Text style={type.caption}>TOTAL DISTANCE</Text>
            <Text style={type.numeric}>{metersToDisplayDistance(summary.totalDistanceM, unit).toFixed(1)}</Text>
            <Text style={type.bodyMuted}>{distanceUnitLabel(unit)}</Text>
          </View>
          <View>
            <Text style={type.caption}>RUNS</Text>
            <Text style={type.numeric}>{summary.runCount}</Text>
          </View>
          <View>
            <Text style={type.caption}>AVG PACE</Text>
            <Text style={type.numeric}>
              {summary.weightedAvgPaceSPerKm !== null ? formatPace(summary.weightedAvgPaceSPerKm, unit).split(' ')[0] : '—'}
            </Text>
          </View>
        </View>
        {summary.longestRunM > 0 && (
          <Text style={[type.bodyMuted, { marginTop: spacing.md }]}>
            Longest run: {metersToDisplayDistance(summary.longestRunM, unit).toFixed(2)} {distanceUnitLabel(unit)}
          </Text>
        )}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[type.eyebrow, { marginBottom: spacing.md }]}>PACE TREND</Text>
        <TrendChart
          points={pacePoints}
          yLabel={`Pace (s/${distanceUnitLabel(unit)})`}
          showTrendLine
          formatX={(x) => x.slice(5)}
        />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[type.eyebrow, { marginBottom: spacing.md }]}>DISTANCE PER WEEK</Text>
        <TrendChart
          points={distancePoints}
          yLabel={`Distance (${distanceUnitLabel(unit)})`}
          formatY={(y) => metersToDisplayDistance(y, unit).toFixed(0)}
          formatX={(x) => x.slice(5)}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  filterButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
