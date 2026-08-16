import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import { RoastCard } from '@/components/common/RoastCard';
import { NavLinkCard } from '@/components/common/NavLinkCard';
import { useUserStore } from '@/state/userStore';

/**
 * Deliberately minimal: this screen fetches nothing and shows no data of
 * its own. It's a landing pad -- greeting, the two primary actions, and
 * links out to This Week / Recent Activity, which own their own content.
 */
export function HomeDashboardScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const insets = useSafeAreaInsets();
  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={type.display}>{`Andddd here comes ${user.displayName}... with the excuses.`}</Text>

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

      <Text style={[type.eyebrow, { marginTop: spacing.md, marginBottom: spacing.md }]}>EXPLORE</Text>
      <NavLinkCard label="This Week" subtitle="Totals, so far" onPress={() => navigation.navigate('ThisWeek')} />
      <NavLinkCard label="Recent Activity" subtitle="What you've been up to" onPress={() => navigation.navigate('RecentActivity')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  actionButton: { flex: 1 },
});
