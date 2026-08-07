import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, type } from '@/theme/tokens';

interface NavLinkCardProps {
  label: string;
  subtitle: string;
  onPress: () => void;
}

/** Minimum 48px touch target. */
export function NavLinkCard({ label, subtitle, onPress }: NavLinkCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={type.subtitle}>{label}</Text>
        <Text style={[type.bodyMuted, { marginTop: 2 }]}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>{'\u203A'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
