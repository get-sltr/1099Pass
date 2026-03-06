/**
 * 1099Pass Dual Theme System
 * Paper & Ink (day) + Midnight Ember (night)
 * From design spec: 1099pass-dual-theme
 */

export type ThemeMode = 'day' | 'night';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  mint: string;
  mintSoft: string;
  amberSoft: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderFocused: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  scoreColors: Record<string, string>;
  shadowLight: string;
  shadowMedium: string;
  shadowDark: string;
  overlay: string;
  overlayLight: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputPlaceholder: string;
  tabInactive: string;
  tabActive: string;
  skeletonBase: string;
  skeletonHighlight: string;
}

const scoreColors = {
  'A+': '#10B981',
  'A': '#34D399',
  'B+': '#F5A623',
  'B': '#FBBF24',
  'C+': '#F97316',
  'C': '#FB923C',
  'D': '#EF4444',
  'F': '#DC2626',
};

/** Paper & Ink — Day mode. Editorial, trustworthy, clean. */
export const dayTheme: ThemeColors = {
  primary: '#FF6B00',
  primaryLight: '#FF8C33',
  secondary: '#FF8C33',
  mint: '#FFF5EC',
  mintSoft: '#FFF5EC',
  amberSoft: '#FFF5EC',
  background: '#FAF9F6',
  surface: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#444444',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.06)',
  borderFocused: 'rgba(255, 107, 0, 0.5)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  scoreColors,
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  inputBackground: '#FFFFFF',
  inputBorder: 'rgba(0, 0, 0, 0.06)',
  inputBorderFocused: '#FF6B00',
  inputPlaceholder: '#999999',
  tabInactive: '#999999',
  tabActive: '#FF6B00',
  skeletonBase: 'rgba(0, 0, 0, 0.06)',
  skeletonHighlight: 'rgba(0, 0, 0, 0.03)',
};

/** Midnight Ember — Night mode. Premium, cinematic, bold. */
export const nightTheme: ThemeColors = {
  primary: '#FF8C33',
  primaryLight: '#FF6B00',
  secondary: '#FF6B00',
  mint: 'rgba(255, 140, 51, 0.15)',
  mintSoft: '#0F0A05',
  amberSoft: '#0F0A05',
  background: '#050505',
  surface: 'rgba(255, 140, 51, 0.04)',
  textPrimary: '#F0F0F0',
  textSecondary: '#999999',
  textTertiary: '#555555',
  textInverse: '#111111',
  border: 'rgba(255, 140, 51, 0.08)',
  borderFocused: 'rgba(255, 140, 51, 0.5)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  scoreColors,
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(255, 140, 51, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  inputBackground: 'rgba(255, 255, 255, 0.045)',
  inputBorder: 'rgba(255, 255, 255, 0.07)',
  inputBorderFocused: '#FF8C33',
  inputPlaceholder: '#555555',
  tabInactive: '#555555',
  tabActive: '#FF8C33',
  skeletonBase: 'rgba(255, 255, 255, 0.06)',
  skeletonHighlight: 'rgba(255, 255, 255, 0.03)',
};

export const dualThemes: Record<ThemeMode, ThemeColors> = {
  day: dayTheme,
  night: nightTheme,
};

export const themeNames: Record<ThemeMode, string> = {
  day: 'Paper & Ink',
  night: 'Midnight Ember',
};
