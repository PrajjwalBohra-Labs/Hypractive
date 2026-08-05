import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GlossSheen } from '@/components/common/GlossSheen';
import { useUserStore } from '@/state/userStore';
import * as statsService from '@/services/statsService';
import { metersToDisplayDistance, distanceUnitLabel, kgToDisplayWeight, weightUnitLabel } from '@/services/unitConversionService';
import { currentWeekRange } from '@/utils/dateUtils';

export function HomeDashboardScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [weekDistanceM, setWeekDistanceM] = useState(0);
  const [weekVolumeKg, setWeekVolumeKg] = useState(0);
  const [weekSessionCount, setWeekSessionCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { from, to } = currentWeekRange();
    const runningSummary = await statsService.getRunningStatsSummary(user.id, from, to);
    const workoutSummary = await statsService.getWorkoutStatsSummary(user.id, from, to);
    setWeekDistanceM(runningSummary.totalDistanceM);
    setWeekVolumeKg(workoutSummary.totalVolumeKg);
    setWeekSessionCount(runningSummary.runCount + workoutSummary.sessionCount);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;
  const unit = user.unitPreference;

  return (
    <View style={styles.container}>
      <Text style={type.display}>{`Ah yes, ${user.displayName}. Your excuses are waiting.`}</Text>

      <Card style={{ marginTop: spacing.lg, overflow: 'hidden' }}>
        <GlossSheen />
        <Text style={type.eyebrow}>THIS WEEK</Text>
        {weekSessionCount === 0 ? (
          <Text style={[type.bodyMuted, { marginTop: spacing.sm }]}>
            Nothing logged yet this week — log a run or start a workout below.
          </Text>
        ) : (
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
            <View>
              <Text style={type.caption}>SESSIONS</Text>
              <Text style={type.numeric}>{weekSessionCount}</Text>
            </View>
          </View>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          label="File Your Escape"
          onPress={() => navigation.navigate('Running', { screen: 'LogRun' })}
          style={styles.actionButton}
        />
        <Button
          label="Delay Your Decay"
          variant="secondary"
          onPress={() => navigation.navigate('Strength', { screen: 'StrengthDashboard' })}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  actionButton: { flex: 1 },
});
