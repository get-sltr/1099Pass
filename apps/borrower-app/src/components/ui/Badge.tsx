/**
 * Badge Component
 * Status indicators, tags, and labels
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, textStyles } from '../../theme';

export type BadgeVariant = 'mint' | 'amber' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  label,
  children,
  variant = 'neutral',
  size = 'medium',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const displayText = label || (typeof children === 'string' ? children : '');

  const badgeStyles: StyleProp<ViewStyle> = [
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    style,
  ];

  const labelStyles: StyleProp<TextStyle> = [
    styles.text,
    variantTextStyles[variant],
    sizeTextStyles[size],
    textStyle,
  ];

  return (
    <View style={badgeStyles} accessibilityRole="text" accessibilityLabel={displayText}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={labelStyles} numberOfLines={1}>
        {displayText || children}
      </Text>
    </View>
  );
}

/**
 * Dot badge for minimal indicators
 */
export function DotBadge({
  variant = 'success',
  size = 'medium',
  style,
}: {
  variant?: BadgeVariant;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}) {
  const dotSize = size === 'small' ? 6 : size === 'medium' ? 8 : 10;

  return (
    <View
      style={[
        styles.dot,
        { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
        dotStyles[variant] || styles.neutralDot,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },

  // Variants - Background colors
  mint: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  amber: {
    backgroundColor: colors.amberSoft,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: colors.amberSoft,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: colors.info,
  },
  neutral: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primary,
  },

  // Sizes
  small: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    minHeight: 20,
  },
  medium: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    minHeight: 24,
  },
  large: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 32,
  },

  // Text styles
  text: {
    ...textStyles.caption,
    fontWeight: '600',
  },

  // Text colors by variant
  mintText: {
    color: colors.primary,
  },
  amberText: {
    color: '#92600E', // Darker amber for contrast
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: '#92600E',
  },
  errorText: {
    color: colors.error,
  },
  infoText: {
    color: colors.info,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  primaryText: {
    color: colors.textInverse,
  },

  // Size-specific text
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 11,
  },
  largeText: {
    fontSize: 13,
  },

  // Icon
  icon: {
    marginRight: spacing[1],
  },

  // Dot badge
  dot: {
    backgroundColor: colors.success,
  },
  mintDot: {
    backgroundColor: colors.mint,
  },
  amberDot: {
    backgroundColor: colors.secondary,
  },
  successDot: {
    backgroundColor: colors.success,
  },
  warningDot: {
    backgroundColor: colors.warning,
  },
  errorDot: {
    backgroundColor: colors.error,
  },
  infoDot: {
    backgroundColor: colors.info,
  },
  neutralDot: {
    backgroundColor: colors.textSecondary,
  },
  primaryDot: {
    backgroundColor: colors.primary,
  },
});

// Style mappings for type safety (defined after styles)
const variantStyles: Record<BadgeVariant, ViewStyle> = {
  mint: styles.mint,
  amber: styles.amber,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
  info: styles.info,
  neutral: styles.neutral,
  primary: styles.primary,
};

const sizeStyles: Record<BadgeSize, ViewStyle> = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

const variantTextStyles: Record<BadgeVariant, TextStyle> = {
  mint: styles.mintText,
  amber: styles.amberText,
  success: styles.successText,
  warning: styles.warningText,
  error: styles.errorText,
  info: styles.infoText,
  neutral: styles.neutralText,
  primary: styles.primaryText,
};

const sizeTextStyles: Record<BadgeSize, TextStyle> = {
  small: styles.smallText,
  medium: styles.mediumText,
  large: styles.largeText,
};

const dotStyles: Record<BadgeVariant, ViewStyle> = {
  mint: styles.mintDot,
  amber: styles.amberDot,
  success: styles.successDot,
  warning: styles.warningDot,
  error: styles.errorDot,
  info: styles.infoDot,
  neutral: styles.neutralDot,
  primary: styles.primaryDot,
};

export default Badge;
