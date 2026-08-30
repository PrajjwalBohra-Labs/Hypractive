import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

/** A quiet horizontal rule separating flat sections -- used on screens
 * that follow the spec's "larger sections, not stacked cards" layout. */
export function SectionDivider() {
  return <View style={styles.line} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
});
