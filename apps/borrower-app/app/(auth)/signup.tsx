/**
 * Sign Up Screen
 * New user registration
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
import { useAuthStore } from '../../src/store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

// Password strength calculation
function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: colors.error };
  if (score <= 2) return { level: 2, label: 'Fair', color: colors.warning };
  if (score <= 3) return { level: 3, label: 'Good', color: colors.secondary };
  return { level: 4, label: 'Strong', color: colors.success };
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { signUp, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      showToast({
        type: 'success',
        title: 'Welcome to 1099Pass!',
        message: 'Let\'s set up your income profile.',
      });

      // Navigate to onboarding
      router.replace('/(onboarding)/connect-accounts');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Sign up failed',
        message: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join thousands of gig workers building their financial future
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(v) => updateField('firstName', v)}
                error={errors.firstName}
                autoCapitalize="words"
                autoComplete="given-name"
                required
              />
            </View>
            <View style={styles.nameField}>
              <Input
                label="Last Name"
                placeholder="Smith"
                value={formData.lastName}
                onChangeText={(v) => updateField('lastName', v)}
                error={errors.lastName}
                autoCapitalize="words"
                autoComplete="family-name"
                required
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            required
          />

          <Input
            label="Phone (Optional)"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
            autoComplete="tel"
            leftIcon="call-outline"
          />

          <Input
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            leftIcon="lock-closed-outline"
            showPasswordToggle
            required
          />

          {/* Password strength indicator */}
          {formData.password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          passwordStrength.level >= level
                            ? passwordStrength.color
                            : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            leftIcon="lock-closed-outline"
            showPasswordToggle
            required
          />

          {/* Terms checkbox */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => updateField('acceptTerms', !formData.acceptTerms)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: formData.acceptTerms }}
          >
            <View
              style={[
                styles.checkbox,
                formData.acceptTerms && styles.checkboxChecked,
                errors.acceptTerms && styles.checkboxError,
              ]}
            >
              {formData.acceptTerms && (
                <Ionicons name="checkmark" size={14} color={colors.textInverse} />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.acceptTerms && (
            <Text style={styles.errorText}>{errors.acceptTerms}</Text>
          )}
        </View>

        {/* Submit button */}
        <View style={styles.submitContainer}>
          <Button
            title="Create Account"
            onPress={handleSignUp}
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    marginBottom: spacing[6],
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

  nameRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },

  nameField: {
    flex: 1,
  },

  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing[2],
    marginBottom: spacing[4],
  },

  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing[1],
  },

  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  strengthLabel: {
    ...textStyles.caption,
    marginLeft: spacing[2],
    fontWeight: '600',
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing[2],
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    marginTop: 2,
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkboxError: {
    borderColor: colors.error,
  },

  termsText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },

  errorText: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing[1],
    marginLeft: spacing[8],
  },

  submitContainer: {
    marginTop: spacing[2],
  },

  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[4],
  },

  loginPromptText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  loginLink: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
