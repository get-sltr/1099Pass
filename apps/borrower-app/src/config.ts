/**
 * App config — env-driven flags.
 * Production: mocks are always off. Development: mocks unless EXPO_PUBLIC_USE_REAL_API=true.
 */
export const USE_REAL_API =
  process.env.EXPO_PUBLIC_USE_REAL_API === 'true' || process.env.EXPO_PUBLIC_USE_REAL_API === '1';

/** Use mocks only in non-production when real API is not requested. */
export const USE_MOCKS =
  process.env.NODE_ENV !== 'production' && !USE_REAL_API;
