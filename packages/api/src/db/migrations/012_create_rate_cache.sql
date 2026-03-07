-- Migration: Create rate_cache table for FRED rate data (filled by scheduled job)
-- Version: 012
-- Rate cache: public read, admin/cron write. No RLS (no user data).
--
-- Cached series: MORTGAGE30US (30-yr fixed), MORTGAGE15US (15-yr fixed) only.
-- MORTGAGE5US (5/1 ARM) was discontinued Nov 2022; for ARM use a secondary source.

CREATE TABLE IF NOT EXISTS rate_cache (
  rate_type VARCHAR(32) PRIMARY KEY,
  rate_value DECIMAL(5,3),
  as_of_date DATE,
  source VARCHAR(32) NOT NULL DEFAULT 'fred_api',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE rate_cache IS 'Conventional mortgage rates from FRED, updated weekly by scheduled Lambda (Thursdays after 12 PM ET).';
COMMENT ON COLUMN rate_cache.rate_type IS 'e.g. conventional_30, conventional_15';
COMMENT ON COLUMN rate_cache.as_of_date IS 'FRED observation date for the rate';
