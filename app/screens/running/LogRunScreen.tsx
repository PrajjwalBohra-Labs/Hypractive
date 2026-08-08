import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { FormField } from '@/components/forms/FormField';
import { NumericInput } from '@/components/forms/NumericInput';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as runSessionRepository from '@/db/repositories/runSessionRepository';
import { validateRunEntry, validatePaceSplit } from '@/utils/validation';
import { displayDistanceToMeters, distanceUnitLabel } from '@/services/unitConversionService';
import { todayIsoDate } from '@/utils/dateUtils';

interface SplitInput {
  key: string;
  distance: string;
  minutes: string;
  seconds: string;
}

export function LogRunScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [date] = useState(todayIsoDate());
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [notes, setNotes] = useState('');
  const [splitsOpen, setSplitsOpen] = useState(false);
  const [splits, setSplits] = useState<SplitInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const unit = user.unitPreference;

  const addSplitRow = () => {
    setSplits([...splits, { key: `${Date.now()}`, distance: '', minutes: '', seconds: '' }]);
  };

  const removeSplitRow = (key: string) => {
    setSplits(splits.filter((s) => s.key !== key));
  };

  const updateSplitRow = (key: string, field: 'distance' | 'minutes' | 'seconds', value: string) => {
    setSplits(splits.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    const distanceM = distance === '' ? 0 : displayDistanceToMeters(parseFloat(distance), unit);
    const durationS = (parseInt(minutes || '0', 10) || 0) * 60 + (parseInt(seconds || '0', 10) || 0);

    const validation = validateRunEntry({ date, distanceM, durationS });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    for (const split of splits) {
      const splitDistanceM = split.distance === '' ? 0 : displayDistanceToMeters(parseFloat(split.distance), unit);
      const splitDurationS = (parseInt(split.minutes || '0', 10) || 0) * 60 + (parseInt(split.seconds || '0', 10) || 0);
      const splitValidation = validatePaceSplit({ distanceM: splitDistanceM, durationS: splitDurationS });
      if (!splitValidation.valid) {
        setErrors({ splits: 'Check your split entries — each needs a distance and duration.' });
        return;
      }
    }

    setErrors({});
    setSaving(true);
    try {
      const session = await runSessionRepository.createRunSession({
        userId: user.id,
        date,
        distanceM,
        durationS,
        notes: notes || null,
      });

      let index = 1;
      for (const split of splits) {
        const splitDistanceM = split.distance === '' ? 0 : displayDistanceToMeters(parseFloat(split.distance), unit);
        const splitDurationS = (parseInt(split.minutes || '0', 10) || 0) * 60 + (parseInt(split.seconds || '0', 10) || 0);
        await runSessionRepository.addPaceSplit(session.id, index, splitDistanceM, splitDurationS);
        index += 1;
      }

      navigation.replace('RunSessionDetail', { runSessionId: session.id, justSaved: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>File Your Escape</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>{date}</Text>

      <NumericInput
        label="Distance"
        unitLabel={distanceUnitLabel(unit)}
        value={distance}
        onChangeText={setDistance}
        placeholder="e.g. 5"
      />
      {errors.distanceM ? <Text style={styles.errorText}>{errors.distanceM}</Text> : null}

      <View style={[styles.row, { marginTop: spacing.md }]}>
        <NumericInput label="Minutes" value={minutes} onChangeText={setMinutes} placeholder="0" />
        <NumericInput label="Seconds" value={seconds} onChangeText={setSeconds} placeholder="0" />
      </View>
      {errors.durationS ? <Text style={styles.errorText}>{errors.durationS}</Text> : null}

      <View style={{ marginTop: spacing.lg }}>
        <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
      </View>

      <Pressable onPress={() => setSplitsOpen(!splitsOpen)} style={styles.splitsToggle}>
        <Text style={type.subtitle}>{splitsOpen ? '\u2212' : '+'} Splits (optional)</Text>
      </Pressable>

      {splitsOpen && (
        <View>
          {splits.map((split, i) => (
            <View key={split.key} style={styles.splitRow}>
              <Text style={type.caption}>SPLIT {i + 1}</Text>
              <View style={styles.row}>
                <NumericInput
                  label="Distance"
                  unitLabel={distanceUnitLabel(unit)}
                  value={split.distance}
                  onChangeText={(v) => updateSplitRow(split.key, 'distance', v)}
                />
                <NumericInput
                  label="Min"
                  value={split.minutes}
                  onChangeText={(v) => updateSplitRow(split.key, 'minutes', v)}
                />
                <NumericInput
                  label="Sec"
                  value={split.seconds}
                  onChangeText={(v) => updateSplitRow(split.key, 'seconds', v)}
                />
              </View>
              <Pressable onPress={() => removeSplitRow(split.key)} style={styles.removeRow}>
                <Ionicons name="close-circle-outline" size={16} color={colors.textPrimary} />
                <Text style={{ color: colors.textPrimary, fontFamily: fonts.semibold, marginLeft: 4 }}>Remove split</Text>
              </Pressable>
            </View>
          ))}
          {errors.splits ? <Text style={styles.errorText}>{errors.splits}</Text> : null}
          <Button label="+ Add Split" variant="secondary" onPress={addSplitRow} style={{ marginTop: spacing.sm }} />
        </View>
      )}

      <Button label="Save Run" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', gap: spacing.sm },
  splitsToggle: { marginTop: spacing.xl, marginBottom: spacing.md },
  splitRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: { color: colors.textPrimary, fontFamily: fonts.semibold, marginTop: spacing.xs },
  removeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
});
