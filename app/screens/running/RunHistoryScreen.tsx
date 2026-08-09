import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { AnimatedPressable } from '@/components/common/AnimatedPressable';
import { NO_RUNS_LINES, pickRandom } from '@/content/roastCopy';
import { useUserStore } from '@/state/userStore';
import * as runSessionRepository from '@/db/repositories/runSessionRepository';
import { metersToDisplayDistance, distanceUnitLabel, formatPace } from '@/services/unitConversionService';
import { todayIsoDate, addDays } from '@/utils/dateUtils';
import type { RunSession } from '@/types/entities';

type RangeFilter = 'all' | '7d' | '30d';

export function RunHistoryScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [range, setRange] = useState<RangeFilter>('all');
  const [emptyLine] = useState(() => pickRandom(NO_RUNS_LINES));

  const load = useCallback(async () => {
    if (!user) return;
    const dateFrom =
      range === '7d' ? addDays(todayIsoDate(), -7) : range === '30d' ? addDays(todayIsoDate(), -30) : undefined;
    setRuns(await runSessionRepository.listRunSessions(user.id, { dateFrom }));
  }, [user, range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;
  const unit = user.unitPreference;

  return (
    <View style={styles.container}>
      <Text style={type.display}>Run History</Text>

      <View style={styles.filterRow}>
        {(['all', '30d', '7d'] as RangeFilter[]).map((r) => (
          <Pressable
            key={r}
            style={[styles.filterButton, range === r && styles.filterButtonActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[type.body, range === r && { color: colors.background }]}>
              {r === 'all' ? 'All time' : r === '30d' ? 'Last 30 days' : 'Last 7 days'}
            </Text>
          </Pressable>
        ))}
      </View>

      {runs.length === 0 ? (
        <EmptyState message={emptyLine} />
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <AnimatedPressable
              style={styles.row}
              onPress={() => navigation.navigate('RunSessionDetail', { runSessionId: item.id })}
            >
              <Text style={type.body}>{item.date}</Text>
              <Text style={type.bodyMuted}>
                {metersToDisplayDistance(item.distanceM, unit).toFixed(2)} {distanceUnitLabel(unit)} · {formatPace(item.avgPaceSPerKm, unit)}
              </Text>
            </AnimatedPressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.lg },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});
