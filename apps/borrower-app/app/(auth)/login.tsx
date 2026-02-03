/**
 * Login Screen
 * Existing user authentication
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button, Input, useToast } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [hasBiometrics, setHasBiometrics] = useState(false);

  // Check for biometric support
  useState(() => {
    LocalAuthentication.hasHardwareAsync().then(setHasBiometrics);
  });

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);

      showToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Loading your income profile...',
      });

      // Navigation is handled by the root index based on auth state
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: error instanceof Error ? error.message : 'Please check your credentials',
      });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to 1099Pass',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // In a real app, we would use stored credentials or a biometric token
        showToast({
          type: 'info',
          title: 'Biometric login',
          message: 'Please enter your credentials this time to enable biometric login',
        });
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue building your income story
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="john@example.com"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            required
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            leftIcon="lock-closed-outline"
            showPasswordToggle
            required
          />

          {/* Forgot password link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <View style={styles.submitContainer}>
          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          />

          {/* Biometric login */}
          {hasBiometrics && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              accessibilityLabel="Sign in with biometrics"
            >
              <View style={styles.biometricIcon}>
                <Ionicons name="finger-print" size={24} color={colors.primary} />
              </View>
              <Text style={styles.biometricText}>Sign in with Face ID / Touch ID</Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up prompt */}
          <View style={styles.signupPrompt}>
            <Text style={styles.signupPromptText}>New to 1099Pass? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing[6],
    flexGrow: 1,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing[2],
    marginBottom: spacing[2],
  },

  header: {
    marginBottom: spacing[8],
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  form: {
    marginBottom: spacing[4],
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: spacing[2],
  },

  forgotPasswordText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },

  submitContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: spacing[4],
  },

  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    marginTop: spacing[4],
  },

  biometricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  biometricText: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '500',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[6],
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing[4],
  },

  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },

  signupPromptText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  signupLink: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
