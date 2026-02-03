/**
 * Welcome Screen
 * First screen users see - introduces 1099Pass
 */

import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VALUE_PROPS = [
  {
    icon: 'shield-checkmark-outline' as const,
    text: 'Verify your real income from any gig or 1099 work',
  },
  {
    icon: 'trending-up-outline' as const,
    text: 'Build your loan readiness score over time',
  },
  {
    icon: 'document-text-outline' as const,
    text: 'Share verified reports with lenders instantly',
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing[8] }]}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Logo placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="wallet" size={40} color={colors.textInverse} />
          </View>
          <Text style={styles.logoText}>1099Pass</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Your Hustle.{'\n'}Your Proof.</Text>
        <Text style={styles.subtitle}>
          Finally, a way to prove your income as a gig worker or independent contractor.
        </Text>
      </View>

      {/* Value Props */}
      <View style={styles.valuePropsContainer}>
        {VALUE_PROPS.map((prop, index) => (
          <View key={index} style={styles.valueProp}>
            <View style={styles.valuePropIcon}>
              <Ionicons name={prop.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.valuePropText}>{prop.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA Buttons */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(auth)/signup')}
          variant="primary"
          size="large"
          fullWidth
          accessibilityLabel="Create an account"
        />

        <Button
          title="I Have an Account"
          onPress={() => router.push('/(auth)/login')}
          variant="secondary"
          size="large"
          fullWidth
          style={styles.secondaryButton}
          accessibilityLabel="Sign in to existing account"
        />

        {/* Terms text */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing[6],
  },

  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing[8],
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },

  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },

  logoText: {
    ...textStyles.h3,
    color: colors.primary,
    letterSpacing: -0.5,
  },

  tagline: {
    ...textStyles.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 52,
  },

  subtitle: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },

  valuePropsContainer: {
    backgroundColor: colors.mintSoft,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
  },

  valueProp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[2],
  },

  valuePropIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  valuePropText: {
    ...textStyles.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },

  ctaContainer: {
    paddingTop: spacing[4],
  },

  secondaryButton: {
    marginTop: spacing[3],
  },

  termsText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing[4],
    lineHeight: 18,
  },

  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
});
