import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';

interface PlaceholderScreenProps {
  title: string;
  note: string;
}

/**
 * Used only for screens not yet implemented in this code-generation pass.
 * Each one names the exact section of ARCHITECTURE.md's section 11 sequence
 * that will replace it, so nothing is silently missing.
 */
export function PlaceholderScreen({ title, note }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={type.title}>{title}</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.sm }]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
});
