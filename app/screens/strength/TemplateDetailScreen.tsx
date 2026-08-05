import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import * as templateRepository from '@/db/repositories/templateRepository';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import type { CustomWorkoutTemplate, TemplateExerciseEntry } from '@/types/entities';

interface EntryWithName extends TemplateExerciseEntry {
  exerciseName: string;
}

export function TemplateDetailScreen({ route, navigation }: any) {
  const templateId: string = route.params.templateId;
  const [template, setTemplate] = useState<CustomWorkoutTemplate | null>(null);
  const [entries, setEntries] = useState<EntryWithName[]>([]);

  const load = useCallback(async () => {
    const t = await templateRepository.getTemplate(templateId);
    setTemplate(t);
    const rows = await templateRepository.listTemplateExercises(templateId);
    const withNames: EntryWithName[] = [];
    for (const row of rows) {
      const ex = await exerciseRepository.getExercise(row.exerciseId);
      withNames.push({ ...row, exerciseName: ex?.name ?? 'Unknown exercise' });
    }
    setEntries(withNames);
  }, [templateId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!template) return null;

  return (
    <View style={styles.container}>
      <Text style={type.display}>{template.name}</Text>
      {template.notes ? <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>{template.notes}</Text> : null}

      <FlatList
        style={{ marginTop: spacing.lg }}
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={type.body}>{item.exerciseName}</Text>
            {(item.targetSets || item.targetReps) && (
              <Text style={type.caption}>
                {item.targetSets ?? '—'} sets × {item.targetReps ?? '—'} reps
              </Text>
            )}
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        <Button
          label="Delay Your Decay"
          onPress={() => navigation.navigate('ActiveWorkout', { templateId: template.id })}
          style={{ flex: 1 }}
        />
        <Button
          label="Edit"
          variant="secondary"
          onPress={() => navigation.navigate('TemplateEditor', { templateId: template.id })}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});
