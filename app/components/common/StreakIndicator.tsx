import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';

interface StreakIndicatorProps {
  streakDays: number;
  last7Days: boolean[];
}

/** A number and a quiet row of dots -- not a card, not a badge. Shows
 * nothing at all when there's no active streak, so it never nags. */
export function StreakIndicator({ streakDays, last7Days }: StreakIndicatorProps) {
  if (streakDays === 0) return null;

  return (
    <View style={styles.row}>
      <Text style={type.caption}>
        {streakDays} DAY{streakDays === 1 ? '' : 'S'} ACTIVE
      </Text>
      <View style={styles.dots}>
        {last7Days.map((active, i) => (
          <View key={i} style={[styles.dot, active ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotActive: { backgroundColor: colors.textPrimary },
  dotInactive: { backgroundColor: colors.border },
});
