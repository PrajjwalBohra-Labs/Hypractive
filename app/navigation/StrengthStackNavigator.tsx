import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import { ExerciseLibraryListScreen } from '@/screens/strength/ExerciseLibraryListScreen';
import { ExerciseEditorScreen } from '@/screens/strength/ExerciseEditorScreen';
import { ExerciseDetailScreen } from '@/screens/strength/ExerciseDetailScreen';
import { ExerciseHistoryDetailScreen } from '@/screens/strength/ExerciseHistoryDetailScreen';
import { TemplateListScreen } from '@/screens/strength/TemplateListScreen';
import { TemplateEditorScreen } from '@/screens/strength/TemplateEditorScreen';
import { TemplateDetailScreen } from '@/screens/strength/TemplateDetailScreen';
import { ActiveWorkoutScreen } from '@/screens/strength/ActiveWorkoutScreen';
import { WorkoutSummaryScreen } from '@/screens/strength/WorkoutSummaryScreen';
import { WorkoutHistoryScreen } from '@/screens/strength/WorkoutHistoryScreen';
import { WorkoutSessionDetailScreen } from '@/screens/strength/WorkoutSessionDetailScreen';
import { WorkoutStatisticsScreen } from '@/screens/strength/WorkoutStatisticsScreen';

const Stack = createNativeStackNavigator();

function StrengthDashboardScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={type.display}>Gravity Negotiations</Text>
      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        <Button label="Build Your Own Regret" onPress={() => navigation.navigate('ActiveWorkout', { templateId: null })} />
        <Button label="Templates" variant="secondary" onPress={() => navigation.navigate('TemplateList')} />
        <Button label="Methods of Suffering" variant="secondary" onPress={() => navigation.navigate('ExerciseLibraryList')} />
        <Button label="Trauma Archive" variant="secondary" onPress={() => navigation.navigate('WorkoutHistory')} />
        <Button label="Damage Report" variant="secondary" onPress={() => navigation.navigate('WorkoutStatistics')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
});

export function StrengthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="StrengthDashboard" component={StrengthDashboardScreen} options={{ title: 'Gravity Negotiations' }} />
      <Stack.Screen name="ExerciseLibraryList" component={ExerciseLibraryListScreen} options={{ title: 'Methods of Suffering' }} />
      <Stack.Screen name="ExerciseEditor" component={ExerciseEditorScreen} options={{ title: 'Exercise' }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
      <Stack.Screen name="ExerciseHistoryDetail" component={ExerciseHistoryDetailScreen} options={{ title: 'History' }} />
      <Stack.Screen name="TemplateList" component={TemplateListScreen} options={{ title: 'Templates' }} />
      <Stack.Screen name="TemplateEditor" component={TemplateEditorScreen} options={{ title: 'Edit Template' }} />
      <Stack.Screen name="TemplateDetail" component={TemplateDetailScreen} options={{ title: 'Template' }} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ title: 'Workout', headerBackVisible: false }} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ title: 'Summary', headerBackVisible: false }} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ title: 'Trauma Archive' }} />
      <Stack.Screen name="WorkoutSessionDetail" component={WorkoutSessionDetailScreen} options={{ title: 'Workout' }} />
      <Stack.Screen name="WorkoutStatistics" component={WorkoutStatisticsScreen} options={{ title: 'Damage Report' }} />
    </Stack.Navigator>
  );
}
