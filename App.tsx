import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import { colors, type } from '@/theme/tokens';
import { useUserStore } from '@/state/userStore';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { RootNavigator } from '@/navigation/RootNavigator';
import { getDb } from '@/db/client';

SplashScreen.preventAutoHideAsync().catch(() => {
  // If this fails (e.g. already hidden), it's not worth blocking startup over.
});

export default function App() {
  const { user, loading, loadUser } = useUserStore();
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
  });
  const [dbReady, setDbReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await getDb(); // ensures migrations run before anything reads/writes
        await loadUser();
        setDbReady(true);
      } catch (err: any) {
        // Surface this instead of leaving the splash screen up forever with
        // no way to tell what went wrong.
        setStartupError(err?.message ?? String(err));
      }
    })();
  }, [loadUser]);

  const appReady = (dbReady && (fontsLoaded || fontError)) || !!startupError;

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (appReady) {
      onLayoutRootView();
    }
  }, [appReady, onLayoutRootView]);

  if (startupError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={type.title}>Couldn't start the app</Text>
        <Text style={[type.bodyMuted, { marginTop: 12 }]}>{startupError}</Text>
        <Text style={[type.caption, { marginTop: 24 }]}>
          Send this exact text to Claude to get it fixed.
        </Text>
      </View>
    );
  }

  // fontError is non-fatal â€” the app still renders with a system font
  // fallback rather than getting stuck on a blank/loading screen forever.
  if (loading || !appReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {user ? <RootNavigator /> : <AuthScreen />}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 },
});
