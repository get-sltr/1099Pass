/**
 * Profile Store
 * Manages borrower profile and financial data
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Types
export interface IncomeSource {
  id: string;
  name: string;
  type: 'gig' | 'freelance' | 'business' | 'employment' | 'investment' | 'other';
  platform?: string; // e.g., 'uber', 'doordash', 'upwork'
  monthlyAverage: number;
  lastUpdated: string;
  connected: boolean;
  accountId?: string;
}

export interface FinancialProfile {
  totalAnnualIncome: number;
  monthlyAverage: number;
  incomeTrend: 'increasing' | 'stable' | 'decreasing';
  incomeStability: number; // 0-100 percentage
  debtToIncomeRatio: number;
  loanReadinessScore: number;
  lastCalculated: string;
}

export interface BorrowerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  dateOfBirth?: string;
  ssn_last4?: string;
  kyc_status: 'pending' | 'verified' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  // State
  profile: BorrowerProfile | null;
  financialProfile: FinancialProfile | null;
  incomeSources: IncomeSource[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<BorrowerProfile>) => Promise<void>;
  loadFinancialProfile: () => Promise<void>;
  loadIncomeSources: () => Promise<void>;
  connectIncomeSource: (platform: string) => Promise<void>;
  disconnectIncomeSource: (sourceId: string) => Promise<void>;
  refreshIncomeData: () => Promise<void>;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

const CACHE_KEY = '1099pass_profile_cache';

// Mock data for development
const MOCK_PROFILE: BorrowerProfile = {
  id: 'user_123',
  firstName: 'Alex',
  lastName: 'Demo',
  email: 'alex@example.com',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
  },
  kyc_status: 'verified',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_FINANCIAL_PROFILE: FinancialProfile = {
  totalAnnualIncome: 78500,
  monthlyAverage: 6542,
  incomeTrend: 'increasing',
  incomeStability: 85,
  debtToIncomeRatio: 28,
  loanReadinessScore: 87,
  lastCalculated: new Date().toISOString(),
};

const MOCK_INCOME_SOURCES: IncomeSource[] = [
  {
    id: 'src_1',
    name: 'Uber',
    type: 'gig',
    platform: 'uber',
    monthlyAverage: 3200,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    connected: true,
    accountId: 'plaid_acc_1',
  },
  {
    id: 'src_2',
    name: 'Freelance Design',
    type: 'freelance',
    platform: 'upwork',
    monthlyAverage: 2500,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    connected: true,
    accountId: 'plaid_acc_2',
  },
  {
    id: 'src_3',
    name: 'Consulting',
    type: 'business',
    monthlyAverage: 842,
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    connected: false,
  },
];

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  financialProfile: null,
  incomeSources: [],
  isLoading: false,
  isUpdating: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      // Try to load from cache first
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        const { profile, financialProfile, incomeSources } = JSON.parse(cached);
        set({ profile, financialProfile, incomeSources });
      }

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          profile: MOCK_PROFILE,
          isLoading: false,
        });
        return;
      }

      const profile = await api.get<BorrowerProfile>('/profile');
      set({ profile, isLoading: false });

      // Update cache
      await SecureStore.setItemAsync(
        CACHE_KEY,
        JSON.stringify({ profile, financialProfile: get().financialProfile, incomeSources: get().incomeSources })
      );
    } catch (error) {
      console.error('Failed to load profile:', error);
      set({
        isLoading: false,
        error: 'Failed to load profile',
      });
    }
  },

  updateProfile: async (updates) => {
    set({ isUpdating: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() } : null,
          isUpdating: false,
        }));
        return;
      }

      const updated = await api.put<BorrowerProfile>('/profile', updates);
      set({ profile: updated, isUpdating: false });
    } catch (error) {
      console.error('Failed to update profile:', error);
      set({
        isUpdating: false,
        error: 'Failed to update profile',
      });
      throw error;
    }
  },

  loadFinancialProfile: async () => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ financialProfile: MOCK_FINANCIAL_PROFILE });
        return;
      }

      const financialProfile = await api.get<FinancialProfile>('/profile/financial');
      set({ financialProfile });
    } catch (error) {
      console.error('Failed to load financial profile:', error);
    }
  },

  loadIncomeSources: async () => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ incomeSources: MOCK_INCOME_SOURCES });
        return;
      }

      const incomeSources = await api.get<IncomeSource[]>('/profile/income-sources');
      set({ incomeSources });
    } catch (error) {
      console.error('Failed to load income sources:', error);
    }
  },

  connectIncomeSource: async (platform) => {
    set({ isUpdating: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock: Add a new connected source
        const newSource: IncomeSource = {
          id: `src_${Date.now()}`,
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          type: 'gig',
          platform,
          monthlyAverage: 0,
          lastUpdated: new Date().toISOString(),
          connected: true,
          accountId: `plaid_acc_${Date.now()}`,
        };
        set((state) => ({
          incomeSources: [...state.incomeSources, newSource],
          isUpdating: false,
        }));
        return;
      }

      await api.post('/profile/income-sources/connect', { platform });
      await get().loadIncomeSources();
      set({ isUpdating: false });
    } catch (error) {
      console.error('Failed to connect income source:', error);
      set({
        isUpdating: false,
        error: 'Failed to connect income source',
      });
      throw error;
    }
  },

  disconnectIncomeSource: async (sourceId) => {
    set({ isUpdating: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set((state) => ({
          incomeSources: state.incomeSources.map((s) =>
            s.id === sourceId ? { ...s, connected: false, accountId: undefined } : s
          ),
          isUpdating: false,
        }));
        return;
      }

      await api.delete(`/profile/income-sources/${sourceId}`);
      await get().loadIncomeSources();
      set({ isUpdating: false });
    } catch (error) {
      console.error('Failed to disconnect income source:', error);
      set({
        isUpdating: false,
        error: 'Failed to disconnect income source',
      });
      throw error;
    }
  },

  refreshIncomeData: async () => {
    set({ isUpdating: true });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        set({
          financialProfile: {
            ...MOCK_FINANCIAL_PROFILE,
            lastCalculated: new Date().toISOString(),
          },
          isUpdating: false,
        });
        return;
      }

      await api.post('/profile/income-sources/refresh');
      await Promise.all([
        get().loadFinancialProfile(),
        get().loadIncomeSources(),
      ]);
      set({ isUpdating: false });
    } catch (error) {
      console.error('Failed to refresh income data:', error);
      set({ isUpdating: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      profile: null,
      financialProfile: null,
      incomeSources: [],
      isLoading: false,
      isUpdating: false,
      error: null,
    });
    SecureStore.deleteItemAsync(CACHE_KEY);
  },
}));

export default useProfileStore;
