import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { colors } from '@/theme/tokens';
import { HomeStackNavigator } from './HomeStackNavigator';
import { RunningStackNavigator } from './RunningStackNavigator';
import { StrengthStackNavigator } from './StrengthStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.textPrimary,
    primary: colors.accent,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: 'transparent', borderTopColor: colors.border },
          tabBarBackground: () => (
            <BlurView intensity={80} tint="light" style={{ flex: 1, backgroundColor: colors.glassTint }} />
          ),
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'The Void' }} />
        <Tab.Screen name="Running" component={RunningStackNavigator} options={{ tabBarLabel: 'Escape Consequences' }} />
        <Tab.Screen name="Strength" component={StrengthStackNavigator} options={{ tabBarLabel: 'Gravity Negotiations' }} />
        <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} options={{ title: 'Self-Sabotage', tabBarLabel: 'Self-Sabotage' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
