import { z } from 'zod';
/** Type of income report */
export declare enum ReportType {
    MORTGAGE_READY = "MORTGAGE_READY",
    AUTO_LOAN_READY = "AUTO_LOAN_READY",
    GENERAL = "GENERAL"
}
/** Report generation/lifecycle status */
export declare enum ReportStatus {
    GENERATING = "GENERATING",
    READY = "READY",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED"
}
/** Snapshot of financial data at report generation time */
export interface ReportDataSnapshot {
    total_annual_income: number;
    monthly_average: number;
    income_trend: string;
    loan_readiness_score: number;
    source_count: number;
    sources: Array<{
        platform_name: string;
        platform_type: string;
        annual_total: number;
        verified: boolean;
    }>;
    debt_to_income_ratio?: number;
    credit_score_range?: string;
    documents_verified: number;
    documents_total: number;
    generated_at: string;
}
/** Income verification report */
export interface Report {
    id: string;
    borrower_id: string;
    report_type: ReportType;
    status: ReportStatus;
    generated_at: string;
    expires_at: string;
    data_snapshot: ReportDataSnapshot;
    pdf_s3_key?: string;
    share_token?: string;
    share_expires_at?: string;
    view_count: number;
    created_at: string;
    updated_at: string;
}
/** Zod schema for ReportDataSnapshot */
export declare const ReportDataSnapshotSchema: z.ZodObject<{
    total_annual_income: z.ZodNumber;
    monthly_average: z.ZodNumber;
    income_trend: z.ZodString;
    loan_readiness_score: z.ZodNumber;
    source_count: z.ZodNumber;
    sources: z.ZodArray<z.ZodObject<{
        platform_name: z.ZodString;
        platform_type: z.ZodString;
        annual_total: z.ZodNumber;
        verified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        verified: boolean;
        platform_name: string;
        platform_type: string;
        annual_total: number;
    }, {
        verified: boolean;
        platform_name: string;
        platform_type: string;
        annual_total: number;
    }>, "many">;
    debt_to_income_ratio: z.ZodOptional<z.ZodNumber>;
    credit_score_range: z.ZodOptional<z.ZodString>;
    documents_verified: z.ZodNumber;
    documents_total: z.ZodNumber;
    generated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    total_annual_income: number;
    monthly_average: number;
    income_trend: string;
    loan_readiness_score: number;
    source_count: number;
    sources: {
        verified: boolean;
        platform_name: string;
        platform_type: string;
        annual_total: number;
    }[];
    documents_verified: number;
    documents_total: number;
    generated_at: string;
    debt_to_income_ratio?: number | undefined;
    credit_score_range?: string | undefined;
}, {
    total_annual_income: number;
    monthly_average: number;
    income_trend: string;
    loan_readiness_score: number;
    source_count: number;
    sources: {
        verified: boolean;
        platform_name: string;
        platform_type: string;
        annual_total: number;
    }[];
    documents_verified: number;
    documents_total: number;
    generated_at: string;
    debt_to_income_ratio?: number | undefined;
    credit_score_range?: string | undefined;
}>;
/** Zod schema for Report */
export declare const ReportSchema: z.ZodObject<{
    id: z.ZodString;
    borrower_id: z.ZodString;
    report_type: z.ZodNativeEnum<typeof ReportType>;
    status: z.ZodNativeEnum<typeof ReportStatus>;
    generated_at: z.ZodString;
    expires_at: z.ZodString;
    data_snapshot: z.ZodObject<{
        total_annual_income: z.ZodNumber;
        monthly_average: z.ZodNumber;
        income_trend: z.ZodString;
        loan_readiness_score: z.ZodNumber;
        source_count: z.ZodNumber;
        sources: z.ZodArray<z.ZodObject<{
            platform_name: z.ZodString;
            platform_type: z.ZodString;
            annual_total: z.ZodNumber;
            verified: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            verified: boolean;
            platform_name: string;
            platform_type: string;
            annual_total: number;
        }, {
            verified: boolean;
            platform_name: string;
            platform_type: string;
            annual_total: number;
        }>, "many">;
        debt_to_income_ratio: z.ZodOptional<z.ZodNumber>;
        credit_score_range: z.ZodOptional<z.ZodString>;
        documents_verified: z.ZodNumber;
        documents_total: z.ZodNumber;
        generated_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        total_annual_income: number;
        monthly_average: number;
        income_trend: string;
        loan_readiness_score: number;
        source_count: number;
        sources: {
            verified: boolean;
            platform_name: string;
            platform_type: string;
            annual_total: number;
        }[];
        documents_verified: number;
        documents_total: number;
        generated_at: string;
        debt_to_income_ratio?: number | undefined;
        credit_score_range?: string | undefined;
    }, {
        total_annual_income: number;
        monthly_average: number;
        income_trend: string;
        loan_readiness_score: number;
        source_count: number;
        sources: {
            verified: boolean;
            platform_name: string;
            platform_type: string;
            annual_total: number;
        }[];
        documents_verified: number;
        documents_total: number;
        generated_at: string;
        debt_to_income_ratio?: number | undefined;
        credit_score_range?: string | undefined;
    }>;
    pdf_s3_key: z.ZodOptional<z.ZodString>;
    share_token: z.ZodOptional<z.ZodString>;
    share_expires_at: z.ZodOptional<z.ZodString>;
    view_count: z.ZodNumber;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: ReportStatus;
    created_at: string;
    updated_at: string;
    borrower_id: string;
    generated_at: string;
    report_type: ReportType;
    expires_at: string;
    data_snapshot: {
        total_annual_income: number;
        monthly_average: number;
        income_trend: string;
        loan_readiness_score: number;
        source_count: number;
        sources: {
            verified: boolean;
            platform_name: string;
            platform_type: string;
            annual_total: number;
        }[];
        documents_verified: number;
        documents_total: number;
        generated_at: string;
        debt_to_income_ratio?: number | undefined;
        credit_score_range?: string | undefined;
    };
    view_count: number;
    pdf_s3_key?: string | undefined;
    share_token?: string | undefined;
    share_expires_at?: string | undefined;
}, {
    id: string;
    status: ReportStatus;
    created_at: string;
    updated_at: string;
    borrower_id: string;
    generated_at: string;
    report_type: ReportType;
    expires_at: string;
    data_snapshot: {
        total_annual_income: number;
        monthly_average: number;
        income_trend: string;
        loan_readiness_score: number;
        source_count: number;
        sources: {
            verified: boolean;
            platform_name: string;
            platform_type: string;
            annual_total: number;
        }[];
        documents_verified: number;
        documents_total: number;
        generated_at: string;
        debt_to_income_ratio?: number | undefined;
        credit_score_range?: string | undefined;
    };
    view_count: number;
    pdf_s3_key?: string | undefined;
    share_token?: string | undefined;
    share_expires_at?: string | undefined;
}>;
/** Zod schema for generate report request */
export declare const GenerateReportSchema: z.ZodObject<{
    report_type: z.ZodNativeEnum<typeof ReportType>;
}, "strip", z.ZodTypeAny, {
    report_type: ReportType;
}, {
    report_type: ReportType;
}>;
//# sourceMappingURL=report.d.ts.map