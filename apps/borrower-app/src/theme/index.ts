/**
 * 1099Pass Theme System
 * Clean Modern Design - Forest Green Theme
 *
 * "We see your real worth"
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from './typography';
import { spacing, spacingAliases, borderRadius, borderWidth, shadows, layout, zIndex } from './spacing';

/**
 * Complete theme object
 */
export const theme = {
  colors,
  fonts: {
    families: fontFamilies,
    sizes: fontSizes,
    weights: fontWeights,
    lineHeights,
    letterSpacing,
  },
  text: textStyles,
  spacing,
  spacingAliases,
  borderRadius,
  borderWidth,
  shadows,
  layout,
  zIndex,
} as const;

export type Theme = typeof theme;

/**
 * Animation durations (in ms)
 */
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  scoreReveal: 1000,
} as const;

/**
 * Common style patterns
 */
export const patterns = {
  // Card with shadow
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    ...shadows.sm,
  },

  // Card elevated (more shadow)
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    ...shadows.md,
  },

  // Input field
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: borderWidth.thin,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    height: layout.inputHeight,
  },

  // Button primary (pill shape)
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[6],
    height: layout.buttonHeight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Button secondary (outline pill)
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: borderWidth.medium,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[6],
    height: layout.buttonHeight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Screen container
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Row layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Row with space between
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
} as const;

export default theme;
