import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import { SectionDivider } from '@/components/common/SectionDivider';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import { RoastCard } from '@/components/common/RoastCard';
import { useUserStore } from '@/state/userStore';
import * as statsService from '@/services/statsService';
import type { RecentActivityEntry } from '@/services/statsService';
import { getContextualLine } from '@/content/roastCopy';
import { StreakIndicator } from '@/components/common/StreakIndicator';
import { computeStreak, getLast7DaysActivity } from '@/services/streakService';
import {
  metersToDisplayDistance,
  distanceUnitLabel,
  formatPace,
  formatDuration,
  kgToDisplayWeight,
  weightUnitLabel,
} from '@/services/unitConversionService';
import { currentWeekRange } from '@/utils/dateUtils';

function FadeUpSection({ delay, children }: { delay: number; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }).start();
  }, [anim, delay]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export function HomeDashboardScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const [weekDistanceM, setWeekDistanceM] = useState(0);
  const [weekVolumeKg, setWeekVolumeKg] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<RecentActivityEntry | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [last7Days, setLast7Days] = useState<boolean[]>([false, false, false, false, false, false, false]);

  const load = useCallback(async () => {
    if (!user) return;
    const { from, to } = currentWeekRange();
    const runningSummary = await statsService.getRunningStatsSummary(user.id, from, to);
    const workoutSummary = await statsService.getWorkoutStatsSummary(user.id, from, to);
    setWeekDistanceM(runningSummary.totalDistanceM);
    setWeekVolumeKg(workoutSummary.totalVolumeKg);
    setRunCount(runningSummary.runCount);
    setWorkoutCount(workoutSummary.sessionCount);

    const recent = await statsService.getRecentActivity(user.id, 1);
    setLastActivity(recent.length > 0 ? recent[0] : null);

    const activeDates = await statsService.getActiveDates(user.id);
    setStreakDays(computeStreak(activeDates));
    setLast7Days(getLast7DaysActivity(activeDates));
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl }}
    >
      <FadeUpSection delay={0}>
        <Text style={type.display}>THE VOID</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>{getContextualLine()}</Text>
        <StreakIndicator streakDays={streakDays} last7Days={last7Days} />
      </FadeUpSection>

      <FadeUpSection delay={80}>
        <SectionDivider />
        <Text style={type.eyebrow}>THIS WEEK</Text>
        {totalSessions === 0 ? (
          <Text style={[type.bodyMuted, { marginTop: spacing.sm }]}>Nothing yet. The week is still young. Barely.</Text>
        ) : (
          <View style={{ marginTop: spacing.sm }}>
            <View style={styles.numberRow}>
              <AnimatedNumber
                value={metersToDisplayDistance(weekDistanceM, unit)}
                formatValue={(v) => v.toFixed(1)}
                style={type.numeric}
              />
              <Text style={[type.numeric, { marginLeft: spacing.xs }]}>{distanceUnitLabel(unit)}</Text>
            </View>
            <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>
              {workoutCount} WORKOUT{workoutCount === 1 ? '' : 'S'} · {runCount} RUN{runCount === 1 ? '' : 'S'}
            </Text>
          </View>
        )}
      </FadeUpSection>

      {lastActivity && (
        <FadeUpSection delay={160}>
          <SectionDivider />
          <Text style={type.eyebrow}>LAST PERFORMANCE</Text>
          <View style={{ marginTop: spacing.sm }}>
            {lastActivity.type === 'run' ? (
              <>
                <Text style={type.title}>
                  {metersToDisplayDistance(lastActivity.distanceM, unit).toFixed(2)} {distanceUnitLabel(unit)}
                </Text>
                <Text style={[type.bodyMuted, { marginTop: 2 }]}>{formatPace(lastActivity.avgPaceSPerKm, unit)}</Text>
              </>
            ) : (
              <>
                <Text style={type.title}>{lastActivity.exerciseCount} exercises</Text>
                <Text style={[type.bodyMuted, { marginTop: 2 }]}>
                  {Math.round(kgToDisplayWeight(lastActivity.totalVolumeKg, unit))} {weightUnitLabel(unit)}
                </Text>
              </>
            )}
            <Text style={[type.caption, { marginTop: spacing.xs }]}>{lastActivity.date}</Text>
          </View>
        </FadeUpSection>
      )}

      <FadeUpSection delay={240}>
        <SectionDivider />
        <Text style={type.eyebrow}>QUICK ACTIONS</Text>
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
      </FadeUpSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  numberRow: { flexDirection: 'row', alignItems: 'flex-end' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  actionButton: { flex: 1 },
});
