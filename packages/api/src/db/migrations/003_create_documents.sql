-- Migration: Create documents table
-- Version: 003

CREATE TYPE document_type AS ENUM ('TAX_RETURN', 'FORM_1099', 'BANK_STATEMENT', 'PROFIT_LOSS', 'OTHER');
CREATE TYPE document_status AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'REJECTED');

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  encrypted BOOLEAN NOT NULL DEFAULT TRUE,
  status document_status NOT NULL DEFAULT 'PENDING',
  verification_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_borrower_id ON documents(borrower_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
