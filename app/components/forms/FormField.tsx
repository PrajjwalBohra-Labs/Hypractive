import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}

export function FormField({ label, value, onChangeText, error, placeholder, keyboardType, multiline }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="warning-outline" size={14} color={colors.textPrimary} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...type.caption, marginBottom: spacing.xs, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderWidth: 2 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  error: { ...type.caption, fontFamily: fonts.semibold, color: colors.textPrimary, textTransform: 'none' },
});
