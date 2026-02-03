import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/auth-store';

export function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Subscription</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notification Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Security</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Accounts</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Manage Income Sources</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, textTransform: 'uppercase' },
  menuItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8 },
  menuText: { fontSize: 16, color: '#333' },
  logoutButton: { backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center' },
  logoutText: { fontSize: 16, color: '#dc3545', fontWeight: '600' },
});
