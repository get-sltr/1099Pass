import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems = [
    { label: 'Personal Information', icon: '👤' },
    { label: 'Linked Accounts', icon: '🔗' },
    { label: 'Subscription', icon: '⭐' },
    { label: 'Security', icon: '🔒' },
    { label: 'Notifications', icon: '🔔' },
    { label: 'Help & Support', icon: '❓' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0] || '?'}
            {user?.last_name?.[0] || ''}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.first_name || 'User'} {user?.last_name || ''}
        </Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>
            {user?.subscription_tier || 'FREE'} Plan
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>1099Pass v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  tierBadge: {
    marginTop: 16,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  menuArrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 32,
  },
});
