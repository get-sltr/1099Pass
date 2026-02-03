/**
 * Profile Complete Screen
 * Final onboarding step - shows initial score and next steps
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, textStyles, borderRadius, getScoreColor, getLetterGrade } from '../../src/theme';

// Score gauge component
function ScoreGauge({ score, animated = true }: { score: number; animated?: boolean }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (animated) {
      // Animate the score counting up
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: score,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Update display score during animation
      animatedValue.addListener(({ value }) => {
        setDisplayScore(Math.round(value));
      });

      return () => {
        animatedValue.removeAllListeners();
      };
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);

  const letterGrade = getLetterGrade(displayScore);
  const scoreColor = getScoreColor(letterGrade);

  // Calculate gauge fill percentage (score is 0-1000)
  const fillPercentage = (displayScore / 1000) * 100;

  return (
    <Animated.View
      style={[
        styles.gaugeContainer,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <View style={styles.gaugeOuter}>
        <View style={[styles.gaugeFill, { backgroundColor: scoreColor }]}>
          <View style={styles.gaugeInner}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {displayScore}
            </Text>
            <Text style={[styles.letterGrade, { color: scoreColor }]}>
              {letterGrade}
            </Text>
          </View>
        </View>
        {/* Progress ring effect */}
        <View
          style={[
            styles.progressRing,
            {
              borderColor: scoreColor,
              borderTopColor: 'transparent',
              transform: [{ rotate: `${(fillPercentage / 100) * 360}deg` }],
            },
          ]}
        />
      </View>
      <Text style={styles.scoreLabel}>Loan Readiness Score</Text>
    </Animated.View>
  );
}

const NEXT_STEPS = [
  {
    icon: 'link-outline' as const,
    title: 'Connect more accounts',
    description: 'Link additional income sources to improve your score',
    action: 'connect',
  },
  {
    icon: 'document-text-outline' as const,
    title: 'Upload tax documents',
    description: 'Add 1099s or tax returns for stronger verification',
    action: 'documents',
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Build history',
    description: 'Keep earning consistently to demonstrate stability',
    action: 'info',
  },
];

export default function ProfileCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuthStore();
  const [showContent, setShowContent] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock initial score based on connected accounts
  const initialScore = 620;

  useEffect(() => {
    // Delay content fade-in after score animation
    const timer = setTimeout(() => {
      setShowContent(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/dashboard');
  };

  const handleNextStep = (action: string) => {
    switch (action) {
      case 'connect':
        router.push('/(onboarding)/connect-accounts');
        break;
      case 'documents':
        router.push('/(tabs)/documents');
        break;
      default:
        // Just info, no action
        break;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[4] },
      ]}
    >
      {/* Celebration header */}
      <View style={styles.header}>
        <View style={styles.celebrationIcon}>
          <Ionicons name="sparkles" size={32} color={colors.secondary} />
        </View>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your income profile is ready. Here's your initial loan readiness score.
        </Text>
      </View>

      {/* Score gauge */}
      <View style={styles.scoreSection}>
        <ScoreGauge score={initialScore} />
      </View>

      {/* Score breakdown */}
      <Animated.View style={[styles.contentSection, { opacity: fadeAnim }]}>
        <Card variant="mint" style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>What affects your score</Text>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownDot} />
            <Text style={styles.breakdownText}>Income consistency and history</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownDot} />
            <Text style={styles.breakdownText}>Number of verified income sources</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownDot} />
            <Text style={styles.breakdownText}>Documentation completeness</Text>
          </View>
        </Card>

        {/* Next steps */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>Improve Your Score</Text>
          {NEXT_STEPS.map((step, index) => (
            <Card
              key={index}
              variant="outlined"
              style={styles.stepCard}
              onPress={step.action !== 'info' ? () => handleNextStep(step.action) : undefined}
            >
              <View style={styles.stepContent}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {step.action !== 'info' && (
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                )}
              </View>
            </Card>
          ))}
        </View>
      </Animated.View>

      {/* Continue button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Dashboard"
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
          rightIcon="arrow-forward"
        />
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

  header: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  celebrationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  scoreSection: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },

  gaugeContainer: {
    alignItems: 'center',
  },

  gaugeOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.surface,
    borderWidth: 8,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  gaugeFill: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
    position: 'absolute',
  },

  gaugeInner: {
    alignItems: 'center',
  },

  progressRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: colors.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  scoreValue: {
    ...textStyles.scoreDisplay,
    fontSize: 48,
    lineHeight: 56,
  },

  letterGrade: {
    ...textStyles.h3,
    marginTop: -spacing[1],
  },

  scoreLabel: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },

  contentSection: {
    flex: 1,
  },

  breakdownCard: {
    marginBottom: spacing[6],
  },

  breakdownTitle: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  breakdownDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing[2],
  },

  breakdownText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },

  nextStepsSection: {
    marginBottom: spacing[4],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },

  stepCard: {
    marginBottom: spacing[2],
  },

  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  stepInfo: {
    flex: 1,
  },

  stepTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  stepDescription: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  buttonContainer: {
    paddingTop: spacing[4],
  },
});
