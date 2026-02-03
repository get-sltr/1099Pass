-- Migration: Create messages table
-- Version: 008

CREATE TYPE sender_type AS ENUM ('BORROWER', 'LENDER');
CREATE TYPE message_status AS ENUM ('SENT', 'DELIVERED', 'READ');

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type sender_type NOT NULL,
  content TEXT NOT NULL,
  encrypted BOOLEAN NOT NULL DEFAULT TRUE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
