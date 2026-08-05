import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/theme/tokens';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { RestTimerPresetsScreen } from '@/screens/settings/RestTimerPresetsScreen';
import { AboutScreen } from '@/screens/settings/AboutScreen';

const Stack = createNativeStackNavigator();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Self-Sabotage' }} />
      <Stack.Screen name="RestTimerPresets" component={RestTimerPresetsScreen} options={{ title: 'Rest Timer Presets' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Who Built This?' }} />
    </Stack.Navigator>
  );
}
