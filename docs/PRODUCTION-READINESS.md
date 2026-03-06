# Production Readiness Checklist

Use this checklist before going live. All items should be verified for production.

---

## Infrastructure (AWS)

- [ ] **CDK deployed** to prod: `cd infrastructure && cdk deploy --all -c environment=prod`
- [ ] **Environment** `ENVIRONMENT=prod` set in Lambda env (via CDK)
- [ ] **RDS** in private subnet, encryption at rest, no public access
- [ ] **S3** buckets: no public access, encryption (KMS), CORS only where needed
- [ ] **Secrets** in Secrets Manager (DB, Plaid, etc.); no secrets in code or env files in repo
- [ ] **Plaid** `PLAID_MODE=production` and production keys in Parameter Store / Secrets Manager
- [ ] **CORS** allows only prod origins (1099pass.com, www, lender., app.) — see `api-stack.ts` getAllowedOrigins
- [ ] **WAF** enabled on API Gateway with rate limiting and OWASP rules
- [ ] **CloudWatch** log groups and alarms for Lambda errors and API 5xx

---

## API

- [ ] **Health endpoint** `GET /health` returns 200 when DB is reachable (used by load balancers/monitoring)
- [ ] **Auth** routes (login/register) public; all other routes behind Cognito authorizer
- [ ] **No PII or financial data** in application logs (request logger and error handler must not log bodies with PII)
- [ ] **DB** SSL required in prod (`config.isDev()` false so `rejectUnauthorized: true`)
- [ ] **SQL logging** disabled in prod (only `config.isDev()` logs in `db/client.ts`)

---

## Lender Portal (Next.js)

- [ ] **Build for S3**: `BUILD_FOR_S3=true npm run build`; deploy with `./scripts/deploy-lender-portal.sh`
- [ ] **Env**: `NEXT_PUBLIC_API_URL` set to prod API URL (e.g. `https://api.1099pass.com`) when building
- [ ] **GA** (optional): `NEXT_PUBLIC_GA_MEASUREMENT_ID` for production property
- [ ] **No debug** code or console.log in production build (Next strips in production by default for many cases; avoid logging PII anywhere)

---

## Borrower App (React Native / Expo)

- [ ] **Production API URL**: `EXPO_PUBLIC_API_URL=https://api.1099pass.com` (or your prod API) set at build time for release builds
- [ ] **Mocks off**: In production (`NODE_ENV=production`) mocks are never used; no need to set anything. For release builds ensure you are not in development mode.
- [ ] **EAS / app store**: Version and build number bumped; privacy policy and terms URLs point to 1099pass.com
- [ ] **No hardcoded** API URLs or secrets in app code

---

## Security

- [ ] **HTTPS only** (API Gateway and CloudFront enforce TLS)
- [ ] **Cognito** MFA available; admin roles require MFA
- [ ] **Plaid tokens** encrypted with KMS before DB write
- [ ] **RLS** enabled on all PostgreSQL tables with user/lender data
- [ ] **Audit** logging for sensitive operations (CloudTrail + application audit_logs)

---

## Legal & Compliance

- [ ] **Terms of Service** and **Privacy Policy** live at 1099pass.com/terms and 1099pass.com/privacy (March 2026, SLTR Digital LLC)
- [ ] **In-app** disclaimers on calculator and AI outputs (educational only, consult a professional)
- [ ] **Data deletion** flow implemented and tested (account delete triggers full cascade)

---

## Monitoring & Runbooks

- [ ] **Health check** monitored (e.g. CloudWatch alarm if GET /health returns 503)
- [ ] **Runbook** or doc for: deploy portal, deploy API (CDK), rollback, clear cache (CloudFront invalidation)
- [ ] **Contacts** for incidents (e.g. support@1099pass.com, legal@1099pass.com)

---

## Quick Commands

| Action | Command |
|--------|---------|
| Deploy API + infra (prod) | `cd infrastructure && cdk deploy --all -c environment=prod` |
| Deploy lender portal | `./scripts/deploy-lender-portal.sh` (prod) or `./scripts/deploy-lender-portal.sh dev` |
| Build portal for S3 | `BUILD_FOR_S3=true npm run build --workspace=@1099pass/lender-portal` |
| Check API health | `curl -s https://<api-url>/prod/health` (or your stage name) |

---

See also: [1099PASS-BUILD.md](1099PASS-BUILD.md) (security principles, tech stack), [DEPLOY-LENDER-PORTAL.md](DEPLOY-LENDER-PORTAL.md) (portal deploy details).
