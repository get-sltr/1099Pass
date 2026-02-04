-- Migration: Create subscriptions table
-- Version: 009
-- Note: Payments handled via Apple App Store (StoreKit) and Google Play Billing

CREATE TYPE user_type_enum AS ENUM ('BORROWER', 'LENDER');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'TRIALING');
CREATE TYPE subscription_tier_enum AS ENUM ('FREE', 'PLUS', 'PRO', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE store_type_enum AS ENUM ('APPLE', 'GOOGLE');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type user_type_enum NOT NULL,
  tier subscription_tier_enum NOT NULL,
  store_customer_id VARCHAR(255) NOT NULL,
  store_subscription_id VARCHAR(255) UNIQUE,
  store_type store_type_enum NOT NULL,
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, user_type);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_store_customer ON subscriptions(store_customer_id);
CREATE INDEX idx_subscriptions_store_type ON subscriptions(store_type);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
