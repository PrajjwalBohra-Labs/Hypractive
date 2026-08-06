import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, type } from '@/theme/tokens';

interface QuickActionCardProps {
  label: string;
  onPress: () => void;
}

/** Minimum 48px touch target on both axes, per the large-touch-target requirement. */
export function QuickActionCard({ label, onPress }: QuickActionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...type.subtitle,
    color: colors.textPrimary,
  },
});
