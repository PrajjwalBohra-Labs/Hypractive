import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { EmptyState } from '@/components/lists/EmptyState';
import { SkeletonListRow } from '@/components/common/SkeletonListRow';
import { useUserStore } from '@/state/userStore';
import * as statsService from '@/services/statsService';
import type { RecentActivityEntry } from '@/services/statsService';
import {
  metersToDisplayDistance,
  distanceUnitLabel,
  formatPace,
  kgToDisplayWeight,
  weightUnitLabel,
} from '@/services/unitConversionService';

export function RecentActivityScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [activity, setActivity] = useState<RecentActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setActivity(await statsService.getRecentActivity(user.id, 40));
    setLoading(false);
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
    <View style={styles.container}>
      <Text style={type.display}>Recent Activity</Text>

      {loading ? (
        <View style={{ marginTop: spacing.lg }}>
          <SkeletonListRow />
        </View>
      ) : activity.length === 0 ? (
        <EmptyState message="Nothing here. The void is patient." />
      ) : (
        <FlatList
          style={{ marginTop: spacing.lg }}
          data={activity}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => openActivity(item)}>
              <View style={styles.rowHeader}>
                <Text style={type.caption}>{item.type === 'run' ? 'ESCAPE' : 'DECAY DELAYED'}</Text>
                <Text style={type.caption}>{item.date}</Text>
              </View>
              {item.type === 'run' ? (
                <Text style={[type.body, { marginTop: spacing.xs }]}>
                  {metersToDisplayDistance(item.distanceM, unit).toFixed(2)} {distanceUnitLabel(unit)} · {formatPace(item.avgPaceSPerKm, unit)}
                </Text>
              ) : (
                <Text style={[type.body, { marginTop: spacing.xs }]}>
                  {item.exerciseCount} exercises · {Math.round(kgToDisplayWeight(item.totalVolumeKg, unit))} {weightUnitLabel(unit)}
                </Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between' },
});
