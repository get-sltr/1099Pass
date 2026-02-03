import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentType } from '@1099pass/shared';

interface UploadedDocument {
  id: string;
  name: string;
  type: DocumentType;
  uploadedAt: Date;
  status: 'processing' | 'verified' | 'rejected';
}

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const newDoc: UploadedDocument = {
          id: Date.now().toString(),
          name: file.name,
          type: 'TAX_RETURN' as DocumentType,
          uploadedAt: new Date(),
          status: 'processing',
        };
        setDocuments((prev) => [newDoc, ...prev]);
        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch {
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const getStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'processing':
        return '#F59E0B';
      case 'verified':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Documents</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyText}>
              Upload tax returns, bank statements, or 1099 forms to build your
              financial profile
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleUpload}
            >
              <Text style={styles.emptyButtonText}>Upload First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.documentCard}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentMeta}>
                  {doc.type.replace('_', ' ')} •{' '}
                  {doc.uploadedAt.toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(doc.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(doc.status) },
                  ]}
                >
                  {doc.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  uploadButton: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  documentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  documentMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
