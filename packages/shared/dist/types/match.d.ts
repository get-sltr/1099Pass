import { z } from 'zod';
import { PlatformType } from './financial-profile';
/** Status of a borrower-lender match */
export declare enum MatchStatus {
    PENDING = "PENDING",
    VIEWED = "VIEWED",
    INTERESTED = "INTERESTED",
    CONTACTED = "CONTACTED",
    DECLINED = "DECLINED"
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
export declare const MatchSchema: z.ZodObject<{
    id: z.ZodString;
    borrower_id: z.ZodString;
    lender_id: z.ZodString;
    report_id: z.ZodString;
    match_score: z.ZodNumber;
    status: z.ZodNativeEnum<typeof MatchStatus>;
    lender_notes: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    responded_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: MatchStatus;
    created_at: string;
    updated_at: string;
    borrower_id: string;
    lender_id: string;
    report_id: string;
    match_score: number;
    lender_notes?: string | undefined;
    responded_at?: string | undefined;
}, {
    id: string;
    status: MatchStatus;
    created_at: string;
    updated_at: string;
    borrower_id: string;
    lender_id: string;
    report_id: string;
    match_score: number;
    lender_notes?: string | undefined;
    responded_at?: string | undefined;
}>;
/** Zod schema for LendingCriteria */
export declare const LendingCriteriaSchema: z.ZodObject<{
    id: z.ZodString;
    lender_id: z.ZodString;
    loan_types: z.ZodArray<z.ZodString, "many">;
    min_annual_income: z.ZodNumber;
    max_annual_income: z.ZodOptional<z.ZodNumber>;
    accepted_gig_platforms: z.ZodArray<z.ZodNativeEnum<typeof PlatformType>, "many">;
    geographic_coverage: z.ZodArray<z.ZodString, "many">;
    max_dti_ratio: z.ZodOptional<z.ZodNumber>;
    min_credit_score: z.ZodOptional<z.ZodNumber>;
    min_months_active: z.ZodNumber;
    active: z.ZodBoolean;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    lender_id: string;
    loan_types: string[];
    min_annual_income: number;
    accepted_gig_platforms: PlatformType[];
    geographic_coverage: string[];
    min_months_active: number;
    active: boolean;
    max_annual_income?: number | undefined;
    max_dti_ratio?: number | undefined;
    min_credit_score?: number | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    lender_id: string;
    loan_types: string[];
    min_annual_income: number;
    accepted_gig_platforms: PlatformType[];
    geographic_coverage: string[];
    min_months_active: number;
    active: boolean;
    max_annual_income?: number | undefined;
    max_dti_ratio?: number | undefined;
    min_credit_score?: number | undefined;
}>;
/** Zod schema for updating lending criteria */
export declare const UpdateLendingCriteriaSchema: z.ZodObject<{
    loan_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    min_annual_income: z.ZodOptional<z.ZodNumber>;
    max_annual_income: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    accepted_gig_platforms: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof PlatformType>, "many">>;
    geographic_coverage: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    max_dti_ratio: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    min_credit_score: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    min_months_active: z.ZodOptional<z.ZodNumber>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    loan_types?: string[] | undefined;
    min_annual_income?: number | undefined;
    max_annual_income?: number | undefined;
    accepted_gig_platforms?: PlatformType[] | undefined;
    geographic_coverage?: string[] | undefined;
    max_dti_ratio?: number | undefined;
    min_credit_score?: number | undefined;
    min_months_active?: number | undefined;
    active?: boolean | undefined;
}, {
    loan_types?: string[] | undefined;
    min_annual_income?: number | undefined;
    max_annual_income?: number | undefined;
    accepted_gig_platforms?: PlatformType[] | undefined;
    geographic_coverage?: string[] | undefined;
    max_dti_ratio?: number | undefined;
    min_credit_score?: number | undefined;
    min_months_active?: number | undefined;
    active?: boolean | undefined;
}>;
//# sourceMappingURL=match.d.ts.map