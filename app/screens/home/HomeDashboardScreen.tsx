import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GlossSheen } from '@/components/common/GlossSheen';
import { RoastCard } from '@/components/common/RoastCard';
import { RecentActivityCard } from '@/components/common/RecentActivityCard';
import { QuickActionCard } from '@/components/common/QuickActionCard';
import { useUserStore } from '@/state/userStore';
import * as statsService from '@/services/statsService';
import type { RecentActivityEntry } from '@/services/statsService';
import { metersToDisplayDistance, distanceUnitLabel, kgToDisplayWeight, weightUnitLabel } from '@/services/unitConversionService';
import { currentWeekRange } from '@/utils/dateUtils';

export function HomeDashboardScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [weekDistanceM, setWeekDistanceM] = useState(0);
  const [weekVolumeKg, setWeekVolumeKg] = useState(0);
  const [weekSessionCount, setWeekSessionCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivityEntry[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { from, to } = currentWeekRange();
    const runningSummary = await statsService.getRunningStatsSummary(user.id, from, to);
    const workoutSummary = await statsService.getWorkoutStatsSummary(user.id, from, to);
    setWeekDistanceM(runningSummary.totalDistanceM);
    setWeekVolumeKg(workoutSummary.totalVolumeKg);
    setWeekSessionCount(runningSummary.runCount + workoutSummary.sessionCount);
    setRecentActivity(await statsService.getRecentActivity(user.id, 8));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;
  const unit = user.unitPreference;

  const openActivity = (entry: RecentActivityEntry) => {
    if (entry.type === 'run') {
      navigation.navigate('Running', { screen: 'RunSessionDetail', params: { runSessionId: entry.id } });
    } else {
      navigation.navigate('Strength', { screen: 'WorkoutSessionDetail', params: { sessionId: entry.id } });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      {/* Hero */}
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

      {/* Primary CTAs */}
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

      <RoastCard />

      {/* Horizontal recent activity */}
      <Text style={[type.eyebrow, { marginBottom: spacing.md }]}>RECENT DAMAGE</Text>
      {recentActivity.length === 0 ? (
        <Text style={type.bodyMuted}>Nothing yet. The void is patient.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.lg }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg }}>
            {recentActivity.map((entry) => (
              <RecentActivityCard
                key={`${entry.type}-${entry.id}`}
                entry={entry}
                unit={unit}
                onPress={() => openActivity(entry)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Quick action grid */}
      <Text style={[type.eyebrow, { marginTop: spacing.xl, marginBottom: spacing.md }]}>QUICK ESCAPES</Text>
      <View style={styles.grid}>
        <QuickActionCard
          label="Evidence of Suffering"
          onPress={() => navigation.navigate('Running', { screen: 'RunningStatistics' })}
        />
        <QuickActionCard
          label="Damage Report"
          onPress={() => navigation.navigate('Strength', { screen: 'WorkoutStatistics' })}
        />
        <QuickActionCard
          label="Trauma Archive"
          onPress={() => navigation.navigate('Strength', { screen: 'WorkoutHistory' })}
        />
        <QuickActionCard
          label="Methods of Suffering"
          onPress={() => navigation.navigate('Strength', { screen: 'ExerciseLibraryList' })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  actionButton: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
