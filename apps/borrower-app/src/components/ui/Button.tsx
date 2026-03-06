/**
 * Button Component
 * Primary CTA with pill shape, supports multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius, spacing, layout, textStyles as themeTextStyles, shadows } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: string; // Ionicon name
  rightIcon?: string; // Ionicon name
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  hapticFeedback = true,
}: ButtonProps) {
  const { colors } = useTheme();
  const handlePress = () => {
    if (disabled || loading) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const buttonStyles = [
    styles.base,
    variant === 'primary' && { backgroundColor: colors.primary, ...shadows.sm },
    variant === 'secondary' && { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    variant === 'danger' && { backgroundColor: colors.error, ...shadows.sm },
    variant === 'mint' && { backgroundColor: colors.mint, ...shadows.sm },
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStylesArray = [
    styles.text,
    { color: colors.textPrimary },
    variant === 'primary' && { color: colors.textInverse },
    variant === 'secondary' && { color: colors.primary },
    variant === 'ghost' && { color: colors.primary },
    variant === 'danger' && { color: colors.textInverse },
    variant === 'mint' && { color: colors.primary },
    styles[`${size}Text` as keyof typeof styles],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  const spinnerColor = variant === 'primary' || variant === 'danger'
    ? colors.textInverse
    : colors.primary;

  const iconColor = variant === 'primary' || variant === 'danger'
    ? colors.textInverse
    : colors.primary;

  const iconSize = size === 'small' ? 16 : size === 'large' ? 22 : 20;

  // Determine what to render on left/right
  const renderLeftIcon = leftIcon ? (
    <Ionicons name={leftIcon as any} size={iconSize} color={iconColor} style={styles.iconLeft as StyleProp<TextStyle>} />
  ) : icon && iconPosition === 'left' ? (
    <View style={styles.iconLeft}>{icon}</View>
  ) : null;

  const renderRightIcon = rightIcon ? (
    <Ionicons name={rightIcon as any} size={iconSize} color={iconColor} style={styles.iconRight as StyleProp<TextStyle>} />
  ) : icon && iconPosition === 'right' ? (
    <View style={styles.iconRight}>{icon}</View>
  ) : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={buttonStyles}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {renderLeftIcon}
          <Text style={textStylesArray as StyleProp<TextStyle>}>{title}</Text>
          {renderRightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
  },

  small: {
    height: layout.buttonHeightSmall,
    paddingHorizontal: spacing[4],
  },
  medium: {
    height: layout.buttonHeight,
    paddingHorizontal: spacing[6],
  },
  large: {
    height: layout.buttonHeightLarge,
    paddingHorizontal: spacing[8],
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    ...themeTextStyles.button,
  },
  smallText: {
    ...themeTextStyles.buttonSmall,
  },
  mediumText: {
    ...themeTextStyles.button,
  },
  largeText: {
    ...themeTextStyles.buttonLarge,
  },

  disabledText: {
    opacity: 0.7,
  },

  iconLeft: {
    marginRight: spacing[2],
  } as ViewStyle,
  iconRight: {
    marginLeft: spacing[2],
  } as ViewStyle,
});

export default Button;
