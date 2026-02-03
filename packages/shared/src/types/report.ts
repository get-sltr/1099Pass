import { z } from 'zod';

/** Type of income report */
export enum ReportType {
  MORTGAGE_READY = 'MORTGAGE_READY',
  AUTO_LOAN_READY = 'AUTO_LOAN_READY',
  GENERAL = 'GENERAL',
}

/** Report generation/lifecycle status */
export enum ReportStatus {
  GENERATING = 'GENERATING',
  READY = 'READY',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
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
export const ReportDataSnapshotSchema = z.object({
  total_annual_income: z.number().min(0),
  monthly_average: z.number().min(0),
  income_trend: z.string(),
  loan_readiness_score: z.number().int().min(0).max(100),
  source_count: z.number().int().min(0),
  sources: z.array(z.object({
    platform_name: z.string(),
    platform_type: z.string(),
    annual_total: z.number().min(0),
    verified: z.boolean(),
  })),
  debt_to_income_ratio: z.number().min(0).max(1).optional(),
  credit_score_range: z.string().optional(),
  documents_verified: z.number().int().min(0),
  documents_total: z.number().int().min(0),
  generated_at: z.string().datetime(),
});

/** Zod schema for Report */
export const ReportSchema = z.object({
  id: z.string().uuid(),
  borrower_id: z.string().uuid(),
  report_type: z.nativeEnum(ReportType),
  status: z.nativeEnum(ReportStatus),
  generated_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  data_snapshot: ReportDataSnapshotSchema,
  pdf_s3_key: z.string().optional(),
  share_token: z.string().optional(),
  share_expires_at: z.string().datetime().optional(),
  view_count: z.number().int().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/** Zod schema for generate report request */
export const GenerateReportSchema = z.object({
  report_type: z.nativeEnum(ReportType),
});
