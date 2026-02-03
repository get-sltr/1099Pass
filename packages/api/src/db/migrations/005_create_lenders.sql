-- Migration: Create lenders table
-- Version: 005

CREATE TYPE lender_type AS ENUM ('BANK', 'CREDIT_UNION', 'MORTGAGE_COMPANY', 'FINTECH', 'OTHER');
CREATE TYPE lender_plan_tier AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE lender_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

CREATE TABLE lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  lender_type lender_type NOT NULL,
  status lender_status NOT NULL DEFAULT 'PENDING',
  plan_tier lender_plan_tier NOT NULL DEFAULT 'STARTER',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  primary_contact_name VARCHAR(200) NOT NULL,
  primary_contact_email VARCHAR(255) NOT NULL,
  primary_contact_phone VARCHAR(20),
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  cognito_sub VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lenders_institution_name ON lenders(institution_name);
CREATE INDEX idx_lenders_status ON lenders(status);
CREATE INDEX idx_lenders_lender_type ON lenders(lender_type);
CREATE INDEX idx_lenders_cognito_sub ON lenders(cognito_sub);

CREATE TRIGGER lenders_updated_at
  BEFORE UPDATE ON lenders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
