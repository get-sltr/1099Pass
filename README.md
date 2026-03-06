# 1099Pass

**The income verification layer for the gig economy.**

1099Pass turns messy, variable gig income into standardized, lender-ready reports — so the 60M+ Americans earning 1099 income can finally get approved for mortgages, auto loans, and credit.

**[1099pass.com](https://1099pass.com)** | SLTR Digital LLC | Founded by Kevin Minn

---

## The Problem

The lending industry was built for W-2 workers. If you have an employer, a pay stub, and two years at the same job, getting a mortgage is straightforward. But if you drive for Uber, freelance on Upwork, and sell on Etsy — earning $85K/year across three platforms — you look like a risk on paper.

**60 million Americans** now earn all or part of their income as independent contractors, gig workers, or freelancers. That number grows every year. Yet the financial system treats them as second-class borrowers:

- **Mortgage denial rates for self-employed borrowers are 40% higher** than W-2 workers at the same income level
- Lenders require 2 years of tax returns, profit & loss statements, and bank statement reviews — a process that takes weeks and still produces inconsistent results
- Many gig workers simply don't apply, leaving a massive underserved market

The problem isn't that gig workers can't afford loans. It's that **no one has built the translation layer** between how they earn and how lenders verify income.

---

## The Solution

1099Pass is a two-sided data intelligence platform:

**For borrowers (mobile app):** Connect your bank accounts. We pull 24 months of transaction history via Plaid, automatically identify your gig income sources, normalize the data, and generate a standardized Income Verification Report with a proprietary Loan Readiness Score. You share this report with lenders in one tap.

**For lenders (web portal):** Access pre-verified, standardized income reports for gig workers. Set your lending criteria. Get matched with qualified borrowers whose income has already been analyzed, categorized, and scored — eliminating weeks of manual verification.

**The core product is the report.** Everything else exists to make it more accurate, comprehensive, and trustworthy.

---

## How It Works

```
Borrower connects bank accounts via Plaid
              ↓
24 months of transactions pulled automatically
              ↓
Income Normalization Engine identifies and categorizes gig income
   • Uber, DoorDash, Upwork, Etsy — 18 platforms recognized
   • Anomaly detection, seasonality analysis
   • Recurring obligation detection for DTI
              ↓
4 projection methods calculate annualized income
   • Trailing average
   • Weighted moving average (recent months weighted higher)
   • Seasonal-adjusted projection
   • Trend-adjusted projection
              ↓
Loan Readiness Score generated (0-100)
   • 6 weighted components
   • Letter grade (A+ through F)
   • Actionable recommendations to improve
              ↓
Lender-ready PDF + JSON report generated
   • Income overview with confidence intervals
   • Per-platform breakdown
   • 24-month history
   • Stability metrics
   • DTI estimate
   • Legal disclaimers
              ↓
Borrower shares report → Lender reviews → Loan conversation starts
```

---

## Core IP

### Income Normalization Engine

The engine transforms raw bank transaction data into standardized income analysis. This is the hard part — gig income is messy, variable, comes from multiple sources, and looks different for every worker.

**What it does:**
- Ingests 24 months of Plaid transaction history
- Auto-identifies 18 gig platforms from merchant names and transaction patterns
- Builds month-by-month income history with anomaly flagging (>2 standard deviations)
- Calculates stability metrics: coefficient of variation, Herfindahl-Hirschman Index for income diversity, seasonality index, year-over-year growth
- Produces 4 independent annualized projections, then blends them with confidence intervals
- Detects recurring obligations (rent, loan payments, subscriptions) for debt-to-income analysis
- All monetary calculations use integer arithmetic (cents) to avoid floating-point errors

### Loan Readiness Score

A proprietary 0-100 score that quantifies how "lender-ready" a borrower's income documentation is. This is NOT a credit score — it measures income verification completeness and consistency.

| Component | Weight | What It Measures |
|-----------|--------|-----------------|
| Income Stability | 25% | Month-to-month consistency (coefficient of variation) |
| Income Trend | 20% | Year-over-year growth direction |
| Income Diversity | 15% | Number and balance of active income sources |
| Documentation | 15% | Tax returns, 1099 forms, bank statements uploaded |
| Income Level | 15% | Annual income tier with DTI adjustment |
| Account Age | 10% | Months of verified transaction history |

Each component produces a raw score, improvement tips, and specific factors. The system generates the top 5 actionable recommendations ranked by potential score increase and estimated timeframe.

**Loan type qualification thresholds:**

| Loan Type | Recommended Score | Minimum Score |
|-----------|------------------|---------------|
| Mortgage | 75 | 60 |
| Auto | 55 | 40 |
| Personal | 50 | 35 |
| Business | 65 | 50 |
| HELOC | 70 | 55 |

### Report Generator

Produces institutional-grade PDF and JSON reports with 10 sections:

1. **Header** — Report ID, generation date, 90-day expiry, verification badge
2. **Borrower Summary** — Name, location (city/state only), account age, verification status
3. **Income Overview** — Projected annual income, confidence intervals, active sources, trajectory
4. **Income Source Breakdown** — Per-platform details (up to 6), monthly averages, annual totals, verification status
5. **24-Month Income History** — Month-by-month with source-level breakdown
6. **Stability Metrics** — CoV, diversity score, seasonality notes, YoY comparison
7. **Loan Readiness Score** — Score, letter grade, component breakdown with explanations
8. **DTI Estimate** — Based on detected recurring obligations (with appropriate caveats)
9. **Document Verification Status** — Supporting documents with upload timestamps
10. **Legal Disclaimer** — Facilitation model disclaimer, FCRA language

Reports are encrypted at rest (AES-256 via AWS KMS), shared via secure tokens with 30-day expiry, and PDF downloads use presigned URLs with 1-hour expiry.

---

## Market

**Total addressable market:**
- 60M+ Americans earn 1099/gig income (Bureau of Labor Statistics, 2024)
- Projected to reach 90M by 2028 (Mastercard/Kaiser study)
- $4.5T US mortgage market, $1.5T auto loan market
- Average mortgage origination fee: $4,000-6,000

**Serviceable market:**
- ~15M gig workers actively seeking credit (mortgages, auto, personal loans)
- ~50,000 mortgage lending institutions in the US
- Non-QM lending (non-traditional income verification) is the fastest-growing mortgage segment

**Why now:**
- Gig economy crossed the tipping point — it's no longer a side hustle, it's primary income for millions
- Plaid and open banking made real-time income verification technically feasible
- Lenders are actively building non-traditional income programs but lack standardized data tools
- Post-2020 remote work boom created millions more independent workers
- No dominant player has captured this space yet

---

## Business Model

### Borrowers (Mobile — iOS & Android)

| Tier | Price | What They Get |
|------|-------|--------------|
| **Free** | $0/mo | 1 report/month, basic score, 2 income sources, 1GB document storage |
| **Plus** | $9.99/mo | 5 reports/month, full score breakdown, priority lender matching, unlimited sources |
| **Pro** | $24.99/mo | Unlimited reports, premium recommendations, direct lender introductions, dedicated support |

Borrower payments via App Store / Google Play (IAP only — no server-side payment processing in mobile).

### Lenders (Web Portal)

| Tier | Price | What They Get |
|------|-------|--------------|
| **Starter** | $99/mo | 50 reports/month, basic matching, lead dashboard |
| **Professional** | $299/mo | 500 reports/month, advanced matching, custom criteria, API access |
| **Enterprise** | $999/mo | Unlimited reports, AI-powered matching, custom integrations, SLA guarantees |

Lender payments via Square (web only).

**Payment flow:** Borrower app → StoreKit (iOS) / Google Play Billing (Android). Lender website → Square.

**Unit economics at scale:**
- Borrower CAC: ~$15-25 (targeted social/search ads to gig workers seeking loans)
- Borrower LTV: ~$120-300 (average 12-month retention at $9.99-24.99/mo)
- Lender CAC: ~$200-500 (direct sales, mortgage industry conferences)
- Lender LTV: ~$3,600-12,000 (annual contracts at $299-999/mo)
- Plaid cost per borrower: ~$1-3/month
- AWS infrastructure: ~$500-2,000/month at 10K borrowers

---

## Architecture

```
                    ┌─────────────┐     ┌──────────────┐
                    │ Borrower App│     │ Lender Portal│
                    │ React Native│     │   Next.js 14 │
                    │  Expo SDK 54│     │Tailwind+shadcn│
                    └──────┬──────┘     └──────┬───────┘
                           │                    │
                           └────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │   API Gateway + WAF + Cognito  │
                    │  Rate limiting, OWASP, SQLi    │
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
    ┌────┴─────┐          ┌────────┴────────┐          ┌─────┴──────┐
    │   Auth   │          │  Core Services  │          │  Matching  │
    │ Handlers │          │  (Lambda/Node)  │          │  & Comms   │
    └──────────┘          │                 │          └────────────┘
                          │ • Income Engine │
                          │ • Score Engine  │
                          │ • Report Gen    │
                          │ • Plaid Service │
                          │ • AI Services   │
                          └────────┬────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
    ┌────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐
    │ RDS       │          │  DynamoDB   │          │     S3      │
    │ Postgres  │          │ Sessions    │          │ Documents   │
    │ 15        │          │ WebSocket   │          │ Reports     │
    │ (11 tables)│         │ Notifications│         │ (KMS enc)   │
    └───────────┘          └─────────────┘          └─────────────┘
         │
    ┌────┴──────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
    │  AWS KMS  │    │  Plaid   │    │  Square  │    │ Bedrock  │    │   SES   │
    │(encryption)│   │(bank data)│   │(lender $) │    │(Claude AI)│   │(email)  │
    └───────────┘    └──────────┘    └───────────┘    └──────────┘    └─────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Borrower App** | React Native + Expo SDK 54, TypeScript |
| **Lender Portal** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | AWS Lambda (Node.js 20.x), API Gateway |
| **Database** | Amazon RDS PostgreSQL 15, DynamoDB |
| **Auth** | AWS Cognito (MFA, OAuth 2.0, RBAC) |
| **Financial Data** | Plaid (Transactions, Auth, Identity, Balance) — production keys live |
| **Payments** | Square (lenders, web) + IAP (borrowers, mobile). Borrower app: StoreKit / Google Play. Lender website: Square. |
| **AI** | AWS Bedrock + Claude (income narratives, document intelligence, smart matching) |
| **Email** | AWS SES (transactional only: verification, password reset, deletion confirmation) |
| **Encryption** | AWS KMS (AES-256 at rest), TLS 1.3 in transit |
| **Storage** | Amazon S3 (encrypted buckets for documents + reports) |
| **Infrastructure** | AWS CDK (TypeScript), 9 stacks |
| **Security** | WAF (OWASP, SQLi, XSS, rate limiting), VPC with private subnets |
| **Monitoring** | CloudWatch, X-Ray, CloudTrail |
| **CI/CD** | GitHub, CodeBuild, CDK Deploy |

**Infrastructure is 100% AWS.** Compute (Lambda), API (API Gateway), database (RDS, DynamoDB), storage (S3), auth (Cognito), AI (Bedrock), and transactional email (SES) all run on AWS. The lender portal is served from S3 + CloudFront. External services used by the platform (not hosted by us): Plaid (bank data), Square (lender payments), Apple/Google (in-app purchases), Expo (mobile builds). Domain DNS is at Porkbun; traffic is served by CloudFront.

### Database Schema (11 tables)

| Table | Purpose |
|-------|---------|
| `borrowers` | Profiles, KYC status, subscription tier, Cognito identity |
| `financial_profiles` | Normalized income data, readiness score, trends, sources (JSONB) |
| `documents` | Tax returns, 1099 forms, bank statements, P&L uploads |
| `reports` | Generated verification reports (status, data snapshot, S3 keys, share tokens) |
| `lenders` | Institution profiles, plan tier, verification, contact info |
| `lending_criteria` | Preferences: loan types, income thresholds, geography, platforms |
| `matches` | Borrower-lender matches with score and status pipeline |
| `messages` | Encrypted in-app messaging |
| `subscriptions` | Billing state for borrowers and lenders |
| `notifications` | Push notification records |
| `audit_logs` | Full compliance audit trail |

---

## AI Integration (AWS Bedrock + Claude)

AI enhances every layer of the platform — not as a gimmick, but solving real data quality and user experience problems.

| Feature | Model | What It Solves |
|---------|-------|---------------|
| **Income Narrative** | Claude Sonnet | Translates raw metrics into underwriting-friendly language for PDF reports |
| **Transaction Classification** | Claude Haiku | Catches gig income that Plaid miscategorizes — especially from lesser-known platforms and direct deposits |
| **Borrower Coach** | Claude Sonnet | In-app chat helping users understand their score and get personalized improvement advice |
| **Document Intelligence** | Claude Haiku (vision) | Extracts data from uploaded 1099 forms, tax returns, and bank statements to auto-populate profiles |
| **Smart Lender Matching** | Claude Sonnet | Re-ranks lender matches beyond rigid criteria, understanding nuanced borrower-lender fit |

All AI processing stays within AWS (Bedrock) — no financial data leaves our infrastructure. PII is redacted before any AI prompt. Estimated cost at 1,000 borrowers: ~$20-50/month.

---

## Competitive Landscape

| Company | What They Do | Gap |
|---------|-------------|-----|
| **LendingTree** | Loan marketplace / lead gen | Doesn't solve income verification |
| **Credit Karma** | Credit monitoring + loan ads | Focused on credit scores, not income normalization |
| **Steady** | Income tracking for gig workers | Tracks income but doesn't create lender-ready reports |
| **Wingspan** | 1099 contractor payments & compliance | Employer-side tool, not borrower empowerment |
| **Rocket Mortgage** | Online mortgage lender | Traditional income models — gig workers still get denied |
| **Hurdlr / Stride** | Tax tracking for freelancers | Tax-focused, no lending connection |

**Nobody generates lender-ready income verification reports specifically designed to translate gig/1099 income into a format that gets loans approved.** The report is the product. The report is the moat.

---

## Regulatory Position

1099Pass is a **data intelligence platform** — not a lender, broker, or financial advisor.

We do not originate, underwrite, fund, or guarantee any loans. We do not hold, process, or manage any funds. We do not negotiate loan terms or act as an intermediary in any loan transaction.

| Regulation | Applies? | Notes |
|------------|----------|-------|
| NMLS Licensing | No | Not brokering or originating loans |
| State Broker Licenses | No | Not negotiating terms |
| RESPA | No / Low Risk | Subscription fees, not per-closing referral fees |
| TILA | No | Not a creditor or lender |
| PCI DSS | No | Square handles all card data |
| Fair Lending / ECOA | Partial | Scoring algorithms must not discriminate |
| GLBA | Yes | Handling consumer financial data |
| CCPA / State Privacy | Yes | Collecting personal and financial data |
| FCRA | Under Review | Legal opinion in progress for report usage in credit decisions |

**Pre-launch legal costs: ~$2,500-6,000** (Terms of Service, Privacy Policy, FCRA opinion, E&O insurance).

This clean regulatory position means we can launch fast without licensing delays that slow down fintech companies handling actual money movement.

---

## What's Built

### Completed
- Monorepo architecture with npm workspaces
- Full AWS CDK infrastructure (9 stacks: VPC, RDS, S3, Cognito, Lambda, API Gateway, WAF, monitoring, CI/CD)
- PostgreSQL database with 11 tables and migrations
- Income Normalization Engine with 4 projection methods, anomaly detection, seasonality analysis
- Loan Readiness Score algorithm (6 weighted components, letter grades, recommendations)
- Report Generator (JSON + PDF with 10 sections)
- Plaid integration (production keys live, 18 gig platforms identified)
- Borrower React Native app (Expo SDK 54, component library, navigation, **dual theme: Paper & Ink / Midnight Ember** with toggle in Settings)
- Lender Next.js portal (dashboard, reports, analytics, criteria, messaging, settings, **Terms of Service & Privacy Policy** [March 2026, SLTR Digital LLC], legal pages)
- **Blog** (SEO-focused, at `/blog`; gig worker / 1099 mortgage & loan guides; sitemap, robots, JSON-LD; optional Google Analytics via `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- Shared TypeScript types with Zod validation across entire stack
- Square integration for lender payments
- Lender portal deployed live at [1099pass.com](https://1099pass.com) via S3 + CloudFront (deploy with `./scripts/deploy-lender-portal.sh`)

### Documentation

| Doc | Purpose |
|-----|---------|
| [docs/1099PASS-BUILD.md](docs/1099PASS-BUILD.md) | Full project context: brand, tech stack, security, features, build order, dev standards |
| [docs/DEPLOY-LENDER-PORTAL.md](docs/DEPLOY-LENDER-PORTAL.md) | Deploy lender portal to S3 + CloudFront, env vars, CI/CD |
| [docs/PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md) | Production checklist: infra, API, portal, app, security, monitoring |
| [docs/TEST-ACCOUNTS.md](docs/TEST-ACCOUNTS.md) | Test accounts and access |
| [docs/PHASE-1-2-3-STATUS.md](docs/PHASE-1-2-3-STATUS.md) | Phase 1–3 status and commands |
| [docs/DNS-SETUP.md](docs/DNS-SETUP.md) | DNS and domain (1099pass.com) |

### In Progress
- End-to-end wiring (Plaid Link flow through report generation to lender viewing)
- AI layer (Bedrock + Claude integration for all 5 features)
- App Store / Google Play submission prep

---

## Design System

**Borrower app (mobile):** Dual theme — **Paper & Ink** (day: cream `#FAF9F6`, accent `#FF6B00`) and **Midnight Ember** (night: dark `#050505`, accent `#FF8C33`). Toggle in Settings → Appearance. Same liquid-glass DNA; editorial and trustworthy by day, premium and bold by night.

**Lender portal (web):** Dark mode, data-dense, professional (Bloomberg-inspired).

**Shared:** Typography: Inter (UI) + JetBrains Mono (financial data). Grid: 8px spacing, 44pt minimum touch targets (Apple HIG). Components: glass-style surfaces, subtle depth, 300ms transitions.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- AWS CLI configured (account 335741630084, us-east-1)
- Xcode (for iOS simulator)

### Development

```bash
# Clone and install
cd ~/Desktop/1099Pass/1099Pass
npm install

# Lender Portal (browser)
cd apps/lender-portal && npm run dev
# → http://localhost:3000

# Borrower App (simulator)
cd apps/borrower-app && npx expo start
# Press 'i' for iOS simulator

# Type check entire monorepo
npx tsc --noEmit

# Deploy to dev
./scripts/deploy.sh dev
```

### Deploy Lender Portal (Production — S3 + CloudFront)

The lender portal is served **statically from S3** with CloudFront. You must build with **static export** and sync the output to the portal bucket.

**One-command deploy (recommended):**

```bash
# From repo root — builds with BUILD_FOR_S3, syncs to S3, invalidates CloudFront
./scripts/deploy-lender-portal.sh
```

For a different environment (e.g. dev):

```bash
./scripts/deploy-lender-portal.sh dev
```

**Manual steps (if you prefer):**

```bash
cd apps/lender-portal
BUILD_FOR_S3=true npm run build
# Output is in apps/lender-portal/out/
aws s3 sync out/ s3://pass1099-prod-lender-portal --delete
aws cloudfront create-invalidation --distribution-id E2L2IO6SQNRKCZ --paths "/*"
```

- **Blog:** The portal includes a Blog at `/blog` (SEO-focused content for gig workers, 1099 income, mortgages). Nav and footer link to it; mobile menu includes Blog.
- **Google Analytics:** Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (e.g. `G-XXXXXXXXXX`) in the lender portal env when building to enable GA4 on all pages including the blog.
- See **[docs/DEPLOY-LENDER-PORTAL.md](docs/DEPLOY-LENDER-PORTAL.md)** for full details, env vars, and CI/CD notes.

---

## Security

- All sensitive data encrypted at rest with AWS KMS (AES-256)
- All traffic encrypted in transit (TLS 1.3)
- Plaid access tokens encrypted before database storage
- WAF with OWASP Top 10, SQL injection, XSS, and rate limiting (1,000 req/5min per IP)
- VPC with private subnets for all data resources
- Cognito authentication with MFA support
- Row-level security on PostgreSQL tables
- Full audit logging via CloudTrail and application audit_logs table
- PII never written to application logs
- Zero-trust architecture with least-privilege IAM roles
- Request body size limited to 8KB (WAF enforced)
- SOC 2 Type II readiness path in place

---

## Why This Wins

1. **The problem is massive and growing.** 60M gig workers today, 90M by 2028. Every one of them will eventually need a loan.

2. **The timing is perfect.** Open banking (Plaid) made real-time income verification possible. Lenders are actively building non-traditional income programs. Nobody owns the data layer yet.

3. **The moat deepens with scale.** More borrowers = better income normalization algorithms. More lender criteria data = smarter matching. Network effects on both sides.

4. **Clean regulatory position.** We're a data platform, not a financial services company. No NMLS licensing, no state broker licenses, no RESPA risk. We can launch in all 50 states from day one.

5. **AI makes the product dramatically better.** Not AI for the sake of AI — Claude understands financial documents, writes underwriting narratives, and catches income that keyword matching misses. This directly improves approval rates.

6. **Both sides pay.** Borrowers pay for better reports and scores. Lenders pay for access to verified, qualified borrowers. No dependency on a single revenue stream.

---

## License

Proprietary — SLTR Digital LLC. All Rights Reserved.

## Contact

Kevin Minn — Founder, SLTR Digital LLC
[1099pass.com](https://1099pass.com) | support@1099pass.com
