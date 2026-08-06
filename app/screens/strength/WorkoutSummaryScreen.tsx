import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ACHIEVEMENT_LINES, pickRandom } from '@/content/roastCopy';

export function WorkoutSummaryScreen({ route, navigation }: any) {
  const prCount: number = route.params?.prCount ?? 0;
  const [achievementLine] = useState(() => pickRandom(ACHIEVEMENT_LINES));

  return (
    <View style={styles.container}>
      <Text style={type.display}>Workout Complete</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>{achievementLine}</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={type.eyebrow}>PERSONAL RECORDS</Text>
        <Text style={[type.numeric, { marginTop: spacing.sm }]}>{prCount}</Text>
        <Text style={type.bodyMuted}>{prCount === 1 ? 'PR hit this session' : 'PRs hit this session'}</Text>
      </Card>

      <Button
        label="Done"
        onPress={() => navigation.navigate('StrengthDashboard')}
        style={{ marginTop: spacing.xl }}
      />

      {/* Per-session totals (volume, duration) aren't computed here yet -- only
          aggregate stats exist so far, via Workout Statistics. Noted as a gap,
          not part of this pass. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
});
