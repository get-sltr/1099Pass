/**
 * Rates Screen
 * Educational mortgage rate display — conventional vs non-QM
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';
import { USE_MOCKS } from '../../src/config';
import { api } from '../../src/services/api';

interface RateData {
  conventional: {
    rate30yr: number | null;
    rate15yr: number | null;
    asOf: string;
    source: string;
  };
  nonQm: {
    bankStatement: { min: number; max: number };
    '1099': { min: number; max: number };
    pnl: { min: number; max: number };
  };
  disclaimer: string;
}

const MOCK_RATES: RateData = {
  conventional: {
    rate30yr: 6.87,
    rate15yr: 6.22,
    asOf: new Date().toISOString().slice(0, 10),
    source: 'FRED (Freddie Mac)',
  },
  nonQm: {
    bankStatement: { min: 7.37, max: 8.12 },
    '1099': { min: 7.62, max: 8.37 },
    pnl: { min: 7.87, max: 8.87 },
  },
  disclaimer:
    'Rates are from public sources (FRED) for educational purposes only. Not an offer or guarantee. Actual rates depend on lender and borrower.',
};

type LoanTab = 'conventional' | 'nonqm';

export default function RatesScreen() {
  const insets = useSafeAreaInsets();
  const [rates, setRates] = useState<RateData>(MOCK_RATES);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<LoanTab>('conventional');

  const fetchRates = useCallback(async () => {
    if (USE_MOCKS) {
      setRates(MOCK_RATES);
      return;
    }
    try {
      const data = await api.get<RateData>('/rates');
      if (data) setRates(data);
    } catch {
      // Keep mock/cached rates on failure
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRates();
    setRefreshing(false);
  }, [fetchRates]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mortgage Rates</Text>
        <Text style={styles.subtitle}>
          Real-time rates to help you understand your options
        </Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'conventional' && styles.tabActive]}
          onPress={() => setActiveTab('conventional')}
        >
          <Text style={[styles.tabText, activeTab === 'conventional' && styles.tabTextActive]}>
            Conventional
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nonqm' && styles.tabActive]}
          onPress={() => setActiveTab('nonqm')}
        >
          <Text style={[styles.tabText, activeTab === 'nonqm' && styles.tabTextActive]}>
            Non-QM / 1099
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'conventional' ? (
        <>
          {/* 30-Year */}
          <Card variant="default" style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View style={styles.rateIconWrap}>
                <Ionicons name="home-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.rateMeta}>
                <Text style={styles.rateLabel}>30-Year Fixed</Text>
                <Text style={styles.rateSubLabel}>Most popular</Text>
              </View>
            </View>
            <Text style={styles.rateValue}>
              {rates.conventional.rate30yr?.toFixed(2) ?? '—'}%
            </Text>
            <View style={styles.rateFooter}>
              <Text style={styles.asOf}>As of {rates.conventional.asOf}</Text>
            </View>
          </Card>

          {/* 15-Year */}
          <Card variant="default" style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View style={styles.rateIconWrap}>
                <Ionicons name="timer-outline" size={22} color={colors.secondary} />
              </View>
              <View style={styles.rateMeta}>
                <Text style={styles.rateLabel}>15-Year Fixed</Text>
                <Text style={styles.rateSubLabel}>Lower rate, higher payment</Text>
              </View>
            </View>
            <Text style={[styles.rateValue, { color: colors.secondary }]}>
              {rates.conventional.rate15yr?.toFixed(2) ?? '—'}%
            </Text>
            <View style={styles.rateFooter}>
              <Text style={styles.asOf}>As of {rates.conventional.asOf}</Text>
            </View>
          </Card>

          {/* Education card */}
          <Card variant="mint" style={styles.eduCard}>
            <View style={styles.eduRow}>
              <Ionicons name="school-outline" size={20} color={colors.primary} />
              <Text style={styles.eduTitle}>What are conventional loans?</Text>
            </View>
            <Text style={styles.eduBody}>
              Conventional mortgages require W-2 income documentation, 2 years of tax returns,
              and typically a minimum 620 credit score. As a 1099/self-employed borrower,
              you may need a non-QM loan instead.
            </Text>
          </Card>
        </>
      ) : (
        <>
          {/* Bank Statement */}
          <Card variant="default" style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View style={[styles.rateIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="document-text-outline" size={22} color="#7C3AED" />
              </View>
              <View style={styles.rateMeta}>
                <Text style={styles.rateLabel}>Bank Statement Loan</Text>
                <Text style={styles.rateSubLabel}>12-24 months of bank statements</Text>
              </View>
            </View>
            <Text style={[styles.rateValue, { color: '#7C3AED' }]}>
              {rates.nonQm.bankStatement.min.toFixed(2)}% – {rates.nonQm.bankStatement.max.toFixed(2)}%
            </Text>
          </Card>

          {/* 1099 Loan */}
          <Card variant="default" style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View style={[styles.rateIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="receipt-outline" size={22} color="#D97706" />
              </View>
              <View style={styles.rateMeta}>
                <Text style={styles.rateLabel}>1099 Income Loan</Text>
                <Text style={styles.rateSubLabel}>1-2 years of 1099 forms</Text>
              </View>
            </View>
            <Text style={[styles.rateValue, { color: '#D97706' }]}>
              {rates.nonQm['1099'].min.toFixed(2)}% – {rates.nonQm['1099'].max.toFixed(2)}%
            </Text>
          </Card>

          {/* P&L Loan */}
          <Card variant="default" style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View style={[styles.rateIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="bar-chart-outline" size={22} color="#2563EB" />
              </View>
              <View style={styles.rateMeta}>
                <Text style={styles.rateLabel}>Profit & Loss Loan</Text>
                <Text style={styles.rateSubLabel}>CPA-prepared P&L statement</Text>
              </View>
            </View>
            <Text style={[styles.rateValue, { color: '#2563EB' }]}>
              {rates.nonQm.pnl.min.toFixed(2)}% – {rates.nonQm.pnl.max.toFixed(2)}%
            </Text>
          </Card>

          {/* Education card */}
          <Card variant="mint" style={styles.eduCard}>
            <View style={styles.eduRow}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={styles.eduTitle}>Why are non-QM rates higher?</Text>
            </View>
            <Text style={styles.eduBody}>
              Non-QM loans accept alternative documentation (bank statements, 1099s, P&L)
              instead of traditional W-2s. The slightly higher rates reflect the flexible
              underwriting — but they make homeownership possible for self-employed borrowers.
            </Text>
          </Card>

          {/* 1099Pass value prop */}
          <Card variant="default" style={styles.valueCard}>
            <View style={styles.eduRow}>
              <Ionicons name="star-outline" size={20} color={colors.primary} />
              <Text style={styles.eduTitle}>How 1099Pass helps</Text>
            </View>
            <Text style={styles.eduBody}>
              Your Loan Readiness Score and income report show lenders a clear, verified picture
              of your earnings — helping you qualify for the best non-QM rate available.
            </Text>
          </Card>
        </>
      )}

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>{rates.disclaimer}</Text>
      <Text style={styles.source}>Source: Freddie Mac via FRED, Federal Reserve Bank of St. Louis</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing[6],
  },
  header: {
    marginBottom: spacing[5],
  },
  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing[5],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Rate cards
  rateCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  rateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  rateMeta: {
    flex: 1,
  },
  rateLabel: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rateSubLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  rateValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing[2],
  },
  rateFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[2],
  },
  asOf: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  // Education
  eduCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  valueCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  eduRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  eduTitle: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eduBody: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Disclaimer
  disclaimer: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[4],
    lineHeight: 16,
  },
  source: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
});
