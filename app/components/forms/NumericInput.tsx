import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius, type } from '@/theme/tokens';

interface NumericInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unitLabel?: string;
  placeholder?: string;
}

/** Presentational only — the screen decides how to convert display value <-> storage value. */
export function NumericInput({ label, value, onChangeText, unitLabel, placeholder }: NumericInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}{unitLabel ? ` (${unitLabel})` : ''}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { ...type.caption, marginBottom: spacing.xs, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
});
