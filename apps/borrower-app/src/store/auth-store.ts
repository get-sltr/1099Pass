/**
 * Auth Store
 * Manages authentication state, tokens, and onboarding status
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { Borrower } from '@1099pass/shared';
import { SubscriptionTier, KYCStatus } from '@1099pass/shared';
import { api, setAuthInvalidatedCallback } from '../services/api';
import { USE_MOCKS } from '../config';

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
      if (USE_MOCKS) {
        // Mock successful login for development
        const mockUser: AppUser = {
          id: 'e418a4a8-6061-708f-eebd-8e99eb78a85e',
          email,
          first_name: 'Kevin',
          last_name: 'Minn',
          phone: null,
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

      // Authenticate with Cognito via backend
      const authResponse = await api.post<{
        idToken: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/login', { email, password });

      const token = authResponse.accessToken;
      const refreshToken = authResponse.refreshToken;

      // Store credentials securely
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
      if (refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Fetch the borrower profile from the API
      const profileResponse = await api.get<{ data: AppUser }>('/borrower/profile');
      const user: AppUser = profileResponse.data ?? {
        id: 'unknown',
        email,
        first_name: email.split('@')[0] || 'User',
        last_name: '',
        subscription_tier: SubscriptionTier.FREE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      if (USE_MOCKS) {
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

      // Register via backend (creates Cognito user + DB record + returns tokens)
      const response = await api.post<{
        idToken?: string;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        user: AppUser;
        message?: string;
      }>('/auth/register', {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      });

      const user = response.user;
      const token = response.accessToken;
      const refreshToken = response.refreshToken;

      if (token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
      }
      if (refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
      await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE, 'false');

      set({
        user,
        token: token ?? null,
        refreshToken: refreshToken ?? null,
        isAuthenticated: !!token,
        hasCompletedOnboarding: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const { token, refreshToken } = get();

    // Revoke session server-side (best-effort — don't block local cleanup on failure)
    if (token && !USE_MOCKS) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Server-side revocation failed — still proceed with local cleanup
      }
    }

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
      const response = await api.post<{
        token: string;
        idToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/refresh', { refreshToken });

      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      if (response.refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }

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

// Wire up the API interceptor so a failed token refresh syncs Zustand → triggers UI redirect
setAuthInvalidatedCallback(() => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
