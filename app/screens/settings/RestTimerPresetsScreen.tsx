import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as restTimerPresetRepository from '@/db/repositories/restTimerPresetRepository';
import type { RestTimerPreset } from '@/types/entities';

export function RestTimerPresetsScreen() {
  const user = useUserStore((s) => s.user);
  const [presets, setPresets] = useState<RestTimerPreset[]>([]);
  const [label, setLabel] = useState('');
  const [durationInput, setDurationInput] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setPresets(await restTimerPresetRepository.listPresets(user.id));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async () => {
    const seconds = parseInt(durationInput, 10);
    if (!user || !label.trim() || Number.isNaN(seconds) || seconds <= 0) return;
    await restTimerPresetRepository.createPreset(user.id, label.trim(), seconds);
    setLabel('');
    setDurationInput('');
    load();
  };

  const handleDelete = async (id: string) => {
    await restTimerPresetRepository.deletePreset(id);
    load();
  };

  return (
    <View style={styles.container}>
      <Text style={type.title}>Rest Timer Presets</Text>

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Label (e.g. Compound lifts)"
          placeholderTextColor={colors.textMuted}
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Sec"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={durationInput}
          onChangeText={setDurationInput}
        />
      </View>
      <Button label="Add Preset" onPress={handleAdd} variant="secondary" style={{ marginBottom: spacing.lg }} />

      {presets.length === 0 ? (
        <EmptyState message="No presets yet. Add one above to reuse it during workouts." />
      ) : (
        <FlatList
          data={presets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={type.body}>{item.label} — {item.durationS}s</Text>
              <Pressable onPress={() => handleDelete(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="close-circle-outline" size={16} color={colors.textPrimary} />
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, marginLeft: 4 }}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
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
});
