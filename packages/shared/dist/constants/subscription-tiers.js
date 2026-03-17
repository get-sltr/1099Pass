"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LENDER_TIERS = exports.BORROWER_TIERS = void 0;
exports.getBorrowerTier = getBorrowerTier;
exports.getLenderTier = getLenderTier;
const borrower_1 = require("../types/borrower");
const lender_1 = require("../types/lender");
/** Borrower subscription tiers */
exports.BORROWER_TIERS = [
    {
        tier: borrower_1.SubscriptionTier.FREE,
        name: 'Free',
        price_monthly: 0,
        reports_per_month: 1,
        features: ['1 report/month', 'Basic loan readiness score', 'Connect 2 income sources', '1GB document storage'],
    },
    {
        tier: borrower_1.SubscriptionTier.PLUS,
        name: 'Plus',
        price_monthly: 9.99,
        reports_per_month: 5,
        features: ['5 reports/month', 'Full score with breakdown', 'Priority lender matching', 'Unlimited sources', '10GB storage'],
    },
    {
        tier: borrower_1.SubscriptionTier.PRO,
        name: 'Pro',
        price_monthly: 24.99,
        reports_per_month: -1,
        features: ['Unlimited reports', 'Premium score + recommendations', 'Direct lender intros', 'Dedicated support', 'Unlimited storage'],
    },
];
/** Lender subscription tiers */
exports.LENDER_TIERS = [
    {
        tier: lender_1.LenderPlanTier.STARTER,
        name: 'Starter',
        price_monthly: 99,
        reports_per_month: 50,
        features: ['50 reports/month', 'Basic matching', 'Lead dashboard', 'Email notifications'],
        api_access: false,
    },
    {
        tier: lender_1.LenderPlanTier.PROFESSIONAL,
        name: 'Professional',
        price_monthly: 299,
        reports_per_month: 500,
        features: ['500 reports/month', 'Advanced matching', 'Custom criteria', 'API access', 'Priority support'],
        api_access: true,
    },
    {
        tier: lender_1.LenderPlanTier.ENTERPRISE,
        name: 'Enterprise',
        price_monthly: 999,
        reports_per_month: -1,
        features: ['Unlimited reports', 'AI matching', 'Custom integrations', 'Dedicated AM', 'SLA guarantees'],
        api_access: true,
    },
];
/** Get borrower tier config */
function getBorrowerTier(tier) {
    return exports.BORROWER_TIERS.find((t) => t.tier === tier);
}
/** Get lender tier config */
function getLenderTier(tier) {
    return exports.LENDER_TIERS.find((t) => t.tier === tier);
}
//# sourceMappingURL=subscription-tiers.js.map