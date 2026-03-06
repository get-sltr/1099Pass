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

The **GET /rates** Lambda returns conventional and non-QM mortgage rates. With a FRED API key it uses live data; without it, it returns sample rates.

To use live FRED data, pass the key at deploy time:

```bash
FRED_API_KEY=your_fred_api_key ./scripts/deploy.sh dev
```

Or set `FRED_API_KEY` in your CI/CD environment (e.g. CodeBuild env or AWS Secrets Manager) so it’s available when the Compute stack is deployed. The key is stored in the Lambda environment (not in code).

Get a free key: [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html).

---

## After deploy

- **Health:** `GET {API_URL}/health` → `{ "status": "ok", "db": true }`
- **Rates:** `GET {API_URL}/rates` → conventional + non-QM rates (public, no auth)
- **Auth:** Cognito User Pool and app clients are created by the Auth stack; use their IDs in the borrower app and lender portal.

---

## Troubleshooting

- **"CDK CLI is not compatible"** — Upgrade: `npm i -g aws-cdk@latest`
- **Lambda "Cannot find module"** — Ensure `packages/api` builds and Compute stack uses `NodejsFunction` (esbuild bundles each handler).
- **Rates return sample data** — Set `FRED_API_KEY` and redeploy the Compute stack.
