/**
 * Onboarding Layout
 * Stack navigation for onboarding screens
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent back gesture during onboarding
      }}
    >
      <Stack.Screen name="connect-accounts" />
      <Stack.Screen name="income-sources" />
      <Stack.Screen name="profile-complete" />
    </Stack>
  );
}
