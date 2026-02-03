#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — Deployment Script
# Usage: ./scripts/deploy.sh <environment> [--stack <stack-name>]
# Environments: dev, staging, prod
###############################################################################

ENVIRONMENT="${1:-}"
STACK_FILTER=""
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CDK_DIR="${ROOT_DIR}/infrastructure"

if [ -z "${ENVIRONMENT}" ]; then
  echo "ERROR: Environment is required."
  echo "Usage: ./scripts/deploy.sh <dev|staging|prod> [--stack <stack-name>]"
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
    --stack)
      STACK_FILTER="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "============================================"
echo " 1099Pass — Deploy to ${ENVIRONMENT}"
echo "============================================"
echo ""

# 1. Validate AWS credentials
echo "[1/5] Validating AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
  echo "ERROR: AWS credentials are not configured."
  exit 1
fi
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
echo "  Account: ${ACCOUNT_ID}"
echo ""

# 2. Production safety check
if [ "${ENVIRONMENT}" = "prod" ]; then
  echo "WARNING: You are deploying to PRODUCTION."
  read -r -p "Are you sure? Type 'yes' to continue: " CONFIRM
  if [ "${CONFIRM}" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
  fi
  echo ""
fi

# 3. Build all packages
echo "[2/5] Building packages..."
cd "${ROOT_DIR}"
npm run build --workspace=@1099pass/shared 2>&1 || {
  echo "ERROR: Failed to build shared package."
  exit 1
}
npm run build --workspace=@1099pass/api 2>&1 || {
  echo "ERROR: Failed to build API package."
  exit 1
}
echo "  Packages built successfully."
echo ""

# 4. Run type checks
echo "[3/5] Running type checks..."
npm run typecheck --workspace=@1099pass/shared 2>&1 || {
  echo "ERROR: Type check failed for shared package."
  exit 1
}
npm run typecheck --workspace=@1099pass/api 2>&1 || {
  echo "ERROR: Type check failed for API package."
  exit 1
}
echo "  Type checks passed."
echo ""

# 5. Synthesize CDK
echo "[4/5] Synthesizing CloudFormation templates..."
cd "${CDK_DIR}"
cdk synth --context environment="${ENVIRONMENT}" 2>&1 || {
  echo "ERROR: CDK synthesis failed."
  exit 1
}
echo "  Synthesis complete."
echo ""

# 6. Deploy
echo "[5/5] Deploying stacks..."
DEPLOY_ARGS=(
  "--context" "environment=${ENVIRONMENT}"
  "--require-approval" "broadening"
  "--tags" "Project=1099Pass"
  "--tags" "Environment=${ENVIRONMENT}"
  "--tags" "ManagedBy=CDK"
)

if [ -n "${STACK_FILTER}" ]; then
  echo "  Deploying stack: ${STACK_FILTER}"
  cdk deploy "${STACK_FILTER}" "${DEPLOY_ARGS[@]}" 2>&1
else
  echo "  Deploying all stacks..."
  cdk deploy --all "${DEPLOY_ARGS[@]}" 2>&1
fi

echo ""
echo "============================================"
echo " Deployment to ${ENVIRONMENT} complete!"
echo "============================================"
