/**
 * Pure encryption/formatting helpers (no Node.js crypto).
 * Safe to use in React Native. Node-only helpers live in encryption-node.ts.
 */

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

/** Constant-time string comparison */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
