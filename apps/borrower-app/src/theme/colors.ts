/**
 * 1099Pass Brand Colors
 * Clean Modern Design System - Forest Green Theme
 */

export const colors = {
  // Primary Brand Colors
  primary: '#1B4D3E', // Deep forest green - trust, stability, money
  primaryLight: '#2A7A5F', // Lighter forest for hover states, active tabs

  // Secondary Colors
  secondary: '#F5A623', // Warm amber - energy, optimism, gig economy hustle

  // Accent Colors
  mint: '#A8E6CF', // Fresh mint - badges, highlights, success accents, progress indicators
  mintSoft: '#E8F8F0', // Very light mint - subtle card backgrounds, section dividers
  amberSoft: '#FFF4E0', // Warm glow - notification badges, warning backgrounds

  // Background & Surface
  background: '#FAFDF8', // Warm off-white with green tint
  surface: '#FFFFFF', // Pure white cards

  // Text Colors
  textPrimary: '#1A2E26', // Green-black - all body text, headings
  textSecondary: '#5C7A6E', // Green-gray - subtitles, timestamps, helper text
  textTertiary: '#9CB4A8', // Light green-gray - placeholders, disabled, meta text
  textInverse: '#FFFFFF', // White text on dark backgrounds

  // Border
  border: '#E2EDE7', // Green-tinted border
  borderFocused: '#2A7A5F', // Focus state border

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
  shadowLight: 'rgba(27, 77, 62, 0.06)',
  shadowMedium: 'rgba(27, 77, 62, 0.1)',
  shadowDark: 'rgba(27, 77, 62, 0.15)',

  // Overlays
  overlay: 'rgba(26, 46, 38, 0.5)',
  overlayLight: 'rgba(26, 46, 38, 0.3)',

  // Input States
  inputBackground: '#FFFFFF',
  inputBorder: '#E2EDE7',
  inputBorderFocused: '#2A7A5F',
  inputPlaceholder: '#9CB4A8',

  // Tab/Navigation
  tabInactive: '#9CB4A8',
  tabActive: '#1B4D3E',

  // Skeleton Loading
  skeletonBase: '#E8F0EC',
  skeletonHighlight: '#F5FAF8',
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
