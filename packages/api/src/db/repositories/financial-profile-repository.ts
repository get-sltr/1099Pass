import { query } from '../client';

export interface FinancialProfileRow {
  id: string;
  borrower_id: string;
  total_annual_income: string; // DECIMAL comes back as string from pg
  income_sources: any; // JSONB
  monthly_average: string;
  income_trend: string;
  debt_to_income_ratio: string | null;
  loan_readiness_score: number;
  credit_score_range: string | null;
  last_synced: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertFinancialProfileInput {
  borrower_id: string;
  total_annual_income: number;
  income_sources: any;
  monthly_average: number;
  income_trend: string;
  debt_to_income_ratio?: number | null;
  loan_readiness_score: number;
}

export async function upsert(data: UpsertFinancialProfileInput): Promise<FinancialProfileRow> {
  const result = await query<FinancialProfileRow>(
    `INSERT INTO financial_profiles (borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (borrower_id) DO UPDATE SET
       total_annual_income = EXCLUDED.total_annual_income,
       income_sources = EXCLUDED.income_sources,
       monthly_average = EXCLUDED.monthly_average,
       income_trend = EXCLUDED.income_trend,
       debt_to_income_ratio = EXCLUDED.debt_to_income_ratio,
       loan_readiness_score = EXCLUDED.loan_readiness_score,
       last_synced = NOW()
     RETURNING *`,
    [
      data.borrower_id,
      data.total_annual_income,
      JSON.stringify(data.income_sources),
      data.monthly_average,
      data.income_trend,
      data.debt_to_income_ratio ?? null,
      data.loan_readiness_score,
    ]
  );
  return result.rows[0]!;
}

export async function findByBorrowerId(borrowerId: string): Promise<FinancialProfileRow | null> {
  const result = await query<FinancialProfileRow>(
    'SELECT * FROM financial_profiles WHERE borrower_id = $1',
    [borrowerId]
  );
  return result.rows[0] ?? null;
}
