import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import type { Exercise } from '@/types/entities';

export function ExerciseDetailScreen({ route, navigation }: any) {
  const exerciseId: string = route.params.exerciseId;
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    exerciseRepository.getExercise(exerciseId).then(setExercise);
  }, [exerciseId]);

  if (!exercise) return null;

  return (
    <View style={styles.container}>
      <Text style={type.display}>{exercise.name}</Text>
      <Card style={{ marginTop: spacing.lg }}>
        {exercise.category && <Text style={type.bodyMuted}>Category: {exercise.category}</Text>}
        {exercise.equipment && <Text style={type.bodyMuted}>Equipment: {exercise.equipment}</Text>}
        {exercise.notes && <Text style={[type.bodyMuted, { marginTop: spacing.sm }]}>{exercise.notes}</Text>}
      </Card>

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button
          label="View History"
          onPress={() => navigation.navigate('ExerciseHistoryDetail', { exerciseId: exercise.id })}
        />
        <Button
          label="Edit"
          variant="secondary"
          onPress={() => navigation.navigate('ExerciseEditor', { exerciseId: exercise.id })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
});
