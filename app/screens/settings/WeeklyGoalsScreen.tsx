import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { NumericInput } from '@/components/forms/NumericInput';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as userRepository from '@/db/repositories/userRepository';
import {
  metersToDisplayDistance,
  displayDistanceToMeters,
  distanceUnitLabel,
  kgToDisplayWeight,
  displayWeightToKg,
  weightUnitLabel,
} from '@/services/unitConversionService';

export function WeeklyGoalsScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [distance, setDistance] = useState('');
  const [volume, setVolume] = useState('');
  const [sessions, setSessions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.weeklyDistanceGoalM != null) setDistance(metersToDisplayDistance(user.weeklyDistanceGoalM, user.unitPreference).toFixed(1));
    if (user.weeklyVolumeGoalKg != null) setVolume(Math.round(kgToDisplayWeight(user.weeklyVolumeGoalKg, user.unitPreference)).toString());
    if (user.weeklySessionsGoal != null) setSessions(user.weeklySessionsGoal.toString());
  }, [user]);

  if (!user) return null;
  const unit = user.unitPreference;

  const handleSave = async () => {
    setSaving(true);
    try {
      await userRepository.updateWeeklyGoals(user.id, {
        weeklyDistanceGoalM: distance === '' ? null : displayDistanceToMeters(parseFloat(distance), unit),
        weeklyVolumeGoalKg: volume === '' ? null : displayWeightToKg(parseFloat(volume), unit),
        weeklySessionsGoal: sessions === '' ? null : parseInt(sessions, 10),
      });
      navigation.goBack();
    } catch {
      Alert.alert("Couldn't save", 'Something went wrong saving your goals. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>Weekly Goals</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
        Leave any field blank to skip it -- rings only appear for goals you actually set.
      </Text>

      <NumericInput label="Distance" unitLabel={distanceUnitLabel(unit)} value={distance} onChangeText={setDistance} placeholder="e.g. 20" />
      <View style={{ height: spacing.lg }} />
      <NumericInput label="Volume" unitLabel={weightUnitLabel(unit)} value={volume} onChangeText={setVolume} placeholder="e.g. 5000" />
      <View style={{ height: spacing.lg }} />
      <NumericInput label="Sessions" value={sessions} onChangeText={setSessions} placeholder="e.g. 4" />

      <Button label="Save Goals" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
