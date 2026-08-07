import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/theme/tokens';
import { HomeDashboardScreen } from '@/screens/home/HomeDashboardScreen';
import { ThisWeekScreen } from '@/screens/home/ThisWeekScreen';
import { RecentActivityScreen } from '@/screens/home/RecentActivityScreen';

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ThisWeek" component={ThisWeekScreen} options={{ title: 'This Week' }} />
      <Stack.Screen name="RecentActivity" component={RecentActivityScreen} options={{ title: 'Recent Activity' }} />
    </Stack.Navigator>
  );
}
