/**
 * Dashboard Screen
 * Main hub showing loan readiness score, income summary, and quick actions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Avatar } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';
import { colors, spacing, textStyles, borderRadius, getScoreColor, getLetterGrade } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated score gauge component
function ScoreGauge({ score }: { score: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    animatedValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [score]);

  const letterGrade = getLetterGrade(displayScore);
  const scoreColor = getScoreColor(letterGrade);

  return (
    <View style={styles.gaugeWrapper}>
      <View style={[styles.gaugeCircle, { borderColor: scoreColor }]}>
        <View style={[styles.gaugeInnerCircle, { backgroundColor: `${scoreColor}15` }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>{displayScore}</Text>
          <Text style={[styles.scoreGrade, { color: scoreColor }]}>{letterGrade}</Text>
        </View>
      </View>
      <View style={styles.scoreMeta}>
        <Text style={styles.scoreLabel}>Loan Readiness</Text>
        <View style={styles.scoreTrend}>
          <Ionicons name="trending-up" size={14} color={colors.success} />
          <Text style={styles.scoreTrendText}>+12 this month</Text>
        </View>
      </View>
    </View>
  );
}

// Quick action button
function QuickAction({
  icon,
  label,
  onPress,
  variant = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'amber';
}) {
  const bgColor = {
    default: colors.surface,
    primary: colors.mintSoft,
    amber: colors.amberSoft,
  }[variant];

  const iconColor = {
    default: colors.textSecondary,
    primary: colors.primary,
    amber: colors.secondary,
  }[variant];

  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// Recent activity item
interface ActivityItem {
  id: string;
  type: 'income' | 'document' | 'report' | 'connection';
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: number;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'income',
    title: 'Uber earnings synced',
    subtitle: '$847.50 from last week',
    timestamp: '2 hours ago',
    amount: 847.50,
  },
  {
    id: '2',
    type: 'report',
    title: 'Report shared',
    subtitle: 'Sent to Quick Mortgage Co.',
    timestamp: 'Yesterday',
  },
  {
    id: '3',
    type: 'connection',
    title: 'DoorDash connected',
    subtitle: 'Now syncing your earnings',
    timestamp: '2 days ago',
  },
  {
    id: '4',
    type: 'income',
    title: 'DoorDash earnings synced',
    subtitle: '$523.00 from last week',
    timestamp: '2 days ago',
    amount: 523.00,
  },
];

function ActivityItemCard({ item }: { item: ActivityItem }) {
  const getActivityIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (item.type) {
      case 'income':
        return 'cash-outline';
      case 'document':
        return 'document-text-outline';
      case 'report':
        return 'share-outline';
      case 'connection':
        return 'link-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getActivityColor = () => {
    switch (item.type) {
      case 'income':
        return colors.success;
      case 'document':
        return colors.secondary;
      case 'report':
        return colors.primary;
      case 'connection':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${getActivityColor()}15` }]}>
        <Ionicons name={getActivityIcon()} size={18} color={getActivityColor()} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.activityTime}>{item.timestamp}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data
  const score = 682;
  const monthlyIncome = 4250;
  const incomeChange = 12.5;
  const connectedSources = 3;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refresh data from API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.first_name || 'there'}!
            </Text>
            <Text style={styles.headerSubtitle}>Your income story is building</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Avatar name={user?.first_name || 'U'} size="md" />
          </TouchableOpacity>
        </View>

        {/* Score card */}
        <Card variant="default" style={styles.scoreCard}>
          <ScoreGauge score={score} />
        </Card>

        {/* Income summary */}
        <View style={styles.incomeSection}>
          <Text style={styles.sectionTitle}>Monthly Income</Text>
          <Card variant="mint" style={styles.incomeCard}>
            <View style={styles.incomeMain}>
              <Text style={styles.incomeAmount}>{formatCurrency(monthlyIncome)}</Text>
              <Badge
                variant={incomeChange >= 0 ? 'success' : 'error'}
                size="small"
              >
                {incomeChange >= 0 ? '+' : ''}{incomeChange}%
              </Badge>
            </View>
            <Text style={styles.incomeSubtext}>
              From {connectedSources} verified sources
            </Text>
            <View style={styles.incomeBar}>
              <View style={[styles.incomeBarFill, { width: '75%' }]} />
            </View>
            <View style={styles.incomeBarLabels}>
              <Text style={styles.incomeBarLabel}>$0</Text>
              <Text style={styles.incomeBarLabel}>Goal: $5,000</Text>
            </View>
          </Card>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="document-text-outline"
              label="Generate Report"
              onPress={() => router.push('/(tabs)/reports')}
              variant="primary"
            />
            <QuickAction
              icon="folder-outline"
              label="View Documents"
              onPress={() => router.push('/(tabs)/documents')}
            />
            <QuickAction
              icon="link-outline"
              label="Connect Account"
              onPress={() => router.push('/(onboarding)/connect-accounts')}
            />
            <QuickAction
              icon="business-outline"
              label="Find Lenders"
              onPress={() => router.push('/(tabs)/lenders')}
              variant="amber"
            />
          </View>
        </View>

        {/* Tips card */}
        <Card variant="amber" style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.secondary} />
            <Text style={styles.tipTitle}>Boost your score</Text>
          </View>
          <Text style={styles.tipText}>
            Connect your bank account to verify deposits and improve your score by up to 50 points.
          </Text>
          <TouchableOpacity style={styles.tipAction}>
            <Text style={styles.tipActionText}>Connect now</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </Card>

        {/* Recent activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <Card variant="outlined" style={styles.activityCard}>
            {MOCK_ACTIVITIES.map((activity, index) => (
              <View key={activity.id}>
                <ActivityItemCard item={activity} />
                {index < MOCK_ACTIVITIES.length - 1 && <View style={styles.activityDivider} />}
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[2],
  },

  headerLeft: {
    flex: 1,
  },

  greeting: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },

  headerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },

  profileButton: {
    marginLeft: spacing[4],
  },

  scoreCard: {
    marginBottom: spacing[6],
    alignItems: 'center',
    paddingVertical: spacing[6],
  },

  gaugeWrapper: {
    alignItems: 'center',
  },

  gaugeCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  gaugeInnerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreNumber: {
    ...textStyles.scoreDisplay,
    fontSize: 44,
    lineHeight: 52,
  },

  scoreGrade: {
    ...textStyles.h4,
    marginTop: -spacing[1],
  },

  scoreMeta: {
    alignItems: 'center',
    marginTop: spacing[4],
  },

  scoreLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },

  scoreTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scoreTrendText: {
    ...textStyles.caption,
    color: colors.success,
    marginLeft: spacing[1],
    fontWeight: '500',
  },

  incomeSection: {
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

  incomeCard: {
    paddingVertical: spacing[5],
  },

  incomeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },

  incomeAmount: {
    ...textStyles.moneyDisplay,
    color: colors.textPrimary,
    marginRight: spacing[3],
  },

  incomeSubtext: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing[4],
  },

  incomeBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },

  incomeBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  incomeBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  incomeBarLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  quickActionsSection: {
    marginBottom: spacing[6],
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[2],
  },

  quickAction: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    marginBottom: spacing[4],
  },

  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },

  quickActionLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  tipCard: {
    marginBottom: spacing[6],
  },

  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  tipTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing[2],
  },

  tipText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },

  tipAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tipActionText: {
    ...textStyles.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
    marginRight: spacing[1],
  },

  activitySection: {
    marginBottom: spacing[4],
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },

  seeAllText: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },

  activityCard: {
    paddingVertical: spacing[2],
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  activitySubtitle: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[0.5],
  },

  activityTime: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },

  activityDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing[12],
  },
});
