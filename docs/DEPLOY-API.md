# Deploying the 1099Pass API

The API is deployed as part of the CDK stacks: Lambda functions behind API Gateway, in your VPC with access to RDS, S3, Secrets Manager, and KMS.

---

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity` works)
- Node 20+ and npm/pnpm
- CDK CLI: `npm install -g aws-cdk` (version must match `aws-cdk-lib` in `infrastructure/package.json`)

---

## Deploy all stacks (including API)

From the **repo root** (the folder containing `infrastructure/`, `packages/`, `apps/`):

```bash
# Deploy to dev
./scripts/deploy.sh dev

# Deploy to prod (prompts for confirmation)
./scripts/deploy.sh prod

# Deploy only the Compute stack (Lambda + API Gateway routes)
./scripts/deploy.sh dev --stack Pass1099-Compute-dev
```

The script:

1. Validates AWS credentials
2. Builds `@1099pass/shared` and `@1099pass/api`
3. Runs type checks
4. Runs `cdk synth` then `cdk deploy`

API base URL is in the **ApiStack** output (e.g. `https://xxxx.execute-api.us-east-1.amazonaws.com/prod/`). Use this as `NEXT_PUBLIC_API_URL` when building the lender portal.

---

## Optional: FRED API key (Live Rates)

The **GET /rates** Lambda returns conventional and non-QM mortgage rates. The FRED API key is stored in **AWS Secrets Manager** (never in code or Lambda env).

1. After deploying, create or update the secret **`pass1099-{environment}-fred-api-key`** in AWS Console (Secrets Manager) with your FRED API key as the plaintext value.
2. The **scheduled Lambda** (`pass1099-{environment}-rates-refresh`) runs every **Thursday at 1:00 PM ET** (18:00 UTC). It fetches from FRED and writes to the `rate_cache` table. No FRED calls happen when users hit GET /rates.
3. Ensure migration **012_create_rate_cache.sql** has been applied so the `rate_cache` table exists. Until the first scheduled run (or a manual invoke of the refresh Lambda), GET /rates may return mock data.

Get a free key: [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html).

### FRED series used by the weekly refresh

| Loan type        | FRED series ID | Update frequency        |
|------------------|----------------|--------------------------|
| 30-year fixed    | MORTGAGE30US   | Weekly (Thursdays)       |
| 15-year fixed    | MORTGAGE15US   | Weekly (Thursdays)       |
| 10-year Treasury | DGS10          | Daily (market benchmark) |

**5/1 ARM:** Freddie Mac discontinued **MORTGAGE5US** in late 2022. For 5/1 ARM rates use a secondary source (e.g. Bankrate or your non-QM partner rate sheets).

---

## After deploy

- **Health:** `GET {API_URL}/health` → `{ "status": "ok", "db": true }`
- **Rates:** `GET {API_URL}/rates` → conventional + non-QM rates (public, no auth). Reads from PostgreSQL `rate_cache` only; no FRED call on request. Response includes `sourceCredit` per FRED terms. Cache is updated by a scheduled Lambda every **Thursday at 1:00 PM ET** (after the 12:00 PM ET FRED release); stays under FRED’s 30 requests/minute limit.
- **Auth:** Cognito User Pool and app clients are created by the Auth stack; use their IDs in the borrower app and lender portal.

---

## Troubleshooting

- **"CDK CLI is not compatible"** — Upgrade: `npm i -g aws-cdk@latest`
- **Lambda "Cannot find module"** — Ensure `packages/api` builds and Compute stack uses `NodejsFunction` (esbuild bundles each handler).
- **Rates return sample data** — Ensure (1) the value of secret `pass1099-{env}-fred-api-key` is set in AWS Secrets Manager, (2) migration `012_create_rate_cache.sql` has been applied, and (3) the refresh Lambda has run at least once (wait for Thursday 1 PM ET or invoke `pass1099-{env}-rates-refresh` manually).
