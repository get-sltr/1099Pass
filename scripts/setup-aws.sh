#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — AWS Account Setup & CDK Bootstrap
# Usage: ./scripts/setup-aws.sh [region]
###############################################################################

REGION="${1:-us-east-1}"
PROJECT="1099Pass"
CDK_DIR="$(cd "$(dirname "$0")/../infrastructure" && pwd)"

echo "============================================"
echo " 1099Pass — AWS Setup"
echo "============================================"
echo ""

# 1. Validate AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "ERROR: AWS CLI is not installed."
  echo "Install it: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

# 2. Validate AWS credentials are configured
echo "[1/6] Validating AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
  echo "ERROR: AWS credentials are not configured or are invalid."
  echo "Run: aws configure"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
CALLER_ARN=$(aws sts get-caller-identity --query "Arn" --output text)
echo "  Account: ${ACCOUNT_ID}"
echo "  Identity: ${CALLER_ARN}"
echo "  Region: ${REGION}"
echo ""

# 3. Validate Node.js version
echo "[2/6] Validating Node.js version..."
NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "${NODE_VERSION}" | cut -d. -f1)
if [ "${NODE_MAJOR}" -lt 20 ]; then
  echo "ERROR: Node.js 20+ is required. Current version: ${NODE_VERSION}"
  exit 1
fi
echo "  Node.js: v${NODE_VERSION}"
echo ""

# 4. Validate CDK CLI is installed
echo "[3/6] Validating AWS CDK CLI..."
if ! command -v cdk &> /dev/null; then
  echo "CDK CLI not found. Installing globally..."
  npm install -g aws-cdk
fi
CDK_VERSION=$(cdk --version)
echo "  CDK: ${CDK_VERSION}"
echo ""

# 5. Install dependencies
echo "[4/6] Installing infrastructure dependencies..."
cd "${CDK_DIR}"
npm install
echo ""

# 6. Bootstrap CDK
echo "[5/6] Bootstrapping CDK in ${ACCOUNT_ID}/${REGION}..."
cdk bootstrap "aws://${ACCOUNT_ID}/${REGION}" \
  --tags "Project=${PROJECT}" \
  --tags "ManagedBy=CDK"
echo ""

# 7. Verify bootstrap
echo "[6/6] Verifying bootstrap..."
if aws cloudformation describe-stacks \
  --stack-name CDKToolkit \
  --region "${REGION}" &> /dev/null; then
  echo "  CDK bootstrap stack found. Setup complete."
else
  echo "ERROR: CDK bootstrap stack not found. Bootstrap may have failed."
  exit 1
fi

echo ""
echo "============================================"
echo " Setup complete!"
echo ""
echo " Next steps:"
echo "   1. Create a .env file with required secrets"
echo "   2. Run: ./scripts/deploy.sh dev"
echo "============================================"
