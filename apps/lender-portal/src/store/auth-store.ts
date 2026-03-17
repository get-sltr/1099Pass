import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export type UserRole = 'admin' | 'loan_officer' | 'underwriter';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId: string;
  institutionName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, token: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      loginWithCredentials: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Authenticate via Cognito through the backend
          const authResponse = await api.post<{
            idToken: string;
            accessToken: string;
            refreshToken?: string;
            expiresIn: number;
          }>('/auth/login', { email, password, clientType: 'LENDER' });

          // For now, build user from token claims
          // In a future iteration, fetch lender profile from /lender/profile
          const user: User = {
            id: email,
            email,
            firstName: email.split('@')[0] || 'User',
            lastName: '',
            role: 'admin',
            institutionId: '',
            institutionName: '',
          };

          set({
            user,
            token: authResponse.accessToken,
            refreshToken: authResponse.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Best-effort server-side revocation
        const state = useAuthStore.getState();
        if (state.token) {
          api.post('/auth/logout', {
            refreshToken: state.refreshToken,
            clientType: 'LENDER',
          }).catch(() => {});
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        // Ensure localStorage is fully cleared (zustand persist can be laggy)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lender-auth');
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'lender-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Role permission helpers
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['*'], // Admin has all permissions
    loan_officer: ['view_reports', 'contact_borrowers', 'view_analytics', 'message'],
    underwriter: ['view_reports', 'view_details', 'view_analytics'],
  };

  const userPermissions = permissions[role];
  return userPermissions.includes('*') || userPermissions.includes(permission);
}
