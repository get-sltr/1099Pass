/**
 * Lender Store
 * Manages lender directory and matching
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Types
export type LoanType = 'mortgage' | 'auto' | 'personal' | 'business' | 'refinance' | 'home_equity';

export interface Lender {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  rating: number;
  reviewCount: number;
  loanTypes: LoanType[];
  minIncome: number;
  maxDti: number;
  acceptedIncomeSources: string[];
  states: string[];
  features: string[];
  matchScore?: number;
  isFeatured: boolean;
  isVerified: boolean;
  responseTime: string;
  approvalRate: number;
  avgInterestRate?: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  createdAt: string;
}

export interface LenderFilters {
  loanTypes?: LoanType[];
  minMatchScore?: number;
  states?: string[];
  sortBy?: 'matchScore' | 'rating' | 'responseTime' | 'approvalRate';
  sortOrder?: 'asc' | 'desc';
}

interface LenderState {
  // State
  lenders: Lender[];
  filteredLenders: Lender[];
  savedLenders: string[];
  filters: LenderFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLenders: () => Promise<void>;
  applyFilters: (filters: LenderFilters) => void;
  clearFilters: () => void;
  saveLender: (lenderId: string) => void;
  unsaveLender: (lenderId: string) => void;
  getLenderById: (lenderId: string) => Lender | undefined;
  contactLender: (lenderId: string, message?: string) => Promise<void>;

  // Utilities
  getMatchedLenders: () => Lender[];
  getSavedLenders: () => Lender[];
  clearError: () => void;
  reset: () => void;
}

const CACHE_KEY = '1099pass_lenders_cache';
const SAVED_KEY = '1099pass_saved_lenders';

// Mock data for development
const MOCK_LENDERS: Lender[] = [
  {
    id: 'lnd_1',
    name: 'Quick Mortgage Co.',
    description: 'Specializing in self-employed and gig worker mortgages. We understand your income.',
    rating: 4.8,
    reviewCount: 1247,
    loanTypes: ['mortgage', 'refinance', 'home_equity'],
    minIncome: 48000,
    maxDti: 45,
    acceptedIncomeSources: ['uber', 'lyft', 'doordash', 'upwork', 'freelance', 'business'],
    states: ['CA', 'TX', 'FL', 'NY', 'WA', 'AZ', 'CO'],
    features: ['Bank statement loans', 'No tax returns required', '1099 income accepted'],
    matchScore: 95,
    isFeatured: true,
    isVerified: true,
    responseTime: '< 24 hours',
    approvalRate: 78,
    avgInterestRate: 6.25,
    minLoanAmount: 100000,
    maxLoanAmount: 3000000,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lnd_2',
    name: 'Drive Finance',
    description: 'Auto loans designed for ride-share drivers and delivery partners.',
    rating: 4.5,
    reviewCount: 892,
    loanTypes: ['auto'],
    minIncome: 36000,
    maxDti: 50,
    acceptedIncomeSources: ['uber', 'lyft', 'doordash', 'instacart', 'amazon_flex'],
    states: ['CA', 'TX', 'FL', 'AZ', 'NV', 'OR'],
    features: ['Same-day approval', 'Flexible terms', 'Rideshare bonus rates'],
    matchScore: 88,
    isFeatured: false,
    isVerified: true,
    responseTime: 'Same day',
    approvalRate: 82,
    avgInterestRate: 7.5,
    minLoanAmount: 5000,
    maxLoanAmount: 75000,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lnd_3',
    name: 'Freelancer Credit Union',
    description: 'Member-owned credit union built for the freelance economy.',
    rating: 4.9,
    reviewCount: 567,
    loanTypes: ['personal', 'business', 'auto'],
    minIncome: 30000,
    maxDti: 40,
    acceptedIncomeSources: ['upwork', 'fiverr', 'freelance', 'business', 'consulting'],
    states: ['CA', 'NY', 'MA', 'WA', 'CO', 'IL'],
    features: ['Low rates', 'No minimum credit score', 'Financial coaching'],
    matchScore: 82,
    isFeatured: true,
    isVerified: true,
    responseTime: '1-2 business days',
    approvalRate: 71,
    avgInterestRate: 5.99,
    minLoanAmount: 1000,
    maxLoanAmount: 50000,
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lnd_4',
    name: 'Gig Workers Bank',
    description: 'Banking and lending solutions built from the ground up for gig workers.',
    rating: 4.3,
    reviewCount: 423,
    loanTypes: ['personal', 'auto'],
    minIncome: 24000,
    maxDti: 55,
    acceptedIncomeSources: ['uber', 'lyft', 'doordash', 'instacart', 'postmates', 'grubhub'],
    states: ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA'],
    features: ['Weekly payments accepted', 'Income smoothing tools', 'Emergency advances'],
    matchScore: 75,
    isFeatured: false,
    isVerified: true,
    responseTime: '< 48 hours',
    approvalRate: 85,
    minLoanAmount: 500,
    maxLoanAmount: 25000,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useLenderStore = create<LenderState>((set, get) => ({
  // Initial state
  lenders: [],
  filteredLenders: [],
  savedLenders: [],
  filters: {},
  isLoading: false,
  error: null,

  loadLenders: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load saved lenders from storage
      const savedJson = await SecureStore.getItemAsync(SAVED_KEY);
      if (savedJson) {
        set({ savedLenders: JSON.parse(savedJson) });
      }

      // Load from cache first
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        const lenders = JSON.parse(cached);
        set({ lenders, filteredLenders: lenders });
      }

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          lenders: MOCK_LENDERS,
          filteredLenders: MOCK_LENDERS,
          isLoading: false,
        });
        return;
      }

      const lenders = await api.get<Lender[]>('/lenders');
      set({
        lenders,
        filteredLenders: lenders,
        isLoading: false,
      });

      // Update cache
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(lenders));
    } catch (error) {
      console.error('Failed to load lenders:', error);
      set({
        isLoading: false,
        error: 'Failed to load lenders',
      });
    }
  },

  applyFilters: (filters) => {
    const { lenders } = get();

    let filtered = [...lenders];

    // Filter by loan types
    if (filters.loanTypes && filters.loanTypes.length > 0) {
      filtered = filtered.filter((l) =>
        filters.loanTypes!.some((lt) => l.loanTypes.includes(lt))
      );
    }

    // Filter by minimum match score
    if (filters.minMatchScore) {
      filtered = filtered.filter((l) => (l.matchScore || 0) >= filters.minMatchScore!);
    }

    // Filter by states
    if (filters.states && filters.states.length > 0) {
      filtered = filtered.filter((l) =>
        filters.states!.some((s) => l.states.includes(s))
      );
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: number, bVal: number;

        switch (filters.sortBy) {
          case 'matchScore':
            aVal = a.matchScore || 0;
            bVal = b.matchScore || 0;
            break;
          case 'rating':
            aVal = a.rating;
            bVal = b.rating;
            break;
          case 'approvalRate':
            aVal = a.approvalRate;
            bVal = b.approvalRate;
            break;
          case 'responseTime':
            // Convert response time to hours for sorting
            aVal = a.responseTime.includes('Same day') ? 4 : parseInt(a.responseTime) || 24;
            bVal = b.responseTime.includes('Same day') ? 4 : parseInt(b.responseTime) || 24;
            break;
          default:
            return 0;
        }

        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    // Featured lenders always first (unless sorting by something else)
    if (!filters.sortBy) {
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    set({ filters, filteredLenders: filtered });
  },

  clearFilters: () => {
    const { lenders } = get();
    set({ filters: {}, filteredLenders: lenders });
  },

  saveLender: (lenderId) => {
    set((state) => {
      const newSaved = [...state.savedLenders, lenderId];
      SecureStore.setItemAsync(SAVED_KEY, JSON.stringify(newSaved));
      return { savedLenders: newSaved };
    });
  },

  unsaveLender: (lenderId) => {
    set((state) => {
      const newSaved = state.savedLenders.filter((id) => id !== lenderId);
      SecureStore.setItemAsync(SAVED_KEY, JSON.stringify(newSaved));
      return { savedLenders: newSaved };
    });
  },

  getLenderById: (lenderId) => {
    return get().lenders.find((l) => l.id === lenderId);
  },

  contactLender: async (lenderId, message) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Would create a conversation in messaging store
        return;
      }

      await api.post(`/lenders/${lenderId}/contact`, { message });
    } catch (error) {
      console.error('Failed to contact lender:', error);
      throw error;
    }
  },

  getMatchedLenders: () => {
    return get().lenders.filter((l) => (l.matchScore || 0) >= 70);
  },

  getSavedLenders: () => {
    const { lenders, savedLenders } = get();
    return lenders.filter((l) => savedLenders.includes(l.id));
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      lenders: [],
      filteredLenders: [],
      savedLenders: [],
      filters: {},
      isLoading: false,
      error: null,
    });
    SecureStore.deleteItemAsync(CACHE_KEY);
    SecureStore.deleteItemAsync(SAVED_KEY);
  },
}));

export default useLenderStore;
