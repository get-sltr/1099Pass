#!/usr/bin/env bash
# Deploy lender portal to S3 + CloudFront (1099pass.com).
# Uses static export so the site can be served from S3.
# Run from repo root: ./scripts/deploy-lender-portal.sh [environment]

set -e
cd "$(dirname "$0")/.."

ENV="${1:-prod}"
BUCKET="pass1099-${ENV}-lender-portal"

echo "Building lender portal (static export for S3)..."
BUILD_FOR_S3=true npm run build --workspace=@1099pass/lender-portal

OUT_DIR="apps/lender-portal/out"
if [ ! -d "$OUT_DIR" ]; then
  echo "Error: $OUT_DIR not found. Build should create it when BUILD_FOR_S3=true."
  exit 1
fi

echo "Syncing to s3://$BUCKET ..."
aws s3 sync "$OUT_DIR" "s3://$BUCKET" --delete

# CloudFront distribution ID (prod from your README; override with CLOUDFRONT_ID env if needed)
CF_ID="${CLOUDFRONT_ID:-E2L2IO6SQNRKCZ}"
echo "Invalidating CloudFront distribution $CF_ID ..."
aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths "/*"

echo "Done. Portal (including Blog) should be live at https://1099pass.com after invalidation completes."
