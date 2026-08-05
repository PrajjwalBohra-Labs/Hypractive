import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primaryShadow,
        isSecondary && { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
        isDanger && { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.textPrimary },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {isPrimary && (
        <LinearGradient
          colors={[colors.accentPressed, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.background : colors.textPrimary} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && { color: colors.background },
            isSecondary && { color: colors.textPrimary },
            isDanger && { color: colors.textPrimary },
          ]}
        >
          {isDanger ? `\u2715 ${label}` : label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryShadow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    ...type.subtitle,
    fontFamily: fonts.bold,
  },
});
