/**
 * Forgot Password Screen
 * Password reset flow
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
import { Button, Input, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to send reset code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('code');
      showToast({
        type: 'success',
        title: 'Code sent!',
        message: 'Check your email for the reset code',
      });
    } catch (err) {
      setError('Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to verify code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('password');
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to reset password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('success');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a code to reset your password
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="john@example.com"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError('');
          }}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon="mail-outline"
          required
        />
      </View>

      <Button
        title="Send Reset Code"
        onPress={handleSendCode}
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
      />
    </>
  );

  const renderCodeStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Enter Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {email}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Reset Code"
          placeholder="000000"
          value={code}
          onChangeText={(v) => {
            setCode(v.replace(/\D/g, '').slice(0, 6));
            setError('');
          }}
          error={error}
          keyboardType="number-pad"
          maxLength={6}
          leftIcon="keypad-outline"
          required
        />

        <TouchableOpacity onPress={handleSendCode} style={styles.resendButton}>
          <Text style={styles.resendText}>Didn't receive a code? Resend</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Verify Code"
        onPress={handleVerifyCode}
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
      />
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password to secure your account
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter new password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setError('');
          }}
          secureTextEntry
          autoCapitalize="none"
          leftIcon="lock-closed-outline"
          showPasswordToggle
          required
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            setError('');
          }}
          error={error}
          secureTextEntry
          autoCapitalize="none"
          leftIcon="lock-closed-outline"
          showPasswordToggle
          required
        />
      </View>

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
      />
    </>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
      </View>

      <Text style={styles.successTitle}>Password Reset!</Text>
      <Text style={styles.successSubtitle}>
        Your password has been successfully reset. You can now sign in with your new password.
      </Text>

      <Button
        title="Sign In"
        onPress={() => router.replace('/(auth)/login')}
        variant="primary"
        size="large"
        fullWidth
        style={styles.successButton}
      />
    </View>
  );

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
        {step !== 'success' && (
          <TouchableOpacity
            onPress={() => {
              if (step === 'email') {
                router.back();
              } else if (step === 'code') {
                setStep('email');
              } else if (step === 'password') {
                setStep('code');
              }
            }}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'password' && renderPasswordStep()}
        {step === 'success' && renderSuccessStep()}
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
    marginBottom: spacing[6],
  },

  resendButton: {
    alignSelf: 'center',
    paddingVertical: spacing[2],
  },

  resendText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },

  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },

  successIcon: {
    marginBottom: spacing[6],
  },

  successTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },

  successSubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },

  successButton: {
    marginTop: spacing[8],
  },
});
