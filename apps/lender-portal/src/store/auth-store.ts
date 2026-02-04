import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      loginWithCredentials: async (email: string, _password: string) => {
        set({ isLoading: true });

        try {
          // TODO: Replace with actual API call
          // For development, mock successful login
          const mockUser: User = {
            id: 'lender-user-123',
            email,
            firstName: 'John',
            lastName: 'Smith',
            role: 'loan_officer',
            institutionId: 'inst-123',
            institutionName: 'Quick Mortgage Co.',
          };

          const mockToken = 'mock-jwt-token-' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
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
