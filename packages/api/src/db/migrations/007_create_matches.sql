-- Migration: Create matches table
-- Version: 007

CREATE TYPE match_status AS ENUM ('PENDING', 'VIEWED', 'INTERESTED', 'CONTACTED', 'DECLINED');

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
  status match_status NOT NULL DEFAULT 'PENDING',
  lender_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(borrower_id, lender_id, report_id)
);

CREATE INDEX idx_matches_borrower_id ON matches(borrower_id);
CREATE INDEX idx_matches_lender_id ON matches(lender_id);
CREATE INDEX idx_matches_report_id ON matches(report_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_at ON matches(created_at);

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
