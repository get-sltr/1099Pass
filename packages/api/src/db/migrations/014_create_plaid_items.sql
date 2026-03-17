-- Migration: Create plaid_items table for storing linked bank accounts
-- Version: 014

CREATE TYPE plaid_item_status AS ENUM ('active', 'requires_reauth', 'disconnected');

CREATE TABLE plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL UNIQUE,
  encrypted_access_token TEXT NOT NULL,
  institution_id VARCHAR(100) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  account_ids JSONB NOT NULL DEFAULT '[]',
  consent_expires_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  status plaid_item_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plaid_items_borrower_id ON plaid_items(borrower_id);
CREATE INDEX idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX idx_plaid_items_status ON plaid_items(status);

CREATE TRIGGER plaid_items_updated_at
  BEFORE UPDATE ON plaid_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: borrowers can only see their own linked accounts
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY plaid_items_borrower_policy ON plaid_items
  USING (borrower_id = current_setting('app.current_user_id')::UUID);
