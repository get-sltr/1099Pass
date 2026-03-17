"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShareToken = generateShareToken;
exports.hashEmail = hashEmail;
exports.generateRandomString = generateRandomString;
/**
 * Node-only crypto utilities. Do not import from this file in React Native / browser.
 * Use encryption.ts for pure helpers (maskSSN, maskAccountNumber, secureCompare).
 */
const crypto_1 = require("crypto");
/** Generate a secure random share token */
function generateShareToken(length = 32) {
    return (0, crypto_1.randomBytes)(length).toString('base64url');
}
/** Hash an email for anonymization */
function hashEmail(email) {
    return (0, crypto_1.createHash)('sha256').update(email.toLowerCase().trim()).digest('hex');
}
/** Generate a random hex string */
function generateRandomString(length = 16) {
    return (0, crypto_1.randomBytes)(length).toString('hex');
}
//# sourceMappingURL=encryption-node.js.map