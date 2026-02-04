/**
 * Profile Screen
 * View and edit user profile
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, Avatar, useToast } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    // TODO: Save profile changes
    showToast({
      type: 'success',
      title: 'Profile updated',
      message: 'Your changes have been saved',
    });
    setIsEditing(false);
  };

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <Avatar name={user?.first_name || 'U'} size="2xl" />
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile info */}
        <Card variant="outlined" style={styles.infoCard}>
          {isEditing ? (
            <>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(v) => setFormData((prev) => ({ ...prev, firstName: v }))}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(v) => setFormData((prev) => ({ ...prev, lastName: v }))}
              />
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(v) => setFormData((prev) => ({ ...prev, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChangeText={(v) => setFormData((prev) => ({ ...prev, phone: v }))}
                keyboardType="phone-pad"
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>Not set</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member since</Text>
                <Text style={styles.infoValue}>January 2024</Text>
              </View>
            </>
          )}
        </Card>

        {isEditing && (
          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="large"
            fullWidth
            style={styles.saveButton}
          />
        )}

        {/* Verification status */}
        {!isEditing && (
          <Card variant="mint" style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <Text style={styles.verificationTitle}>Identity Verified</Text>
            </View>
            <Text style={styles.verificationText}>
              Your identity was verified on January 15, 2024
            </Text>
          </Card>
        )}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing[2],
  },

  title: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },

  editButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },

  editButtonText: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },

  changePhotoText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing[1],
  },

  infoCard: {
    marginBottom: spacing[4],
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },

  infoLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  infoValue: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  saveButton: {
    marginBottom: spacing[6],
  },

  verificationCard: {
    marginBottom: spacing[4],
  },

  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  verificationTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing[2],
  },

  verificationText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
});
