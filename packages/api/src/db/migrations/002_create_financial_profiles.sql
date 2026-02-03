-- Migration: Create financial_profiles table
-- Version: 002

CREATE TYPE platform_type AS ENUM (
  'GIG_DELIVERY', 'GIG_RIDESHARE', 'GIG_FREELANCE', 'GIG_MARKETPLACE',
  'CONTRACTOR_1099', 'SELF_EMPLOYED', 'OTHER'
);

CREATE TYPE income_trend AS ENUM (
  'INCREASING', 'STABLE', 'DECREASING', 'VOLATILE', 'INSUFFICIENT_DATA'
);

CREATE TABLE financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL UNIQUE REFERENCES borrowers(id) ON DELETE CASCADE,
  total_annual_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  income_sources JSONB NOT NULL DEFAULT '[]',
  monthly_average DECIMAL(12,2) NOT NULL DEFAULT 0,
  income_trend income_trend NOT NULL DEFAULT 'INSUFFICIENT_DATA',
  debt_to_income_ratio DECIMAL(5,4),
  loan_readiness_score INTEGER NOT NULL DEFAULT 0 CHECK (loan_readiness_score BETWEEN 0 AND 100),
  credit_score_range VARCHAR(20),
  last_synced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_profiles_borrower_id ON financial_profiles(borrower_id);
CREATE INDEX idx_financial_profiles_last_synced ON financial_profiles(last_synced);
CREATE INDEX idx_financial_profiles_loan_score ON financial_profiles(loan_readiness_score);

CREATE TRIGGER financial_profiles_updated_at
  BEFORE UPDATE ON financial_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
