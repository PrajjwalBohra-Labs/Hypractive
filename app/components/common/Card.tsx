import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius } from '@/theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** White card, crisp dark border, soft shadow for lift, and a faint
 * top hairline (translucent black, not a color) for a touch of gloss. */
export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.hairline} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.sheen,
  },
});
