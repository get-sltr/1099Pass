/**
 * Settings Screen
 * App settings and account management
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar, Badge, Modal, Button, useToast } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  showArrow?: boolean;
  dangerous?: boolean;
}

interface SettingToggle {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { showToast } = useToast();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/welcome');
  };

  const profileSettings: SettingItem[] = [
    {
      id: 'edit_profile',
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => router.push('/(tabs)/profile'),
      showArrow: true,
    },
    {
      id: 'change_password',
      icon: 'lock-closed-outline',
      label: 'Change Password',
      onPress: () => {
        showToast({
          type: 'info',
          title: 'Coming soon',
          message: 'Password change will be available soon',
        });
      },
      showArrow: true,
    },
    {
      id: 'linked_accounts',
      icon: 'link-outline',
      label: 'Linked Accounts',
      value: '3 connected',
      onPress: () => router.push('/(onboarding)/connect-accounts'),
      showArrow: true,
    },
  ];

  const notificationToggles: SettingToggle[] = [
    {
      id: 'push',
      icon: 'notifications-outline',
      label: 'Push Notifications',
      description: 'Get alerts for lender messages and updates',
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      id: 'email',
      icon: 'mail-outline',
      label: 'Email Notifications',
      description: 'Receive weekly income summaries',
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
  ];

  const securitySettings: SettingItem[] = [
    {
      id: 'biometric',
      icon: 'finger-print',
      label: 'Biometric Login',
      onPress: () => setBiometricLogin(!biometricLogin),
    },
    {
      id: 'two_factor',
      icon: 'shield-checkmark-outline',
      label: 'Two-Factor Authentication',
      badge: 'Enabled',
      onPress: () => {
        showToast({
          type: 'info',
          title: 'Coming soon',
          message: '2FA management will be available soon',
        });
      },
      showArrow: true,
    },
    {
      id: 'active_sessions',
      icon: 'phone-portrait-outline',
      label: 'Active Sessions',
      value: '2 devices',
      onPress: () => {
        showToast({
          type: 'info',
          title: 'Coming soon',
          message: 'Session management will be available soon',
        });
      },
      showArrow: true,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help_center',
      icon: 'help-circle-outline',
      label: 'Help Center',
      onPress: () => {
        showToast({
          type: 'info',
          title: 'Coming soon',
          message: 'Help center will be available soon',
        });
      },
      showArrow: true,
    },
    {
      id: 'contact_support',
      icon: 'chatbubble-outline',
      label: 'Contact Support',
      onPress: () => router.push('/(tabs)/messages'),
      showArrow: true,
    },
    {
      id: 'report_bug',
      icon: 'bug-outline',
      label: 'Report a Bug',
      onPress: () => {
        showToast({
          type: 'info',
          title: 'Coming soon',
          message: 'Bug reporting will be available soon',
        });
      },
      showArrow: true,
    },
  ];

  const legalSettings: SettingItem[] = [
    {
      id: 'terms',
      icon: 'document-text-outline',
      label: 'Terms of Service',
      showArrow: true,
    },
    {
      id: 'privacy',
      icon: 'shield-outline',
      label: 'Privacy Policy',
      showArrow: true,
    },
    {
      id: 'data_request',
      icon: 'download-outline',
      label: 'Request My Data',
      showArrow: true,
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      id: 'logout',
      icon: 'log-out-outline',
      label: 'Log Out',
      onPress: () => setShowLogoutModal(true),
      dangerous: true,
    },
    {
      id: 'delete_account',
      icon: 'trash-outline',
      label: 'Delete Account',
      onPress: () => {
        Alert.alert(
          'Delete Account',
          'This action cannot be undone. All your data will be permanently deleted.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                showToast({
                  type: 'info',
                  title: 'Coming soon',
                  message: 'Account deletion will be available soon',
                });
              },
            },
          ]
        );
      },
      dangerous: true,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={!item.onPress}
    >
      <View style={[styles.settingIcon, item.dangerous && styles.settingIconDanger]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.dangerous ? colors.error : colors.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, item.dangerous && styles.settingLabelDanger]}>
          {item.label}
        </Text>
        {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
        {item.badge && (
          <Badge variant="success" size="small">
            {item.badge}
          </Badge>
        )}
      </View>
      {item.showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  const renderSettingToggle = (toggle: SettingToggle) => (
    <View key={toggle.id} style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={toggle.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{toggle.label}</Text>
        {toggle.description && (
          <Text style={styles.settingDescription}>{toggle.description}</Text>
        )}
      </View>
      <Switch
        value={toggle.value}
        onValueChange={toggle.onToggle}
        trackColor={{ false: colors.border, true: colors.mintSoft }}
        thumbColor={toggle.value ? colors.primary : colors.surface}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile card */}
        <Card variant="default" style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileContent}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Avatar name={user?.firstName || 'U'} size="lg" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Account settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card variant="outlined" style={styles.settingsCard}>
            {profileSettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < profileSettings.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card variant="outlined" style={styles.settingsCard}>
            {notificationToggles.map((toggle, index) => (
              <View key={toggle.id}>
                {renderSettingToggle(toggle)}
                {index < notificationToggles.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Card variant="outlined" style={styles.settingsCard}>
            {/* Biometric toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="finger-print" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use Face ID or fingerprint
                </Text>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={setBiometricLogin}
                trackColor={{ false: colors.border, true: colors.mintSoft }}
                thumbColor={biometricLogin ? colors.primary : colors.surface}
              />
            </View>
            <View style={styles.divider} />
            {securitySettings.slice(1).map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < securitySettings.length - 2 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card variant="outlined" style={styles.settingsCard}>
            {supportSettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < supportSettings.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Card variant="outlined" style={styles.settingsCard}>
            {legalSettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < legalSettings.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Card variant="outlined" style={styles.settingsCard}>
            {dangerSettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < dangerSettings.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* App version */}
        <Text style={styles.version}>1099Pass v1.0.0</Text>
      </ScrollView>

      {/* Logout confirmation modal */}
      <Modal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </Text>
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowLogoutModal(false)}
              variant="ghost"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="Log Out"
              onPress={handleLogout}
              variant="danger"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing[4],
  },

  header: {
    paddingHorizontal: spacing[2],
    marginBottom: spacing[6],
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },

  profileCard: {
    marginBottom: spacing[6],
  },

  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },

  profileName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  profileEmail: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[0.5],
  },

  section: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },

  settingsCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },

  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  settingIconDanger: {
    backgroundColor: `${colors.error}15`,
  },

  settingContent: {
    flex: 1,
    marginRight: spacing[2],
  },

  settingLabel: {
    ...textStyles.body,
    color: colors.textPrimary,
  },

  settingLabelDanger: {
    color: colors.error,
  },

  settingValue: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  settingDescription: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing[14],
  },

  version: {
    ...textStyles.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },

  modalContent: {
    paddingTop: spacing[2],
  },

  modalText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing[6],
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },

  modalButton: {
    flex: 1,
  },
});
