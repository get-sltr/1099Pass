/**
 * Reports Screen
 * View and generate income verification reports
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
import { Button, Card, Badge, Modal, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type ReportStatus = 'active' | 'expired' | 'revoked';
type ReportPeriod = '3months' | '6months' | '12months' | 'ytd';

interface Report {
  id: string;
  createdAt: string;
  expiresAt: string;
  period: ReportPeriod;
  recipient: string;
  status: ReportStatus;
  accessCount: number;
}

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    createdAt: '2024-01-15',
    expiresAt: '2024-02-15',
    period: '12months',
    recipient: 'Quick Mortgage Co.',
    status: 'active',
    accessCount: 3,
  },
  {
    id: '2',
    createdAt: '2024-01-10',
    expiresAt: '2024-01-25',
    period: '6months',
    recipient: 'Auto Finance Plus',
    status: 'expired',
    accessCount: 1,
  },
  {
    id: '3',
    createdAt: '2023-12-20',
    expiresAt: '2024-01-05',
    period: '3months',
    recipient: 'Credit Union One',
    status: 'revoked',
    accessCount: 0,
  },
];

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: '3months', label: '3 Months' },
  { value: '6months', label: '6 Months' },
  { value: '12months', label: '12 Months' },
  { value: 'ytd', label: 'Year to Date' },
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('12months');
  const [recipientName, setRecipientName] = useState('');

  const activeReports = reports.filter((r) => r.status === 'active');

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'expired':
        return <Badge variant="neutral">Expired</Badge>;
      case 'revoked':
        return <Badge variant="error">Revoked</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPeriodLabel = (period: ReportPeriod) => {
    return PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;
  };

  const handleCreateReport = () => {
    const newReport: Report = {
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period: selectedPeriod,
      recipient: recipientName || 'General Purpose',
      status: 'active',
      accessCount: 0,
    };

    setReports((prev) => [newReport, ...prev]);
    setShowCreateModal(false);
    setRecipientName('');

    showToast({
      type: 'success',
      title: 'Report created',
      message: 'Your income verification report is ready to share',
    });
  };

  const handleRevokeReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: 'revoked' as ReportStatus } : r
      )
    );

    showToast({
      type: 'info',
      title: 'Access revoked',
      message: 'The recipient can no longer view this report',
    });
  };

  const handleShareReport = (report: Report) => {
    // TODO: Implement sharing functionality
    showToast({
      type: 'success',
      title: 'Link copied',
      message: 'Share link copied to clipboard',
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
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>
            Create and manage your income verification reports
          </Text>
        </View>

        {/* Summary card */}
        <Card variant="mint" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{activeReports.length}</Text>
              <Text style={styles.summaryLabel}>Active Reports</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{reports.length}</Text>
              <Text style={styles.summaryLabel}>Total Created</Text>
            </View>
          </View>
        </Card>

        {/* Create new report button */}
        <Button
          title="Create New Report"
          onPress={() => setShowCreateModal(true)}
          variant="primary"
          size="large"
          fullWidth
          leftIcon="add-circle-outline"
          style={styles.createButton}
        />

        {/* Reports list */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Your Reports</Text>

          {reports.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first income verification report
              </Text>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} variant="outlined" style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportIcon}>
                    <Ionicons name="document-text" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportRecipient}>{report.recipient}</Text>
                    <Text style={styles.reportPeriod}>
                      {getPeriodLabel(report.period)} Report
                    </Text>
                  </View>
                  {getStatusBadge(report.status)}
                </View>

                <View style={styles.reportMeta}>
                  <View style={styles.reportMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                    <Text style={styles.reportMetaText}>
                      Created {formatDate(report.createdAt)}
                    </Text>
                  </View>
                  {report.status === 'active' && (
                    <View style={styles.reportMetaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                      <Text style={styles.reportMetaText}>
                        Expires {formatDate(report.expiresAt)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.reportMetaItem}>
                    <Ionicons name="eye-outline" size={14} color={colors.textTertiary} />
                    <Text style={styles.reportMetaText}>
                      Viewed {report.accessCount} times
                    </Text>
                  </View>
                </View>

                {report.status === 'active' && (
                  <View style={styles.reportActions}>
                    <TouchableOpacity
                      style={styles.reportAction}
                      onPress={() => handleShareReport(report)}
                    >
                      <Ionicons name="share-outline" size={18} color={colors.primary} />
                      <Text style={styles.reportActionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.reportAction}
                      onPress={() => handleRevokeReport(report.id)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                      <Text style={[styles.reportActionText, { color: colors.error }]}>
                        Revoke
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>

        {/* Info card */}
        <Card variant="default" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>Your data is protected</Text>
          </View>
          <Text style={styles.infoText}>
            Reports are encrypted and can only be viewed by recipients you authorize.
            You can revoke access at any time.
          </Text>
        </Card>
      </ScrollView>

      {/* Create report modal */}
      <Modal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Report"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Report Period</Text>
          <View style={styles.periodOptions}>
            {PERIOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodOption,
                  selectedPeriod === option.value && styles.periodOptionSelected,
                ]}
                onPress={() => setSelectedPeriod(option.value)}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    selectedPeriod === option.value && styles.periodOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.modalLabel, { marginTop: spacing[4] }]}>
            Recipient Name (Optional)
          </Text>
          <TouchableOpacity style={styles.recipientInput}>
            <Ionicons name="business-outline" size={20} color={colors.textTertiary} />
            <Text style={styles.recipientPlaceholder}>
              {recipientName || 'e.g., Quick Mortgage Co.'}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalInfo}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
            <Text style={styles.modalInfoText}>
              Reports are valid for 30 days and can be revoked at any time
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowCreateModal(false)}
              variant="ghost"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="Create Report"
              onPress={handleCreateReport}
              variant="primary"
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
    marginHorizontal: spacing[4],
  },

  createButton: {
    marginBottom: spacing[6],
  },

  reportsSection: {
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
  },

  reportCard: {
    marginBottom: spacing[3],
  },

  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  reportInfo: {
    flex: 1,
  },

  reportRecipient: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  reportPeriod: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  reportMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
    marginBottom: spacing[3],
  },

  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportMetaText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing[1],
  },

  reportActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
    marginTop: spacing[1],
  },

  reportAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingRight: spacing[4],
  },

  reportActionText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing[1],
  },

  infoCard: {
    marginBottom: spacing[4],
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  infoTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing[2],
  },

  infoText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  modalContent: {
    paddingTop: spacing[2],
  },

  modalLabel: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing[2],
  },

  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  periodOption: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  periodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.mintSoft,
  },

  periodOptionText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },

  periodOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  recipientInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  recipientPlaceholder: {
    ...textStyles.body,
    color: colors.textTertiary,
    marginLeft: spacing[2],
  },

  modalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },

  modalInfoText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing[2],
    flex: 1,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },

  modalButton: {
    flex: 1,
  },
});
