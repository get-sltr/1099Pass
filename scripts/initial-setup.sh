#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 1099Pass — Initial AWS Setup
# Run this ONCE to set up your AWS environment
###############################################################################

echo "============================================"
echo " 1099Pass — Initial AWS Setup"
echo "============================================"
echo ""

# Check AWS credentials
echo "[1/6] Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
  echo "ERROR: AWS credentials not configured."
  echo "Run: aws configure"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
REGION="${AWS_REGION:-us-east-1}"
echo "  Account: ${ACCOUNT_ID}"
echo "  Region: ${REGION}"
echo ""

# Bootstrap CDK
echo "[2/6] Bootstrapping CDK..."
cd "$(dirname "$0")/../infrastructure"
npx cdk bootstrap "aws://${ACCOUNT_ID}/${REGION}" \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  --tags Project=1099Pass
echo "  CDK bootstrapped."
echo ""

# Create secrets in Secrets Manager
echo "[3/6] Creating secrets placeholders..."

# Plaid secrets
aws secretsmanager create-secret \
  --name "1099pass-dev-plaid" \
  --description "Plaid API credentials for 1099Pass" \
  --secret-string '{"client_id":"REPLACE_ME","secret":"REPLACE_ME"}' \
  --region "${REGION}" 2>/dev/null || \
  echo "  Plaid secret already exists"

# Stripe secrets
aws secretsmanager create-secret \
  --name "1099pass-dev-stripe" \
  --description "Stripe API credentials for 1099Pass" \
  --secret-string '{"secret_key":"REPLACE_ME","webhook_secret":"REPLACE_ME"}' \
  --region "${REGION}" 2>/dev/null || \
  echo "  Stripe secret already exists"

echo "  Secrets created (update with real values later)."
echo ""

# Request SSL certificate for domain
echo "[4/6] Requesting SSL certificate for 1099pass.com..."
CERT_ARN=$(aws acm request-certificate \
  --domain-name "1099pass.com" \
  --subject-alternative-names "*.1099pass.com" "www.1099pass.com" "api.1099pass.com" "lender.1099pass.com" "app.1099pass.com" \
  --validation-method DNS \
  --region us-east-1 \
  --query "CertificateArn" \
  --output text 2>/dev/null) || CERT_ARN="EXISTS"

if [ "$CERT_ARN" != "EXISTS" ]; then
  echo "  Certificate ARN: ${CERT_ARN}"
  echo ""
  echo "  IMPORTANT: You need to validate this certificate!"
  echo "  1. Go to AWS Certificate Manager console"
  echo "  2. Find the certificate for 1099pass.com"
  echo "  3. Click 'Create records in Route 53' OR copy the CNAME records"
  echo "  4. Add the CNAME records to your Porkbun DNS"
  echo ""

  # Get validation records
  aws acm describe-certificate \
    --certificate-arn "${CERT_ARN}" \
    --region us-east-1 \
    --query "Certificate.DomainValidationOptions[0].ResourceRecord" \
    --output table
else
  echo "  Certificate already requested or exists."
fi
echo ""

# Create S3 bucket for Terraform state (optional, CDK uses its own)
echo "[5/6] Creating deployment artifacts bucket..."
aws s3 mb "s3://1099pass-${ACCOUNT_ID}-artifacts" --region "${REGION}" 2>/dev/null || \
  echo "  Artifacts bucket already exists"
echo ""

# Output next steps
echo "[6/6] Setup complete!"
echo ""
echo "============================================"
echo " Next Steps"
echo "============================================"
echo ""
echo "1. VALIDATE SSL CERTIFICATE"
echo "   Add these DNS records to Porkbun:"
echo "   (Check AWS Certificate Manager for the CNAME values)"
echo ""
echo "2. UPDATE SECRETS"
echo "   aws secretsmanager update-secret \\"
echo "     --secret-id 1099pass-dev-plaid \\"
echo "     --secret-string '{\"client_id\":\"YOUR_PLAID_CLIENT_ID\",\"secret\":\"YOUR_PLAID_SECRET\"}'"
echo ""
echo "   aws secretsmanager update-secret \\"
echo "     --secret-id 1099pass-dev-stripe \\"
echo "     --secret-string '{\"secret_key\":\"sk_test_xxx\",\"webhook_secret\":\"whsec_xxx\"}'"
echo ""
echo "3. DEPLOY TO DEV"
echo "   ./scripts/deploy.sh dev"
echo ""
echo "4. CONFIGURE DNS (after deploy)"
echo "   The deploy will output CloudFront and API Gateway URLs."
echo "   Add these to your Porkbun DNS."
echo ""
echo "============================================"
