-- Migration: Add SQUARE to store_type_enum for lender web subscriptions via Square.
-- Also add ULTRA tier. Borrower IAP remains APPLE / GOOGLE only.
-- Version: 013

ALTER TYPE store_type_enum ADD VALUE IF NOT EXISTS 'SQUARE';
ALTER TYPE subscription_tier_enum ADD VALUE IF NOT EXISTS 'ULTRA';
