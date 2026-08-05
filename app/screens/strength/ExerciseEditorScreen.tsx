import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import { validateExercise } from '@/utils/validation';

export function ExerciseEditorScreen({ route, navigation }: any) {
  const exerciseId: string | null = route.params?.exerciseId ?? null;
  const user = useUserStore((s) => s.user);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!exerciseId) return;
    (async () => {
      const existing = await exerciseRepository.getExercise(exerciseId);
      if (existing) {
        setName(existing.name);
        setCategory(existing.category ?? '');
        setEquipment(existing.equipment ?? '');
        setNotes(existing.notes ?? '');
      }
    })();
  }, [exerciseId]);

  const handleSave = async () => {
    const validation = validateExercise({ name });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      if (exerciseId) {
        await exerciseRepository.updateExercise(exerciseId, {
          name,
          category: category || null,
          equipment: equipment || null,
          notes: notes || null,
        });
      } else {
        await exerciseRepository.createExercise({
          userId: user.id,
          name,
          category: category || null,
          equipment: equipment || null,
          notes: notes || null,
        });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Couldn\u2019t save', 'Something went wrong saving this exercise. Your entries are still here — try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!exerciseId) return;
    const deleted = await exerciseRepository.deleteExerciseIfUnused(exerciseId);
    if (deleted) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Can\u2019t delete this exercise',
      'It has logged history attached, so deleting it would break past records. Archive it instead to hide it from pickers while keeping your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive instead',
          onPress: async () => {
            await exerciseRepository.archiveExercise(exerciseId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <FormField label="Name" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Barbell Back Squat" />
      <FormField label="Category" value={category} onChangeText={setCategory} placeholder="Your own tag, e.g. Push" />
      <FormField label="Equipment" value={equipment} onChangeText={setEquipment} placeholder="Your own tag, e.g. Barbell" />
      <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline />

      <Button label={exerciseId ? 'Save Changes' : 'Add Exercise'} onPress={handleSave} loading={saving} />

      {exerciseId && (
        <View style={{ marginTop: spacing.md }}>
          <Button label="Delete" variant="danger" onPress={handleDelete} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
