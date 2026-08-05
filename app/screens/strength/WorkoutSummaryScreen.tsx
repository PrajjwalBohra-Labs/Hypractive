import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export function WorkoutSummaryScreen({ route, navigation }: any) {
  const prCount: number = route.params?.prCount ?? 0;

  return (
    <View style={styles.container}>
      <Text style={type.display}>Workout Complete</Text>

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

      {/* Full session totals (volume, duration) ship with Workout Statistics in build step 9. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
});
