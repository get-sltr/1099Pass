/**
 * LoadingSpinner Component
 * Various loading indicators and skeleton screens
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, spacing, textStyles, borderRadius } from '../../theme';

export type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<SpinnerSize, 'small' | 'large'> = {
  small: 'small',
  medium: 'small',
  large: 'large',
};

export function LoadingSpinner({
  size = 'medium',
  color = colors.primary,
  message,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={SIZES[size]} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={SIZES[size]} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

/**
 * Skeleton placeholder for loading content
 */
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius: radius = borderRadius.md,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.skeletonBase, colors.skeletonHighlight, colors.skeletonBase],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton Text - preset for text placeholders
 */
interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number | string;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.skeletonTextContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={14}
          style={index > 0 ? styles.skeletonTextLine : undefined}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton Card - preset for card placeholders
 */
interface SkeletonCardProps {
  style?: StyleProp<ViewStyle>;
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showContent?: boolean;
}

export function SkeletonCard({
  style,
  showAvatar = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
}: SkeletonCardProps) {
  return (
    <View style={[styles.skeletonCard, style]}>
      {/* Header row */}
      <View style={styles.skeletonCardHeader}>
        {showAvatar && (
          <Skeleton
            width={40}
            height={40}
            borderRadius={20}
            style={styles.skeletonAvatar}
          />
        )}
        <View style={styles.skeletonCardTitleContainer}>
          {showTitle && <Skeleton width="70%" height={16} />}
          {showSubtitle && (
            <Skeleton width="50%" height={12} style={{ marginTop: spacing[2] }} />
          )}
        </View>
      </View>

      {/* Content */}
      {showContent && (
        <View style={styles.skeletonCardContent}>
          <SkeletonText lines={2} lastLineWidth="80%" />
        </View>
      )}
    </View>
  );
}

/**
 * Loading Overlay - covers content while loading
 */
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
}

/**
 * Pulse animation for score reveal
 */
interface PulseLoaderProps {
  size?: number;
  color?: string;
}

export function PulseLoader({
  size = 60,
  color = colors.primary,
}: PulseLoaderProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },

  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  message: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[3],
    textAlign: 'center',
  },

  // Skeleton
  skeleton: {
    overflow: 'hidden',
  },

  skeletonTextContainer: {
    width: '100%',
  },

  skeletonTextLine: {
    marginTop: spacing[2],
  },

  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },

  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  skeletonAvatar: {
    marginRight: spacing[3],
  },

  skeletonCardTitleContainer: {
    flex: 1,
  },

  skeletonCardContent: {
    marginTop: spacing[4],
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 253, 248, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  overlayContent: {
    alignItems: 'center',
    padding: spacing[6],
  },

  overlayMessage: {
    ...textStyles.body,
    color: colors.textPrimary,
    marginTop: spacing[4],
    textAlign: 'center',
  },

  // Pulse
  pulse: {
    position: 'absolute',
  },
});

export default LoadingSpinner;
