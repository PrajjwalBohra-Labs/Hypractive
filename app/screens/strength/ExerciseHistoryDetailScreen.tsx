import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { TrendChart } from '@/components/charts/TrendChart';
import { useUserStore } from '@/state/userStore';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import * as exerciseHistoryRepository from '@/db/repositories/exerciseHistoryRepository';
import * as progressRecordRepository from '@/db/repositories/progressRecordRepository';
import * as statsService from '@/services/statsService';
import { kgToDisplayWeight, weightUnitLabel } from '@/services/unitConversionService';
import type { Exercise, ExerciseHistoryEntry, ProgressRecord, ChartPoint } from '@/types/entities';

export function ExerciseHistoryDetailScreen({ route }: any) {
  const exerciseId: string = route.params.exerciseId;
  const user = useUserStore((s) => s.user);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [entries, setEntries] = useState<ExerciseHistoryEntry[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [weightPoints, setWeightPoints] = useState<ChartPoint[]>([]);

  const load = useCallback(async () => {
    setExercise(await exerciseRepository.getExercise(exerciseId));
    setEntries(await exerciseHistoryRepository.listHistoryForExercise(exerciseId));
    setRecords(await progressRecordRepository.listProgressRecordsForExercise(exerciseId));
    setWeightPoints(await statsService.getExerciseWeightOverTime(exerciseId));
  }, [exerciseId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user || !exercise) return null;
  const unit = user.unitPreference;

  const weightPr = records.find((r) => r.metric === 'max_weight');
  const volumePr = records.find((r) => r.metric === 'max_volume_single_set');

  return (
    <View style={styles.container}>
      <Text style={type.display}>{exercise.name}</Text>

      {(weightPr || volumePr) && (
        <View style={styles.prRow}>
          {weightPr && (
            <View style={styles.prCard}>
              <Text style={type.caption}>BEST WEIGHT</Text>
              <Text style={type.numeric}>{kgToDisplayWeight(weightPr.value, unit).toFixed(1)}</Text>
              <Text style={type.bodyMuted}>{weightUnitLabel(unit)}</Text>
            </View>
          )}
          {volumePr && (
            <View style={styles.prCard}>
              <Text style={type.caption}>BEST SET VOLUME</Text>
              <Text style={type.numeric}>{Math.round(kgToDisplayWeight(volumePr.value, unit))}</Text>
              <Text style={type.bodyMuted}>{weightUnitLabel(unit)}</Text>
            </View>
          )}
        </View>
      )}

      {weightPoints.length >= 2 && (
        <View style={{ marginTop: spacing.lg }}>
          <TrendChart
            points={weightPoints}
            yLabel={`Weight (${weightUnitLabel(unit)})`}
            showTrendLine
            formatY={(y) => kgToDisplayWeight(y, unit).toFixed(0)}
          />
        </View>
      )}

      {entries.length === 0 ? (
        <EmptyState message="No history for this exercise yet." />
      ) : (
        <FlatList
          style={{ marginTop: spacing.lg }}
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={type.body}>{item.date}</Text>
              <Text style={type.bodyMuted}>
                {item.weightKg !== null ? `${kgToDisplayWeight(item.weightKg, unit).toFixed(1)}${weightUnitLabel(unit)} \u00d7 ` : ''}
                {item.reps} reps
              </Text>
              {(item.isPrWeight || item.isPrVolume) && <Text style={styles.prBadge}>PR</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  prRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  prCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  prBadge: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
});
