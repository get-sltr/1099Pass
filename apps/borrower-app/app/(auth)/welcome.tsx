/**
 * Welcome Screen
 * First screen users see - introduces 1099Pass
 */

import { View, Text, StyleSheet, Image, Dimensions, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, textStyles, borderRadius } from '../../src/theme';

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
  const { colors } = useTheme();
  const isDark = colors.background === '#050505';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing[8] }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoImageWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="1099Pass logo"
            />
          </View>
        </View>

        {/* Tagline */}
        <Text style={[styles.tagline, { color: colors.textPrimary }]}>Your Hustle.{'\n'}Your Proof.</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Finally, a way to prove your income as a gig worker or independent contractor.
        </Text>
      </View>

      {/* Value Props */}
      <View style={[styles.valuePropsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
        {VALUE_PROPS.map((prop, index) => (
          <View key={index} style={styles.valueProp}>
            <View style={[styles.valuePropIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
              <Ionicons name={prop.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.valuePropText, { color: colors.textPrimary }]}>{prop.text}</Text>
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
        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
          By continuing, you agree to our{' '}
          <Text style={[styles.termsLink, { color: colors.primary }]} onPress={() => Linking.openURL('https://1099pass.com/terms')}>
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text style={[styles.termsLink, { color: colors.primary }]} onPress={() => Linking.openURL('https://1099pass.com/privacy')}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  logoImageWrapper: {
    width: 220,
    height: 100,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoImage: {
    width: '100%',
    height: '100%',
  },

  tagline: {
    ...textStyles.h1,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 52,
  },

  subtitle: {
    ...textStyles.bodyLarge,
    textAlign: 'center',
    maxWidth: 320,
  },

  valuePropsContainer: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  valuePropText: {
    ...textStyles.body,
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
    textAlign: 'center',
    marginTop: spacing[4],
    lineHeight: 18,
  },

  termsLink: {
    fontWeight: '500',
  },
});
