import { z } from 'zod';
import { PlatformType } from './financial-profile';

/** Status of a borrower-lender match */
export enum MatchStatus {
  PENDING = 'PENDING',
  VIEWED = 'VIEWED',
  INTERESTED = 'INTERESTED',
  CONTACTED = 'CONTACTED',
  DECLINED = 'DECLINED',
}

/** Borrower-lender match record */
export interface Match {
  id: string;
  borrower_id: string;
  lender_id: string;
  report_id: string;
  match_score: number;
  status: MatchStatus;
  lender_notes?: string;
  created_at: string;
  responded_at?: string;
  updated_at: string;
}

/** Lender's lending criteria configuration */
export interface LendingCriteria {
  id: string;
  lender_id: string;
  loan_types: string[];
  min_annual_income: number;
  max_annual_income?: number;
  accepted_gig_platforms: PlatformType[];
  geographic_coverage: string[];
  max_dti_ratio?: number;
  min_credit_score?: number;
  min_months_active: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Zod schema for Match */
export const MatchSchema = z.object({
  id: z.string().uuid(),
  borrower_id: z.string().uuid(),
  lender_id: z.string().uuid(),
  report_id: z.string().uuid(),
  match_score: z.number().int().min(0).max(100),
  status: z.nativeEnum(MatchStatus),
  lender_notes: z.string().max(2000).optional(),
  created_at: z.string().datetime(),
  responded_at: z.string().datetime().optional(),
  updated_at: z.string().datetime(),
});

/** Zod schema for LendingCriteria */
export const LendingCriteriaSchema = z.object({
  id: z.string().uuid(),
  lender_id: z.string().uuid(),
  loan_types: z.array(z.string()),
  min_annual_income: z.number().min(0),
  max_annual_income: z.number().min(0).optional(),
  accepted_gig_platforms: z.array(z.nativeEnum(PlatformType)),
  geographic_coverage: z.array(z.string().length(2)),
  max_dti_ratio: z.number().min(0).max(1).optional(),
  min_credit_score: z.number().int().min(300).max(850).optional(),
  min_months_active: z.number().int().min(0),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/** Zod schema for updating lending criteria */
export const UpdateLendingCriteriaSchema = LendingCriteriaSchema.omit({
  id: true,
  lender_id: true,
  created_at: true,
  updated_at: true,
}).partial();
