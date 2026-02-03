import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement password reset API call
      setIsEmailSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to {email}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>1099Pass</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you instructions to reset your
          password.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="your@email.com"
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Back to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginTop: 80,
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerLink: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#10B981',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
