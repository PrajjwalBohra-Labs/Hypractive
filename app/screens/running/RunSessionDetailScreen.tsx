import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { useUserStore } from '@/state/userStore';
import * as runSessionRepository from '@/db/repositories/runSessionRepository';
import { computePaceVariance } from '@/services/paceService';
import { detectSplitTrend, comparePaceToPriorRun } from '@/services/runningAnalysisService';
import {
  metersToDisplayDistance,
  distanceUnitLabel,
  formatPace,
  formatDuration,
} from '@/services/unitConversionService';
import { ACHIEVEMENT_LINES, pickRandom } from '@/content/roastCopy';
import type { RunSession, PaceSplit } from '@/types/entities';

export function RunSessionDetailScreen({ route }: any) {
  const runSessionId: string = route.params.runSessionId;
  const justSaved: boolean = route.params?.justSaved ?? false;
  const user = useUserStore((s) => s.user);
  const [session, setSession] = useState<RunSession | null>(null);
  const [splits, setSplits] = useState<PaceSplit[]>([]);
  const [priorPace, setPriorPace] = useState<number | null>(null);
  const [achievementLine] = useState(() => (justSaved ? pickRandom(ACHIEVEMENT_LINES) : null));

  const load = useCallback(async () => {
    if (!user) return;
    const s = await runSessionRepository.getRunSession(runSessionId);
    setSession(s);
    if (!s) return;
    setSplits(await runSessionRepository.listPaceSplits(runSessionId));
    const prior = await runSessionRepository.findComparableRun(user.id, s.distanceM, s.id, s.date);
    setPriorPace(prior ? prior.avgPaceSPerKm : null);
  }, [runSessionId, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user || !session) return null;
  const unit = user.unitPreference;

  const variance = computePaceVariance(splits);
  const splitTrend = detectSplitTrend(splits);
  const priorComparison = comparePaceToPriorRun(session.avgPaceSPerKm, priorPace);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>{session.date}</Text>
      {achievementLine && <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>{achievementLine}</Text>}

      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.statRow}>
          <View>
            <Text style={type.caption}>DISTANCE</Text>
            <Text style={type.numeric}>{metersToDisplayDistance(session.distanceM, unit).toFixed(2)}</Text>
            <Text style={type.bodyMuted}>{distanceUnitLabel(unit)}</Text>
          </View>
          <View>
            <Text style={type.caption}>DURATION</Text>
            <Text style={type.numeric}>{formatDuration(session.durationS)}</Text>
          </View>
          <View>
            <Text style={type.caption}>AVG PACE</Text>
            <Text style={type.numeric}>{formatPace(session.avgPaceSPerKm, unit).split(' ')[0]}</Text>
            <Text style={type.bodyMuted}>/{distanceUnitLabel(unit)}</Text>
          </View>
        </View>
      </Card>

      {session.notes ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={type.bodyMuted}>{session.notes}</Text>
        </Card>
      ) : null}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>RUNNING ANALYSIS</Text>
        <Text style={[type.body, { marginTop: spacing.sm }]}>{splitTrendLabel(splitTrend)}</Text>
        {variance !== null && (
          <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>
            Split pace variance: ±{Math.round(variance)}s/km
          </Text>
        )}
        <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>
          {priorComparison.hasPriorRun
            ? `${formatDeltaLabel(priorComparison.paceDeltaSPerKm!, unit)} vs. your most recent comparable run`
            : 'No prior comparable run to compare against'}
        </Text>
      </Card>

      {splits.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={type.eyebrow}>SPLITS</Text>
          {splits.map((split) => (
            <View key={split.id} style={styles.splitRow}>
              <Text style={type.body}>#{split.splitIndex}</Text>
              <Text style={type.body}>{metersToDisplayDistance(split.distanceM, unit).toFixed(2)} {distanceUnitLabel(unit)}</Text>
              <Text style={type.body}>{formatDuration(split.durationS)}</Text>
              <Text style={type.body}>{formatPace(split.paceSPerKm, unit)}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function splitTrendLabel(trend: string): string {
  switch (trend) {
    case 'negative_split': return 'Negative split — second half faster than first half';
    case 'positive_split': return 'Positive split — second half slower than first half';
    case 'even': return 'Even split — both halves matched';
    default: return 'Add splits to see a split trend';
  }
}

function formatDeltaLabel(deltaSPerKm: number, unit: 'metric' | 'imperial'): string {
  const sign = deltaSPerKm >= 0 ? '+' : '';
  return `${sign}${Math.round(deltaSPerKm)}s/${distanceUnitLabel(unit)}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
});
