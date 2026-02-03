-- Migration: Create lending_criteria table
-- Version: 006

CREATE TABLE lending_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  loan_types TEXT[] NOT NULL DEFAULT '{}',
  min_annual_income DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (min_annual_income >= 0),
  max_annual_income DECIMAL(12,2),
  accepted_gig_platforms TEXT[] NOT NULL DEFAULT '{}',
  geographic_coverage TEXT[] NOT NULL DEFAULT '{}',
  max_dti_ratio DECIMAL(5,4) CHECK (max_dti_ratio >= 0 AND max_dti_ratio <= 1),
  min_credit_score INTEGER CHECK (min_credit_score >= 300 AND min_credit_score <= 850),
  min_months_active INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lending_criteria_lender_id ON lending_criteria(lender_id);
CREATE INDEX idx_lending_criteria_active ON lending_criteria(active);

CREATE TRIGGER lending_criteria_updated_at
  BEFORE UPDATE ON lending_criteria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
