import React, { useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as runSessionRepository from '@/db/repositories/runSessionRepository';
import { metersToDisplayDistance, distanceUnitLabel, formatPace } from '@/services/unitConversionService';
import { LogRunScreen } from '@/screens/running/LogRunScreen';
import { RunSessionDetailScreen } from '@/screens/running/RunSessionDetailScreen';
import { RunHistoryScreen } from '@/screens/running/RunHistoryScreen';
import { RunningStatisticsScreen } from '@/screens/running/RunningStatisticsScreen';
import type { RunSession } from '@/types/entities';

const Stack = createNativeStackNavigator();

function RunningDashboardScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const [recentRuns, setRecentRuns] = useState<RunSession[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setRecentRuns(await runSessionRepository.listRunSessions(user.id, { limit: 5 }));
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
      <Text style={type.display}>Escape Consequences</Text>

      <Button label="File Your Escape" onPress={() => navigation.navigate('LogRun')} style={{ marginTop: spacing.lg }} />
      <Button
        label="Evidence of Suffering"
        variant="secondary"
        onPress={() => navigation.navigate('RunningStatistics')}
        style={{ marginTop: spacing.sm }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.sm }}>
        <Text style={type.eyebrow}>RECENT ESCAPES</Text>
        <Pressable onPress={() => navigation.navigate('RunHistory')}>
          <Text style={{ color: colors.accent }}>See all</Text>
        </Pressable>
      </View>

      {recentRuns.length === 0 ? (
        <Text style={type.bodyMuted}>You've successfully avoided cardio.</Text>
      ) : (
        <FlatList
          data={recentRuns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('RunSessionDetail', { runSessionId: item.id })}
            >
              <Text style={type.body}>{item.date}</Text>
              <Text style={type.bodyMuted}>
                {metersToDisplayDistance(item.distanceM, unit).toFixed(2)} {distanceUnitLabel(unit)} · {formatPace(item.avgPaceSPerKm, unit)}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Text style={[type.bodyMuted, { marginTop: spacing.xl }]}>
        Running Plans ship in a later build step.
      </Text>
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
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});

export function RunningStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="RunningDashboard" component={RunningDashboardScreen} options={{ title: 'Escape Consequences' }} />
      <Stack.Screen name="LogRun" component={LogRunScreen} options={{ title: 'File Your Escape' }} />
      <Stack.Screen name="RunSessionDetail" component={RunSessionDetailScreen} options={{ title: 'Run' }} />
      <Stack.Screen name="RunHistory" component={RunHistoryScreen} options={{ title: 'Run History' }} />
      <Stack.Screen name="RunningStatistics" component={RunningStatisticsScreen} options={{ title: 'Evidence of Suffering' }} />
    </Stack.Navigator>
  );
}
