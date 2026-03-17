import { z } from 'zod';
/** Gig platform / income source type */
export declare enum PlatformType {
    GIG_DELIVERY = "GIG_DELIVERY",
    GIG_RIDESHARE = "GIG_RIDESHARE",
    GIG_FREELANCE = "GIG_FREELANCE",
    GIG_MARKETPLACE = "GIG_MARKETPLACE",
    CONTRACTOR_1099 = "CONTRACTOR_1099",
    SELF_EMPLOYED = "SELF_EMPLOYED",
    OTHER = "OTHER"
}
/** Income trend direction */
export declare enum IncomeTrend {
    INCREASING = "INCREASING",
    STABLE = "STABLE",
    DECREASING = "DECREASING",
    VOLATILE = "VOLATILE",
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
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
export declare const MonthlyAmountSchema: z.ZodObject<{
    month: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    month: string;
    amount: number;
}, {
    month: string;
    amount: number;
}>;
/** Zod schema for IncomeSource */
export declare const IncomeSourceSchema: z.ZodObject<{
    platform_name: z.ZodString;
    platform_type: z.ZodNativeEnum<typeof PlatformType>;
    monthly_amounts: z.ZodArray<z.ZodObject<{
        month: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        month: string;
        amount: number;
    }, {
        month: string;
        amount: number;
    }>, "many">;
    annual_total: z.ZodNumber;
    active_since: z.ZodString;
    verified: z.ZodBoolean;
    plaid_account_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    verified: boolean;
    platform_name: string;
    platform_type: PlatformType;
    monthly_amounts: {
        month: string;
        amount: number;
    }[];
    annual_total: number;
    active_since: string;
    plaid_account_id?: string | undefined;
}, {
    verified: boolean;
    platform_name: string;
    platform_type: PlatformType;
    monthly_amounts: {
        month: string;
        amount: number;
    }[];
    annual_total: number;
    active_since: string;
    plaid_account_id?: string | undefined;
}>;
/** Zod schema for FinancialProfile */
export declare const FinancialProfileSchema: z.ZodObject<{
    id: z.ZodString;
    borrower_id: z.ZodString;
    total_annual_income: z.ZodNumber;
    income_sources: z.ZodArray<z.ZodObject<{
        platform_name: z.ZodString;
        platform_type: z.ZodNativeEnum<typeof PlatformType>;
        monthly_amounts: z.ZodArray<z.ZodObject<{
            month: z.ZodString;
            amount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            month: string;
            amount: number;
        }, {
            month: string;
            amount: number;
        }>, "many">;
        annual_total: z.ZodNumber;
        active_since: z.ZodString;
        verified: z.ZodBoolean;
        plaid_account_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        verified: boolean;
        platform_name: string;
        platform_type: PlatformType;
        monthly_amounts: {
            month: string;
            amount: number;
        }[];
        annual_total: number;
        active_since: string;
        plaid_account_id?: string | undefined;
    }, {
        verified: boolean;
        platform_name: string;
        platform_type: PlatformType;
        monthly_amounts: {
            month: string;
            amount: number;
        }[];
        annual_total: number;
        active_since: string;
        plaid_account_id?: string | undefined;
    }>, "many">;
    monthly_average: z.ZodNumber;
    income_trend: z.ZodNativeEnum<typeof IncomeTrend>;
    debt_to_income_ratio: z.ZodOptional<z.ZodNumber>;
    loan_readiness_score: z.ZodNumber;
    credit_score_range: z.ZodOptional<z.ZodString>;
    last_synced: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    borrower_id: string;
    total_annual_income: number;
    income_sources: {
        verified: boolean;
        platform_name: string;
        platform_type: PlatformType;
        monthly_amounts: {
            month: string;
            amount: number;
        }[];
        annual_total: number;
        active_since: string;
        plaid_account_id?: string | undefined;
    }[];
    monthly_average: number;
    income_trend: IncomeTrend;
    loan_readiness_score: number;
    last_synced: string;
    debt_to_income_ratio?: number | undefined;
    credit_score_range?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    borrower_id: string;
    total_annual_income: number;
    income_sources: {
        verified: boolean;
        platform_name: string;
        platform_type: PlatformType;
        monthly_amounts: {
            month: string;
            amount: number;
        }[];
        annual_total: number;
        active_since: string;
        plaid_account_id?: string | undefined;
    }[];
    monthly_average: number;
    income_trend: IncomeTrend;
    loan_readiness_score: number;
    last_synced: string;
    debt_to_income_ratio?: number | undefined;
    credit_score_range?: string | undefined;
}>;
//# sourceMappingURL=financial-profile.d.ts.map