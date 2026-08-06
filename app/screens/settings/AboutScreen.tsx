import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';

export function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={type.display}>Hypractive</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
        Version 0.1.0 — still in denial, like you.
      </Text>

      <Card>
        <Text style={type.eyebrow}>THE CULT MANIFESTO</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          A private running and strength log that only knows what you tell it. No pre-loaded plans, no borrowed
          motivation, no one else's progress to compare yourself to — just your own numbers, staring back at you.
          Nothing here is shared with anyone. There's nowhere to hide, but also nowhere for the evidence to leak.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>WHY THIS EXISTS</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          Most fitness apps cheer for you. This one keeps receipts instead. It exists to log what actually happened —
          not what you meant to do, not what you'll "start Monday" — built for a small group of people who'd rather
          be mocked by an app than lied to by one.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>MEET YOUR TORMENTOR</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          That relentless voice roasting your rest days is just software — there's no one on the other end judging
          you personally, however it might feel at 6am. Your email and password live only on this device. There's no
          server, so there's no password recovery and no way to log in anywhere else. It's here to make the app feel
          complete, not to actually protect anything.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>TERMS OF SUFFERING</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          The only terms that matter: everything is stored locally on this device, full stop. Use Settings → Export
          Backup regularly, especially before reinstalling the app or switching phones — there is no cloud safety
          net, no automatic sync, and no one coming to save your gains but you.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>THE FINE PRINT</Text>
        <Text style={[type.body, { marginTop: spacing.sm, lineHeight: 22 }]}>
          Set in Urbanist, designed by Corey Hu, licensed under the SIL Open Font License.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
