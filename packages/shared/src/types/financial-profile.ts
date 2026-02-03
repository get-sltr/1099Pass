import { z } from 'zod';

/** Gig platform / income source type */
export enum PlatformType {
  GIG_DELIVERY = 'GIG_DELIVERY',
  GIG_RIDESHARE = 'GIG_RIDESHARE',
  GIG_FREELANCE = 'GIG_FREELANCE',
  GIG_MARKETPLACE = 'GIG_MARKETPLACE',
  CONTRACTOR_1099 = 'CONTRACTOR_1099',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  OTHER = 'OTHER',
}

/** Income trend direction */
export enum IncomeTrend {
  INCREASING = 'INCREASING',
  STABLE = 'STABLE',
  DECREASING = 'DECREASING',
  VOLATILE = 'VOLATILE',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
}

/** Monthly income data point */
export interface MonthlyAmount {
  month: string;
  amount: number;
}

/** Individual income source */
export interface IncomeSource {
  platform_name: string;
  platform_type: PlatformType;
  monthly_amounts: MonthlyAmount[];
  annual_total: number;
  active_since: string;
  verified: boolean;
  plaid_account_id?: string;
}

/** Borrower's complete financial profile */
export interface FinancialProfile {
  id: string;
  borrower_id: string;
  total_annual_income: number;
  income_sources: IncomeSource[];
  monthly_average: number;
  income_trend: IncomeTrend;
  debt_to_income_ratio?: number;
  loan_readiness_score: number;
  credit_score_range?: string;
  last_synced: string;
  created_at: string;
  updated_at: string;
}

/** Zod schema for MonthlyAmount */
export const MonthlyAmountSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().min(0),
});

/** Zod schema for IncomeSource */
export const IncomeSourceSchema = z.object({
  platform_name: z.string().min(1).max(100),
  platform_type: z.nativeEnum(PlatformType),
  monthly_amounts: z.array(MonthlyAmountSchema),
  annual_total: z.number().min(0),
  active_since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verified: z.boolean(),
  plaid_account_id: z.string().optional(),
});

/** Zod schema for FinancialProfile */
export const FinancialProfileSchema = z.object({
  id: z.string().uuid(),
  borrower_id: z.string().uuid(),
  total_annual_income: z.number().min(0),
  income_sources: z.array(IncomeSourceSchema),
  monthly_average: z.number().min(0),
  income_trend: z.nativeEnum(IncomeTrend),
  debt_to_income_ratio: z.number().min(0).max(1).optional(),
  loan_readiness_score: z.number().int().min(0).max(100),
  credit_score_range: z.string().optional(),
  last_synced: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
