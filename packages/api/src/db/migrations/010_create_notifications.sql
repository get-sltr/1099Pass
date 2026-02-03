-- Migration: Create notifications table
-- Version: 010

CREATE TYPE notification_type AS ENUM ('MATCH', 'MESSAGE', 'REPORT', 'SCORE', 'SYSTEM');
CREATE TYPE notification_status AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type user_type_enum NOT NULL,
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  status notification_status NOT NULL DEFAULT 'UNREAD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
