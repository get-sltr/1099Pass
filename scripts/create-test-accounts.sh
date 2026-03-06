#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — Create All-Access Test Accounts
# Creates Cognito users + optional DB records for testing website and app.
#
# Usage:
#   ./scripts/create-test-accounts.sh [dev|staging] [--seed-db]
#
# Prerequisites:
#   - AWS CLI configured, CDK auth stack deployed (Pass1099-Auth-{env})
#   - For --seed-db: DB credentials in Secrets Manager (1099pass-{env}-db-credentials)
###############################################################################

ENVIRONMENT="${1:-dev}"
SEED_DB=false
for arg in "$@"; do
  if [ "$arg" = "--seed-db" ]; then
    SEED_DB=true
    break
  fi
done

# Test account credentials (same password for both; meets Cognito policy)
TEST_BORROWER_EMAIL="test-borrower@1099pass.com"
TEST_LENDER_EMAIL="test-lender@1099pass.com"
TEST_PASSWORD="TestPass123!"
BORROWER_NAME="Test"
BORROWER_LASTNAME="Borrower"
LENDER_NAME="Test"
LENDER_LASTNAME="Lender"

REGION="${AWS_REGION:-us-east-1}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! "${ENVIRONMENT}" =~ ^(dev|staging)$ ]]; then
  echo "ERROR: Environment must be dev or staging (got: ${ENVIRONMENT})"
  exit 1
fi

echo "============================================"
echo " 1099Pass — Create Test Accounts (${ENVIRONMENT})"
echo "============================================"
echo ""

# Resolve User Pool ID
echo "[1/5] Resolving Cognito User Pool..."
USER_POOL_NAME="pass1099-${ENVIRONMENT}-users"
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --region "${REGION}" \
  --query "UserPools[?Name=='${USER_POOL_NAME}'].Id" --output text 2>/dev/null | head -1)

if [ -z "${USER_POOL_ID}" ] || [ "${USER_POOL_ID}" = "None" ]; then
  echo "ERROR: User Pool '${USER_POOL_NAME}' not found."
  echo "Deploy the auth stack first: cd infrastructure && npx cdk deploy Pass1099-Auth-${ENVIRONMENT}"
  exit 1
fi
echo "  User Pool ID: ${USER_POOL_ID}"
echo ""

# Create borrower user
echo "[2/5] Creating borrower test user (${TEST_BORROWER_EMAIL})..."
aws cognito-idp admin-create-user \
  --user-pool-id "${USER_POOL_ID}" \
  --username "${TEST_BORROWER_EMAIL}" \
  --user-attributes \
    "Name=email,Value=${TEST_BORROWER_EMAIL}" \
    "Name=email_verified,Value=true" \
    "Name=given_name,Value=${BORROWER_NAME}" \
    "Name=family_name,Value=${BORROWER_LASTNAME}" \
    "Name=custom:user_type,Value=BORROWER" \
  --message-action SUPPRESS \
  --region "${REGION}" 2>/dev/null || true

aws cognito-idp admin-set-user-password \
  --user-pool-id "${USER_POOL_ID}" \
  --username "${TEST_BORROWER_EMAIL}" \
  --password "${TEST_PASSWORD}" \
  --permanent \
  --region "${REGION}" 2>/dev/null || true
echo "  Borrower user ready."
echo ""

# Create lender user
echo "[3/5] Creating lender test user (${TEST_LENDER_EMAIL})..."
aws cognito-idp admin-create-user \
  --user-pool-id "${USER_POOL_ID}" \
  --username "${TEST_LENDER_EMAIL}" \
  --user-attributes \
    "Name=email,Value=${TEST_LENDER_EMAIL}" \
    "Name=email_verified,Value=true" \
    "Name=given_name,Value=${LENDER_NAME}" \
    "Name=family_name,Value=${LENDER_LASTNAME}" \
    "Name=custom:user_type,Value=LENDER" \
  --message-action SUPPRESS \
  --region "${REGION}" 2>/dev/null || true

aws cognito-idp admin-set-user-password \
  --user-pool-id "${USER_POOL_ID}" \
  --username "${TEST_LENDER_EMAIL}" \
  --password "${TEST_PASSWORD}" \
  --permanent \
  --region "${REGION}" 2>/dev/null || true
echo "  Lender user ready."
echo ""

# Get Cognito sub for borrower (for DB seed)
echo "[4/5] Fetching Cognito sub IDs..."
BORROWER_SUB=$(aws cognito-idp admin-get-user \
  --user-pool-id "${USER_POOL_ID}" \
  --username "${TEST_BORROWER_EMAIL}" \
  --region "${REGION}" \
  --query "UserAttributes[?Name=='sub'].Value" --output text 2>/dev/null || echo "")
LENDER_SUB=$(aws cognito-idp admin-get-user \
  --user-pool-id "${USER_POOL_ID}" \
  --username "${TEST_LENDER_EMAIL}" \
  --region "${REGION}" \
  --query "UserAttributes[?Name=='sub'].Value" --output text 2>/dev/null || echo "")

if [ -n "${BORROWER_SUB}" ]; then
  echo "  Borrower sub: ${BORROWER_SUB}"
fi
if [ -n "${LENDER_SUB}" ]; then
  echo "  Lender sub:   ${LENDER_SUB}"
fi
echo ""

# Optional: seed DB
if [ "${SEED_DB}" = true ] && [ -n "${BORROWER_SUB}" ] && [ -n "${LENDER_SUB}" ]; then
  echo "[5/5] Seeding database with test account records..."
  SECRET_NAME="1099pass-${ENVIRONMENT}-db-credentials"
  DB_SECRET=$(aws secretsmanager get-secret-value --secret-id "${SECRET_NAME}" \
    --query "SecretString" --output text --region "${REGION}" 2>/dev/null) || {
    echo "  WARN: Could not fetch DB secret '${SECRET_NAME}'. Skip DB seed."
    echo ""
    echo "  To seed DB later, run with DB access:"
    echo "  PGPASSWORD=... psql -h <host> -U <user> -d <dbname> -f - <<SQL"
    echo "  -- Use cognito_sub = '${BORROWER_SUB}' for borrower and '${LENDER_SUB}' for lender"
    exit 0
  }
  DB_HOST=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['host'])")
  DB_PORT=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['port'])")
  DB_NAME=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['dbname'])")
  DB_USER=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])")
  DB_PASS=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])")

  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<SQL
-- All-access test borrower
INSERT INTO borrowers (id, email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '${TEST_BORROWER_EMAIL}',
  '+15550000001',
  '${BORROWER_NAME}',
  '${BORROWER_LASTNAME}',
  '1990-01-01',
  '123 Test St',
  'Austin',
  'TX',
  '78701',
  'VERIFIED',
  'PRO',
  '${BORROWER_SUB}'
) ON CONFLICT (email) DO UPDATE SET cognito_sub = EXCLUDED.cognito_sub, subscription_tier = 'PRO', kyc_status = 'VERIFIED';

-- All-access test lender
INSERT INTO lenders (id, institution_name, license_number, lender_type, status, plan_tier, verified, primary_contact_name, primary_contact_email, primary_contact_phone, cognito_sub)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '1099Pass Test Lending',
  'TEST-1099PASS-001',
  'FINTECH',
  'ACTIVE',
  'ENTERPRISE',
  true,
  '${LENDER_NAME} ${LENDER_LASTNAME}',
  '${TEST_LENDER_EMAIL}',
  '+15550000002',
  '${LENDER_SUB}'
) ON CONFLICT (license_number) DO UPDATE SET cognito_sub = EXCLUDED.cognito_sub;
SQL
  echo "  DB seed done."
else
  echo "[5/5] Skipping DB seed (use --seed-db to insert borrower/lender rows)."
fi

echo ""
echo "============================================"
echo " Test accounts created successfully"
echo "============================================"
echo ""
echo "  BORROWER APP (mobile / borrower flow):"
echo "    Email:    ${TEST_BORROWER_EMAIL}"
echo "    Password: ${TEST_PASSWORD}"
echo ""
echo "  LENDER PORTAL (website):"
echo "    Email:    ${TEST_LENDER_EMAIL}"
echo "    Password: ${TEST_PASSWORD}"
echo ""
echo "  Save these credentials. See docs/TEST-ACCOUNTS.md for usage."
echo ""
