import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { SkeletonListRow } from '@/components/common/SkeletonListRow';
import { useUserStore } from '@/state/userStore';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import type { Exercise } from '@/types/entities';

export function ExerciseLibraryListScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const rows = await exerciseRepository.listExercises(user.id, { search: search || undefined });
    setExercises(rows);
    setLoading(false);
  }, [user, search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={type.display}>Exercise Library</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('ExerciseEditor', { exerciseId: null })}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      {exercises.length > 0 || search.length > 0 ? (
        <TextInput
          style={styles.search}
          placeholder="Search by name, category, equipment"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      ) : null}

      {loading ? (
        <SkeletonListRow />
      ) : exercises.length === 0 && search.length === 0 ? (
        <EmptyState
          message="No exercises yet. Add your first exercise to start building your library."
          actionLabel="+ New Exercise"
          onAction={() => navigation.navigate('ExerciseEditor', { exerciseId: null })}
        />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
            >
              <View>
                <Text style={type.body}>{item.name}</Text>
                {(item.category || item.equipment) && (
                  <Text style={type.caption}>
                    {[item.category, item.equipment].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  addButton: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  addButtonText: { color: colors.background, fontFamily: fonts.bold },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
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
