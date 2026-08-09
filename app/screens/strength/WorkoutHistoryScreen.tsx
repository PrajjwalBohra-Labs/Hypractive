import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { SkeletonListRow } from '@/components/common/SkeletonListRow';
import { AnimatedPressable } from '@/components/common/AnimatedPressable';
import { NO_WORKOUTS_LINES, pickRandom } from '@/content/roastCopy';
import { useUserStore } from '@/state/userStore';
import * as workoutSessionRepository from '@/db/repositories/workoutSessionRepository';
import type { WorkoutSessionSummary } from '@/db/repositories/workoutSessionRepository';
import { ensureMinimumElapsed } from '@/utils/timing';
import type { WorkoutSession } from '@/types/entities';

interface RowData {
  session: WorkoutSession;
  summary: WorkoutSessionSummary;
}

export function WorkoutHistoryScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [rows, setRows] = useState<RowData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [emptyLine] = useState(() => pickRandom(NO_WORKOUTS_LINES));

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = Date.now();
    const sessions = search
      ? await workoutSessionRepository.searchSessionsByExerciseName(user.id, search)
      : await workoutSessionRepository.listSessions(user.id);
    const withSummaries: RowData[] = [];
    for (const session of sessions) {
      const summary = await workoutSessionRepository.getSessionSummary(session.id);
      withSummaries.push({ session, summary });
    }
    setRows(withSummaries);
    await ensureMinimumElapsed(start);
    setLoading(false);
  }, [user, search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={type.display}>Workout History</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by exercise name"
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <SkeletonListRow />
      ) : rows.length === 0 ? (
        <EmptyState message={search ? 'No workouts match that exercise.' : emptyLine} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.session.id}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <AnimatedPressable
              style={styles.row}
              onPress={() => navigation.navigate('WorkoutSessionDetail', { sessionId: item.session.id })}
            >
              <Text style={type.body}>{item.session.date}</Text>
              <Text style={type.bodyMuted}>
                {item.summary.exerciseNames.join(', ') || 'No exercises logged'}
              </Text>
              <Text style={type.caption}>
                {item.summary.totalSets} sets · {Math.round(item.summary.totalVolumeKg)}kg total volume
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
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
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
