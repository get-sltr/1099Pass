/**
 * Root Layout
 * Handles navigation based on auth and onboarding state
 * Includes error boundary and offline handling
 */

import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider } from '../src/components/ui';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { nightTheme } from '../src/theme/dualThemes';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { colors: themeColors } = useTheme();
  const bg = themeColors.background;

  useEffect(() => {
    // Hide splash screen once fonts are loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <OfflineBanner showWhenOnline />
      <StatusBar style={themeColors.background === nightTheme.background ? 'light' : 'dark'} backgroundColor={bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ToastProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </ToastProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
