import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { metersToDisplayDistance, distanceUnitLabel, formatPace, kgToDisplayWeight, weightUnitLabel } from '@/services/unitConversionService';
import type { RecentActivityEntry } from '@/services/statsService';
import type { UnitPreference } from '@/types/entities';

interface RecentActivityCardProps {
  entry: RecentActivityEntry;
  unit: UnitPreference;
  onPress: () => void;
}

export function RecentActivityCard({ entry, unit, onPress }: RecentActivityCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={type.caption}>{entry.type === 'run' ? 'ESCAPE' : 'DECAY DELAYED'}</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>{entry.date}</Text>
      {entry.type === 'run' ? (
        <>
          <Text style={styles.headline}>
            {metersToDisplayDistance(entry.distanceM, unit).toFixed(1)} {distanceUnitLabel(unit)}
          </Text>
          <Text style={type.bodyMuted}>{formatPace(entry.avgPaceSPerKm, unit)}</Text>
        </>
      ) : (
        <>
          <Text style={styles.headline}>{entry.exerciseCount} exercises</Text>
          <Text style={type.bodyMuted}>
            {Math.round(kgToDisplayWeight(entry.totalVolumeKg, unit))} {weightUnitLabel(unit)}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  headline: {
    ...type.title,
    fontSize: 18,
    marginTop: spacing.sm,
  },
});
