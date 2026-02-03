/**
 * Card Component
 * Reusable container with shadow and border
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing, shadows, borderWidth } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'mint' | 'amber';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large';
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'medium',
  accessibilityLabel,
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding${capitalize(padding)}` as keyof typeof styles],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={cardStyles}
        activeOpacity={0.95}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  default: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    ...shadows.sm,
  },

  elevated: {
    borderWidth: 0,
    ...shadows.md,
  },

  outlined: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  mint: {
    backgroundColor: colors.mintSoft,
    borderWidth: borderWidth.thin,
    borderColor: colors.mint,
  },

  amber: {
    backgroundColor: colors.amberSoft,
    borderWidth: borderWidth.thin,
    borderColor: colors.secondary,
  },

  // Padding variants
  paddingNone: {
    padding: 0,
  },

  paddingSmall: {
    padding: spacing[3],
  },

  paddingMedium: {
    padding: spacing[4],
  },

  paddingLarge: {
    padding: spacing[6],
  },
});

export default Card;
