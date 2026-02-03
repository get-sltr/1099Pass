#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — Development Seed Data
# Usage: ./scripts/seed-data.sh <environment>
# WARNING: This script is for development/staging ONLY. Never run on production.
###############################################################################

ENVIRONMENT="${1:-}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${ENVIRONMENT}" ]; then
  echo "ERROR: Environment is required."
  echo "Usage: ./scripts/seed-data.sh <dev|staging>"
  exit 1
fi

if [ "${ENVIRONMENT}" = "prod" ]; then
  echo "ERROR: Seed data cannot be loaded into production."
  exit 1
fi

if [[ ! "${ENVIRONMENT}" =~ ^(dev|staging)$ ]]; then
  echo "ERROR: Invalid environment '${ENVIRONMENT}'. Must be one of: dev, staging"
  exit 1
fi

echo "============================================"
echo " 1099Pass — Seed Data (${ENVIRONMENT})"
echo "============================================"
echo ""

# Fetch database credentials
echo "[1/2] Fetching database credentials..."
SECRET_NAME="1099pass-${ENVIRONMENT}-db-credentials"
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "${SECRET_NAME}" \
  --query "SecretString" \
  --output text 2>/dev/null) || {
  echo "ERROR: Could not fetch secret '${SECRET_NAME}'."
  exit 1
}

DB_HOST=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['host'])")
DB_PORT=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['port'])")
DB_NAME=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['dbname'])")
DB_USER=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])")
DB_PASS=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])")

echo "  Connected to: ${DB_HOST}/${DB_NAME}"
echo ""

# Insert seed data
echo "[2/2] Inserting seed data..."

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<'SQL'

-- Seed Borrowers
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'alice@example.com', '+15551234001', 'Alice', 'Johnson', '1990-05-15', '123 Main St', 'Austin', 'TX', '78701', 'VERIFIED', 'PLUS', 'cognito-sub-alice'),
  ('b0000001-0000-0000-0000-000000000002', 'bob@example.com', '+15551234002', 'Bob', 'Smith', '1985-11-22', '456 Oak Ave', 'Denver', 'CO', '80202', 'VERIFIED', 'PRO', 'cognito-sub-bob'),
  ('b0000001-0000-0000-0000-000000000003', 'carol@example.com', '+15551234003', 'Carol', 'Williams', '1992-03-08', '789 Pine Rd', 'Seattle', 'WA', '98101', 'PENDING', 'FREE', 'cognito-sub-carol')
ON CONFLICT (email) DO NOTHING;

-- Seed Financial Profiles
INSERT INTO financial_profiles (id, borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
VALUES
  ('fp000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 72000.00,
   '[{"platform_name":"Uber","platform_type":"GIG_RIDESHARE","monthly_amounts":[{"month":"2024-01","amount":5500},{"month":"2024-02","amount":6200},{"month":"2024-03","amount":6000}],"annual_total":48000,"active_since":"2022-06-01","verified":true},{"platform_name":"DoorDash","platform_type":"GIG_DELIVERY","monthly_amounts":[{"month":"2024-01","amount":2000},{"month":"2024-02","amount":2100},{"month":"2024-03","amount":1900}],"annual_total":24000,"active_since":"2023-01-15","verified":true}]'::jsonb,
   6000.00, 'STABLE', 0.28, 78, now()),
  ('fp000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 105000.00,
   '[{"platform_name":"Upwork","platform_type":"GIG_FREELANCE","monthly_amounts":[{"month":"2024-01","amount":8000},{"month":"2024-02","amount":9200},{"month":"2024-03","amount":8800}],"annual_total":105000,"active_since":"2021-03-01","verified":true}]'::jsonb,
   8750.00, 'INCREASING', 0.22, 85, now())
ON CONFLICT (borrower_id) DO NOTHING;

-- Seed Lenders
INSERT INTO lenders (id, institution_name, license_number, lender_type, status, plan_tier, verified, primary_contact_name, primary_contact_email, primary_contact_phone, cognito_sub)
VALUES
  ('l0000001-0000-0000-0000-000000000001', 'First National Bank', 'FNB-2024-001', 'BANK', 'ACTIVE', 'PROFESSIONAL', true, 'David Chen', 'david@fnb-example.com', '+15559876001', 'cognito-sub-fnb'),
  ('l0000001-0000-0000-0000-000000000002', 'GigLend Credit Union', 'GLCU-2024-002', 'CREDIT_UNION', 'ACTIVE', 'ENTERPRISE', true, 'Sarah Miller', 'sarah@giglend-example.com', '+15559876002', 'cognito-sub-glcu')
ON CONFLICT (license_number) DO NOTHING;

-- Seed Lending Criteria
INSERT INTO lending_criteria (id, lender_id, loan_types, min_annual_income, accepted_gig_platforms, geographic_coverage, max_dti_ratio, min_months_active, active)
VALUES
  ('lc000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001',
   ARRAY['CONVENTIONAL_MORTGAGE', 'FHA_MORTGAGE', 'AUTO_LOAN'],
   45000.00,
   ARRAY['GIG_RIDESHARE', 'GIG_DELIVERY', 'GIG_FREELANCE'],
   ARRAY['TX', 'CO', 'CA', 'NY', 'FL'],
   0.43, 12, true),
  ('lc000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000002',
   ARRAY['CONVENTIONAL_MORTGAGE', 'FHA_MORTGAGE', 'VA_MORTGAGE', 'AUTO_LOAN', 'PERSONAL_LOAN'],
   30000.00,
   ARRAY['GIG_RIDESHARE', 'GIG_DELIVERY', 'GIG_FREELANCE', 'GIG_MARKETPLACE', 'CONTRACTOR_1099', 'SELF_EMPLOYED'],
   ARRAY['TX', 'CO', 'CA', 'NY', 'FL', 'WA', 'OR', 'AZ', 'NV', 'UT'],
   0.50, 6, true)
ON CONFLICT DO NOTHING;

-- Seed Reports
INSERT INTO reports (id, borrower_id, report_type, status, generated_at, expires_at, data_snapshot, view_count)
VALUES
  ('r0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'MORTGAGE_READY', 'READY', now(), now() + interval '90 days',
   '{"total_annual_income":72000,"monthly_average":6000,"income_trend":"STABLE","loan_readiness_score":78,"source_count":2,"top_source":"Uber","debt_to_income_ratio":0.28}'::jsonb,
   3),
  ('r0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'MORTGAGE_READY', 'READY', now(), now() + interval '90 days',
   '{"total_annual_income":105000,"monthly_average":8750,"income_trend":"INCREASING","loan_readiness_score":85,"source_count":1,"top_source":"Upwork","debt_to_income_ratio":0.22}'::jsonb,
   5)
ON CONFLICT DO NOTHING;

-- Seed Subscriptions
INSERT INTO subscriptions (id, user_id, user_type, tier, stripe_customer_id, stripe_subscription_id, status, current_period_start, current_period_end)
VALUES
  ('s0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'BORROWER', 'PLUS', 'cus_seed_alice', 'sub_seed_alice', 'ACTIVE', now(), now() + interval '30 days'),
  ('s0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000001', 'LENDER', 'PROFESSIONAL', 'cus_seed_fnb', 'sub_seed_fnb', 'ACTIVE', now(), now() + interval '30 days')
ON CONFLICT DO NOTHING;

SQL

echo ""
echo "============================================"
echo " Seed data loaded successfully!"
echo "============================================"
