import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  type: 'income' | 'financial' | 'loan_readiness';
}

export default function ReportsScreen() {
  const reports: Report[] = [];

  const getTypeLabel = (type: Report['type']) => {
    switch (type) {
      case 'income':
        return 'Income Verification';
      case 'financial':
        return 'Financial Profile';
      case 'loan_readiness':
        return 'Loan Readiness';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Reports</Text>
      </View>

      <ScrollView style={styles.list}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyText}>
              Upload documents and link your accounts to generate financial
              reports that lenders can view
            </Text>
            <View style={styles.reportTypes}>
              <View style={styles.reportTypeCard}>
                <Text style={styles.reportTypeIcon}>💰</Text>
                <Text style={styles.reportTypeTitle}>Income Verification</Text>
                <Text style={styles.reportTypeDesc}>
                  Verify your 1099 and gig income
                </Text>
              </View>
              <View style={styles.reportTypeCard}>
                <Text style={styles.reportTypeIcon}>📈</Text>
                <Text style={styles.reportTypeTitle}>Financial Profile</Text>
                <Text style={styles.reportTypeDesc}>
                  Complete financial overview
                </Text>
              </View>
              <View style={styles.reportTypeCard}>
                <Text style={styles.reportTypeIcon}>✓</Text>
                <Text style={styles.reportTypeTitle}>Loan Readiness</Text>
                <Text style={styles.reportTypeDesc}>
                  Your loan qualification score
                </Text>
              </View>
            </View>
          </View>
        ) : (
          reports.map((report) => (
            <TouchableOpacity key={report.id} style={styles.reportCard}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportMeta}>
                  {getTypeLabel(report.type)} •{' '}
                  {report.generatedAt.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
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
  list: {
    flex: 1,
    padding: 16,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  reportMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  arrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
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
    marginBottom: 32,
    lineHeight: 24,
  },
  reportTypes: {
    width: '100%',
    gap: 12,
  },
  reportTypeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  reportTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reportTypeDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
});
