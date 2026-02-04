/**
 * Report Store
 * Manages income verification reports
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Types
export type ReportStatus = 'generating' | 'active' | 'expired' | 'revoked';
export type ReportPeriod = '3months' | '6months' | '12months' | 'ytd';

export interface Report {
  id: string;
  period: ReportPeriod;
  status: ReportStatus;
  recipient?: string;
  recipientEmail?: string;
  accessCount: number;
  lastViewedAt?: string;
  shareUrl?: string;
  shareExpiresAt?: string;
  pdfUrl?: string;
  incomeData: {
    totalIncome: number;
    monthlyAverage: number;
    incomeSources: Array<{
      name: string;
      type: string;
      amount: number;
      percentage: number;
    }>;
  };
  createdAt: string;
  expiresAt: string;
}

export interface ReportGenerationOptions {
  period: ReportPeriod;
  recipient?: string;
  recipientEmail?: string;
  includeCharts?: boolean;
  includeProjections?: boolean;
}

interface ReportState {
  // State
  reports: Report[];
  currentReport: Report | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  loadReports: () => Promise<void>;
  getReport: (reportId: string) => Promise<Report | null>;
  generateReport: (options: ReportGenerationOptions) => Promise<Report>;
  shareReport: (reportId: string, email?: string) => Promise<string>;
  revokeReport: (reportId: string) => Promise<void>;
  downloadReport: (reportId: string) => Promise<string>;

  // Utilities
  getActiveReports: () => Report[];
  clearError: () => void;
  reset: () => void;
}

const CACHE_KEY = '1099pass_reports_cache';

// Mock data for development
const MOCK_REPORTS: Report[] = [
  {
    id: 'rpt_1',
    period: '12months',
    status: 'active',
    recipient: 'Quick Mortgage Co.',
    accessCount: 3,
    lastViewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    shareUrl: 'https://1099pass.com/share/abc123',
    shareExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    incomeData: {
      totalIncome: 78500,
      monthlyAverage: 6542,
      incomeSources: [
        { name: 'Uber', type: 'gig', amount: 38400, percentage: 49 },
        { name: 'Freelance Design', type: 'freelance', amount: 30000, percentage: 38 },
        { name: 'Consulting', type: 'business', amount: 10100, percentage: 13 },
      ],
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rpt_2',
    period: '6months',
    status: 'expired',
    recipient: 'Auto Finance Plus',
    accessCount: 1,
    incomeData: {
      totalIncome: 39250,
      monthlyAverage: 6542,
      incomeSources: [
        { name: 'Uber', type: 'gig', amount: 19200, percentage: 49 },
        { name: 'Freelance Design', type: 'freelance', amount: 15000, percentage: 38 },
        { name: 'Consulting', type: 'business', amount: 5050, percentage: 13 },
      ],
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rpt_3',
    period: '3months',
    status: 'revoked',
    recipient: 'Credit Union One',
    accessCount: 0,
    incomeData: {
      totalIncome: 19625,
      monthlyAverage: 6542,
      incomeSources: [
        { name: 'Uber', type: 'gig', amount: 9600, percentage: 49 },
        { name: 'Freelance Design', type: 'freelance', amount: 7500, percentage: 38 },
        { name: 'Consulting', type: 'business', amount: 2525, percentage: 13 },
      ],
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useReportStore = create<ReportState>((set, get) => ({
  // Initial state
  reports: [],
  currentReport: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  loadReports: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load from cache first
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        set({ reports: JSON.parse(cached) });
      }

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          reports: MOCK_REPORTS,
          isLoading: false,
        });
        return;
      }

      const reports = await api.get<Report[]>('/reports');
      set({ reports, isLoading: false });

      // Update cache
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to load reports:', error);
      set({
        isLoading: false,
        error: 'Failed to load reports',
      });
    }
  },

  getReport: async (reportId) => {
    set({ isLoading: true, error: null });

    try {
      // Check local cache first
      const localReport = get().reports.find((r) => r.id === reportId);
      if (localReport) {
        set({ currentReport: localReport, isLoading: false });
        return localReport;
      }

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const mockReport = MOCK_REPORTS.find((r) => r.id === reportId);
        set({ currentReport: mockReport || null, isLoading: false });
        return mockReport || null;
      }

      const report = await api.get<Report>(`/reports/${reportId}`);
      set({ currentReport: report, isLoading: false });
      return report;
    } catch (error) {
      console.error('Failed to get report:', error);
      set({
        isLoading: false,
        error: 'Failed to load report details',
      });
      return null;
    }
  },

  generateReport: async (options) => {
    set({ isGenerating: true, error: null });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        // Simulate generation time
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const newReport: Report = {
          id: `rpt_${Date.now()}`,
          period: options.period,
          status: 'active',
          recipient: options.recipient,
          recipientEmail: options.recipientEmail,
          accessCount: 0,
          shareUrl: `https://1099pass.com/share/${Date.now()}`,
          shareExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          incomeData: MOCK_REPORTS[0].incomeData,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
          currentReport: newReport,
          isGenerating: false,
        }));

        return newReport;
      }

      const report = await api.post<Report>('/reports/generate', options);

      set((state) => ({
        reports: [report, ...state.reports],
        currentReport: report,
        isGenerating: false,
      }));

      return report;
    } catch (error) {
      console.error('Failed to generate report:', error);
      set({
        isGenerating: false,
        error: 'Failed to generate report',
      });
      throw error;
    }
  },

  shareReport: async (reportId, email) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const shareUrl = `https://1099pass.com/share/${reportId}?t=${Date.now()}`;
        return shareUrl;
      }

      const { shareUrl } = await api.post<{ shareUrl: string }>(`/reports/${reportId}/share`, {
        email,
      });

      return shareUrl;
    } catch (error) {
      console.error('Failed to share report:', error);
      throw error;
    }
  },

  revokeReport: async (reportId) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: 'revoked' as ReportStatus, shareUrl: undefined } : r
          ),
        }));
        return;
      }

      await api.post(`/reports/${reportId}/revoke`);

      set((state) => ({
        reports: state.reports.map((r) =>
          r.id === reportId ? { ...r, status: 'revoked' as ReportStatus, shareUrl: undefined } : r
        ),
      }));
    } catch (error) {
      console.error('Failed to revoke report:', error);
      throw error;
    }
  },

  downloadReport: async (reportId) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return `https://1099pass.com/reports/${reportId}/download.pdf`;
      }

      const { downloadUrl } = await api.get<{ downloadUrl: string }>(`/reports/${reportId}/download`);
      return downloadUrl;
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  },

  getActiveReports: () => {
    return get().reports.filter((r) => r.status === 'active');
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      reports: [],
      currentReport: null,
      isLoading: false,
      isGenerating: false,
      error: null,
    });
    SecureStore.deleteItemAsync(CACHE_KEY);
  },
}));

export default useReportStore;
