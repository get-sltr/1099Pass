import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.greeting}>
          Welcome back, {user?.first_name || 'there'}!
        </Text>
        <Text style={styles.subtitle}>Here's your financial overview</Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Loan Readiness Score</Text>
        <Text style={styles.scoreValue}>--</Text>
        <Text style={styles.scoreHint}>Connect accounts to calculate</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/documents')}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionLabel}>Upload Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionLabel}>Link Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionLabel}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptyHint}>
            Upload documents or link accounts to get started
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  welcome: {
    padding: 24,
    backgroundColor: '#1E3A5F',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginTop: 4,
  },
  scoreCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  scoreHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptyHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});
