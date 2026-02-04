/**
 * 1099Pass Typography System
 * Modern, clean, professional with warmth
 */

import { Platform } from 'react-native';

/**
 * Font Families
 * - Outfit: Modern, clean, slightly geometric - for headings and body
 * - Source Serif 4: Warm editorial feel - for accent text
 * - JetBrains Mono: Professional data look - for numbers/financial figures
 *
 * Note: These fonts need to be loaded via expo-font or Google Fonts
 * For now, we use system fonts as fallbacks
 */
export const fontFamilies = {
  // Primary font for headings and body
  heading: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  headingBold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),

  // Body text
  body: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),

  // Accent text (editorial feel)
  accent: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),

  // Numbers and financial data
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

/**
 * Font Sizes (in pixels)
 * Based on a modular scale with 1.25 ratio
 */
export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 24,
  '2xl': 30,
  '3xl': 38,
  '4xl': 48,
  '5xl': 60,
} as const;

/**
 * Line Heights (multipliers)
 */
export const lineHeights = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

/**
 * Font Weights
 */
export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

/**
 * Letter Spacing
 */
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

/**
 * Pre-defined Text Styles
 */
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },

  // Body Text
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Labels and Captions
  label: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.snug,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Numbers and Financial Data
  moneyDisplay: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  scoreDisplay: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  scoreLarge: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  moneyLarge: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  money: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  moneySmall: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },

  // Button Text
  buttonLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  },

  // Links
  link: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Accent/Editorial
  accent: {
    fontFamily: fontFamilies.accent,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    fontStyle: 'italic' as const,
  },
} as const;

export type TextStyleKey = keyof typeof textStyles;
