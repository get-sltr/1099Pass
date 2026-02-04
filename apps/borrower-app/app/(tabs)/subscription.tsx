/**
 * Subscription Screen
 * Manage subscription plans, billing, and premium features
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge, Modal, useToast } from '../../src/components/ui';
import { useSubscriptionStore, type SubscriptionTier, type SubscriptionPlan } from '../../src/store/subscription-store';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const {
    currentSubscription,
    plans,
    usageStats,
    billingHistory,
    isLoading,
    loadSubscription,
    loadUsageStats,
    loadBillingHistory,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscriptionStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubscription();
    loadUsageStats();
    loadBillingHistory();
  }, []);

  const currentPlan = plans.find((p) => p.id === currentSubscription?.tier) || plans[0];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === currentSubscription?.tier) return;
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const isUpgrade = getPlanIndex(selectedPlan.id) > getPlanIndex(currentSubscription?.tier || 'FREE');

      if (isUpgrade) {
        await upgradePlan(selectedPlan.id);
        showToast({
          type: 'success',
          title: 'Upgraded!',
          message: `You're now on the ${selectedPlan.name} plan`,
        });
      } else {
        await downgradePlan(selectedPlan.id);
        showToast({
          type: 'info',
          title: 'Plan changed',
          message: `Your plan will change to ${selectedPlan.name} at the end of your billing period`,
        });
      }

      setShowUpgradeModal(false);
      setSelectedPlan(null);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to change plan. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      await cancelSubscription();
      setShowCancelModal(false);
      showToast({
        type: 'info',
        title: 'Subscription canceled',
        message: 'Your subscription will remain active until the end of your billing period',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel subscription. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    setIsProcessing(true);
    try {
      await reactivateSubscription();
      showToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Your subscription has been reactivated',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reactivate subscription',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIndex = (tier: SubscriptionTier): number => {
    return plans.findIndex((p) => p.id === tier);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading && !currentSubscription) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

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
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Current plan card */}
        <Card variant="mint" style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <View>
              <Text style={styles.currentPlanLabel}>Current Plan</Text>
              <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
            </View>
            <Badge
              variant={currentSubscription?.status === 'active' ? 'success' : 'warning'}
            >
              {currentSubscription?.cancelAtPeriodEnd ? 'Canceling' : 'Active'}
            </Badge>
          </View>

          {currentSubscription?.tier !== 'FREE' && (
            <View style={styles.currentPlanDetails}>
              <View style={styles.currentPlanDetail}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.currentPlanDetailText}>
                  {currentSubscription?.cancelAtPeriodEnd
                    ? `Access until ${formatDate(currentSubscription.currentPeriodEnd)}`
                    : `Renews ${formatDate(currentSubscription?.currentPeriodEnd || '')}`}
                </Text>
              </View>
              <View style={styles.currentPlanDetail}>
                <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.currentPlanDetailText}>
                  {currentPlan.priceDisplay}
                </Text>
              </View>
            </View>
          )}

          {currentSubscription?.cancelAtPeriodEnd && (
            <TouchableOpacity
              style={styles.reactivateButton}
              onPress={handleReactivate}
              disabled={isProcessing}
            >
              <Text style={styles.reactivateButtonText}>
                {isProcessing ? 'Processing...' : 'Reactivate Subscription'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Usage stats */}
        {usageStats && (
          <Card variant="outlined" style={styles.usageCard}>
            <Text style={styles.sectionTitle}>Usage This Month</Text>
            <View style={styles.usageGrid}>
              <View style={styles.usageStat}>
                <Text style={styles.usageValue}>
                  {usageStats.reportsGenerated}
                  {usageStats.reportsLimit > 0 && (
                    <Text style={styles.usageLimit}>/{usageStats.reportsLimit}</Text>
                  )}
                </Text>
                <Text style={styles.usageLabel}>Reports</Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={styles.usageValue}>
                  {usageStats.incomeSourcesConnected}
                  {usageStats.incomeSourcesLimit > 0 && (
                    <Text style={styles.usageLimit}>/{usageStats.incomeSourcesLimit}</Text>
                  )}
                </Text>
                <Text style={styles.usageLabel}>Income Sources</Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={styles.usageValue}>{usageStats.documentsStored}</Text>
                <Text style={styles.usageLabel}>Documents</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Plans comparison */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>

          {plans.map((plan) => {
            const isCurrent = plan.id === currentSubscription?.tier;
            const isHigher = getPlanIndex(plan.id) > getPlanIndex(currentSubscription?.tier || 'FREE');

            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => handleSelectPlan(plan)}
                disabled={isCurrent}
                activeOpacity={0.8}
              >
                <Card
                  variant={plan.highlighted ? 'mint' : 'outlined'}
                  style={[
                    styles.planCard,
                    isCurrent && styles.planCardCurrent,
                  ]}
                >
                  {plan.highlighted && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>Most Popular</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planPrice}>{plan.priceDisplay}</Text>
                    </View>
                    {isCurrent && (
                      <Badge variant="primary">Current</Badge>
                    )}
                  </View>

                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.planFeature}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={colors.success}
                        />
                        <Text style={styles.planFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {!isCurrent && (
                    <View style={styles.planAction}>
                      <Text style={[
                        styles.planActionText,
                        isHigher ? styles.planActionUpgrade : styles.planActionDowngrade,
                      ]}>
                        {isHigher ? 'Upgrade' : 'Downgrade'} to {plan.name}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isHigher ? colors.primary : colors.textSecondary}
                      />
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Billing history */}
        {billingHistory.length > 0 && (
          <View style={styles.billingSection}>
            <Text style={styles.sectionTitle}>Billing History</Text>
            <Card variant="outlined" style={styles.billingCard}>
              {billingHistory.map((invoice, index) => (
                <View
                  key={invoice.id}
                  style={[
                    styles.billingItem,
                    index < billingHistory.length - 1 && styles.billingItemBorder,
                  ]}
                >
                  <View>
                    <Text style={styles.billingDate}>{formatDate(invoice.date)}</Text>
                    <Text style={styles.billingAmount}>
                      ${invoice.amount.toFixed(2)}
                    </Text>
                  </View>
                  <Badge
                    variant={invoice.status === 'paid' ? 'success' : 'warning'}
                    size="small"
                  >
                    {invoice.status}
                  </Badge>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Cancel subscription */}
        {currentSubscription?.tier !== 'FREE' && !currentSubscription?.cancelAtPeriodEnd && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}

        {/* Info card */}
        <Card variant="default" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>Money-back guarantee</Text>
          </View>
          <Text style={styles.infoText}>
            Try any paid plan risk-free. Cancel within 7 days for a full refund.
          </Text>
        </Card>
      </ScrollView>

      {/* Upgrade/Downgrade confirmation modal */}
      <Modal
        visible={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setSelectedPlan(null);
        }}
        title={`Switch to ${selectedPlan?.name}`}
      >
        <View style={styles.modalContent}>
          {selectedPlan && (
            <>
              <Text style={styles.modalText}>
                {getPlanIndex(selectedPlan.id) > getPlanIndex(currentSubscription?.tier || 'FREE')
                  ? `You'll be charged ${selectedPlan.priceDisplay} starting today. Your new features will be available immediately.`
                  : `Your plan will change to ${selectedPlan.name} at the end of your current billing period. You'll continue to have access to ${currentPlan.name} features until then.`}
              </Text>

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowUpgradeModal(false);
                    setSelectedPlan(null);
                  }}
                  variant="ghost"
                  size="medium"
                  style={styles.modalButton}
                  disabled={isProcessing}
                />
                <Button
                  title={isProcessing ? 'Processing...' : 'Confirm'}
                  onPress={handleConfirmPlanChange}
                  variant="primary"
                  size="medium"
                  style={styles.modalButton}
                  disabled={isProcessing}
                />
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Cancel subscription modal */}
      <Modal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
      >
        <View style={styles.modalContent}>
          <View style={styles.cancelWarning}>
            <Ionicons name="warning-outline" size={32} color={colors.warning} />
          </View>
          <Text style={styles.cancelTitle}>Are you sure?</Text>
          <Text style={styles.modalText}>
            You'll lose access to these features at the end of your billing period:
          </Text>
          <View style={styles.cancelFeatures}>
            {currentPlan.features.slice(0, 3).map((feature, index) => (
              <View key={index} style={styles.cancelFeature}>
                <Ionicons name="close-circle" size={16} color={colors.error} />
                <Text style={styles.cancelFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <Button
              title="Keep Subscription"
              onPress={() => setShowCancelModal(false)}
              variant="primary"
              size="medium"
              style={styles.modalButton}
              disabled={isProcessing}
            />
            <Button
              title={isProcessing ? 'Processing...' : 'Cancel Anyway'}
              onPress={handleCancelSubscription}
              variant="danger"
              size="medium"
              style={styles.modalButton}
              disabled={isProcessing}
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

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing[2],
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
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },

  headerSpacer: {
    width: 44,
  },

  currentPlanCard: {
    marginBottom: spacing[4],
  },

  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },

  currentPlanLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  currentPlanName: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginTop: spacing[1],
  },

  currentPlanDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },

  currentPlanDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentPlanDetailText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[1],
  },

  reactivateButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  reactivateButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
  },

  usageCard: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },

  usageGrid: {
    flexDirection: 'row',
  },

  usageStat: {
    flex: 1,
    alignItems: 'center',
  },

  usageValue: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },

  usageLimit: {
    ...textStyles.body,
    color: colors.textTertiary,
  },

  usageLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  plansSection: {
    marginBottom: spacing[6],
  },

  planCard: {
    marginBottom: spacing[3],
    position: 'relative',
    overflow: 'visible',
  },

  planCardCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing[4],
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },

  popularBadgeText: {
    ...textStyles.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },

  planName: {
    ...textStyles.h4,
    color: colors.textPrimary,
  },

  planPrice: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },

  planFeatures: {
    marginBottom: spacing[3],
  },

  planFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },

  planFeatureText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[2],
    flex: 1,
  },

  planAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  planActionText: {
    ...textStyles.body,
    fontWeight: '600',
    marginRight: spacing[1],
  },

  planActionUpgrade: {
    color: colors.primary,
  },

  planActionDowngrade: {
    color: colors.textSecondary,
  },

  billingSection: {
    marginBottom: spacing[6],
  },

  billingCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },

  billingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },

  billingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  billingDate: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },

  billingAmount: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing[0.5],
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
  },

  cancelButtonText: {
    ...textStyles.body,
    color: colors.error,
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

  modalText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing[4],
    lineHeight: 22,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },

  modalButton: {
    flex: 1,
  },

  cancelWarning: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  cancelTitle: {
    ...textStyles.h4,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },

  cancelFeatures: {
    marginBottom: spacing[4],
  },

  cancelFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  cancelFeatureText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
});
