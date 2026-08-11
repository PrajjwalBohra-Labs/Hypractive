import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { SkeletonListRow } from '@/components/common/SkeletonListRow';
import { AnimatedPressable } from '@/components/common/AnimatedPressable';
import { useUserStore } from '@/state/userStore';
import * as templateRepository from '@/db/repositories/templateRepository';
import { ensureMinimumElapsed } from '@/utils/timing';
import type { CustomWorkoutTemplate } from '@/types/entities';

export function TemplateListScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [templates, setTemplates] = useState<CustomWorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = Date.now();
    setTemplates(await templateRepository.listTemplates(user.id));
    await ensureMinimumElapsed(start);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={type.display}>Templates</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('TemplateEditor', { templateId: null })}>
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      {loading ? (
        <SkeletonListRow />
      ) : templates.length === 0 ? (
        <EmptyState
          message="No workout templates yet. Build one to reuse it every time you train."
          actionLabel="+ New Template"
          onAction={() => navigation.navigate('TemplateEditor', { templateId: null })}
        />
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedPressable style={styles.row} onPress={() => navigation.navigate('TemplateDetail', { templateId: item.id })}>
              <Text style={type.body}>{item.name}</Text>
            </AnimatedPressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  addButton: { backgroundColor: colors.accent, minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
  addButtonText: { color: colors.background, fontFamily: fonts.bold },
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
