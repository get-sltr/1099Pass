/**
 * Offline Banner Component
 * Shows a banner when the device is offline
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addNetworkListener, getNetworkStatus } from '../services/api';
import { colors, spacing, textStyles } from '../theme';

interface Props {
  showWhenOnline?: boolean;
  message?: string;
}

export function OfflineBanner({ showWhenOnline = false, message }: Props) {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const [wasOffline, setWasOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];

  useEffect(() => {
    const unsubscribe = addNetworkListener((online) => {
      setIsOnline(online);

      if (!online) {
        setWasOffline(true);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const shouldShow = !isOnline || (showWhenOnline && wasOffline && isOnline);

    Animated.spring(slideAnim, {
      toValue: shouldShow ? 0 : -60,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();

    // Auto-hide "back online" message after 3 seconds
    if (showWhenOnline && wasOffline && isOnline) {
      const timeout = setTimeout(() => {
        setWasOffline(false);
        Animated.spring(slideAnim, {
          toValue: -60,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, wasOffline, showWhenOnline]);

  const getBannerContent = () => {
    if (!isOnline) {
      return {
        icon: 'cloud-offline-outline' as const,
        text: message || 'You are offline. Some features may be unavailable.',
        backgroundColor: colors.warning,
        textColor: '#000',
      };
    }

    if (wasOffline && isOnline) {
      return {
        icon: 'checkmark-circle-outline' as const,
        text: 'Back online!',
        backgroundColor: colors.success,
        textColor: '#fff',
      };
    }

    return null;
  };

  const content = getBannerContent();

  if (!content) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: content.backgroundColor,
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.content}>
        <Ionicons name={content.icon} size={18} color={content.textColor} />
        <Text style={[styles.text, { color: content.textColor }]}>
          {content.text}
        </Text>
      </View>
    </Animated.View>
  );
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(getNetworkStatus());

  useEffect(() => {
    const unsubscribe = addNetworkListener(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },

  text: {
    ...textStyles.bodySmall,
    fontWeight: '500',
    marginLeft: spacing[2],
    textAlign: 'center',
  },
});

export default OfflineBanner;
