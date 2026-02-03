import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>1099Pass</Text>
        <Text style={styles.tagline}>Your gig income, lender-ready</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B2B5E', justifyContent: 'space-between', padding: 24 },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 18, color: '#00B4D8', marginTop: 12 },
  buttonContainer: { paddingBottom: 40 },
  button: { paddingVertical: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: '#00B4D8' },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff' },
  secondaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
