import { create } from 'zustand';
import { Borrower } from '@1099pass/shared';

interface AuthState {
  user: Borrower | null;
  tokens: { accessToken: string; refreshToken: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: Borrower, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
  logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
