import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import type { UnitPreference } from '@/types/entities';

type Mode = 'signup' | 'login';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const signUp = useUserStore((s) => s.signUp);
  const logIn = useUserStore((s) => s.logIn);

  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [unit, setUnit] = useState<UnitPreference>('metric');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result =
      mode === 'signup'
        ? await signUp(email, password, confirmPassword, displayName, unit)
        : await logIn(email, password);
    setSubmitting(false);
    if (!result.success) setErrors(result.errors);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + spacing.xl }}>
      <Text style={type.display}>Hypractive</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
        {mode === 'signup' ? 'Create your account to get started.' : 'Welcome back.'}
      </Text>

      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggle, mode === 'signup' && styles.toggleActive]} onPress={() => switchMode('signup')}>
          <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
        </Pressable>
        <Pressable style={[styles.toggle, mode === 'login' && styles.toggleActive]} onPress={() => switchMode('login')}>
          <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Log In</Text>
        </Pressable>
      </View>

      {mode === 'signup' && (
        <FormField label="Name" value={displayName} onChangeText={setDisplayName} error={errors.displayName} placeholder="e.g. Alex" />
      )}

      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="you@example.com"
        keyboardType="email-address"
      />

      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
      />

      {mode === 'signup' && (
        <FormField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          placeholder="Re-enter your password"
        />
      )}

      {mode === 'signup' && (
        <>
          <Text style={styles.unitLabel}>UNITS</Text>
          <View style={styles.unitRow}>
            <Pressable style={[styles.unitOption, unit === 'metric' && styles.unitOptionActive]} onPress={() => setUnit('metric')}>
              <Text style={[type.body, unit === 'metric' && styles.unitTextActive]}>Metric (km, kg)</Text>
            </Pressable>
            <Pressable style={[styles.unitOption, unit === 'imperial' && styles.unitOptionActive]} onPress={() => setUnit('imperial')}>
              <Text style={[type.body, unit === 'imperial' && styles.unitTextActive]}>Imperial (mi, lb)</Text>
            </Pressable>
          </View>
        </>
      )}

      <Button
        label={mode === 'signup' ? 'Create Account' : 'Log In'}
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginTop: spacing.xl }}
      />

      <Text style={styles.disclaimer}>
        This account lives only on this device. There's no password recovery or account transfer — it's here to make
        the app feel complete, not as a real security or sync feature. See About for details.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surfaceRaised, borderRadius: radius.pill, padding: 4, marginBottom: spacing.xl },
  toggle: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.accent },
  toggleText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textSecondary },
  toggleTextActive: { color: colors.background },
  unitLabel: { ...type.caption, marginBottom: spacing.sm, textTransform: 'uppercase' },
  unitRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  unitOption: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unitOptionActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  unitTextActive: { color: colors.background },
  disclaimer: { ...type.caption, marginTop: spacing.xl, textAlign: 'center', lineHeight: 18 },
});
