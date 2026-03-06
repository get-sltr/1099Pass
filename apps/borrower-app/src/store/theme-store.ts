/**
 * Theme Store
 * Persists day/night (Paper & Ink / Midnight Ember) preference
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../theme/dualThemes';

const THEME_STORAGE_KEY = '1099pass_theme_mode';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  loadStoredTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'day',

  setTheme: async (mode: ThemeMode) => {
    set({ theme: mode });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  },

  loadStoredTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'day' || stored === 'night') {
        set({ theme: stored });
      }
    } catch {
      // ignore
    }
  },
}));
