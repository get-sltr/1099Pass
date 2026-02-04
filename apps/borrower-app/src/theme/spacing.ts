/**
 * 1099Pass Spacing System
 * Based on 4px grid system
 */

/**
 * Spacing Scale (in pixels)
 * All spacing values are multiples of 4
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Common spacing aliases
 */
export const spacingAliases = {
  none: spacing[0],
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  '2xl': spacing[10],
  '3xl': spacing[12],
  '4xl': spacing[16],
} as const;

/**
 * Border Radius
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12, // Cards
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 100, // Pills, badges, CTAs (fully rounded)
} as const;

/**
 * Border Width
 */
export const borderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

/**
 * Shadows (elevation levels)
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(27, 77, 62, 1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: 'rgba(27, 77, 62, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: 'rgba(27, 77, 62, 1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  xl: {
    shadowColor: 'rgba(27, 77, 62, 1)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
} as const;

/**
 * Layout Constants
 */
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing[4],
  screenPaddingVertical: spacing[4],

  // Card padding
  cardPadding: spacing[4],
  cardPaddingLarge: spacing[6],

  // Input heights
  inputHeightSmall: 40,
  inputHeight: 48,
  inputHeightLarge: 56,

  // Button heights
  buttonHeightSmall: 36,
  buttonHeight: 48,
  buttonHeightLarge: 56,

  // Touch targets (minimum 44x44 for accessibility)
  minTouchTarget: 44,

  // Header heights
  headerHeight: 56,
  tabBarHeight: 80,

  // Max content width (for tablets)
  maxContentWidth: 480,

  // Icon sizes
  iconSizeSmall: 16,
  iconSize: 20,
  iconSizeLarge: 24,
  iconSizeXLarge: 32,
} as const;

/**
 * Z-Index layers
 */
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingAliasKey = keyof typeof spacingAliases;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
