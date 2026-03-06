# Phase 1, 2, 3 — Status (as of this session)

## Phase 1: Wire It Up

### ✅ Lambda packaging (FIXED)
- **Problem:** Lambdas failed with "Cannot find module 'zod'", "Cannot find module 'login'", "Cannot find module '../../middleware/error-handler'", etc., because each Lambda was deployed with only the compiled JS in its handler folder (no `node_modules`, no sibling modules).
- **Solution:**
  - **NodejsFunction** (esbuild) is used for every Lambda so each handler is bundled with its dependencies and relative imports.
  - **New handlers:** `handlers/auth/login.ts` (Cognito `USER_PASSWORD_AUTH`), `handlers/reports/list.ts` (GET /reports from S3).
  - **Exports:** `generate.ts` exports `handler` (wrapped with `withAuth`); list and login export `handler`.
  - **Cognito env:** Login Lambda receives `USER_POOL_ID`, `COGNITO_BORROWER_CLIENT_ID`, `COGNITO_LENDER_CLIENT_ID` from the Compute stack (passed from Auth stack in `bin/1099pass.ts`).
  - **Local bundling:** `forceDockerBundling: false` and `esbuild` in `packages/api` so `cdk synth` works without Docker.
- **Path:** Handler entry points are under `packages/api/src/handlers/` (path from infra: `../../..` = repo root when running from `infrastructure/lib/stacks`).
- **Note:** If you see "CDK CLI is not compatible with the CDK library", upgrade the CLI: `npm i -g aws-cdk@latest` (or use the version required by the message).

### ⏳ Borrower app → API → Plaid Link E2E
- App has `EXPO_PUBLIC_USE_REAL_API` and API client; Plaid Link flow and connect/sync handlers exist. Full E2E still needs: real Cognito login in the app, Plaid Link token from API, connect/callback/sync wired and tested with a real Plaid account.

### ⏳ Report generation → S3 → PDF download
- Generate handler writes report JSON + PDF to S3; list handler returns report IDs; get-report and get-pdf handlers exist. Remaining: ensure GET /reports/:id and GET /reports/:id/pdf (or similar) are routed in API Gateway and app uses them for download.

### ⏳ Lender portal → API → report viewing
- Lender portal still uses mock data. Needs: `NEXT_PUBLIC_API_URL`, Cognito auth, and report list/detail API calls instead of mocks.

### ⏳ Repositories
- Borrower repository exists. Other repos (report, lender, match, message, subscription, etc.) may need to be verified/implemented per spec.

### ⏳ Square (lender subscriptions)
- Not implemented in this session. Backend routes and Square webhooks need to be added.

### ⏳ IAP (borrower subscriptions)
- Not implemented in this session. App Store / Google Play IAP and backend subscription state need to be added.

---

## Phase 2: AI Layer

### ✅ AI income narrative in report generator
- **Report:** `LenderReport` has optional `incomeNarrative?: string`.
- **PDF:** New section "Income Verification Narrative" between Income Overview and Income Sources (only if narrative is present).
- **Generate handler:** Calls `generateIncomeNarrative(incomeProfile)` before building the report; passes result into `reportService.generateReport(..., incomeNarrative)`. If Bedrock fails, report is still generated without the narrative.

### ⏳ AI transaction classifier in income normalization
- Service `ai-transaction-classifier.ts` exists. It needs to be called from `income-normalization-service.ts` in `identifyIncomeSources()` (or equivalent) for ambiguous transactions. Not wired in this session.

### ⏳ Document analyzer + S3 trigger
- Handler `POST /ai/analyze-document` exists. S3 trigger on document upload to run analysis and store results is not added.

### ⏳ AI smart matching for lender portal
- `ai-matching-service.ts` exists. Lender portal needs to call the match API and display AI-ranked results. Not wired in this session.

---

## Phase 3: Polish & Launch

### ⏳ Liquid Glass design system
- Not applied globally in this session.

### ⏳ E2E testing
- No automated E2E (Plaid → report → lender) added.

### ⏳ Landing + legal pages
- Not updated in this session.

### ⏳ Lambda Node.js 22
- Compute stack still uses `NODEJS_20_X`. Upgrade to 22 when ready (EOL for 20 is April 2026).

### ⏳ Security audit
- KMS, RLS, WAF, audit logs not audited in this session.

---

## Lender portal: Blog and deploy (S3 + CloudFront)

- **Blog:** `/blog` and `/blog/[slug]` with full SEO (meta, Open Graph, Twitter, JSON-LD, sitemap, robots). Content targets gig workers, 1099 income, mortgages, conventional loans; CTAs direct to 1099pass.com. Nav and footer include Blog; mobile menu includes Blog.
- **Google Analytics:** Optional GA4 via `NEXT_PUBLIC_GA_MEASUREMENT_ID` in lender portal env (see `apps/lender-portal/.env.example`).
- **Deploy:** Portal is static on S3 + CloudFront. Build with `BUILD_FOR_S3=true`, then sync `apps/lender-portal/out` to the portal bucket and invalidate CloudFront. Use `./scripts/deploy-lender-portal.sh` from repo root. See **docs/DEPLOY-LENDER-PORTAL.md**.

---

## Commands reference

```bash
# From repo root
cd /Users/km/Desktop/1099Pass/1099Pass

# Install (includes esbuild for Lambda bundling)
npm install

# Build API
npm run build --workspace=@1099pass/api

# Synth compute stack (requires CDK CLI compatible with aws-cdk-lib)
cd infrastructure && npx cdk synth Pass1099-Compute-dev

# Deploy (after fixing CLI version if needed)
./scripts/deploy.sh dev

# Deploy lender portal to S3 + CloudFront (blog, landing, dashboard)
./scripts/deploy-lender-portal.sh
# Or for dev: ./scripts/deploy-lender-portal.sh dev
```

---

## Files touched this session

- `packages/api/src/handlers/auth/login.ts` — new
- `packages/api/src/handlers/reports/list.ts` — new
- `packages/api/src/handlers/reports/generate.ts` — export `handler`, call AI narrator
- `packages/api/src/services/report-generator-service.ts` — `incomeNarrative` + PDF section
- `packages/api/package.json` — Cognito SDK, esbuild
- `infrastructure/lib/stacks/compute-stack.ts` — NodejsFunction, Cognito env, list reports, S3 grant
- `infrastructure/bin/1099pass.ts` — pass `userPoolId`, `cognitoBorrowerClientId`, `cognitoLenderClientId` to ComputeStack
- **Blog & portal deploy:** `apps/lender-portal/src/app/blog/`, `apps/lender-portal/src/lib/blog-posts.ts`, `apps/lender-portal/src/components/GoogleAnalytics.tsx`, `apps/lender-portal/src/app/sitemap.ts`, `apps/lender-portal/src/app/robots.ts`, `apps/lender-portal/src/app/page.tsx` (nav + mobile menu), `apps/lender-portal/next.config.js` (BUILD_FOR_S3), `apps/lender-portal/src/app/dashboard/reports/[id]/` (generateStaticParams + ReportDetailClient), `scripts/deploy-lender-portal.sh`, `docs/DEPLOY-LENDER-PORTAL.md`
