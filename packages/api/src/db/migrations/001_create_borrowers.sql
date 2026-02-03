-- Migration: Create borrowers table
-- Version: 001

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE kyc_status AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'FAILED');
CREATE TYPE borrower_subscription_tier AS ENUM ('FREE', 'PLUS', 'PRO');

CREATE TABLE borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  street_address VARCHAR(255),
  city VARCHAR(100),
  state CHAR(2),
  zip_code VARCHAR(10),
  kyc_status kyc_status NOT NULL DEFAULT 'PENDING',
  subscription_tier borrower_subscription_tier NOT NULL DEFAULT 'FREE',
  cognito_sub VARCHAR(255) NOT NULL UNIQUE,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_borrowers_email ON borrowers(email);
CREATE INDEX idx_borrowers_cognito_sub ON borrowers(cognito_sub);
CREATE INDEX idx_borrowers_kyc_status ON borrowers(kyc_status);
CREATE INDEX idx_borrowers_subscription_tier ON borrowers(subscription_tier);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER borrowers_updated_at
  BEFORE UPDATE ON borrowers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
