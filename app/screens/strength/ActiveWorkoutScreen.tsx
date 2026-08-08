import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import { NumericInput } from '@/components/forms/NumericInput';
import { RestTimerModal } from '@/components/timer/RestTimerModal';
import { useUserStore } from '@/state/userStore';
import { useActiveWorkoutStore } from '@/state/activeWorkoutStore';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import * as restTimerPresetRepository from '@/db/repositories/restTimerPresetRepository';
import { validateLoggedSet } from '@/utils/validation';
import { kgToDisplayWeight, displayWeightToKg, weightUnitLabel } from '@/services/unitConversionService';
import type { Exercise, RestTimerPreset } from '@/types/entities';

export function ActiveWorkoutScreen({ route, navigation }: any) {
  const templateId: string | null = route.params?.templateId ?? null;
  const user = useUserStore((s) => s.user);
  const store = useActiveWorkoutStore();

  const [started, setStarted] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>([]);
  const [presets, setPresets] = useState<RestTimerPreset[]>([]);
  const [timerVisible, setTimerVisible] = useState(false);
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});
  const [repsInputs, setRepsInputs] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || started) return;
    (async () => {
      if (templateId) {
        await store.startFromTemplate(user.id, templateId);
      } else {
        await store.startBlank(user.id);
      }
      setPresets(await restTimerPresetRepository.listPresets(user.id));
      setStarted(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, templateId, started]);

  if (!user || !started) return null;

  const unit = user.unitPreference;

  const openExercisePicker = async () => {
    setLibraryExercises(await exerciseRepository.listExercises(user.id));
    setPickerVisible(true);
  };

  const handleAddExercise = (exercise: Exercise) => {
    store.addExercise(exercise.id, exercise.name);
    setPickerVisible(false);
  };

  const handleAddSet = async (exerciseId: string) => {
    const weightStr = weightInputs[exerciseId] ?? '';
    const repsStr = repsInputs[exerciseId] ?? '';
    const reps = parseInt(repsStr, 10);
    const weightDisplay = weightStr === '' ? null : parseFloat(weightStr);
    const weightKg = weightDisplay === null ? null : displayWeightToKg(weightDisplay, unit);

    const validation = validateLoggedSet({ reps, weightKg });
    if (!validation.valid) {
      setFieldErrors({ ...fieldErrors, [exerciseId]: Object.values(validation.errors)[0] });
      return;
    }
    setFieldErrors({ ...fieldErrors, [exerciseId]: '' });
    await store.addSet(exerciseId, weightKg, reps, null);
    setRepsInputs({ ...repsInputs, [exerciseId]: '' });
  };

  const handleFinish = async () => {
    const prs = await store.finish(user.id);
    navigation.replace('WorkoutSummary', { prCount: prs.length });
    store.reset();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <Text style={type.display}>Workout in Progress</Text>

        {store.exerciseIds.length === 0 && (
          <Text style={[type.bodyMuted, { marginTop: spacing.lg }]}>
            No exercises yet — add one below to start logging sets.
          </Text>
        )}

        {store.exerciseIds.map((exerciseId) => {
          const sets = store.setsByExercise[exerciseId] ?? [];
          const overload = store.lastOverloadByExercise[exerciseId];
          return (
            <View key={exerciseId} style={styles.exerciseCard}>
              <Text style={type.subtitle}>{store.exerciseNames[exerciseId]}</Text>

              {sets.map((s) => (
                <Text key={s.id} style={[type.bodyMuted, { marginTop: spacing.xs }]}>
                  Set {s.setIndex}: {s.weightKg !== null ? `${kgToDisplayWeight(s.weightKg, unit).toFixed(1)}${weightUnitLabel(unit)} × ` : ''}{s.reps} reps
                </Text>
              ))}

              {overload && (
                <View style={styles.overloadRow}>
                  {overloadIcon(overload.weightClassification) && (
                    <Ionicons name={overloadIcon(overload.weightClassification)!} size={14} color={colors.textPrimary} />
                  )}
                  <Text style={[type.caption, { fontFamily: fonts.semibold, color: colors.textPrimary, marginLeft: 4 }]}>
                    {overloadLabel(overload)}
                  </Text>
                </View>
              )}

              <View style={styles.inputRow}>
                <NumericInput
                  label="Weight"
                  unitLabel={weightUnitLabel(unit)}
                  value={weightInputs[exerciseId] ?? ''}
                  onChangeText={(v) => setWeightInputs({ ...weightInputs, [exerciseId]: v })}
                  placeholder="optional"
                />
                <NumericInput
                  label="Reps"
                  value={repsInputs[exerciseId] ?? ''}
                  onChangeText={(v) => setRepsInputs({ ...repsInputs, [exerciseId]: v })}
                />
              </View>
              {fieldErrors[exerciseId] ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                  <Ionicons name="warning-outline" size={16} color={colors.textPrimary} />
                  <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, marginLeft: 4 }}>
                    {fieldErrors[exerciseId]}
                  </Text>
                </View>
              ) : null}

              <View style={styles.rowButtons}>
                <Button label="Add Set" onPress={() => handleAddSet(exerciseId)} style={{ flex: 1 }} />
                <Button label="Rest" variant="secondary" onPress={() => setTimerVisible(true)} style={{ flex: 1 }} />
              </View>
            </View>
          );
        })}

        <Button label="+ Add Exercise" variant="secondary" onPress={openExercisePicker} style={{ marginTop: spacing.md }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Finish Workout"
          onPress={() =>
            Alert.alert('Finish workout?', 'This will save your session.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Finish', onPress: handleFinish },
            ])
          }
        />
      </View>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xxl }}>
          <Text style={type.title}>Add an exercise</Text>
          <FlatList
            style={{ marginTop: spacing.lg }}
            data={libraryExercises.filter((e) => !store.exerciseIds.includes(e.id))}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.pickerRow} onPress={() => handleAddExercise(item)}>
                <Text style={type.body}>{item.name}</Text>
              </Pressable>
            )}
          />
          <Button label="Cancel" variant="secondary" onPress={() => setPickerVisible(false)} style={{ marginTop: spacing.lg }} />
        </View>
      </Modal>

      <RestTimerModal visible={timerVisible} onClose={() => setTimerVisible(false)} presets={presets} />
    </View>
  );
}

function overloadLabel(o: { weightClassification: string; weightDeltaKg: number | null }): string {
  switch (o.weightClassification) {
    case 'first_time': return 'First time logging this exercise';
    case 'increase': return `+${o.weightDeltaKg?.toFixed(1)}kg vs. previous best`;
    case 'equal': return 'Matches previous best';
    case 'decrease': return `${o.weightDeltaKg?.toFixed(1)}kg vs. previous best`;
    default: return '';
  }
}

function overloadIcon(classification: string): keyof typeof Ionicons.glyphMap | null {
  if (classification === 'increase') return 'arrow-up-circle-outline';
  if (classification === 'decrease') return 'arrow-down-circle-outline';
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  overloadRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  rowButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});
