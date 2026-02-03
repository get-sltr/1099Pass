/**
 * Avatar Component
 * User avatars with initials or image
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, textStyles } from '../../theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
}

const SIZES: Record<AvatarSize, { container: number; text: number; icon: number }> = {
  xs: { container: 24, text: 10, icon: 14 },
  sm: { container: 32, text: 12, icon: 18 },
  md: { container: 40, text: 14, icon: 22 },
  lg: { container: 48, text: 16, icon: 26 },
  xl: { container: 64, text: 20, icon: 32 },
  '2xl': { container: 80, text: 26, icon: 40 },
};

function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function getBackgroundColor(name: string): string {
  // Generate consistent color based on name
  if (!name) return colors.primaryLight;

  const colorOptions = [
    colors.primary,
    colors.primaryLight,
    '#3D9970', // Teal green
    '#2E8B57', // Sea green
    '#228B22', // Forest green
    '#6B8E23', // Olive drab
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colorOptions.length;
  return colorOptions[index]!;
}

export function Avatar({
  name,
  imageUrl,
  size = 'md',
  style,
  showBorder = false,
}: AvatarProps) {
  const sizeConfig = SIZES[size];
  const backgroundColor = getBackgroundColor(name || '');
  const initials = getInitials(name || '');

  const containerStyle = [
    styles.container,
    {
      width: sizeConfig.container,
      height: sizeConfig.container,
      borderRadius: sizeConfig.container / 2,
      backgroundColor,
    },
    showBorder && styles.border,
    style,
  ];

  if (imageUrl) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
            },
          ]}
          accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
        />
      </View>
    );
  }

  if (!name) {
    return (
      <View style={containerStyle}>
        <Ionicons
          name="person"
          size={sizeConfig.icon}
          color={colors.textInverse}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle} accessibilityLabel={`${name}'s avatar`}>
      <Text
        style={[
          styles.initials,
          { fontSize: sizeConfig.text },
        ]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );
}

/**
 * Avatar Group for showing multiple avatars stacked
 */
interface AvatarGroupProps {
  users: Array<{ name?: string; imageUrl?: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({
  users,
  max = 4,
  size = 'sm',
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  const sizeConfig = SIZES[size];

  return (
    <View style={styles.group}>
      {visibleUsers.map((user, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginLeft: index > 0 ? -sizeConfig.container / 3 : 0 },
          ]}
        >
          <Avatar
            name={user.name}
            imageUrl={user.imageUrl}
            size={size}
            showBorder
          />
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          style={[
            styles.remainingCount,
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
              marginLeft: -sizeConfig.container / 3,
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: sizeConfig.text - 2 }]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  border: {
    borderWidth: 2,
    borderColor: colors.surface,
  },

  image: {
    resizeMode: 'cover',
  },

  initials: {
    color: colors.textInverse,
    fontWeight: '600',
    fontFamily: textStyles.body.fontFamily,
  },

  // Avatar Group
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  groupItem: {
    zIndex: 1,
  },

  remainingCount: {
    backgroundColor: colors.mintSoft,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  remainingText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default Avatar;
