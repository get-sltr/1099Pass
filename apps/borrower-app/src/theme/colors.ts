/**
 * 1099Pass Brand Colors
 * Clean Modern Design System - Orange Brand Theme
 */

export const colors = {
  // Primary Brand Colors
  primary: '#FF6B00', // 1099Pass orange - bold, energetic, trustworthy
  primaryLight: '#FF8C33', // Lighter orange for hover states, active tabs

  // Secondary Colors
  secondary: '#F5A623', // Warm amber - energy, optimism, gig economy hustle

  // Accent Colors
  mint: '#FFE6D0', // Warm peach - badges, highlights, success accents, progress indicators
  mintSoft: '#FFF5EC', // Very light warm - subtle card backgrounds, section dividers
  amberSoft: '#FFF4E0', // Warm glow - notification badges, warning backgrounds

  // Background & Surface
  background: '#FAF9F6', // Warm off-white
  surface: '#FFFFFF', // Pure white cards

  // Text Colors
  textPrimary: '#111111', // Near-black - all body text, headings
  textSecondary: '#444444', // Medium gray - subtitles, timestamps, helper text
  textTertiary: '#999999', // Light gray - placeholders, disabled, meta text
  textInverse: '#FFFFFF', // White text on dark backgrounds

  // Border
  border: 'rgba(0, 0, 0, 0.06)', // Neutral border
  borderFocused: '#FF6B00', // Focus state border

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Score Colors - Letter Grades
  scoreColors: {
    'A+': '#10B981',
    'A': '#34D399',
    'B+': '#F5A623',
    'B': '#FBBF24',
    'C+': '#F97316',
    'C': '#FB923C',
    'D': '#EF4444',
    'F': '#DC2626',
  },

  // Shadows (color values for rgba)
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Input States
  inputBackground: '#FFFFFF',
  inputBorder: 'rgba(0, 0, 0, 0.06)',
  inputBorderFocused: '#FF6B00',
  inputPlaceholder: '#999999',

  // Tab/Navigation
  tabInactive: '#999999',
  tabActive: '#FF6B00',

  // Skeleton Loading
  skeletonBase: 'rgba(0, 0, 0, 0.06)',
  skeletonHighlight: 'rgba(0, 0, 0, 0.03)',
} as const;

export type ColorKey = keyof typeof colors;
export type ScoreGrade = keyof typeof colors.scoreColors;

/**
 * Get score color based on letter grade
 */
export function getScoreColor(grade: string): string {
  return colors.scoreColors[grade as ScoreGrade] || colors.textSecondary;
}

/**
 * Get score color based on numeric score
 */
export function getScoreColorByValue(score: number): string {
  if (score >= 95) return colors.scoreColors['A+'];
  if (score >= 90) return colors.scoreColors['A'];
  if (score >= 85) return colors.scoreColors['B+'];
  if (score >= 80) return colors.scoreColors['B'];
  if (score >= 75) return colors.scoreColors['C+'];
  if (score >= 70) return colors.scoreColors['C'];
  if (score >= 60) return colors.scoreColors['D'];
  return colors.scoreColors['F'];
}

/**
 * Get letter grade from numeric score
 */
export function getLetterGrade(score: number): ScoreGrade {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
