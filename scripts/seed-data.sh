#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — Development Seed Data (Phase 5 Integration)
# Usage: ./scripts/seed-data.sh <environment>
# WARNING: This script is for development/staging ONLY. Never run on production.
#
# Creates:
#   - 5 borrower profiles with varied income profiles
#   - 2 lender profiles with different criteria
#   - Reports for each borrower
#   - Sample messages between matched pairs
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
echo "This will create:"
echo "  - 5 borrower profiles (varied income profiles)"
echo "  - 2 lender profiles (different criteria)"
echo "  - Reports for each borrower"
echo "  - Sample messages between matched pairs"
echo ""

# Fetch database credentials
echo "[1/3] Fetching database credentials..."
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
echo "[2/3] Inserting seed data..."

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<'SQL'

-- ============================================================================
-- BORROWERS (5 profiles with varied income sources)
-- ============================================================================

-- Borrower A: Marcus Thompson - Uber + DoorDash, $65K income, score 82
-- High-performing gig worker with diversified rideshare/delivery income
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES (
  'brw-a000-0000-0000-000000000001',
  'marcus.thompson@example.com',
  '+15551000001',
  'Marcus',
  'Thompson',
  '1988-03-15',
  '4521 Riverside Dr',
  'Austin',
  'TX',
  '78704',
  'VERIFIED',
  'PLUS',
  'cognito-sub-marcus'
) ON CONFLICT (email) DO NOTHING;

-- Borrower B: Sarah Chen - Upwork + Etsy, $48K income, score 71
-- Freelance designer with creative marketplace income
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES (
  'brw-b000-0000-0000-000000000002',
  'sarah.chen@example.com',
  '+15551000002',
  'Sarah',
  'Chen',
  '1992-07-22',
  '892 Creative Ave',
  'Portland',
  'OR',
  '97205',
  'VERIFIED',
  'PRO',
  'cognito-sub-sarah'
) ON CONFLICT (email) DO NOTHING;

-- Borrower C: James Rivera - Lyft only, $35K income, score 45
-- Single-source rideshare driver with lower income stability
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES (
  'brw-c000-0000-0000-000000000003',
  'james.rivera@example.com',
  '+15551000003',
  'James',
  'Rivera',
  '1995-11-08',
  '1456 Oak Street',
  'Los Angeles',
  'CA',
  '90012',
  'VERIFIED',
  'FREE',
  'cognito-sub-james'
) ON CONFLICT (email) DO NOTHING;

-- Borrower D: Dr. Priya Patel - Multiple 1099, $120K income, score 68
-- Medical consultant with multiple contractor relationships
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES (
  'brw-d000-0000-0000-000000000004',
  'priya.patel.md@example.com',
  '+15551000004',
  'Priya',
  'Patel',
  '1980-02-14',
  '7890 Medical Plaza',
  'San Francisco',
  'CA',
  '94102',
  'VERIFIED',
  'PRO',
  'cognito-sub-priya'
) ON CONFLICT (email) DO NOTHING;

-- Borrower E: Alex Johnson - Instacart + TaskRabbit + Fiverr, $55K income, score 74
-- Multi-platform gig worker with diverse service income
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES (
  'brw-e000-0000-0000-000000000005',
  'alex.johnson@example.com',
  '+15551000005',
  'Alex',
  'Johnson',
  '1990-09-30',
  '2345 Service Lane',
  'Denver',
  'CO',
  '80202',
  'VERIFIED',
  'PLUS',
  'cognito-sub-alex'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- FINANCIAL PROFILES (Detailed income data for each borrower)
-- ============================================================================

-- Marcus Thompson: Uber ($40K) + DoorDash ($25K) = $65K, Score 82
INSERT INTO financial_profiles (id, borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
VALUES (
  'fp-a0000-0000-0000-000000000001',
  'brw-a000-0000-0000-000000000001',
  65000.00,
  '[
    {
      "platform_name": "Uber",
      "platform_type": "GIG_RIDESHARE",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 3200},
        {"month": "2024-02", "amount": 3400},
        {"month": "2024-03", "amount": 3500},
        {"month": "2024-04", "amount": 3300},
        {"month": "2024-05", "amount": 3400},
        {"month": "2024-06", "amount": 3450},
        {"month": "2024-07", "amount": 3350},
        {"month": "2024-08", "amount": 3280},
        {"month": "2024-09", "amount": 3420},
        {"month": "2024-10", "amount": 3380},
        {"month": "2024-11", "amount": 3300},
        {"month": "2024-12", "amount": 3420}
      ],
      "annual_total": 40000,
      "active_since": "2021-06-01",
      "verified": true,
      "verification_date": "2024-01-15"
    },
    {
      "platform_name": "DoorDash",
      "platform_type": "GIG_DELIVERY",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 2000},
        {"month": "2024-02", "amount": 2100},
        {"month": "2024-03", "amount": 2150},
        {"month": "2024-04", "amount": 2050},
        {"month": "2024-05", "amount": 2100},
        {"month": "2024-06", "amount": 2180},
        {"month": "2024-07", "amount": 2080},
        {"month": "2024-08", "amount": 2020},
        {"month": "2024-09", "amount": 2120},
        {"month": "2024-10", "amount": 2090},
        {"month": "2024-11", "amount": 2060},
        {"month": "2024-12", "amount": 2050}
      ],
      "annual_total": 25000,
      "active_since": "2022-03-15",
      "verified": true,
      "verification_date": "2024-01-15"
    }
  ]'::jsonb,
  5417.00,
  'STABLE',
  0.24,
  82,
  now()
) ON CONFLICT (borrower_id) DO NOTHING;

-- Sarah Chen: Upwork ($32K) + Etsy ($16K) = $48K, Score 71
INSERT INTO financial_profiles (id, borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
VALUES (
  'fp-b0000-0000-0000-000000000002',
  'brw-b000-0000-0000-000000000002',
  48000.00,
  '[
    {
      "platform_name": "Upwork",
      "platform_type": "GIG_FREELANCE",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 2400},
        {"month": "2024-02", "amount": 2800},
        {"month": "2024-03", "amount": 2600},
        {"month": "2024-04", "amount": 3100},
        {"month": "2024-05", "amount": 2900},
        {"month": "2024-06", "amount": 2500},
        {"month": "2024-07", "amount": 2700},
        {"month": "2024-08", "amount": 2600},
        {"month": "2024-09", "amount": 2800},
        {"month": "2024-10", "amount": 2750},
        {"month": "2024-11", "amount": 2650},
        {"month": "2024-12", "amount": 2700}
      ],
      "annual_total": 32000,
      "active_since": "2020-09-01",
      "verified": true,
      "verification_date": "2024-01-10"
    },
    {
      "platform_name": "Etsy",
      "platform_type": "GIG_MARKETPLACE",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 1100},
        {"month": "2024-02", "amount": 1050},
        {"month": "2024-03", "amount": 1200},
        {"month": "2024-04", "amount": 1350},
        {"month": "2024-05", "amount": 1600},
        {"month": "2024-06", "amount": 1400},
        {"month": "2024-07", "amount": 1250},
        {"month": "2024-08", "amount": 1300},
        {"month": "2024-09", "amount": 1450},
        {"month": "2024-10", "amount": 1550},
        {"month": "2024-11", "amount": 1850},
        {"month": "2024-12", "amount": 1900}
      ],
      "annual_total": 16000,
      "active_since": "2021-11-01",
      "verified": true,
      "verification_date": "2024-01-10"
    }
  ]'::jsonb,
  4000.00,
  'VARIABLE',
  0.32,
  71,
  now()
) ON CONFLICT (borrower_id) DO NOTHING;

-- James Rivera: Lyft only = $35K, Score 45 (single source, lower stability)
INSERT INTO financial_profiles (id, borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
VALUES (
  'fp-c0000-0000-0000-000000000003',
  'brw-c000-0000-0000-000000000003',
  35000.00,
  '[
    {
      "platform_name": "Lyft",
      "platform_type": "GIG_RIDESHARE",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 2600},
        {"month": "2024-02", "amount": 3100},
        {"month": "2024-03", "amount": 2400},
        {"month": "2024-04", "amount": 3200},
        {"month": "2024-05", "amount": 2800},
        {"month": "2024-06", "amount": 2500},
        {"month": "2024-07", "amount": 3400},
        {"month": "2024-08", "amount": 2700},
        {"month": "2024-09", "amount": 3000},
        {"month": "2024-10", "amount": 2900},
        {"month": "2024-11", "amount": 2600},
        {"month": "2024-12", "amount": 2800}
      ],
      "annual_total": 35000,
      "active_since": "2023-06-01",
      "verified": true,
      "verification_date": "2024-01-20"
    }
  ]'::jsonb,
  2917.00,
  'VARIABLE',
  0.41,
  45,
  now()
) ON CONFLICT (borrower_id) DO NOTHING;

-- Dr. Priya Patel: Multiple 1099 contracts = $120K, Score 68
INSERT INTO financial_profiles (id, borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
VALUES (
  'fp-d0000-0000-0000-000000000004',
  'brw-d000-0000-0000-000000000004',
  120000.00,
  '[
    {
      "platform_name": "Stanford Medical Consulting",
      "platform_type": "CONTRACTOR_1099",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 4500},
        {"month": "2024-02", "amount": 4500},
        {"month": "2024-03", "amount": 4500},
        {"month": "2024-04", "amount": 4500},
        {"month": "2024-05", "amount": 4500},
        {"month": "2024-06", "amount": 4500},
        {"month": "2024-07", "amount": 4500},
        {"month": "2024-08", "amount": 4500},
        {"month": "2024-09", "amount": 4500},
        {"month": "2024-10", "amount": 4500},
        {"month": "2024-11", "amount": 4500},
        {"month": "2024-12", "amount": 4500}
      ],
      "annual_total": 54000,
      "active_since": "2019-01-01",
      "verified": true,
      "verification_date": "2024-01-05"
    },
    {
      "platform_name": "Kaiser Telehealth",
      "platform_type": "CONTRACTOR_1099",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 3000},
        {"month": "2024-02", "amount": 3200},
        {"month": "2024-03", "amount": 2800},
        {"month": "2024-04", "amount": 3100},
        {"month": "2024-05", "amount": 3000},
        {"month": "2024-06", "amount": 2900},
        {"month": "2024-07", "amount": 3100},
        {"month": "2024-08", "amount": 3000},
        {"month": "2024-09", "amount": 2800},
        {"month": "2024-10", "amount": 3200},
        {"month": "2024-11", "amount": 3000},
        {"month": "2024-12", "amount": 2900}
      ],
      "annual_total": 36000,
      "active_since": "2021-06-01",
      "verified": true,
      "verification_date": "2024-01-05"
    },
    {
      "platform_name": "MedExpert Online",
      "platform_type": "CONTRACTOR_1099",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 2200},
        {"month": "2024-02", "amount": 2800},
        {"month": "2024-03", "amount": 2400},
        {"month": "2024-04", "amount": 2600},
        {"month": "2024-05", "amount": 2500},
        {"month": "2024-06", "amount": 2300},
        {"month": "2024-07", "amount": 2700},
        {"month": "2024-08", "amount": 2500},
        {"month": "2024-09", "amount": 2400},
        {"month": "2024-10", "amount": 2600},
        {"month": "2024-11", "amount": 2500},
        {"month": "2024-12", "amount": 2500}
      ],
      "annual_total": 30000,
      "active_since": "2022-03-01",
      "verified": true,
      "verification_date": "2024-01-05"
    }
  ]'::jsonb,
  10000.00,
  'STABLE',
  0.35,
  68,
  now()
) ON CONFLICT (borrower_id) DO NOTHING;

-- Alex Johnson: Instacart ($25K) + TaskRabbit ($18K) + Fiverr ($12K) = $55K, Score 74
INSERT INTO financial_profiles (id, borrower_id, total_annual_income, income_sources, monthly_average, income_trend, debt_to_income_ratio, loan_readiness_score, last_synced)
VALUES (
  'fp-e0000-0000-0000-000000000005',
  'brw-e000-0000-0000-000000000005',
  55000.00,
  '[
    {
      "platform_name": "Instacart",
      "platform_type": "GIG_DELIVERY",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 2000},
        {"month": "2024-02", "amount": 2100},
        {"month": "2024-03", "amount": 2200},
        {"month": "2024-04", "amount": 2050},
        {"month": "2024-05", "amount": 2150},
        {"month": "2024-06", "amount": 2100},
        {"month": "2024-07", "amount": 2000},
        {"month": "2024-08", "amount": 2150},
        {"month": "2024-09", "amount": 2100},
        {"month": "2024-10", "amount": 2050},
        {"month": "2024-11", "amount": 2000},
        {"month": "2024-12", "amount": 2100}
      ],
      "annual_total": 25000,
      "active_since": "2022-01-15",
      "verified": true,
      "verification_date": "2024-01-12"
    },
    {
      "platform_name": "TaskRabbit",
      "platform_type": "GIG_MARKETPLACE",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 1400},
        {"month": "2024-02", "amount": 1500},
        {"month": "2024-03", "amount": 1600},
        {"month": "2024-04", "amount": 1450},
        {"month": "2024-05", "amount": 1550},
        {"month": "2024-06", "amount": 1500},
        {"month": "2024-07", "amount": 1400},
        {"month": "2024-08", "amount": 1550},
        {"month": "2024-09", "amount": 1500},
        {"month": "2024-10", "amount": 1450},
        {"month": "2024-11", "amount": 1500},
        {"month": "2024-12", "amount": 1600}
      ],
      "annual_total": 18000,
      "active_since": "2021-08-01",
      "verified": true,
      "verification_date": "2024-01-12"
    },
    {
      "platform_name": "Fiverr",
      "platform_type": "GIG_FREELANCE",
      "monthly_amounts": [
        {"month": "2024-01", "amount": 900},
        {"month": "2024-02", "amount": 1000},
        {"month": "2024-03", "amount": 1100},
        {"month": "2024-04", "amount": 950},
        {"month": "2024-05", "amount": 1050},
        {"month": "2024-06", "amount": 1000},
        {"month": "2024-07", "amount": 900},
        {"month": "2024-08", "amount": 1050},
        {"month": "2024-09", "amount": 1000},
        {"month": "2024-10", "amount": 950},
        {"month": "2024-11", "amount": 1000},
        {"month": "2024-12", "amount": 1100}
      ],
      "annual_total": 12000,
      "active_since": "2022-06-01",
      "verified": true,
      "verification_date": "2024-01-12"
    }
  ]'::jsonb,
  4583.00,
  'INCREASING',
  0.28,
  74,
  now()
) ON CONFLICT (borrower_id) DO NOTHING;

-- ============================================================================
-- LENDERS (2 profiles with different criteria)
-- ============================================================================

-- Lender A: First National Mortgage - Mortgage focus, all gig types, min $50K, nationwide
INSERT INTO lenders (id, institution_name, license_number, lender_type, status, plan_tier, verified, primary_contact_name, primary_contact_email, primary_contact_phone, cognito_sub)
VALUES (
  'lnd-a000-0000-0000-000000000001',
  'First National Mortgage',
  'FNMTG-2024-0001',
  'BANK',
  'ACTIVE',
  'ENTERPRISE',
  true,
  'Jennifer Williams',
  'jwilliams@firstnational-mortgage.example.com',
  '+15552000001',
  'cognito-sub-lender-a'
) ON CONFLICT (license_number) DO NOTHING;

-- Lender B: Golden State Auto Finance - Auto loans, rideshare/delivery focus, min $30K, California only
INSERT INTO lenders (id, institution_name, license_number, lender_type, status, plan_tier, verified, primary_contact_name, primary_contact_email, primary_contact_phone, cognito_sub)
VALUES (
  'lnd-b000-0000-0000-000000000002',
  'Golden State Auto Finance',
  'GSAF-2024-0002',
  'CREDIT_UNION',
  'ACTIVE',
  'PROFESSIONAL',
  true,
  'Michael Rodriguez',
  'mrodriguez@gsautofinance.example.com',
  '+15552000002',
  'cognito-sub-lender-b'
) ON CONFLICT (license_number) DO NOTHING;

-- ============================================================================
-- LENDING CRITERIA
-- ============================================================================

-- Lender A Criteria: Mortgage, all gig types, min $50K, nationwide (all 50 states)
INSERT INTO lending_criteria (id, lender_id, loan_types, min_annual_income, accepted_gig_platforms, geographic_coverage, max_dti_ratio, min_months_active, active)
VALUES (
  'lc-a0000-0000-0000-000000000001',
  'lnd-a000-0000-0000-000000000001',
  ARRAY['CONVENTIONAL_MORTGAGE', 'FHA_MORTGAGE', 'VA_MORTGAGE', 'JUMBO_MORTGAGE'],
  50000.00,
  ARRAY['GIG_RIDESHARE', 'GIG_DELIVERY', 'GIG_FREELANCE', 'GIG_MARKETPLACE', 'CONTRACTOR_1099', 'SELF_EMPLOYED'],
  ARRAY['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
  0.43,
  24,
  true
) ON CONFLICT DO NOTHING;

-- Lender B Criteria: Auto loans, rideshare/delivery only, min $30K, California only
INSERT INTO lending_criteria (id, lender_id, loan_types, min_annual_income, accepted_gig_platforms, geographic_coverage, max_dti_ratio, min_months_active, active)
VALUES (
  'lc-b0000-0000-0000-000000000002',
  'lnd-b000-0000-0000-000000000002',
  ARRAY['AUTO_LOAN'],
  30000.00,
  ARRAY['GIG_RIDESHARE', 'GIG_DELIVERY'],
  ARRAY['CA'],
  0.50,
  12,
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- REPORTS (One for each borrower)
-- ============================================================================

-- Report for Marcus Thompson (Borrower A) - Score 82, $65K
INSERT INTO reports (id, borrower_id, report_type, status, generated_at, expires_at, data_snapshot, view_count)
VALUES (
  'rpt-a000-0000-0000-000000000001',
  'brw-a000-0000-0000-000000000001',
  'MORTGAGE_READY',
  'READY',
  now() - interval '5 days',
  now() + interval '85 days',
  '{
    "total_annual_income": 65000,
    "monthly_average": 5417,
    "income_trend": "STABLE",
    "loan_readiness_score": 82,
    "score_grade": "A",
    "source_count": 2,
    "sources": ["Uber", "DoorDash"],
    "top_source": "Uber",
    "top_source_percent": 62,
    "debt_to_income_ratio": 0.24,
    "years_active": 2.5,
    "verification_status": "FULLY_VERIFIED",
    "risk_factors": [],
    "strengths": ["Stable income trend", "Low DTI ratio", "Diversified income sources", "Long platform history"]
  }'::jsonb,
  12
) ON CONFLICT DO NOTHING;

-- Report for Sarah Chen (Borrower B) - Score 71, $48K
INSERT INTO reports (id, borrower_id, report_type, status, generated_at, expires_at, data_snapshot, view_count)
VALUES (
  'rpt-b000-0000-0000-000000000002',
  'brw-b000-0000-0000-000000000002',
  'MORTGAGE_READY',
  'READY',
  now() - interval '3 days',
  now() + interval '87 days',
  '{
    "total_annual_income": 48000,
    "monthly_average": 4000,
    "income_trend": "VARIABLE",
    "loan_readiness_score": 71,
    "score_grade": "B",
    "source_count": 2,
    "sources": ["Upwork", "Etsy"],
    "top_source": "Upwork",
    "top_source_percent": 67,
    "debt_to_income_ratio": 0.32,
    "years_active": 3.3,
    "verification_status": "FULLY_VERIFIED",
    "risk_factors": ["Variable income pattern", "Slightly higher DTI"],
    "strengths": ["Diversified income sources", "Long platform history", "Creative industry expertise"]
  }'::jsonb,
  8
) ON CONFLICT DO NOTHING;

-- Report for James Rivera (Borrower C) - Score 45, $35K
INSERT INTO reports (id, borrower_id, report_type, status, generated_at, expires_at, data_snapshot, view_count)
VALUES (
  'rpt-c000-0000-0000-000000000003',
  'brw-c000-0000-0000-000000000003',
  'AUTO_READY',
  'READY',
  now() - interval '7 days',
  now() + interval '83 days',
  '{
    "total_annual_income": 35000,
    "monthly_average": 2917,
    "income_trend": "VARIABLE",
    "loan_readiness_score": 45,
    "score_grade": "D",
    "source_count": 1,
    "sources": ["Lyft"],
    "top_source": "Lyft",
    "top_source_percent": 100,
    "debt_to_income_ratio": 0.41,
    "years_active": 0.6,
    "verification_status": "FULLY_VERIFIED",
    "risk_factors": ["Single income source", "High DTI ratio", "Short platform history", "Variable income pattern"],
    "strengths": ["Active gig worker", "Verified income"]
  }'::jsonb,
  3
) ON CONFLICT DO NOTHING;

-- Report for Dr. Priya Patel (Borrower D) - Score 68, $120K
INSERT INTO reports (id, borrower_id, report_type, status, generated_at, expires_at, data_snapshot, view_count)
VALUES (
  'rpt-d000-0000-0000-000000000004',
  'brw-d000-0000-0000-000000000004',
  'MORTGAGE_READY',
  'READY',
  now() - interval '2 days',
  now() + interval '88 days',
  '{
    "total_annual_income": 120000,
    "monthly_average": 10000,
    "income_trend": "STABLE",
    "loan_readiness_score": 68,
    "score_grade": "B",
    "source_count": 3,
    "sources": ["Stanford Medical Consulting", "Kaiser Telehealth", "MedExpert Online"],
    "top_source": "Stanford Medical Consulting",
    "top_source_percent": 45,
    "debt_to_income_ratio": 0.35,
    "years_active": 5.0,
    "verification_status": "FULLY_VERIFIED",
    "risk_factors": ["Contractor-based income (not traditional W2)", "Multiple client dependency"],
    "strengths": ["High income", "Stable trend", "Diversified sources", "Professional credentials"]
  }'::jsonb,
  15
) ON CONFLICT DO NOTHING;

-- Report for Alex Johnson (Borrower E) - Score 74, $55K
INSERT INTO reports (id, borrower_id, report_type, status, generated_at, expires_at, data_snapshot, view_count)
VALUES (
  'rpt-e000-0000-0000-000000000005',
  'brw-e000-0000-0000-000000000005',
  'MORTGAGE_READY',
  'READY',
  now() - interval '1 day',
  now() + interval '89 days',
  '{
    "total_annual_income": 55000,
    "monthly_average": 4583,
    "income_trend": "INCREASING",
    "loan_readiness_score": 74,
    "score_grade": "B",
    "source_count": 3,
    "sources": ["Instacart", "TaskRabbit", "Fiverr"],
    "top_source": "Instacart",
    "top_source_percent": 45,
    "debt_to_income_ratio": 0.28,
    "years_active": 2.5,
    "verification_status": "FULLY_VERIFIED",
    "risk_factors": ["Multiple gig platforms (operational complexity)"],
    "strengths": ["Increasing income trend", "Low DTI ratio", "Highly diversified income", "Adaptable skill set"]
  }'::jsonb,
  6
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUBSCRIPTIONS (via Apple App Store / Google Play Billing)
-- ============================================================================

-- Borrower subscriptions
INSERT INTO subscriptions (id, user_id, user_type, tier, store_customer_id, store_subscription_id, store_type, status, current_period_start, current_period_end)
VALUES
  ('sub-brw-a-0000-000000000001', 'brw-a000-0000-0000-000000000001', 'BORROWER', 'PLUS', 'apple_seed_marcus', 'sub_apple_marcus', 'APPLE', 'ACTIVE', now(), now() + interval '30 days'),
  ('sub-brw-b-0000-000000000002', 'brw-b000-0000-0000-000000000002', 'BORROWER', 'PRO', 'google_seed_sarah', 'sub_google_sarah', 'GOOGLE', 'ACTIVE', now(), now() + interval '30 days'),
  ('sub-brw-c-0000-000000000003', 'brw-c000-0000-0000-000000000003', 'BORROWER', 'FREE', 'apple_seed_james', 'sub_apple_james', 'APPLE', 'ACTIVE', now(), now() + interval '30 days'),
  ('sub-brw-d-0000-000000000004', 'brw-d000-0000-0000-000000000004', 'BORROWER', 'PRO', 'google_seed_priya', 'sub_google_priya', 'GOOGLE', 'ACTIVE', now(), now() + interval '30 days'),
  ('sub-brw-e-0000-000000000005', 'brw-e000-0000-0000-000000000005', 'BORROWER', 'PLUS', 'apple_seed_alex', 'sub_apple_alex', 'APPLE', 'ACTIVE', now(), now() + interval '30 days')
ON CONFLICT DO NOTHING;

-- Lender subscriptions (web portal - use Google Play for testing)
INSERT INTO subscriptions (id, user_id, user_type, tier, store_customer_id, store_subscription_id, store_type, status, current_period_start, current_period_end)
VALUES
  ('sub-lnd-a-0000-000000000001', 'lnd-a000-0000-0000-000000000001', 'LENDER', 'ENTERPRISE', 'google_seed_lender_a', 'sub_google_lender_a', 'GOOGLE', 'ACTIVE', now(), now() + interval '30 days'),
  ('sub-lnd-b-0000-000000000002', 'lnd-b000-0000-0000-000000000002', 'LENDER', 'PROFESSIONAL', 'google_seed_lender_b', 'sub_google_lender_b', 'GOOGLE', 'ACTIVE', now(), now() + interval '30 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MESSAGES (Sample conversations between matched borrowers and lenders)
-- ============================================================================

-- Conversation 1: Lender A <-> Marcus Thompson (matching: $65K > $50K minimum)
INSERT INTO messages (id, sender_id, sender_type, recipient_id, recipient_type, subject, body, read, created_at)
VALUES
  (
    'msg-001-0000-0000-000000000001',
    'lnd-a000-0000-0000-000000000001',
    'LENDER',
    'brw-a000-0000-0000-000000000001',
    'BORROWER',
    'Your 1099Pass Profile - Mortgage Pre-Qualification',
    'Hi Marcus,

I reviewed your 1099Pass income verification report and I''m impressed with your consistent earnings from Uber and DoorDash. Your loan readiness score of 82 is excellent!

Based on your $65,000 verified annual income and stable earning pattern, you may qualify for our FHA mortgage program with competitive rates.

Would you like to schedule a call to discuss your home buying goals?

Best regards,
Jennifer Williams
Senior Loan Officer
First National Mortgage',
    true,
    now() - interval '4 days'
  ),
  (
    'msg-002-0000-0000-000000000002',
    'brw-a000-0000-0000-000000000001',
    'BORROWER',
    'lnd-a000-0000-0000-000000000001',
    'LENDER',
    'Re: Your 1099Pass Profile - Mortgage Pre-Qualification',
    'Hi Jennifer,

Thank you for reaching out! I''ve been driving for Uber for about 3 years now and added DoorDash last year to supplement my income.

I''m very interested in learning more about the FHA program. I''m looking to buy a home in the Austin area, ideally in the $280-320K range.

What documents would you need from me to start the pre-qualification process?

Thanks,
Marcus',
    true,
    now() - interval '3 days 18 hours'
  ),
  (
    'msg-003-0000-0000-000000000003',
    'lnd-a000-0000-0000-000000000001',
    'LENDER',
    'brw-a000-0000-0000-000000000001',
    'BORROWER',
    'Re: Your 1099Pass Profile - Mortgage Pre-Qualification',
    'Hi Marcus,

Great to hear back from you! That price range is very achievable given your income profile.

The good news is that your 1099Pass report covers most of what we need for income verification. We''ll also need:
- Two years of tax returns (1040s)
- Bank statements (last 2 months)
- Photo ID

Since your income is already verified through 1099Pass with a 24-month history, we can move quickly on the pre-approval.

I have availability this Thursday at 2pm or Friday at 10am for a 30-minute call. Let me know what works!

Jennifer',
    false,
    now() - interval '3 days'
  )
ON CONFLICT DO NOTHING;

-- Conversation 2: Lender B <-> James Rivera (matching: CA, rideshare, $35K > $30K minimum)
INSERT INTO messages (id, sender_id, sender_type, recipient_id, recipient_type, subject, body, read, created_at)
VALUES
  (
    'msg-004-0000-0000-000000000004',
    'lnd-b000-0000-0000-000000000002',
    'LENDER',
    'brw-c000-0000-0000-000000000003',
    'BORROWER',
    'Auto Loan Options for Rideshare Drivers',
    'Hi James,

I noticed your 1099Pass profile shows you''re an active Lyft driver in Los Angeles. At Golden State Auto Finance, we specialize in helping gig workers like you get into reliable vehicles.

Even though your loan readiness score is 45, we have programs specifically designed for rideshare drivers. With your $35K annual income, you could qualify for:
- Used car loans up to $25,000
- New car loans up to $30,000 with a co-signer

A newer, fuel-efficient car could also help increase your earnings on the platform.

Interested in learning more?

Best,
Michael Rodriguez
Golden State Auto Finance',
    true,
    now() - interval '6 days'
  ),
  (
    'msg-005-0000-0000-000000000005',
    'brw-c000-0000-0000-000000000003',
    'BORROWER',
    'lnd-b000-0000-0000-000000000002',
    'LENDER',
    'Re: Auto Loan Options for Rideshare Drivers',
    'Hi Michael,

Thanks for reaching out. I''ve been thinking about upgrading my car since my current one is getting older and maintenance costs are eating into my profits.

I''m interested in the used car loan option. What interest rates are you currently offering? And what would the monthly payment look like for a $20,000 loan?

Also, would you accept my Lyft income even though I''ve only been driving for about 8 months?

James',
    true,
    now() - interval '5 days 12 hours'
  )
ON CONFLICT DO NOTHING;

-- Conversation 3: Lender A <-> Dr. Priya Patel (matching: high income contractor)
INSERT INTO messages (id, sender_id, sender_type, recipient_id, recipient_type, subject, body, read, created_at)
VALUES
  (
    'msg-006-0000-0000-000000000006',
    'lnd-a000-0000-0000-000000000001',
    'LENDER',
    'brw-d000-0000-0000-000000000004',
    'BORROWER',
    'Jumbo Mortgage Options for Medical Professionals',
    'Dear Dr. Patel,

I reviewed your impressive 1099Pass income profile showing $120,000 in verified annual income from your medical consulting work.

As a 1099 contractor with multiple stable income sources, you''re an excellent candidate for our Jumbo Mortgage program. Given your income level and the San Francisco market, you could qualify for homes up to $1.2M.

We have special programs for medical professionals that offer:
- Reduced documentation requirements (your 1099Pass report helps significantly)
- Competitive rates even for self-employed borrowers
- Flexible DTI calculations that account for contractor income patterns

Would you like to discuss your home buying plans?

Best regards,
Jennifer Williams
Senior Loan Officer
First National Mortgage',
    true,
    now() - interval '1 day'
  )
ON CONFLICT DO NOTHING;

-- Conversation 4: Lender A <-> Alex Johnson (matching: $55K > $50K, diversified)
INSERT INTO messages (id, sender_id, sender_type, recipient_id, recipient_type, subject, body, read, created_at)
VALUES
  (
    'msg-007-0000-0000-000000000007',
    'lnd-a000-0000-0000-000000000001',
    'LENDER',
    'brw-e000-0000-0000-000000000005',
    'BORROWER',
    'Multi-Platform Gig Worker? We Can Help!',
    'Hi Alex,

I saw your 1099Pass profile and I''m impressed by how you''ve diversified your income across Instacart, TaskRabbit, and Fiverr. Your increasing income trend and score of 74 show great financial management.

Many lenders struggle to evaluate multi-platform gig workers, but at First National Mortgage, we''ve developed expertise in this area. Your $55,000 annual income qualifies you for our FHA programs.

If you''re thinking about homeownership, I''d love to help you explore your options. The Denver market has some great opportunities right now.

Feel free to reach out with any questions!

Best,
Jennifer Williams
First National Mortgage',
    false,
    now() - interval '12 hours'
  )
ON CONFLICT DO NOTHING;

SQL

echo ""

# Print summary
echo "[3/3] Verifying seed data..."

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -t <<'SQL'
SELECT
  '  Borrowers: ' || COUNT(*)
FROM borrowers
WHERE id LIKE 'brw-%';
SQL

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -t <<'SQL'
SELECT
  '  Lenders: ' || COUNT(*)
FROM lenders
WHERE id LIKE 'lnd-%';
SQL

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -t <<'SQL'
SELECT
  '  Financial Profiles: ' || COUNT(*)
FROM financial_profiles
WHERE id LIKE 'fp-%';
SQL

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -t <<'SQL'
SELECT
  '  Reports: ' || COUNT(*)
FROM reports
WHERE id LIKE 'rpt-%';
SQL

PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${DB_NAME}" -t <<'SQL'
SELECT
  '  Messages: ' || COUNT(*)
FROM messages
WHERE id LIKE 'msg-%';
SQL

echo ""
echo "============================================"
echo " Seed data loaded successfully!"
echo ""
echo " Test Accounts:"
echo "   Borrowers:"
echo "     - marcus.thompson@example.com (Uber+DoorDash, \$65K, score 82)"
echo "     - sarah.chen@example.com (Upwork+Etsy, \$48K, score 71)"
echo "     - james.rivera@example.com (Lyft only, \$35K, score 45)"
echo "     - priya.patel.md@example.com (Multi-1099, \$120K, score 68)"
echo "     - alex.johnson@example.com (Instacart+TaskRabbit+Fiverr, \$55K, score 74)"
echo ""
echo "   Lenders:"
echo "     - jwilliams@firstnational-mortgage.example.com (Nationwide Mortgage)"
echo "     - mrodriguez@gsautofinance.example.com (CA Auto Loans)"
echo "============================================"
