import { createHash, randomBytes } from 'crypto';

/** Generate a secure random share token */
export function generateShareToken(length = 32): string {
  return randomBytes(length).toString('base64url');
}

/** Hash an email for anonymization */
export function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/** Mask SSN showing only last 4 digits */
export function maskSSN(ssn: string): string {
  const cleaned = ssn.replace(/[\s-]/g, '');
  if (cleaned.length !== 9) return 'XXX-XX-XXXX';
  return `***-**-${cleaned.slice(-4)}`;
}

/** Mask account number showing only last 4 digits */
export function maskAccountNumber(account: string): string {
  if (account.length <= 4) return '****';
  return `${'*'.repeat(account.length - 4)}${account.slice(-4)}`;
}

/** Generate a random hex string */
export function generateRandomString(length = 16): string {
  return randomBytes(length).toString('hex');
}

/** Constant-time string comparison */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
