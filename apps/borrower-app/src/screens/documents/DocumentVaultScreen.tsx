import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockDocuments = [
  { id: '1', type: 'TAX_RETURN', filename: '2023_tax_return.pdf', status: 'VERIFIED' },
  { id: '2', type: 'FORM_1099', filename: 'uber_1099.pdf', status: 'PENDING' },
];

export function DocumentVaultScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockDocuments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.documentCard}>
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>PDF</Text>
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{item.filename}</Text>
              <Text style={styles.documentType}>{item.type.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'VERIFIED' ? styles.verified : styles.pending]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16 },
  documentCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  iconPlaceholder: { width: 48, height: 48, backgroundColor: '#e8e8e8', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 12, color: '#666' },
  documentInfo: { flex: 1, marginLeft: 12 },
  documentName: { fontSize: 16, fontWeight: '600', color: '#333' },
  documentType: { fontSize: 14, color: '#666', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verified: { backgroundColor: '#d4edda' },
  pending: { backgroundColor: '#fff3cd' },
  statusText: { fontSize: 10, fontWeight: '600' },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, backgroundColor: '#1B2B5E', borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { fontSize: 32, color: '#fff' },
});
