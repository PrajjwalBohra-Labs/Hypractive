import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

interface SkeletonListRowProps {
  count?: number;
}

/** Matches the shape of the bordered list rows used across Exercise
 * Library, Templates, Run/Workout History. Renders `count` of them so a
 * loading screen shows a believable list, not a single placeholder. */
export function SkeletonListRow({ count = 4 }: SkeletonListRowProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width="55%" height={16} />
          <Skeleton width="35%" height={12} style={{ marginTop: spacing.sm }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});
