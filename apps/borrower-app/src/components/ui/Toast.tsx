/**
 * Toast Component
 * Notification toasts with auto-dismiss
 */

import React, { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, textStyles, shadows, layout } from '../../theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextValue {
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

const TOAST_COLORS: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: colors.success,
    border: colors.success,
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: colors.error,
    border: colors.error,
  },
  warning: {
    bg: colors.amberSoft,
    icon: colors.warning,
    border: colors.warning,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: colors.info,
    border: colors.info,
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ToastItemProps {
  toast: ToastConfig;
  onHide: () => void;
}

function ToastItem({ toast, onHide }: ToastItemProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const toastColors = TOAST_COLORS[toast.type];

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: toastColors.bg,
          borderLeftColor: toastColors.border,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={TOAST_ICONS[toast.type]}
            size={24}
            color={toastColors.icon}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {toast.title}
          </Text>
          {toast.message && (
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
          )}
        </View>

        {toast.action && (
          <TouchableOpacity
            onPress={() => {
              toast.action?.onPress();
              hideToast();
            }}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
          >
            <Text style={[styles.actionText, { color: toastColors.icon }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={hideToast}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...config, id }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View
        style={[styles.toastsContainer, { top: insets.top + spacing[2] }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/**
 * Standalone Toast component for manual rendering
 */
interface StandaloneToastProps {
  visible: boolean;
  onHide: () => void;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function Toast({
  visible,
  onHide,
  type,
  title,
  message,
  action,
}: StandaloneToastProps) {
  if (!visible) return null;

  return (
    <ToastItem
      toast={{
        id: 'standalone',
        type,
        title,
        message,
        action,
        duration: 10000, // Longer for standalone since user controls visibility
      }}
      onHide={onHide}
    />
  );
}

const styles = StyleSheet.create({
  toastsContainer: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },

  toastContainer: {
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    marginBottom: spacing[2],
    ...shadows.md,
    backgroundColor: colors.surface,
  },

  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[3],
    paddingRight: spacing[10],
  },

  iconContainer: {
    marginRight: spacing[3],
    marginTop: spacing[1],
  },

  textContainer: {
    flex: 1,
    marginRight: spacing[2],
  },

  title: {
    ...textStyles.label,
    color: colors.textPrimary,
  },

  message: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  actionButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minWidth: layout.minTouchTarget,
  },

  actionText: {
    ...textStyles.buttonSmall,
  },

  closeButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Toast;
