/**
 * Theme Context
 * Provides current theme (Paper & Ink / Midnight Ember) and colors to the app
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore } from '../store/theme-store';
import { dualThemes, type ThemeMode, type ThemeColors } from '../theme/dualThemes';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, loadStoredTheme } = useThemeStore();
  const colors = dualThemes[theme];

  useEffect(() => {
    loadStoredTheme();
  }, [loadStoredTheme]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
