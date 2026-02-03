import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockReports = [
  { id: '1', type: 'MORTGAGE_READY', date: '2024-01-15', status: 'READY' },
  { id: '2', type: 'AUTO_LOAN_READY', date: '2024-01-10', status: 'READY' },
];

export function ReportsListScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.generateButton}>
        <Text style={styles.generateButtonText}>+ Generate New Report</Text>
      </TouchableOpacity>

      <FlatList
        data={mockReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View>
              <Text style={styles.reportType}>{item.type.replace('_', ' ')}</Text>
              <Text style={styles.reportDate}>{item.date}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  generateButton: { backgroundColor: '#1B2B5E', margin: 16, padding: 16, borderRadius: 8, alignItems: 'center' },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listContent: { padding: 16 },
  reportCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportType: { fontSize: 16, fontWeight: '600', color: '#333' },
  reportDate: { fontSize: 14, color: '#666', marginTop: 4 },
  statusBadge: { backgroundColor: '#d4edda', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#155724', fontSize: 12, fontWeight: '600' },
});
