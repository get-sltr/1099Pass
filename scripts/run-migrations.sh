#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — Database Migration Runner
# Usage: ./scripts/run-migrations.sh <environment> [--rollback <migration_number>]
###############################################################################

ENVIRONMENT="${1:-}"
ROLLBACK=""
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="${ROOT_DIR}/packages/api/src/db/migrations"

if [ -z "${ENVIRONMENT}" ]; then
  echo "ERROR: Environment is required."
  echo "Usage: ./scripts/run-migrations.sh <dev|staging|prod>"
  exit 1
fi

if [[ ! "${ENVIRONMENT}" =~ ^(dev|staging|prod)$ ]]; then
  echo "ERROR: Invalid environment '${ENVIRONMENT}'. Must be one of: dev, staging, prod"
  exit 1
fi

# Parse optional arguments
shift
while [[ $# -gt 0 ]]; do
  case $1 in
    --rollback)
      ROLLBACK="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "============================================"
echo " 1099Pass — Run Migrations (${ENVIRONMENT})"
echo "============================================"
echo ""

# 1. Fetch database credentials from Secrets Manager
echo "[1/3] Fetching database credentials..."
SECRET_NAME="1099pass-${ENVIRONMENT}-db-credentials"
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "${SECRET_NAME}" \
  --query "SecretString" \
  --output text 2>/dev/null) || {
  echo "ERROR: Could not fetch secret '${SECRET_NAME}'."
  echo "Ensure the database stack has been deployed."
  exit 1
}

DB_HOST=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['host'])")
DB_PORT=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['port'])")
DB_NAME=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['dbname'])")
DB_USER=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])")
DB_PASS=$(echo "${DB_SECRET}" | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])")

echo "  Host: ${DB_HOST}"
echo "  Database: ${DB_NAME}"
echo ""

# 2. Create migrations tracking table if not exists
echo "[2/3] Ensuring migrations table exists..."
PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -q <<'SQL'
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
SQL
echo "  Migrations table ready."
echo ""

# 3. Run migrations
echo "[3/3] Running migrations..."
APPLIED=0
SKIPPED=0

for MIGRATION_FILE in "${MIGRATIONS_DIR}"/*.sql; do
  FILENAME=$(basename "${MIGRATION_FILE}")

  # Check if already applied
  ALREADY_APPLIED=$(PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
    -U "${DB_USER}" -d "${DB_NAME}" -tAc \
    "SELECT COUNT(*) FROM _migrations WHERE filename = '${FILENAME}'")

  if [ "${ALREADY_APPLIED}" -gt 0 ]; then
    echo "  SKIP: ${FILENAME} (already applied)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "  APPLY: ${FILENAME}..."
  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
    -U "${DB_USER}" -d "${DB_NAME}" \
    -v ON_ERROR_STOP=1 \
    -f "${MIGRATION_FILE}" || {
    echo "ERROR: Migration ${FILENAME} failed."
    exit 1
  }

  # Record migration
  PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
    -U "${DB_USER}" -d "${DB_NAME}" -q -c \
    "INSERT INTO _migrations (filename) VALUES ('${FILENAME}')"

  APPLIED=$((APPLIED + 1))
done

echo ""
echo "============================================"
echo " Migrations complete!"
echo " Applied: ${APPLIED}, Skipped: ${SKIPPED}"
echo "============================================"
