import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement registration API call
      Alert.alert('Success', 'Account created! Please sign in.');
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Registration Failed', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>1099Pass</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
              />
            </View>
          </View>

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

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
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
    marginTop: 60,
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
