import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, radius, type } from '@/theme/tokens';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useUserStore } from '@/state/userStore';
import * as exportImportService from '@/services/exportImportService';

export function SettingsScreen({ navigation }: any) {
  const user = useUserStore((s) => s.user);
  const setUnitPreference = useUserStore((s) => s.setUnitPreference);
  const logOut = useUserStore((s) => s.logOut);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!user) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportImportService.exportAndShare(user.id);
    } catch (err: any) {
      Alert.alert('Export failed', err?.message ?? 'Something went wrong creating the backup file.');
    } finally {
      setExporting(false);
    }
  };

  const runImport = async (fileUri: string, mode: exportImportService.ImportMode) => {
    setImporting(true);
    try {
      const bundle = await exportImportService.readBackupFile(fileUri);
      await exportImportService.importBackup(bundle, user.id, mode);
      Alert.alert('Import complete', 'Your backup has been restored.');
    } catch (err: any) {
      Alert.alert(
        'Import failed',
        (err?.message ?? 'Something went wrong.') + ' Nothing was changed — your existing data is untouched.'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleImportPress = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || !result.assets?.[0]) return;
    const fileUri = result.assets[0].uri;

    Alert.alert(
      'Import backup',
      'Merge adds anything new from the backup without touching what you already have. Replace erases your current data first, then restores exactly what\u2019s in the backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Merge', onPress: () => runImport(fileUri, 'merge') },
        { text: 'Replace', style: 'destructive', onPress: () => runImport(fileUri, 'replace') },
      ]
    );
  };

  const handleLogOut = () => {
    Alert.alert('Log out?', 'You can log back in with your email and password any time — your data stays on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Card>
        <Text style={type.eyebrow}>VICTIM PROFILE</Text>
        <Text style={[type.body, { marginTop: spacing.xs }]}>{user.displayName}</Text>
        {user.email && <Text style={type.bodyMuted}>{user.email}</Text>}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>UNITS</Text>
        <View style={styles.unitRow}>
          <Pressable
            style={[styles.unitOption, user.unitPreference === 'metric' && styles.unitOptionActive]}
            onPress={() => setUnitPreference('metric')}
          >
            <Text style={[type.body, user.unitPreference === 'metric' && { color: colors.background }]}>Metric</Text>
          </Pressable>
          <Pressable
            style={[styles.unitOption, user.unitPreference === 'imperial' && styles.unitOptionActive]}
            onPress={() => setUnitPreference('imperial')}
          >
            <Text style={[type.body, user.unitPreference === 'imperial' && { color: colors.background }]}>Imperial</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>REST TIMER</Text>
        <Button
          label="Manage Presets"
          variant="secondary"
          onPress={() => navigation.navigate('RestTimerPresets')}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>DATA</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.xs, marginBottom: spacing.md }]}>
          Your data lives only on this device. Export a backup regularly, especially before reinstalling the app or switching phones.
        </Text>
        <Button label="Export Backup" onPress={handleExport} loading={exporting} />
        <Button
          label="Import Backup"
          variant="secondary"
          onPress={handleImportPress}
          loading={importing}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>NUTRITION TRACKING</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>Coming in a future versions.</Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>APP LOCK</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.xs }]}>Coming in a future versions.</Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={type.eyebrow}>ABOUT</Text>
        <Button
          label="Who Built This?"
          variant="secondary"
          onPress={() => navigation.navigate('About')}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      <Button label="Log Out" variant="danger" onPress={handleLogOut} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  unitRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  unitOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
  },
  unitOptionActive: { backgroundColor: colors.accent, borderColor: colors.accent },
});
