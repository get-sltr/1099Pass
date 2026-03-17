"use strict";
/**
 * Pure encryption/formatting helpers (no Node.js crypto).
 * Safe to use in React Native. Node-only helpers live in encryption-node.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSSN = maskSSN;
exports.maskAccountNumber = maskAccountNumber;
exports.secureCompare = secureCompare;
/** Mask SSN showing only last 4 digits */
function maskSSN(ssn) {
    const cleaned = ssn.replace(/[\s-]/g, '');
    if (cleaned.length !== 9)
        return 'XXX-XX-XXXX';
    return `***-**-${cleaned.slice(-4)}`;
}
/** Mask account number showing only last 4 digits */
function maskAccountNumber(account) {
    if (account.length <= 4)
        return '****';
    return `${'*'.repeat(account.length - 4)}${account.slice(-4)}`;
}
/** Constant-time string comparison */
function secureCompare(a, b) {
    if (a.length !== b.length)
        return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
//# sourceMappingURL=encryption.js.map