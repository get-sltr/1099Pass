/**
 * Pure encryption/formatting helpers (no Node.js crypto).
 * Safe to use in React Native. Node-only helpers live in encryption-node.ts.
 */
/** Mask SSN showing only last 4 digits */
export declare function maskSSN(ssn: string): string;
/** Mask account number showing only last 4 digits */
export declare function maskAccountNumber(account: string): string;
/** Constant-time string comparison */
export declare function secureCompare(a: string, b: string): boolean;
//# sourceMappingURL=encryption.d.ts.map