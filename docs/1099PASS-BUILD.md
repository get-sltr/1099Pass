# 1099Pass -- Project Context for Claude Code / Cursor
## Last Updated: March 6, 2026

---

## BRAND

- **App Name:** 1099Pass
- **Tagline:** "Built for the income they won't count."
- **AI Motto:** "We grind and hustle for our consumers to achieve the goal they want to reach."
- **Audience:** Non-W2 workers (gig workers, freelancers, independent contractors, self-employed, commission-based, small business owners)
- **Entity:** SLTR Digital LLC (California)
- **Domain:** 1099pass.com (registered via Porkbun)
- **Bundle ID:** com.sltrdigital.1099pass
- **Repo:** ~/Documents/1099Pass
- **Founder:** Kevin Minn, CEO, sole founder, 100% equity

---

## WHAT 1099PASS IS

A financial intelligence platform for non-W2 workers. Three pillars, one product, all shipping together:

1. **Education Engine** -- Loan type education, non-QM rate tracker, credit improvement curriculum, buyer journey guides, tax strategy education. Covers mortgages, auto loans, refinancing, construction loans, business loans, SBA loans.
2. **Document Preparation + AI Scenario Engine** -- Plaid-powered bank statement organization, income normalization, document packaging, AI-powered scenario analysis with multiple paths to approval, interactive calculators calibrated for non-QM loan types.
3. **Lender-Side SaaS** -- Subscription portal for non-QM lenders to receive pre-organized borrower document packages. Standardized format. API integration.

## WHAT 1099PASS IS NOT

- NOT a lender, loan originator, loan broker, mortgage broker, or financial advisor
- NOT a party to any loan transaction
- NOT a lead generator (no compensated referrals to lenders)
- NOT a consumer reporting agency (reports are educational tools, not FCRA consumer reports)
- Does NOT hold, process, or transmit consumer funds
- Does NOT make credit or lending decisions
- Does NOT pull credit reports (V1 uses self-reported credit scores)

---

## TECH STACK

| Component | Technology |
|-----------|------------|
| Borrower Mobile App | React Native + Expo (iOS and Android) |
| Lender Portal | Next.js (Desktop web) |
| Backend | AWS Lambda (serverless), API Gateway |
| Database | Amazon RDS (PostgreSQL), DynamoDB |
| Auth | AWS Cognito (MFA, OAuth 2.0, RBAC) |
| Financial Data | Plaid (Transactions, Auth, Identity, Balance) -- PRODUCTION ACCESS APPROVED |
| AI Engine | GPT-4 for scenario analysis, income categorization, recommendations |
| Rate Data | FRED API (Freddie Mac PMMS) + non-QM lender published rate sheets |
| Document Storage | Amazon S3 (AES-256 encrypted via KMS) |
| Encryption | AWS KMS for data at rest, TLS 1.3 in transit |
| Payments (Borrower) | StoreKit 2 (iOS) / Google Play Billing (Android) |
| Payments (Lender) | Square (web only) |
| Infrastructure | AWS CDK (Infrastructure as Code), VPC with private subnets |
| Monitoring | AWS CloudWatch, X-Ray, CloudTrail |
| Email | Brevo (transactional only: verification, password reset, deletion confirmation) |
| Credit Score | Self-reported by user (V1). Bureau soft pull integration planned for V2. |

---

## BRAND DESIGN SYSTEM

- **Primary Color:** #0A1628 (Navy)
- **Accent Color:** #C4652A (Rust)
- **Background:** #F5F0E8 (Cream) for borrower app / #0A1628 (Navy) for lender portal
- **Text Primary:** #2D2D2D (Charcoal)
- **Text Secondary:** #666666
- **Typography:** Georgia for headings, Arial/Inter for body
- **Style:** Editorial/magazine aesthetic for marketing. Clean, professional, trustworthy for the app. Bold/futuristic for the lender portal.
- **NO** glassmorphism on this product. This is fintech. Trust and clarity over flash.

**Borrower app dual theme (design spec):** Day mode **Paper & Ink** (cream #FAF9F6, accent #FF6B00). Night mode **Midnight Ember** (dark #050505, accent #FF8C33). Same liquid-glass DNA; see `1099pass-dual-theme` design file.

---

## EXISTING ASSETS (Already Built -- Phases 1-5)

- Monorepo structure with npm workspaces
- AWS CDK infrastructure (VPC, RDS, S3, Cognito, Lambda, API Gateway)
- Database migrations (11 tables)
- Shared TypeScript types with Zod validation
- Income normalization engine with Plaid integration
- Income Readiness Score algorithm
- Report generator (JSON + PDF)
- Borrower React Native app scaffold
- Lender Next.js portal scaffold
- CI/CD pipeline
- Square integration for lender payments
- Self-reported credit score feature

### Known Issues from Previous Build

- `packages/shared/src/utils/encryption.ts` imports Node's `crypto` which crashes React Native. Must use `expo-crypto` or `react-native-get-random-values` for mobile.
- API handlers (auth, lender, messaging, notifications, subscriptions) need verification/completion.
- Verify all 8 repositories are implemented (borrower, lender, report, messaging, notification, subscription, document, match).
- Expo SDK compatibility check needed.
- End-to-end flow (Plaid Link > income processing > report generation > lender viewing) not yet connected.

---

## SECURITY ARCHITECTURE (NON-NEGOTIABLE)

### Five Core Principles

**Principle 1: ZERO LOCAL STORAGE**
No user data stored on local devices, local servers, or any infrastructure outside encrypted AWS services within a VPC with private subnets. Everything goes to AWS. Nothing stays local. No exceptions.

**Principle 2: ZERO AI RETENTION**
AI processes data in volatile memory (RAM) only. No disk writes. No logs. No cache. No training. No fine-tuning. Data discarded immediately after response generation. API calls made with all available data retention opt-out flags.

**Principle 3: DELETE MEANS DELETE**
Account deletion triggers hard deletes across every data store. No soft deletes. No archive tables. No anonymization in lieu of deletion. No "we keep anonymized data for analytics." The user's data is wiped from primary DB, all S3 objects permanently deleted, all Plaid tokens revoked, all references purged. Backup media overwritten within 30-day rotation.

**Principle 4: ENCRYPTION EVERYWHERE**
Every byte of user data encrypted at rest (AES-256 via AWS KMS) and in transit (TLS 1.3). Zero exceptions. Database connections use SSL. S3 buckets enforce server-side encryption. API calls enforce HTTPS. Internal service-to-service uses encrypted channels. No plaintext data exists anywhere at any time.

**Principle 5: NO LOOPHOLES**
No administrative backdoor. No debug mode bypass. No god mode account. No bulk data export function. No data warehouse aggregating user financial data. Audit logs record every access to financial data including by administrators. Logs are immutable (S3 Object Lock) and encrypted.

### Implementation Requirements

```
ENCRYPTION:
- RDS: Enable encryption at rest with KMS CMK
- S3: Bucket policy enforces aws:SecureTransport, SSE-KMS default encryption
- DynamoDB: Encryption at rest with KMS
- Cognito: Standard encryption (AWS managed)
- Plaid tokens: Encrypt with KMS before INSERT, decrypt at moment of use only
- Passwords: bcrypt with cost factor >= 12, unique random salts
- All API endpoints: HTTPS only, HSTS headers enforced
- Internal Lambda-to-Lambda: Encrypted via AWS internal network + IAM auth

ACCESS CONTROLS:
- PostgreSQL RLS on EVERY table containing user data
- RLS policy: user_id = auth.uid() on SELECT, INSERT, UPDATE, DELETE
- IAM roles: one role per Lambda function, minimum permissions
- Cognito: MFA available for all users, required for admin
- API Gateway: Cognito authorizer on all authenticated endpoints
- S3: No public buckets. All access via presigned URLs with expiration.
- VPC: Private subnets for RDS, Lambda in VPC for DB access
- Security groups: Minimum port access, no 0.0.0.0/0 inbound

AUDIT:
- CloudTrail: Enabled on all regions, S3 Object Lock for log integrity
- Application logs: Structured JSON, NO PII, NO financial data
- Every DB read/write of financial data: log user_id, action, timestamp, data scope
- Log retention: 7 years (regulatory)

DELETION CASCADE (must execute in this order):
1. Revoke all Plaid access tokens (POST to Plaid /item/remove)
2. DELETE CASCADE from users table in PostgreSQL (verify row count = 0)
3. Delete all S3 objects under s3://bucket/users/{user_id}/ (list + delete all)
4. Delete all DynamoDB items with user partition key
5. Delete user from Cognito (AdminDeleteUser)
6. Delete Square customer if exists (Square API)
7. Write immutable audit entry to CloudTrail
8. Send deletion confirmation email via Brevo
```

---

## BORROWER APP FEATURES

### Education Engine

**Loan Type Library:**
Complete education on every loan type available to non-W2 workers:

| Loan Type | Description | Docs Required |
|-----------|-------------|---------------|
| Bank Statement (12mo) | Lender uses 12 months of deposits instead of tax returns | 12 months bank statements, self-employment verification |
| Bank Statement (24mo) | Same but 24 months, sometimes better rates | 24 months bank statements, self-employment verification |
| 1099 Income | Uses 1099 forms + bank statements | 1-2 years 1099s, bank statements, higher credit score |
| P&L (Profit & Loss) | CPA-prepared P&L used instead of tax returns | CPA-prepared P&L, business license, bank statements |
| Asset Depletion | Liquid assets divided over loan term = theoretical monthly income | Proof of liquid assets (savings, investments, retirement) |
| DSCR | Investment property, qualified by rental income not personal income | Rental analysis/lease, property appraisal, no personal income docs |
| Conventional | Standard Fannie/Freddie, available if tax returns support it | 2 years tax returns, W-2s/1099s, pay stubs, bank statements |
| FHA | Government-backed, lower down payment | 2 years tax returns, bank statements, self-employment verification |
| VA | Veterans, no down payment | COE, 2 years tax returns, bank statements |
| Auto Loan | Vehicle financing | Income verification, credit check, down payment |
| Business / SBA | Small business loans | Business plan, financials, tax returns, bank statements |
| Construction | Two-phase funding for building | Plans, contractor agreements, financials, down payment |
| Refinance | Replace existing loan with better terms | Current loan docs, income verification, appraisal |

Each loan type page includes: what it is, who it's for, requirements, typical rates (spread above conventional), down payment minimums, credit score thresholds, pros and cons, and "Is this right for me?" guidance.

**Rate Tracker:**
- Pull conventional rates weekly from FRED API (series: MORTGAGE30US, MORTGAGE15US)
- Calculate non-QM rate ranges: conventional + spread by loan type
- Spreads: Bank statement +0.5% to +2.0%, 1099 +0.5% to +1.75%, P&L +1.0% to +2.0%
- Break down by credit score tier: 620-659, 660-699, 700-739, 740+
- Break down by down payment: 5%, 10%, 15%, 20%, 25%+
- Push notifications when rates drop significantly (optional user opt-in)

**Credit Education:**
- How credit scores work (FICO components and weights)
- Which accounts to pay down first for maximum score impact
- How to dispute errors on credit report
- Authorized user tradelines explained
- What NOT to do before applying for a mortgage
- Timeline projections: "If you pay down $X on Card Y, estimated score change: +Z points in W months"
- Credit monitoring integration (future V2)

**Buyer Journey:**
Guided four-stage pathway:
- Stage 1: Discovery -- "I want to buy. What are my options?"
- Stage 2: Preparation -- Credit improvement plan, tax strategy, document gathering
- Stage 3: Ready -- Package complete, scenarios analyzed, know your numbers
- Stage 4: Post-Close -- Refinance monitoring, rate alerts, next purchase

### Document Preparation

**Plaid Integration:**
- Connect bank accounts via Plaid Link (OAuth)
- Pull up to 24 months transaction history
- Identify and categorize all income deposits by source (Uber, DoorDash, Upwork, Etsy, freelance clients, etc.)
- Calculate monthly averages, annual projections, income stability metrics, earning trends
- Flag anomalies (large one-time deposits vs. recurring income)
- Organize into chronological, categorized bank statement summary

**Document Upload:**
- Upload 1099 forms, tax returns, CPA letters, P&L statements, self-employment verification
- Drag and drop, camera capture, file picker
- Document type classification (auto-detect or manual select)
- Preview before adding to package

**Document Package:**
- Combine Plaid-derived data + uploaded documents into one lender-ready package
- Standardized format: cover page, income summary, bank statement analysis, supporting documents
- Checklist: shows what's complete, what's missing
- Shareable: user explicitly chooses when and with whom to share

### AI Scenario Engine (Core Differentiator)

**How it works:**
User inputs their goal ("I want to buy a $600K home"). AI already has their bank deposits, stated income, credit score (self-reported), savings, and assets from Plaid. AI runs every viable loan scenario and presents results ranked by total cost and feasibility.

**Output format (example):**
```
SCENARIO A (Best rate, requires action):
"Improve your credit from 640 to 680 over 4 months. That unlocks a bank
statement loan at 7.0% instead of 7.75%. Monthly savings: $285.
Lifetime savings: $102,600. Here's your credit improvement plan."

SCENARIO B (Available now):
"Bank statement loan at 7.75% with 20% down. Monthly payment: $4,200.
You qualify today with current documents."

SCENARIO C (Tax strategy):
"Show $150K on next year's tax return instead of $80K. Additional tax
cost: ~$17,500. But you qualify for conventional at 6.25%. Monthly
savings: $580 vs Scenario B. Tax investment pays for itself in 30 months."

SCENARIO D (Larger down payment):
"Save additional $30K for 25% down. Some lenders reduce rate by 0.25%
to 0.50% at this threshold."
```

**AI behavior rules:**
- ALWAYS provide multiple paths, never one dead-end answer
- ALWAYS include the math (monthly payment, total interest, trade-off calculations)
- ALWAYS label outputs as "hypothetical" and "for educational purposes"
- ALWAYS suggest consulting a licensed professional
- NEVER claim to approve or deny a loan
- NEVER store any user data (zero retention, process in memory only)
- NEVER provide specific lender names as recommendations (general categories only until licensing allows)
- Personality: hardworking, creative, resourceful, on the consumer's side

**Blank Template Calculator:**
In addition to AI scenarios, provide a blank calculator where users plug in their own numbers:
- Property price, down payment (% or $), loan term, interest rate, credit score
- Auto-populate: estimated property taxes (by zip code from public data), estimated insurance, PMI if applicable
- Multiple loan type toggles: conventional, bank statement, 1099, P&L, FHA
- Each toggle adjusts rate range and requirements automatically
- "What if" sliders: adjust income shown, down payment, credit score, see real-time payment changes
- Accuracy target: within 1-2% of actual lender quotes (Bankrate/NerdWallet benchmark)

### Beyond Mortgages

Apply the same education + calculator + scenario model to:
- **Auto Loans:** Rate comparison, dealer vs. credit union guidance, pre-approval strategy
- **Refinancing:** When to refi, break-even calculator, rate monitoring alerts
- **Construction Loans:** Two-phase process education, draw schedules, builder requirements
- **Business Loans / SBA:** Documentation maze navigation, SBA 7(a) vs. 504 vs. microloans
- **Car Loans:** Avoid dealer markups, credit union pre-approval, trade-in strategy

---

## LENDER PORTAL FEATURES

**Dashboard:**
- View incoming borrower document packages (only those explicitly shared by borrowers)
- Search/filter by income range, loan type, credit score range, location
- Download standardized PDF reports
- Contact borrower (via in-app messaging only, no direct contact info exposed without consent)

**Subscription Tiers:**

| Tier | Price | Reports | Per Additional | Features |
|------|-------|---------|----------------|----------|
| Pay As You Go | $0/mo | 0 included | $25/report | Basic search |
| Starter | $99/mo | 25 included | $15/report | 10 contacts/mo, basic analytics, email support |
| Professional | $199/mo | 100 included | $10/report | 50 contacts/mo, advanced analytics, priority support |
| Enterprise | $499/mo | 500 included | $5/report | Unlimited contacts, API access, custom integrations, dedicated AM |

**API (Enterprise tier):**
- REST API for integration with existing Loan Origination Systems (LOS)
- Webhook notifications for new shared packages
- Batch document retrieval
- Standardized JSON + PDF output format

---

## BORROWER PRICING (TBD -- Finalize before launch)

Considerations:
- Free tier: Education only (rate tracker, loan guides, credit education, blog content)
- Paid tier: Document preparation, AI scenario engine, full calculators, Plaid integration
- Price range: $14.99 to $24.99/month (value significantly exceeds original $19.99 model)
- Annual discount option
- Free trial: 7 days of full access

---

## DATABASE SCHEMA (Core Tables)

See repo `infrastructure` and migration files for full DDL. Core: users, plaid_items, bank_accounts, transactions, income_summaries, documents, document_packages, package_shares, scenarios, lenders, audit_log. RLS on every user-facing table.

---

## API ENDPOINTS

```
AUTH: POST /auth/register, /auth/login, /auth/refresh, /auth/forgot-password, DELETE /auth/account
PLAID: POST /plaid/create-link-token, /plaid/exchange-token, GET /plaid/accounts, POST /plaid/sync-transactions, DELETE /plaid/item/:itemId
INCOME: GET /income/summary, POST /income/calculate
DOCUMENTS: POST /documents/upload, GET /documents, GET/DELETE /documents/:id
PACKAGES: CRUD + POST /packages/:id/share, POST /packages/:id/revoke/:shareId
SCENARIOS: POST /scenarios/analyze, GET /scenarios, GET /scenarios/:id
CALCULATOR: POST /calculator/mortgage, /calculator/auto, /calculator/affordability, GET /calculator/rates
LENDER PORTAL: GET /lender/packages, /lender/packages/:id, /lender/analytics, POST /lender/contact/:userId
```

---

## COMPLIANCE REQUIREMENTS

| Regulation | Status | Notes |
|-----------|--------|-------|
| GLBA Privacy Rule | Required | Privacy notice, NPI handling |
| GLBA Safeguards Rule | Required | Written security program, risk assessment, vendor oversight |
| CCPA/CPRA | Required | California residents. All rights supported. Deletion exceeds requirements. |
| FCRA | NOT applicable | We do not generate consumer reports |
| ECOA / Fair Lending | NOT applicable | We do not make credit/lending decisions |
| RESPA | NOT applicable | We do not broker, originate, or service loans |
| SAFE Act / NMLS | NOT applicable (V1) | No lead gen, no compensated referrals. May apply if Phase 4 adds lender matching |
| State Breach Laws | Required | 72-hour user notification, regulatory notification as required |
| SOC 2 Type II | Readiness target | Architecture designed for it, formal audit when revenue supports |

---

## LEGAL DISCLAIMERS (Required in-app, on every relevant screen)

**On all calculator/scenario outputs:**
"These are estimated scenarios based on current average rates and general lending guidelines. For educational purposes only. Actual rates and terms depend on the lender and your financial situation. Consult a licensed mortgage professional before making financial decisions."

**In-app footer / About screen:**
"1099Pass is an educational and document preparation platform operated by SLTR Digital LLC. We are not a lender, broker, or financial advisor. We do not originate, underwrite, or guarantee loans. All lending decisions are made by the lender."

**On AI outputs:**
"This analysis was generated by AI for educational purposes. It may contain errors. Verify all information with a licensed professional."

---

## DEV STANDARDS (Non-negotiable)

- Senior SWE level -- clean code, reliability, accountability
- Security-first -- always check DB before SQL operations
- No quick fixes -- root cause fixes only
- Award-winning UI/UX -- built to scale to millions
- TypeScript strict mode everywhere
- Zod validation on all inputs
- Error handling on every async operation
- Loading states on every data fetch
- RLS on every table with user data
- NO em dashes anywhere (Kevin's rule) -- use commas, semicolons, or periods instead
- NO local storage of any user data
- NO PII in logs
- NO hardcoded secrets
- NO public S3 buckets
- ALWAYS encrypt Plaid tokens before DB write
- ALWAYS verify user ownership before any data operation
- DELETE means DELETE -- hard delete, not soft delete, not archive

---

## FILE STRUCTURE

See repo root. Key: `packages/shared`, `apps/borrower-app`, `apps/lender-portal`, `infrastructure/`, `packages/api` (handlers).

---

## BUILD PRIORITY ORDER

1. Fix existing infrastructure issues (crypto import, API handler verification)
2. Borrower app: Auth flow (Cognito) + onboarding
3. Plaid integration: Link, token exchange, transaction sync, income calculation
4. Education engine: Loan type library, rate tracker (FRED API), credit education
5. Document preparation: Upload, organize, package builder, checklist
6. AI scenario engine: GPT-4 integration, multi-scenario output, calculator
7. Calculator suite: Mortgage, auto, affordability, "what if" sliders
8. Lender portal: Auth, dashboard, package viewer, subscription/billing (Square)
9. Deletion cascade: Full implementation and testing
10. Legal pages: Terms, Privacy Policy, in-app disclaimers
11. Landing page: Deploy to 1099pass.com
12. App Store / Google Play submission

---

## SAFETY & SECURITY REMINDERS

- NEVER read, display, or log .env file contents
- NEVER commit secrets to git
- NEVER store sensitive data in local storage or AsyncStorage
- NEVER store user data in AI (zero retention)
- NEVER log PII or financial data
- ALWAYS check database state before destructive SQL operations
- ALWAYS use RLS policies on all tables with user data
- ALWAYS encrypt Plaid tokens with KMS before database write
- ALWAYS use presigned S3 URLs (never public URLs) for document access
- ALWAYS verify user_id matches authenticated user before any data operation
- ALWAYS use parameterized queries (never string concatenation for SQL)
- DELETE means DELETE -- complete, permanent, irreversible
- Account deletion must trigger the full 8-step cascade
- When in doubt, err on the side of more security, not less
