-- Migration: Create reports table
-- Version: 004

CREATE TYPE report_type AS ENUM ('MORTGAGE_READY', 'AUTO_LOAN_READY', 'GENERAL');
CREATE TYPE report_status AS ENUM ('GENERATING', 'READY', 'EXPIRED', 'REVOKED');

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  status report_status NOT NULL DEFAULT 'GENERATING',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  data_snapshot JSONB NOT NULL,
  pdf_s3_key VARCHAR(500),
  share_token VARCHAR(64) UNIQUE,
  share_expires_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_borrower_id ON reports(borrower_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_expires_at ON reports(expires_at);
CREATE UNIQUE INDEX idx_reports_share_token ON reports(share_token) WHERE share_token IS NOT NULL;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
