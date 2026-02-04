/**
 * Subscription Store
 * Manages subscription plans, billing, and premium features
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Types
export type SubscriptionTier = 'FREE' | 'PLUS' | 'PRO';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceDisplay: string;
  billingPeriod: 'monthly';
  features: string[];
  limits: {
    reportsPerMonth: number;
    incomeSources: number;
    documentStorage: string;
    shareExpiration: string;
    priorityMatching: boolean;
    dedicatedSupport: boolean;
  };
  highlighted?: boolean;
}

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

export interface UsageStats {
  reportsGenerated: number;
  reportsLimit: number;
  documentsStored: number;
  documentsLimit: number;
  incomeSourcesConnected: number;
  incomeSourcesLimit: number;
}

interface SubscriptionState {
  // State
  currentSubscription: Subscription | null;
  plans: SubscriptionPlan[];
  billingHistory: BillingHistory[];
  usageStats: UsageStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSubscription: () => Promise<void>;
  loadBillingHistory: () => Promise<void>;
  loadUsageStats: () => Promise<void>;
  upgradePlan: (tier: SubscriptionTier) => Promise<void>;
  downgradePlan: (tier: SubscriptionTier) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;

  // Utilities
  canGenerateReport: () => boolean;
  canConnectIncomeSource: () => boolean;
  getPlanByTier: (tier: SubscriptionTier) => SubscriptionPlan | undefined;
  clearError: () => void;
}

// Available plans
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    billingPeriod: 'monthly',
    features: [
      'Connect up to 2 income sources',
      'Basic loan readiness score',
      '1 watermarked report preview/month',
      'View lender directory',
    ],
    limits: {
      reportsPerMonth: 1,
      incomeSources: 2,
      documentStorage: '100MB',
      shareExpiration: '7 days',
      priorityMatching: false,
      dedicatedSupport: false,
    },
  },
  {
    id: 'PLUS',
    name: 'Plus',
    price: 9.99,
    priceDisplay: '$9.99/mo',
    billingPeriod: 'monthly',
    features: [
      'Unlimited income sources',
      'Full loan readiness score breakdown',
      '3 downloadable PDF reports/month',
      'Credit coaching tips',
      '90-day report sharing',
      '1GB document storage',
    ],
    limits: {
      reportsPerMonth: 3,
      incomeSources: -1, // unlimited
      documentStorage: '1GB',
      shareExpiration: '90 days',
      priorityMatching: false,
      dedicatedSupport: false,
    },
    highlighted: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 19.99,
    priceDisplay: '$19.99/mo',
    billingPeriod: 'monthly',
    features: [
      'Everything in Plus',
      'Unlimited reports',
      'Priority lender matching',
      '1-year report sharing',
      'Unlimited document storage',
      'Report customization',
      'Dedicated support',
    ],
    limits: {
      reportsPerMonth: -1, // unlimited
      incomeSources: -1, // unlimited
      documentStorage: 'Unlimited',
      shareExpiration: '1 year',
      priorityMatching: true,
      dedicatedSupport: true,
    },
  },
];

// Mock data for development
const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub_mock_123',
  tier: 'FREE',
  status: 'active',
  currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
};

const MOCK_BILLING_HISTORY: BillingHistory[] = [];

const MOCK_USAGE_STATS: UsageStats = {
  reportsGenerated: 0,
  reportsLimit: 1,
  documentsStored: 3,
  documentsLimit: 10,
  incomeSourcesConnected: 2,
  incomeSourcesLimit: 2,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  currentSubscription: null,
  plans: SUBSCRIPTION_PLANS,
  billingHistory: [],
  usageStats: null,
  isLoading: false,
  error: null,

  loadSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          currentSubscription: MOCK_SUBSCRIPTION,
          isLoading: false,
        });
        return;
      }

      const subscription = await api.get<Subscription>('/subscription');
      set({
        currentSubscription: subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load subscription:', error);
      set({
        isLoading: false,
        error: 'Failed to load subscription details',
      });
    }
  },

  loadBillingHistory: async () => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ billingHistory: MOCK_BILLING_HISTORY });
        return;
      }

      const history = await api.get<BillingHistory[]>('/subscription/billing');
      set({ billingHistory: history });
    } catch (error) {
      console.error('Failed to load billing history:', error);
    }
  },

  loadUsageStats: async () => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ usageStats: MOCK_USAGE_STATS });
        return;
      }

      const stats = await api.get<UsageStats>('/subscription/usage');
      set({ usageStats: stats });
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  },

  upgradePlan: async (tier: SubscriptionTier) => {
    set({ isLoading: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tier);
        if (!plan) throw new Error('Invalid plan');

        set({
          currentSubscription: {
            ...MOCK_SUBSCRIPTION,
            tier,
          },
          usageStats: {
            ...MOCK_USAGE_STATS,
            reportsLimit: plan.limits.reportsPerMonth,
            incomeSourcesLimit: plan.limits.incomeSources,
          },
          isLoading: false,
        });
        return;
      }

      const subscription = await api.post<Subscription>('/subscription/upgrade', { tier });
      set({
        currentSubscription: subscription,
        isLoading: false,
      });

      // Reload usage stats after upgrade
      get().loadUsageStats();
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      set({
        isLoading: false,
        error: 'Failed to upgrade subscription',
      });
      throw error;
    }
  },

  downgradePlan: async (tier: SubscriptionTier) => {
    set({ isLoading: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tier);
        if (!plan) throw new Error('Invalid plan');

        set({
          currentSubscription: {
            ...MOCK_SUBSCRIPTION,
            tier,
            cancelAtPeriodEnd: false,
          },
          usageStats: {
            ...MOCK_USAGE_STATS,
            reportsLimit: plan.limits.reportsPerMonth,
            incomeSourcesLimit: plan.limits.incomeSources,
          },
          isLoading: false,
        });
        return;
      }

      const subscription = await api.post<Subscription>('/subscription/downgrade', { tier });
      set({
        currentSubscription: subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to downgrade plan:', error);
      set({
        isLoading: false,
        error: 'Failed to downgrade subscription',
      });
      throw error;
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set((state) => ({
          currentSubscription: state.currentSubscription
            ? { ...state.currentSubscription, cancelAtPeriodEnd: true }
            : null,
          isLoading: false,
        }));
        return;
      }

      const subscription = await api.post<Subscription>('/subscription/cancel');
      set({
        currentSubscription: subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      set({
        isLoading: false,
        error: 'Failed to cancel subscription',
      });
      throw error;
    }
  },

  reactivateSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set((state) => ({
          currentSubscription: state.currentSubscription
            ? { ...state.currentSubscription, cancelAtPeriodEnd: false }
            : null,
          isLoading: false,
        }));
        return;
      }

      const subscription = await api.post<Subscription>('/subscription/reactivate');
      set({
        currentSubscription: subscription,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      set({
        isLoading: false,
        error: 'Failed to reactivate subscription',
      });
      throw error;
    }
  },

  canGenerateReport: () => {
    const { currentSubscription, usageStats, plans } = get();
    if (!currentSubscription || !usageStats) return false;

    const plan = plans.find((p) => p.id === currentSubscription.tier);
    if (!plan) return false;

    // Unlimited reports
    if (plan.limits.reportsPerMonth === -1) return true;

    return usageStats.reportsGenerated < plan.limits.reportsPerMonth;
  },

  canConnectIncomeSource: () => {
    const { currentSubscription, usageStats, plans } = get();
    if (!currentSubscription || !usageStats) return false;

    const plan = plans.find((p) => p.id === currentSubscription.tier);
    if (!plan) return false;

    // Unlimited income sources
    if (plan.limits.incomeSources === -1) return true;

    return usageStats.incomeSourcesConnected < plan.limits.incomeSources;
  },

  getPlanByTier: (tier: SubscriptionTier) => {
    return get().plans.find((p) => p.id === tier);
  },

  clearError: () => set({ error: null }),
}));

export default useSubscriptionStore;
