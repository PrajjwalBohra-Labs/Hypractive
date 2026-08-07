import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { GlossSheen } from '@/components/common/GlossSheen';
import { useUserStore } from '@/state/userStore';
import * as statsService from '@/services/statsService';
import { metersToDisplayDistance, distanceUnitLabel, kgToDisplayWeight, weightUnitLabel } from '@/services/unitConversionService';
import { currentWeekRange } from '@/utils/dateUtils';

export function ThisWeekScreen() {
  const user = useUserStore((s) => s.user);
  const [weekDistanceM, setWeekDistanceM] = useState(0);
  const [weekVolumeKg, setWeekVolumeKg] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { from, to } = currentWeekRange();
    const runningSummary = await statsService.getRunningStatsSummary(user.id, from, to);
    const workoutSummary = await statsService.getWorkoutStatsSummary(user.id, from, to);
    setWeekDistanceM(runningSummary.totalDistanceM);
    setWeekVolumeKg(workoutSummary.totalVolumeKg);
    setRunCount(runningSummary.runCount);
    setWorkoutCount(workoutSummary.sessionCount);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;
  const unit = user.unitPreference;
  const totalSessions = runCount + workoutCount;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>This Week</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
        {totalSessions === 0 ? 'Nothing yet. The week is still young. Barely.' : `${totalSessions} session${totalSessions === 1 ? '' : 's'} so far.`}
      </Text>

      <Card style={{ overflow: 'hidden' }}>
        <GlossSheen />
        <Text style={type.eyebrow}>TOTALS</Text>
        <View style={styles.statRow}>
          <View>
            <Text style={type.caption}>DISTANCE</Text>
            <Text style={type.numeric}>{metersToDisplayDistance(weekDistanceM, unit).toFixed(1)}</Text>
            <Text style={type.bodyMuted}>{distanceUnitLabel(unit)}</Text>
          </View>
          <View>
            <Text style={type.caption}>VOLUME</Text>
            <Text style={type.numeric}>{Math.round(kgToDisplayWeight(weekVolumeKg, unit))}</Text>
            <Text style={type.bodyMuted}>{weightUnitLabel(unit)}</Text>
          </View>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>BREAKDOWN</Text>
        <View style={styles.breakdownRow}>
          <Text style={type.body}>Runs</Text>
          <Text style={type.bodyMuted}>{runCount}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={type.body}>Workouts</Text>
          <Text style={type.bodyMuted}>{workoutCount}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
