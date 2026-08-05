import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { useUserStore } from '@/state/userStore';
import * as workoutSessionRepository from '@/db/repositories/workoutSessionRepository';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import { kgToDisplayWeight, displayWeightToKg, weightUnitLabel } from '@/services/unitConversionService';
import type { WorkoutSession, LoggedSet } from '@/types/entities';

interface GroupedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export function WorkoutSessionDetailScreen({ route }: any) {
  const sessionId: string = route.params.sessionId;
  const user = useUserStore((s) => s.user);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [groups, setGroups] = useState<GroupedExercise[]>([]);

  const load = useCallback(async () => {
    const s = await workoutSessionRepository.getSession(sessionId);
    setSession(s);
    const sets = await workoutSessionRepository.getLoggedSetsForSession(sessionId);
    const byExercise = new Map<string, LoggedSet[]>();
    for (const set of sets) {
      const list = byExercise.get(set.exerciseId) ?? [];
      list.push(set);
      byExercise.set(set.exerciseId, list);
    }
    const grouped: GroupedExercise[] = [];
    for (const [exerciseId, exerciseSets] of byExercise) {
      const ex = await exerciseRepository.getExercise(exerciseId);
      grouped.push({ exerciseId, exerciseName: ex?.name ?? 'Unknown exercise', sets: exerciseSets });
    }
    setGroups(grouped);
  }, [sessionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleEditSet = async (setId: string, field: 'weightKg' | 'reps', displayValue: string, unit: 'metric' | 'imperial') => {
    if (field === 'weightKg') {
      const parsed = displayValue === '' ? null : parseFloat(displayValue);
      const weightKg = parsed === null ? null : displayWeightToKg(parsed, unit);
      await workoutSessionRepository.updateLoggedSet(setId, { weightKg });
    } else {
      const reps = parseInt(displayValue, 10);
      if (!Number.isNaN(reps)) {
        await workoutSessionRepository.updateLoggedSet(setId, { reps });
      }
    }
    load();
    // Note: editing a past set does not retroactively recompute history/PR
    // records in this build -- that reconciliation ships alongside Workout
    // Statistics (build step 9).
  };

  if (!user || !session) return null;
  const unit = user.unitPreference;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>{session.date}</Text>

      {groups.map((group) => (
        <Card key={group.exerciseId} style={{ marginTop: spacing.md }}>
          <Text style={type.subtitle}>{group.exerciseName}</Text>
          {group.sets.map((set) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={type.caption}>SET {set.setIndex}</Text>
              <View style={styles.setInputs}>
                <TextInput
                  style={styles.setInput}
                  defaultValue={set.weightKg !== null ? kgToDisplayWeight(set.weightKg, unit).toFixed(1) : ''}
                  placeholder={weightUnitLabel(unit)}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  onEndEditing={(e) => handleEditSet(set.id, 'weightKg', e.nativeEvent.text, unit)}
                />
                <TextInput
                  style={styles.setInput}
                  defaultValue={set.reps.toString()}
                  placeholder="reps"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  onEndEditing={(e) => handleEditSet(set.id, 'reps', e.nativeEvent.text, unit)}
                />
              </View>
            </View>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  setRow: { marginTop: spacing.sm },
  setInputs: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  setInput: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
});
