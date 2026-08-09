import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { AnimatedPressable } from '@/components/common/AnimatedPressable';

interface NavLinkCardProps {
  label: string;
  subtitle: string;
  onPress: () => void;
}

/** Minimum 48px touch target. */
export function NavLinkCard({ label, subtitle, onPress }: NavLinkCardProps) {
  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={type.subtitle}>{label}</Text>
          <Text style={[type.bodyMuted, { marginTop: 2 }]}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
