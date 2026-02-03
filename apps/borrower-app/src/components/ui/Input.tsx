/**
 * Input Component
 * Text input with label, error states, and icons
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, layout, textStyles, fontFamilies } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  showPasswordToggle?: boolean;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      showPasswordToggle = false,
      required = false,
      secureTextEntry,
      editable = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = Boolean(error);
    const isSecure = secureTextEntry && !isPasswordVisible;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const inputContainerStyles = [
      styles.inputContainer,
      isFocused && styles.inputContainerFocused,
      hasError && styles.inputContainerError,
      !editable && styles.inputContainerDisabled,
      inputStyle,
    ];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}

        <View style={inputContainerStyles}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={layout.iconSize}
              color={isFocused ? colors.primary : colors.textSecondary}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            ]}
            placeholderTextColor={colors.inputPlaceholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isSecure}
            editable={editable}
            accessibilityLabel={label || props.placeholder}
            accessibilityHint={hint}
            accessibilityState={{
              disabled: !editable,
            }}
            {...props}
          />

          {showPasswordToggle && secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.rightIconButton}
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={layout.iconSize}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !showPasswordToggle && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconButton}
              disabled={!onRightIconPress}
              accessibilityRole={onRightIconPress ? 'button' : 'none'}
            >
              <Ionicons
                name={rightIcon}
                size={layout.iconSize}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {(error || hint) && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },

  label: {
    ...textStyles.label,
    color: colors.textPrimary,
  },

  required: {
    color: colors.error,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    minHeight: layout.inputHeight,
  },

  inputContainerFocused: {
    borderColor: colors.inputBorderFocused,
    borderWidth: 2,
  },

  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },

  inputContainerDisabled: {
    backgroundColor: colors.mintSoft,
    opacity: 0.7,
  },

  input: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 15,
    color: colors.textPrimary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: layout.inputHeight - 2,
  },

  inputWithLeftIcon: {
    paddingLeft: 0,
  },

  inputWithRightIcon: {
    paddingRight: 0,
  },

  leftIcon: {
    marginLeft: spacing[4],
    marginRight: spacing[2],
  },

  rightIconButton: {
    padding: spacing[3],
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helperText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },

  errorText: {
    color: colors.error,
  },
});

export default Input;
