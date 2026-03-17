import { SubscriptionTier } from '../types/borrower';
import { LenderPlanTier } from '../types/lender';
/** Borrower tier config */
export interface BorrowerTierConfig {
    tier: SubscriptionTier;
    name: string;
    price_monthly: number;
    reports_per_month: number;
    features: string[];
}
/** Lender tier config */
export interface LenderTierConfig {
    tier: LenderPlanTier;
    name: string;
    price_monthly: number;
    reports_per_month: number;
    features: string[];
    api_access: boolean;
}
/** Borrower subscription tiers */
export declare const BORROWER_TIERS: readonly BorrowerTierConfig[];
/** Lender subscription tiers */
export declare const LENDER_TIERS: readonly LenderTierConfig[];
/** Get borrower tier config */
export declare function getBorrowerTier(tier: SubscriptionTier): BorrowerTierConfig | undefined;
/** Get lender tier config */
export declare function getLenderTier(tier: LenderPlanTier): LenderTierConfig | undefined;
//# sourceMappingURL=subscription-tiers.d.ts.map