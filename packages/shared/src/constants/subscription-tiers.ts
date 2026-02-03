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
export const BORROWER_TIERS: readonly BorrowerTierConfig[] = [
  {
    tier: SubscriptionTier.FREE,
    name: 'Free',
    price_monthly: 0,
    reports_per_month: 1,
    features: ['1 report/month', 'Basic loan readiness score', 'Connect 2 income sources', '1GB document storage'],
  },
  {
    tier: SubscriptionTier.PLUS,
    name: 'Plus',
    price_monthly: 9.99,
    reports_per_month: 5,
    features: ['5 reports/month', 'Full score with breakdown', 'Priority lender matching', 'Unlimited sources', '10GB storage'],
  },
  {
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    price_monthly: 24.99,
    reports_per_month: -1,
    features: ['Unlimited reports', 'Premium score + recommendations', 'Direct lender intros', 'Dedicated support', 'Unlimited storage'],
  },
] as const;

/** Lender subscription tiers */
export const LENDER_TIERS: readonly LenderTierConfig[] = [
  {
    tier: LenderPlanTier.STARTER,
    name: 'Starter',
    price_monthly: 99,
    reports_per_month: 50,
    features: ['50 reports/month', 'Basic matching', 'Lead dashboard', 'Email notifications'],
    api_access: false,
  },
  {
    tier: LenderPlanTier.PROFESSIONAL,
    name: 'Professional',
    price_monthly: 299,
    reports_per_month: 500,
    features: ['500 reports/month', 'Advanced matching', 'Custom criteria', 'API access', 'Priority support'],
    api_access: true,
  },
  {
    tier: LenderPlanTier.ENTERPRISE,
    name: 'Enterprise',
    price_monthly: 999,
    reports_per_month: -1,
    features: ['Unlimited reports', 'AI matching', 'Custom integrations', 'Dedicated AM', 'SLA guarantees'],
    api_access: true,
  },
] as const;

/** Get borrower tier config */
export function getBorrowerTier(tier: SubscriptionTier): BorrowerTierConfig | undefined {
  return BORROWER_TIERS.find((t) => t.tier === tier);
}

/** Get lender tier config */
export function getLenderTier(tier: LenderPlanTier): LenderTierConfig | undefined {
  return LENDER_TIERS.find((t) => t.tier === tier);
}
