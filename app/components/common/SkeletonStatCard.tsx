import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/common/Card';
import { spacing } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

/** Matches the summary Card at the top of Running/Workout Statistics and
 * the Home dashboard's This Week card -- an eyebrow label above a row of
 * big numbers. */
export function SkeletonStatCard() {
  return (
    <Card>
      <Skeleton width={90} height={12} />
      <View style={styles.row}>
        <View>
          <Skeleton width={50} height={10} />
          <Skeleton width={60} height={30} style={{ marginTop: spacing.xs }} />
        </View>
        <View>
          <Skeleton width={50} height={10} />
          <Skeleton width={60} height={30} style={{ marginTop: spacing.xs }} />
        </View>
        <View>
          <Skeleton width={50} height={10} />
          <Skeleton width={60} height={30} style={{ marginTop: spacing.xs }} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
});
