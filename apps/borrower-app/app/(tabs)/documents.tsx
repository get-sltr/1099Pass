/**
 * Documents Screen
 * View and upload income documents
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
import * as DocumentPicker from 'expo-document-picker';
import { Button, Card, Badge, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type DocumentType = 'tax_return' | '1099' | 'bank_statement' | 'pay_stub' | 'other';
type DocumentStatus = 'verified' | 'pending' | 'rejected';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
  fileSize: string;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: '2023_Tax_Return.pdf',
    type: 'tax_return',
    status: 'verified',
    uploadedAt: '2024-01-15',
    fileSize: '2.4 MB',
  },
  {
    id: '2',
    name: 'Uber_1099_2023.pdf',
    type: '1099',
    status: 'verified',
    uploadedAt: '2024-01-14',
    fileSize: '156 KB',
  },
  {
    id: '3',
    name: 'DoorDash_1099_2023.pdf',
    type: '1099',
    status: 'pending',
    uploadedAt: '2024-01-18',
    fileSize: '142 KB',
  },
  {
    id: '4',
    name: 'Chase_Statement_Dec.pdf',
    type: 'bank_statement',
    status: 'verified',
    uploadedAt: '2024-01-10',
    fileSize: '890 KB',
  },
];

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'tax_return', label: 'Tax Return', icon: 'document-text-outline' },
  { type: '1099', label: '1099 Form', icon: 'receipt-outline' },
  { type: 'bank_statement', label: 'Bank Statement', icon: 'card-outline' },
  { type: 'pay_stub', label: 'Pay Stub', icon: 'cash-outline' },
  { type: 'other', label: 'Other', icon: 'folder-outline' },
];

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [isUploading, setIsUploading] = useState(false);

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const pendingCount = documents.filter((d) => d.status === 'pending').length;

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setIsUploading(true);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const file = result.assets[0];
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: 'other',
        status: 'pending',
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: `${Math.round((file.size || 0) / 1024)} KB`,
      };

      setDocuments((prev) => [newDocument, ...prev]);

      showToast({
        type: 'success',
        title: 'Document uploaded',
        message: 'We\'ll verify your document shortly',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: 'Please try again',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    showToast({
      type: 'info',
      title: 'Document deleted',
    });
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
    }
  };

  const getDocumentIcon = (type: DocumentType): keyof typeof Ionicons.glyphMap => {
    return DOCUMENT_TYPES.find((t) => t.type === type)?.icon || 'document-outline';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>
              Upload and manage your income documents
            </Text>
          </View>
        </View>

        {/* Summary card */}
        <Card variant="mint" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{documents.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {verifiedCount}
              </Text>
              <Text style={styles.summaryLabel}>Verified</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>
                {pendingCount}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </View>
        </Card>

        {/* Upload button */}
        <Button
          title="Upload Document"
          onPress={handleUploadDocument}
          variant="primary"
          size="large"
          fullWidth
          leftIcon="cloud-upload-outline"
          loading={isUploading}
          style={styles.uploadButton}
        />

        {/* Documents list */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Your Documents</Text>

          {documents.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No documents yet</Text>
              <Text style={styles.emptySubtitle}>
                Upload tax returns, 1099s, or bank statements
              </Text>
            </Card>
          ) : (
            documents.map((document) => (
              <Card key={document.id} variant="outlined" style={styles.documentCard}>
                <View style={styles.documentRow}>
                  <View style={styles.documentIcon}>
                    <Ionicons
                      name={getDocumentIcon(document.type)}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={1}>
                      {document.name}
                    </Text>
                    <View style={styles.documentMeta}>
                      <Text style={styles.documentMetaText}>
                        {formatDate(document.uploadedAt)}
                      </Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.documentMetaText}>{document.fileSize}</Text>
                    </View>
                  </View>
                  {getStatusBadge(document.status)}
                </View>

                <View style={styles.documentActions}>
                  <TouchableOpacity style={styles.documentAction}>
                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                    <Text style={styles.documentActionText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.documentAction}>
                    <Ionicons name="download-outline" size={18} color={colors.primary} />
                    <Text style={styles.documentActionText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.documentAction}
                    onPress={() => handleDeleteDocument(document.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.documentActionText, { color: colors.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Info card */}
        <Card variant="default" style={styles.infoCard}>
          <Text style={styles.infoTitle}>Accepted documents</Text>
          <View style={styles.infoList}>
            {DOCUMENT_TYPES.slice(0, 4).map((type) => (
              <View key={type.type} style={styles.infoItem}>
                <Ionicons name={type.icon} size={16} color={colors.textSecondary} />
                <Text style={styles.infoItemText}>{type.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.infoNote}>
            PDF and image formats accepted. Max file size: 10 MB
          </Text>
        </Card>
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
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing[2],
    marginRight: spacing[2],
  },

  headerContent: {
    flex: 1,
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  summaryCard: {
    marginBottom: spacing[4],
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },

  summaryLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  uploadButton: {
    marginBottom: spacing[6],
  },

  documentsSection: {
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

  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },

  emptyTitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },

  emptySubtitle: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    textAlign: 'center',
  },

  documentCard: {
    marginBottom: spacing[3],
  },

  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  documentInfo: {
    flex: 1,
    marginRight: spacing[2],
  },

  documentName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[0.5],
  },

  documentMetaText: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: spacing[2],
  },

  documentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
  },

  documentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingRight: spacing[4],
  },

  documentActionText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing[1],
  },

  infoCard: {
    marginBottom: spacing[4],
  },

  infoTitle: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  infoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[3],
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoItemText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginLeft: spacing[1],
  },

  infoNote: {
    ...textStyles.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});
