/**
 * Modal Component
 * Bottom sheet and centered modal variants
 */

import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, layout, textStyles, shadows } from '../../theme';

export type ModalVariant = 'center' | 'bottom';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: ModalVariant;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  scrollable?: boolean;
  maxHeight?: number | string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  variant = 'center',
  showCloseButton = true,
  closeOnBackdropPress = true,
  scrollable = false,
  maxHeight = '80%',
}: ModalProps) {
  const insets = useSafeAreaInsets();

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const contentStyle = [
    styles.content,
    variant === 'center' && styles.contentCenter,
    variant === 'bottom' && [
      styles.contentBottom,
      { paddingBottom: insets.bottom + spacing[4] },
    ],
  ];

  const renderContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View
        style={[
          contentStyle,
          typeof maxHeight === 'number'
            ? { maxHeight }
            : { maxHeight: SCREEN_HEIGHT * (parseFloat(maxHeight) / 100) },
        ]}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {title && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              )}
            </View>

            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Handle bar for bottom sheet */}
        {variant === 'bottom' && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}

        {/* Body */}
        {scrollable ? (
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.body}>{children}</View>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <RNModal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType={variant === 'bottom' ? 'slide' : 'fade'}
      statusBarTranslucent
    >
      {renderContent()}
    </RNModal>
  );
}

/**
 * Confirmation Modal - preset for common confirmation dialogs
 */
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      variant="center"
      showCloseButton={false}
    >
      <Text style={styles.confirmMessage}>{message}</Text>

      <View style={styles.confirmActions}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.confirmButton, styles.cancelButton]}
          accessibilityRole="button"
          accessibilityLabel={cancelText}
        >
          <Text style={styles.cancelButtonText}>{cancelText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onConfirm();
            onClose();
          }}
          style={[
            styles.confirmButton,
            confirmVariant === 'danger'
              ? styles.dangerButton
              : styles.primaryButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel={confirmText}
        >
          <Text style={styles.confirmButtonText}>{confirmText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },

  content: {
    backgroundColor: colors.surface,
    ...shadows.xl,
  },

  contentCenter: {
    marginHorizontal: spacing[4],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },

  contentBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
  },

  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },

  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },

  titleContainer: {
    flex: 1,
    marginRight: spacing[3],
  },

  title: {
    ...textStyles.h5,
    color: colors.textPrimary,
  },

  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  closeButton: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },

  bodyContent: {
    flexGrow: 1,
  },

  // Confirm Modal
  confirmMessage: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing[4],
  },

  confirmActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },

  confirmButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.buttonHeight,
  },

  cancelButton: {
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  dangerButton: {
    backgroundColor: colors.error,
  },

  cancelButtonText: {
    ...textStyles.button,
    color: colors.textPrimary,
  },

  confirmButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
});

export default Modal;
