import { create } from 'zustand';

export interface BorrowerReport {
  id: string;
  borrowerId: string;
  score: number;
  letterGrade: string;
  projectedAnnualIncome: number;
  monthlyAverageIncome: number;
  sourceCount: number;
  primarySourceType: string;
  incomeTrend: 'growing' | 'stable' | 'declining';
  incomeCV: number;
  dtiEstimate?: number;
  reportDate: string;
  verificationStatus: 'verified' | 'pending' | 'partial';
  state?: string;
  loanType?: 'mortgage' | 'auto' | 'both';
}

export interface ReportFilters {
  loanType: 'mortgage' | 'auto' | 'all';
  minScore: number;
  minIncome: number;
  maxIncome: number;
  incomeSourceTypes: string[];
  states: string[];
  freshness: '7' | '30' | '90' | 'all';
  sortBy: 'score' | 'income' | 'newest' | 'oldest';
}

interface ReportsState {
  reports: BorrowerReport[];
  filters: ReportFilters;
  selectedReportId: string | null;
  savedSearches: { name: string; filters: ReportFilters }[];
  shortlist: string[]; // Report IDs
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;

  // Actions
  setFilters: (filters: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  setSelectedReport: (id: string | null) => void;
  addToShortlist: (reportId: string) => void;
  removeFromShortlist: (reportId: string) => void;
  isInShortlist: (reportId: string) => boolean;
  saveSearch: (name: string) => void;
  loadSearch: (name: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

const defaultFilters: ReportFilters = {
  loanType: 'all',
  minScore: 0,
  minIncome: 0,
  maxIncome: 1000000,
  incomeSourceTypes: [],
  states: [],
  freshness: 'all',
  sortBy: 'score',
};

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  filters: defaultFilters,
  selectedReportId: null,
  savedSearches: [],
  shortlist: [],
  isLoading: false,
  totalCount: 0,
  currentPage: 1,
  pageSize: 25,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page on filter change
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters, currentPage: 1 });
  },

  setSelectedReport: (id) => {
    set({ selectedReportId: id });
  },

  addToShortlist: (reportId) => {
    set((state) => ({
      shortlist: state.shortlist.includes(reportId)
        ? state.shortlist
        : [...state.shortlist, reportId],
    }));
  },

  removeFromShortlist: (reportId) => {
    set((state) => ({
      shortlist: state.shortlist.filter((id) => id !== reportId),
    }));
  },

  isInShortlist: (reportId) => {
    return get().shortlist.includes(reportId);
  },

  saveSearch: (name) => {
    const { filters, savedSearches } = get();
    set({
      savedSearches: [...savedSearches, { name, filters: { ...filters } }],
    });
  },

  loadSearch: (name) => {
    const { savedSearches } = get();
    const search = savedSearches.find((s) => s.name === name);
    if (search) {
      set({ filters: { ...search.filters }, currentPage: 1 });
    }
  },

  setPage: (page) => {
    set({ currentPage: page });
  },

  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 });
  },
}));
