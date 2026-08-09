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
import type { WorkoutStatsSummary, ExerciseFrequency } from '@/services/statsService';
import { kgToDisplayWeight, weightUnitLabel } from '@/services/unitConversionService';
import { todayIsoDate, addDays } from '@/utils/dateUtils';
import { ensureMinimumElapsed } from '@/utils/timing';
import type { ChartPoint } from '@/types/entities';

type RangeFilter = '30d' | '90d' | 'all';

const EARLIEST_DATE = '2000-01-01';

export function WorkoutStatisticsScreen() {
  const user = useUserStore((s) => s.user);
  const [range, setRange] = useState<RangeFilter>('30d');
  const [summary, setSummary] = useState<WorkoutStatsSummary | null>(null);
  const [volumePoints, setVolumePoints] = useState<ChartPoint[]>([]);
  const [prPoints, setPrPoints] = useState<ChartPoint[]>([]);
  const [mostTrained, setMostTrained] = useState<ExerciseFrequency[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const start = Date.now();
    const today = todayIsoDate();
    const dateFrom = range === '30d' ? addDays(today, -30) : range === '90d' ? addDays(today, -90) : EARLIEST_DATE;

    const [summaryResult, volume, pr, trained] = await Promise.all([
      statsService.getWorkoutStatsSummary(user.id, dateFrom, today),
      statsService.getWorkoutFrequencyOverTime(user.id, dateFrom, today, 'week'),
      statsService.getPrCountOverTime(user.id, dateFrom, today),
      statsService.getMostTrainedExercises(user.id, dateFrom, today, 5),
    ]);
    await ensureMinimumElapsed(start);
    setSummary(summaryResult);
    setVolumePoints(volume);
    setPrPoints(pr);
    setMostTrained(trained);
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
        <Text style={type.display}>Workout Statistics</Text>
        <View style={{ marginTop: spacing.lg }}>
          <SkeletonStatCard />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>Workout Statistics</Text>

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
            <Text style={type.caption}>TOTAL VOLUME</Text>
            <Text style={type.numeric}>{Math.round(kgToDisplayWeight(summary.totalVolumeKg, unit))}</Text>
            <Text style={type.bodyMuted}>{weightUnitLabel(unit)}</Text>
          </View>
          <View>
            <Text style={type.caption}>SESSIONS</Text>
            <Text style={type.numeric}>{summary.sessionCount}</Text>
          </View>
          <View>
            <Text style={type.caption}>SETS</Text>
            <Text style={type.numeric}>{summary.setCount}</Text>
          </View>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[type.eyebrow, { marginBottom: spacing.md }]}>SESSIONS PER WEEK</Text>
        <TrendChart points={volumePoints} yLabel="Sessions" formatX={(x) => x.slice(5)} />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[type.eyebrow, { marginBottom: spacing.md }]}>PRs PER MONTH</Text>
        <TrendChart points={prPoints} yLabel="PRs hit" formatX={(x) => x.slice(0, 7)} />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[type.eyebrow, { marginBottom: spacing.md }]}>MOST TRAINED</Text>
        {mostTrained.length === 0 ? (
          <Text style={type.bodyMuted}>No sets logged in this range.</Text>
        ) : (
          mostTrained.map((ex) => (
            <View key={ex.exerciseId} style={styles.trainedRow}>
              <Text style={type.body}>{ex.exerciseName}</Text>
              <Text style={type.bodyMuted}>{ex.setCount} sets</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trainedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
