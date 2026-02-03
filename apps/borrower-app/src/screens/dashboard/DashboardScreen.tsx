import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.subtitle}>Your financial profile summary</Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Loan Readiness Score</Text>
        <Text style={styles.scoreValue}>78</Text>
        <Text style={styles.scoreDescription}>Good standing</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income Summary</Text>
        <View style={styles.incomeCard}>
          <Text style={styles.incomeLabel}>Annual Income</Text>
          <Text style={styles.incomeValue}>$72,000</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>Generate Report</Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>Upload Document</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, backgroundColor: '#1B2B5E' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#00B4D8', marginTop: 4 },
  scoreCard: { backgroundColor: '#fff', margin: 16, padding: 24, borderRadius: 12, alignItems: 'center', elevation: 2 },
  scoreLabel: { fontSize: 14, color: '#666' },
  scoreValue: { fontSize: 64, fontWeight: 'bold', color: '#1B2B5E', marginVertical: 8 },
  scoreDescription: { fontSize: 16, color: '#00B4D8' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  incomeCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  incomeLabel: { fontSize: 14, color: '#666' },
  incomeValue: { fontSize: 28, fontWeight: 'bold', color: '#1B2B5E', marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#1B2B5E', fontWeight: '600' },
});
