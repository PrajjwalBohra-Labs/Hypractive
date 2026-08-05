import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';

export function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>Hypractive</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>Version 0.1.0</Text>

      <Card>
        <Text style={type.eyebrow}>WHAT THIS IS</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          A private running and strength training log. Everything you see — exercises, plans, and history — comes
          from what you've entered yourself. Nothing is pre-loaded, and nothing is shared with anyone else.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>ABOUT YOUR ACCOUNT</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          Your email and password are stored only on this device — there's no server, so there's no password
          recovery and no way to access your account from another device. It exists to make the app feel complete,
          not as a real security or sync feature.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>YOUR DATA</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          Everything is stored locally on this device. Use Settings → Export Backup regularly, especially before
          reinstalling the app or switching phones — there is no automatic cloud backup.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>TYPEFACE</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          Urbanist, designed by Corey Hu, licensed under the SIL Open Font License.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
