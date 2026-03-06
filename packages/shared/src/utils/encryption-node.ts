/**
 * Node-only crypto utilities. Do not import from this file in React Native / browser.
 * Use encryption.ts for pure helpers (maskSSN, maskAccountNumber, secureCompare).
 */
import { createHash, randomBytes } from 'crypto';

/** Generate a secure random share token */
export function generateShareToken(length = 32): string {
  return randomBytes(length).toString('base64url');
}

/** Hash an email for anonymization */
export function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/** Generate a random hex string */
export function generateRandomString(length = 16): string {
  return randomBytes(length).toString('hex');
}
