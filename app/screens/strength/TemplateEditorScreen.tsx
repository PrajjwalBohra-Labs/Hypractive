import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as templateRepository from '@/db/repositories/templateRepository';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import { validateTemplate } from '@/utils/validation';
import type { Exercise, TemplateExerciseEntry } from '@/types/entities';

export function TemplateEditorScreen({ route, navigation }: any) {
  const templateId: string | null = route.params?.templateId ?? null;
  const user = useUserStore((s) => s.user);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<TemplateExerciseEntry[]>([]);
  const [exerciseNames, setExerciseNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | undefined>();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(templateId);

  const loadEntries = useCallback(async (id: string) => {
    const rows = await templateRepository.listTemplateExercises(id);
    setEntries(rows);
    const namesMap: Record<string, string> = {};
    for (const row of rows) {
      const ex = await exerciseRepository.getExercise(row.exerciseId);
      if (ex) namesMap[row.exerciseId] = ex.name;
    }
    setExerciseNames(namesMap);
  }, []);

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      const existing = await templateRepository.getTemplate(templateId);
      if (existing) {
        setName(existing.name);
        setNotes(existing.notes ?? '');
      }
      await loadEntries(templateId);
    })();
  }, [templateId, loadEntries]);

  useFocusEffect(
    useCallback(() => {
      if (currentTemplateId) loadEntries(currentTemplateId);
    }, [currentTemplateId, loadEntries])
  );

  const openPicker = async () => {
    if (!user) return;
    setLibraryExercises(await exerciseRepository.listExercises(user.id));
    setPickerVisible(true);
  };

  const handlePickExercise = async (exerciseId: string) => {
    if (!user) return;
    let id = currentTemplateId;
    if (!id) {
      // Auto-create the template as a draft on first exercise add, so entries have a parent.
      const validation = validateTemplate({ name: name || 'Untitled Template' });
      if (!validation.valid) {
        setError(validation.errors.name);
        setPickerVisible(false);
        return;
      }
      const created = await templateRepository.createTemplate(user.id, name || 'Untitled Template', notes || null);
      id = created.id;
      setCurrentTemplateId(id);
    }
    await templateRepository.addTemplateExercise(id, exerciseId, null, null);
    setPickerVisible(false);
    loadEntries(id);
  };

  const handleTargetChange = async (entryId: string, field: 'targetSets' | 'targetReps', value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    const targetSets = field === 'targetSets' ? num : entry.targetSets;
    const targetReps = field === 'targetReps' ? num : entry.targetReps;
    await templateRepository.updateTemplateExerciseTargets(entryId, targetSets, targetReps);
    if (currentTemplateId) loadEntries(currentTemplateId);
  };

  const handleRemoveEntry = async (entryId: string) => {
    await templateRepository.removeTemplateExercise(entryId);
    if (currentTemplateId) loadEntries(currentTemplateId);
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= entries.length) return;
    const reordered = [...entries];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    await templateRepository.reorderTemplateExercises(reordered.map((e) => e.id));
    if (currentTemplateId) loadEntries(currentTemplateId);
  };

  const handleSave = async () => {
    const validation = validateTemplate({ name });
    if (!validation.valid) {
      setError(validation.errors.name);
      return;
    }
    if (currentTemplateId) {
      await templateRepository.updateTemplate(currentTemplateId, { name, notes: notes || null });
    } else if (user) {
      await templateRepository.createTemplate(user.id, name, notes || null);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <FormField label="Template name" value={name} onChangeText={setName} error={error} placeholder="e.g. Push Day" />
      <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline />

      <Text style={[type.eyebrow, { marginTop: spacing.md, marginBottom: spacing.sm }]}>EXERCISES</Text>

      {entries.map((entry, index) => (
        <View key={entry.id} style={styles.exerciseRow}>
          <View style={styles.exerciseRowHeader}>
            <Text style={type.body}>{exerciseNames[entry.exerciseId] ?? '\u2026'}</Text>
            <View style={styles.rowActions}>
              <Pressable onPress={() => handleMove(index, -1)}><Ionicons name="chevron-up-circle-outline" size={20} color={colors.textSecondary} /></Pressable>
              <Pressable onPress={() => handleMove(index, 1)}><Ionicons name="chevron-down-circle-outline" size={20} color={colors.textSecondary} /></Pressable>
              <Pressable onPress={() => handleRemoveEntry(entry.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="close-circle-outline" size={16} color={colors.textPrimary} />
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, marginLeft: 4 }}>Remove</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.targetRow}>
            <TextInput
              style={styles.targetInput}
              placeholder="Sets"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              defaultValue={entry.targetSets?.toString() ?? ''}
              onEndEditing={(e) => handleTargetChange(entry.id, 'targetSets', e.nativeEvent.text)}
            />
            <TextInput
              style={styles.targetInput}
              placeholder="Reps"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              defaultValue={entry.targetReps?.toString() ?? ''}
              onEndEditing={(e) => handleTargetChange(entry.id, 'targetReps', e.nativeEvent.text)}
            />
          </View>
        </View>
      ))}

      <Button label="+ Add Exercise" variant="secondary" onPress={openPicker} style={{ marginTop: spacing.sm }} />
      <Button label="Save Template" onPress={handleSave} style={{ marginTop: spacing.lg }} />

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xxl }}>
          <Text style={type.title}>Choose an exercise</Text>
          {libraryExercises.length === 0 ? (
            <Text style={[type.bodyMuted, { marginTop: spacing.lg }]}>
              Your Exercise Library is empty. Add exercises there first.
            </Text>
          ) : (
            <FlatList
              data={libraryExercises}
              keyExtractor={(item) => item.id}
              style={{ marginTop: spacing.lg }}
              renderItem={({ item }) => (
                <Pressable style={styles.pickerRow} onPress={() => handlePickExercise(item.id)}>
                  <Text style={type.body}>{item.name}</Text>
                </Pressable>
              )}
            />
          )}
          <Button label="Cancel" variant="secondary" onPress={() => setPickerVisible(false)} style={{ marginTop: spacing.lg }} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  exerciseRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  targetRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  targetInput: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
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
