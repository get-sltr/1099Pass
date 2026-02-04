/**
 * Auth Store
 * Manages authentication state, tokens, and onboarding status
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { Borrower } from '@1099pass/shared';
import { SubscriptionTier, KYCStatus } from '@1099pass/shared';
import { api } from '../services/api';

// Extended Borrower type for app-specific fields
interface AppUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  subscription_tier: SubscriptionTier;
  onboarding_complete?: boolean;
  created_at: string;
  updated_at: string;
}

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '1099pass_auth_token',
  REFRESH_TOKEN: '1099pass_refresh_token',
  USER: '1099pass_user',
  ONBOARDING_COMPLETE: '1099pass_onboarding_complete',
} as const;

interface AuthState {
  // Auth state
  user: AppUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Onboarding state
  hasCompletedOnboarding: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (user: Partial<AppUser>) => void;
  setLoading: (loading: boolean) => void;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
  hasCompletedOnboarding: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      // For development, use mock auth if API is not available
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        // Mock successful login for development
        const mockUser: AppUser = {
          id: 'mock-user-123',
          email,
          first_name: email.split('@')[0] || 'User',
          last_name: 'Demo',
          phone: '+1234567890',
          subscription_tier: SubscriptionTier.FREE,
          onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, mockToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(mockUser));

        const onboardingComplete = await SecureStore.getItemAsync(
          STORAGE_KEYS.ONBOARDING_COMPLETE
        );

        set({
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
          hasCompletedOnboarding: onboardingComplete === 'true',
          isLoading: false,
        });
        return;
      }

      // Production API call
      const response = await api.post<{
        token: string;
        refreshToken: string;
        user: AppUser;
      }>('/auth/login', { email, password });

      const { token, refreshToken, user } = response;

      // Store credentials securely
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        hasCompletedOnboarding: user.onboarding_complete ?? false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (data: SignUpData) => {
    set({ isLoading: true });

    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        // Mock successful signup for development
        const mockUser: AppUser = {
          id: 'mock-user-' + Date.now(),
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          subscription_tier: SubscriptionTier.FREE,
          onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, mockToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(mockUser));
        await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE, 'false');

        set({
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
          hasCompletedOnboarding: false,
          isLoading: false,
        });
        return;
      }

      // Production API call
      const response = await api.post<{
        token: string;
        refreshToken: string;
        user: AppUser;
      }>('/auth/register', {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      });

      const { token, refreshToken, user } = response;

      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        hasCompletedOnboarding: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      // Keep onboarding status for potential re-login
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });

    try {
      const [token, userJson, onboardingComplete] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
        SecureStore.getItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson) as AppUser;

        set({
          user,
          token,
          isAuthenticated: true,
          hasCompletedOnboarding: onboardingComplete === 'true' || user.onboarding_complete === true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  refreshAuthToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post<{ token: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken }
      );

      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      set({
        token: response.token,
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      // If refresh fails, logout
      await get().logout();
      throw error;
    }
  },

  completeOnboarding: async () => {
    const { user } = get();

    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');

      if (user) {
        const updatedUser = { ...user, onboarding_complete: true };
        await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

        set({
          user: updatedUser,
          hasCompletedOnboarding: true,
        });
      } else {
        set({ hasCompletedOnboarding: true });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  updateUser: (updates: Partial<AppUser>) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });

      // Persist to storage
      SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

export default useAuthStore;
