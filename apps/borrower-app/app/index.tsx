/**
 * Root Index
 * Redirects to appropriate screen based on auth/onboarding state
 */

import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store';
import { LoadingSpinner } from '../src/components/ui';
import { colors } from '../src/theme';

export default function RootIndex() {
  const { isLoading, isAuthenticated, hasCompletedOnboarding, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not logged in - show welcome/auth screens
      router.replace('/(auth)/welcome');
    } else if (!hasCompletedOnboarding) {
      // Logged in but hasn't completed onboarding
      router.replace('/(onboarding)/connect-accounts');
    } else {
      // Fully authenticated and onboarded - go to main app
      router.replace('/(tabs)/dashboard');
    }
  }, [isLoading, isAuthenticated, hasCompletedOnboarding]);

  return (
    <View style={styles.container}>
      <LoadingSpinner
        size="large"
        message="Loading your income story..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
