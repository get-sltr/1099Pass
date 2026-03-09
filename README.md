# 1099Pass

**Built for the income they won't count.**

1099Pass is a financial intelligence platform for non-W2 workers (gig workers, freelancers, independent contractors, self-employed, commission-based, small business owners). It combines education, AI-powered document preparation, and a professional-side CRM into one product that bridges the gap between 70+ million gig workers and the financial products that already exist for them.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How It Works](#how-it-works)
- [Core IP](#core-ip)
  - [Income Normalization Engine](#income-normalization-engine)
  - [Loan Readiness Score](#loan-readiness-score)
  - [AI Scenario Engine](#ai-scenario-engine)
  - [Report Generator](#report-generator)
- [Platform Overview](#platform-overview)
  - [Borrower App (Mobile)](#borrower-app-mobile)
  - [Professional Portal (Desktop)](#professional-portal-desktop)
- [Borrower Features](#borrower-features)
  - [Education Engine](#education-engine)
  - [Document Preparation](#document-preparation)
  - [AI Scenario Analysis](#ai-scenario-analysis)
  - [Calculator Suite](#calculator-suite)
  - [Buyer Categories](#buyer-categories)
- [Professional Portal Features](#professional-portal-features)
  - [Role-Based Onboarding](#role-based-onboarding)
  - [Lender Dashboard](#lender-dashboard)
  - [Real Estate Agent Dashboard](#real-estate-agent-dashboard)
  - [Car Sales Professional Dashboard](#car-sales-professional-dashboard)
  - [Rate Center](#rate-center)
  - [Professional Education](#professional-education)
- [Market](#market)
  - [Market Size](#market-size)
  - [Target Users](#target-users)
- [Business Model](#business-model)
  - [Borrower Pricing](#borrower-pricing)
  - [Professional Pricing](#professional-pricing)
  - [Revenue Projections](#revenue-projections)
- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
  - [Database Schema](#database-schema)
  - [API Endpoints](#api-endpoints)
  - [AI Integration](#ai-integration)
  - [Infrastructure](#infrastructure)
- [Security Architecture](#security-architecture)
  - [Five Core Principles](#five-core-principles)
  - [Encryption](#encryption)
  - [Access Controls](#access-controls)
  - [Deletion Cascade](#deletion-cascade)
  - [Audit and Compliance](#audit-and-compliance)
- [Competitive Landscape](#competitive-landscape)
- [Regulatory Position](#regulatory-position)
- [What 1099Pass Is Not](#what-1099pass-is-not)
- [What's Built](#whats-built)
  - [Completed](#completed)
  - [In Progress](#in-progress)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Dev Standards](#dev-standards)

---

## The Problem

Over 70 million Americans earn income through gig work, freelancing, and independent contracting. When they try to make a major purchase, they face a completely different set of rules than W-2 workers.

A W-2 employee shows up with a pay stub and two tax returns. A gig worker might need 2 to 5 years of tax returns, 12 to 24 months of bank statements, CPA verification letters, profit and loss statements, and proof of ongoing self-employment. The requirements change by lender, by loan type, and by state.

Most gig workers don't even know what's required before they start. Many give up before they ever talk to a lender. The ones who do often don't know that alternative loan products exist, products specifically designed for non-traditional income that could get them approved.

The financial system has adapted to the gig economy on the lending side with non-QM products, bank statement loans, and flexible underwriting. The borrower-side tools have not caught up. Nobody is preparing these borrowers for a process that has a completely different set of rules.

This problem is not limited to mortgages. The same friction exists for car purchases, business loans, SBA loans, construction loans, and refinancing. Every major financial decision a gig worker makes runs into the same wall.

---

## The Solution

1099Pass is the bridge between gig workers and the financial products that already exist for them. It operates on three layers:

**Layer 1: Education.** Teach gig workers what loan types exist, what they qualify for, what documentation they need, and how to improve their position before applying.

**Layer 2: Preparation.** Connect their bank accounts via Plaid, organize their income data, prepare lender-ready document packages, and run AI-powered scenarios that map every viable path to approval.

**Layer 3: Connection.** Deliver those pre-verified packages to professionals (lenders, real estate agents, car sales professionals) through a CRM-style desktop portal. The borrower shows up prepared. The professional receives organized data. The process moves faster for everyone.

---

## How It Works

**For Borrowers (Mobile App):**

1. Sign up and complete onboarding questions (employment type, financial goal, timeline)
2. Get routed to the right experience based on goal: buying a home, buying a car, or obtaining a major loan
3. Access the Education Engine to learn about loan types, rate environments, and credit optimization
4. Connect bank accounts via Plaid to pull up to 24 months of transaction history
5. Upload supporting documents (1099s, tax returns, CPA letters, P&L statements)
6. Run AI Scenario Analysis to see every viable path to approval with real numbers
7. Generate a lender-ready document package
8. Share the package with a professional on the platform

**For Professionals (Desktop Portal at 1099pass.com):**

1. Sign up and select professional type: Lender, Real Estate Agent, or Car Sales Professional
2. Provide license verification (NMLS number, state license, or dealer license)
3. Access a role-specific CRM dashboard with pipeline management
4. Receive pre-verified borrower document packages
5. Track leads through industry-standard pipeline stages
6. Access Rate Center for current rate data relevant to their role
7. Access Education section for role-specific professional development

---

## Core IP

### Income Normalization Engine

Processes up to 24 months of bank transactions pulled through Plaid. Identifies deposits from 18+ gig platforms (Uber, Lyft, DoorDash, Instacart, Upwork, Fiverr, Etsy, Amazon Flex, Grubhub, Postmates, TaskRabbit, Shipt, Rover, Turo, Airbnb, Freelancer, Toptal, and direct client payments). Calculates monthly averages, annual projections, income stability metrics, earning trends, and source diversification. Flags anomalies like large one-time deposits vs recurring income. Produces four independent income projection methods.

### Loan Readiness Score

Six weighted components producing a letter grade (A through F) with actionable recommendations. Components include income stability and consistency, documentation completeness, credit positioning (self-reported in V1), savings and reserves, debt-to-income estimation, and time in current employment/gig status. Each component includes specific steps to improve the score.

### AI Scenario Engine

User inputs their goal (purchase price, down payment, timeline). The AI already has their bank deposits, stated income, credit score, savings, and assets from Plaid. It runs every viable loan scenario and presents results ranked by total cost and feasibility.

Example output:

```
SCENARIO A (Best rate, requires action):
"Improve your credit from 640 to 680 over 4 months. That unlocks a
bank statement loan at 7.0% instead of 7.75%. Monthly savings: $285.
Lifetime savings: $102,600. Here is your credit improvement plan."

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

AI behavior rules:
- ALWAYS provide multiple paths, never one dead-end answer
- ALWAYS include the math (monthly payment, total interest, trade-off calculations)
- ALWAYS label outputs as hypothetical and for educational purposes
- ALWAYS suggest consulting a licensed professional
- NEVER claim to approve or deny a loan
- NEVER store any user data (zero retention, process in memory only)
- NEVER provide specific lender names as recommendations

### Report Generator

Produces lender-ready output in both PDF and JSON formats. Ten sections: cover page, borrower profile summary, income analysis (by source, by month, annual projections), bank statement summary, income stability assessment, Loan Readiness Score breakdown, documentation checklist, scenario analysis results, supporting document index, and legal disclaimers. Standardized format that any lender can review without reformatting.

---

## Platform Overview

### Borrower App (Mobile)

React Native with Expo, targeting iOS and Android. Three buyer categories served through one app with role-based UI routing after onboarding.

### Professional Portal (Desktop)

Next.js web application at 1099pass.com. Three professional types share one portal with role-based dashboards. Login requires professional verification (license number).

---

## Borrower Features

### Education Engine

**Loan Type Library:**

Complete education on every loan type available to non-W2 workers:

| Loan Type | Description | Key Requirements |
|-----------|-------------|-----------------|
| Bank Statement (12mo) | Lender uses 12 months of deposits instead of tax returns | 12 months bank statements, self-employment verification |
| Bank Statement (24mo) | 24 months of deposits, sometimes better rates | 24 months bank statements, self-employment verification |
| 1099 Income | Uses 1099 forms plus bank statements | 1-2 years 1099s, bank statements, higher credit score |
| P&L (Profit and Loss) | CPA-prepared P&L used instead of tax returns | CPA-prepared P&L, business license, bank statements |
| Asset Depletion | Liquid assets divided over loan term equals theoretical monthly income | Proof of liquid assets (savings, investments, retirement) |
| DSCR | Investment property, qualified by rental income not personal income | Rental analysis/lease, property appraisal, no personal income docs |
| Conventional | Standard Fannie/Freddie, available if tax returns support it | 2 years tax returns, W-2s/1099s, pay stubs, bank statements |
| FHA | Government-backed, lower down payment | 2 years tax returns, bank statements, self-employment verification |
| VA | Veterans, no down payment | COE, 2 years tax returns, bank statements |
| USDA | Rural area loans, zero down payment | Income limits, property location, 2 years tax returns |
| Auto Loan | Vehicle financing for self-employed buyers | Income verification, credit check, down payment |
| Business / SBA | Small business loans (7a, 504, microloans) | Business plan, financials, tax returns, bank statements |
| Construction | Two-phase funding for building | Plans, contractor agreements, financials, down payment |
| Refinance | Replace existing loan with better terms | Current loan docs, income verification, appraisal |

Each loan type page includes: what it is, who it is for, requirements, typical rates (spread above conventional), down payment minimums, credit score thresholds, pros and cons, and "Is this right for me?" guidance.

**Rate Tracker:**

- Conventional rates from FRED API (series: MORTGAGE30US, MORTGAGE15US)
- Non-QM rate ranges calculated as spreads above conventional
- Spreads by loan type: Bank Statement +0.5% to +2.0%, 1099 +0.5% to +1.75%, P&L +1.0% to +2.0%
- Breakdown by credit score tier: 620-659, 660-699, 700-739, 740+
- Breakdown by down payment: 5%, 10%, 15%, 20%, 25%+
- Auto loan rates from FRED API (series: TERMCBCCALLNS, RIFLPBCIANM60NM)
- Historical trend charts (90-day and 1-year)
- Push notifications when rates drop significantly (optional user opt-in)

**Credit Education:**

- How credit scores work (FICO components and weights)
- Which accounts to pay down first for maximum score impact
- How to dispute errors on credit reports
- Authorized user tradelines explained
- What NOT to do before applying for a loan
- Timeline projections: "If you pay down $X on Card Y, estimated score change: +Z points in W months"

**Buyer Journey:**

Guided four-stage pathway:
- Stage 1: Discovery. "I want to buy. What are my options?"
- Stage 2: Preparation. Credit improvement plan, tax strategy, document gathering
- Stage 3: Ready. Package complete, scenarios analyzed, know your numbers
- Stage 4: Post-Close. Refinance monitoring, rate alerts, next purchase planning

### Document Preparation

**Plaid Integration:**
- Connect bank accounts via Plaid Link (OAuth)
- Pull up to 24 months transaction history
- Identify and categorize all income deposits by source
- Calculate monthly averages, annual projections, income stability metrics, earning trends
- Flag anomalies (large one-time deposits vs recurring income)
- Organize into chronological, categorized bank statement summary

**Document Upload:**
- Upload 1099 forms, tax returns, CPA letters, P&L statements, self-employment verification
- Drag and drop, camera capture, file picker
- Document type classification (auto-detect or manual select)
- Preview before adding to package

**Document Package:**
- Combine Plaid-derived data plus uploaded documents into one lender-ready package
- Standardized format: cover page, income summary, bank statement analysis, supporting documents
- Completeness checklist: shows what is done, what is missing
- Shareable: user explicitly chooses when and with whom to share

### AI Scenario Analysis

Users input their financial goal and the AI processes their complete financial picture from Plaid data. It runs every viable loan scenario, compares paths, and presents actionable results with real numbers. See [AI Scenario Engine](#ai-scenario-engine) for detailed output examples.

### Calculator Suite

**Mortgage Calculator:**
- Property price, down payment (% or $), loan term, interest rate, credit score inputs
- Auto-populate estimated property taxes (by zip code from public data), estimated insurance, PMI if applicable
- Multiple loan type toggles: conventional, bank statement, 1099, P&L, FHA
- Each toggle adjusts rate range and requirements automatically
- "What if" sliders: adjust income shown, down payment, credit score, see real-time payment changes

**Auto Loan Calculator:**
- Vehicle price, down payment, loan term, interest rate, credit score
- New vs used rate adjustment
- Trade-in value input
- Monthly payment breakdown
- Comparison: dealer financing vs credit union vs bank

**Affordability Calculator:**
- Input current income, debts, down payment savings
- Calculate maximum affordable purchase price by loan type
- Show how different loan types change the number

### Buyer Categories

Users select their goal during onboarding and get routed to the appropriate experience:

**Home Purchase:** Full mortgage education, non-QM loan library, mortgage calculators, home-specific document packaging, lender-focused scenario analysis.

**Car Purchase:** Auto loan education, dealer vs credit union guidance, auto calculators, income verification packaging for auto finance, pre-approval strategy.

**Major Loan (SBA, Construction, Refinance, Other):** Business loan education, SBA program navigation, construction loan process guides, refinance break-even calculators, loan-specific document packaging.

---

## Professional Portal Features

### Role-Based Onboarding

All professionals register at 1099pass.com. During signup they select their professional type and provide verification:

**Loan Officers and Mortgage Lenders:**
- NMLS License Number (required)
- Company/Institution Name
- Specializations: Bank Statement, 1099, P&L, Conventional, FHA, VA, USDA, Auto, SBA, Construction
- States Licensed In

**Real Estate Agents and Brokers:**
- State License Number (required)
- State of License
- Brokerage Name
- Specializations: Residential, Commercial, Investment Properties, First-Time Buyers

**Auto Finance and Car Sales Professionals:**
- Dealership Name (required)
- Dealer License Number (if applicable)
- State
- Specializations: New Vehicles, Used Vehicles, Fleet Sales, Luxury/Exotic

### Lender Dashboard

CRM-style interface for loan officers and mortgage lenders.

**Pipeline Stages:**

| New Lead | Contacted | Documents Received | Under Review | Submitted to Underwriting | Approved | Closed | Lost |

**Dashboard includes:**
- Summary cards: Active Leads, Packages Received This Month, Loans In Progress, Conversion Rate
- Recent activity feed
- Pipeline snapshot with kanban board and table view toggle
- Rate ticker showing current conventional and non-QM rates
- Borrower package viewer with search and filter (income range, loan type, credit score, location)
- In-app messaging with borrowers
- Lead management with notes, follow-ups, and status tracking

### Real Estate Agent Dashboard

CRM-style interface for real estate agents guiding gig worker clients through the buyer journey.

**Pipeline Stages:**

| New Inquiry | Initial Consultation | Getting Pre-Approved | Property Search | Offer Submitted | In Escrow | Closing | Closed | Lost |

**Dashboard includes:**
- Summary cards: Active Clients, Pre-Approved Clients, In Escrow, Closed This Month
- Recent activity feed
- Pipeline with client preparation status tracking
- Rate ticker showing current mortgage rates
- Client package viewer showing borrower preparation progress
- Education section for agents to learn non-QM loan types
- In-app messaging with clients

### Car Sales Professional Dashboard

CRM-style interface for auto finance and car sales professionals.

**Pipeline Stages:**

| New Lead | Credit Check | Income Verified | Financing Options | Test Drive / Selection | F&I (Finance and Insurance) | Deal Closed | Lost |

**Dashboard includes:**
- Summary cards: Active Leads, Packages Received, Deals In Progress, Closed This Month
- Recent activity feed
- Pipeline with deal tracking
- Rate ticker showing current auto loan rates
- Buyer income package viewer
- In-app messaging with buyers

### Rate Center

**Mortgage Rates (Lenders and Real Estate Agents):**
- Current 30-Year and 15-Year fixed rates from FRED API
- Non-QM estimated rate ranges (spreads above conventional)
- Breakdown by credit score tier and down payment percentage
- 90-day and 1-year historical trend charts
- Weekly data refresh (FRED publishes Thursdays)

**Auto Loan Rates (Car Sales Professionals):**
- Current new and used auto loan rates from FRED API
- Breakdown by credit score tier (super prime, prime, near prime, subprime)
- Breakdown by loan term (36, 48, 60, 72, 84 months)
- Bank/credit union vs dealer financing comparison
- Monthly data refresh

### Professional Education

**For Lenders:**
- Non-QM product reference guide
- Underwriting guidelines by loan type
- Rate spread reference tables
- Working with 1099Pass borrower packages
- Income normalization methodology
- LOS integration guide (Enterprise tier)

**For Real Estate Agents:**
- Understanding non-QM loans for your clients
- How to identify if a client needs non-QM vs conventional
- Documentation checklists to share with clients
- Timeline expectations for non-QM vs conventional
- Common mistakes gig worker buyers make
- How 1099Pass prepares clients before they talk to a lender

**For Car Sales Professionals:**
- Financing self-employed car buyers
- Income verification alternatives for non-W2 buyers
- Bank statement programs for auto loans
- Credit union vs dealer financing for self-employed
- Streamlining approval for non-traditional income

---

## Market

### Market Size

- 70+ million Americans currently earn income through gig work, freelancing, and independent contracting
- That number grows every year as the workforce shifts toward independent work
- US mortgage market: $4.5 trillion annually
- US auto loan market: $1.6 trillion outstanding
- US small business lending: $700+ billion annually
- ~50,000 mortgage lending institutions in the US
- ~1.5 million real estate agents in the US
- ~200,000+ auto dealerships in the US

### Target Users

**Borrower side:** Any non-W2 worker making a major purchase. Uber drivers, DoorDash couriers, Upwork freelancers, Etsy sellers, independent consultants, real estate agents (they are often 1099 themselves), insurance agents, truck owner-operators, content creators, photographers, personal trainers, and every other form of independent work.

**Professional side:** Loan officers specializing in non-QM products, real estate agents and brokers working with self-employed buyers, auto finance managers and car sales professionals at dealerships serving non-traditional income buyers.

---

## Business Model

### Borrower Pricing

| Plan | Price | Access |
|------|-------|--------|
| Free | $0/month | Education only: rate tracker, loan guides, credit education, buyer journey content |
| Premium | $29.99/month | Full access: document preparation, AI scenario engine, calculators, Plaid integration, document packaging |

Payments through Apple StoreKit 2 (iOS) and Google Play Billing (Android). 7-day free trial of Premium.

### Professional Pricing

| Tier | Price | Features |
|------|-------|----------|
| Professional | $49.99/month | CRM dashboard, pipeline management, borrower package access, rate center, education, in-app messaging |
| Enterprise | $499/month | 10 seats, everything in Professional plus API access for LOS integration, custom integrations, dedicated account manager |

Payments through Square.

### Revenue Projections

Conservative estimate at scale:
- 100,000 borrowers at $29.99/month = $36M/year borrower revenue
- 5,000 professionals at $49.99/month = $3M/year professional revenue
- 500 enterprise accounts at $499/month = $3M/year enterprise revenue
- Total: $42M ARR at moderate market penetration

Infrastructure cost per borrower is low. Plaid runs $1-3/month, AWS compute scales efficiently on Lambda, AI costs via Bedrock are roughly $0.01-0.05 per user interaction. Gross margins should be 80%+ at scale.

---

## Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Borrower Mobile App | React Native + Expo (iOS and Android) |
| Professional Portal | Next.js (desktop web, role-based dashboards) |
| Backend | AWS Lambda (serverless), API Gateway (REST) |
| Database | Amazon RDS PostgreSQL, DynamoDB (sessions) |
| Auth | AWS Cognito (MFA, OAuth 2.0, RBAC, role-based routing) |
| Financial Data | Plaid (Transactions, Auth, Identity, Balance) -- PRODUCTION ACCESS |
| AI Engine | Claude Sonnet and Claude Haiku via AWS Bedrock |
| Rate Data | FRED API (MORTGAGE30US, MORTGAGE15US, TERMCBCCALLNS, RIFLPBCIANM60NM) |
| Document Storage | Amazon S3 (AES-256 encrypted via KMS) |
| Encryption | AWS KMS (data at rest), TLS 1.3 (data in transit) |
| Payments (Borrower) | StoreKit 2 (iOS), Google Play Billing (Android) |
| Payments (Professional) | Square |
| Infrastructure | AWS CDK (Infrastructure as Code), VPC with private subnets |
| Monitoring | AWS CloudWatch, X-Ray, CloudTrail, GuardDuty |
| Email | Brevo (transactional: verification, password reset, deletion confirmation) |
| Credit Score | Self-reported by user (V1). Bureau soft pull planned for V2. |
| AI Development | Claude Code (primary), Claude Opus (architecture and security auditing) |

### Database Schema

Core tables (PostgreSQL with Row Level Security on all user-facing tables):

```
users                -- User accounts (cognito_sub, email, employment_type, credit_score_range)
plaid_items          -- Plaid connections (access_token_encrypted via KMS)
bank_accounts        -- Connected accounts (type, mask, balances)
transactions         -- Plaid-derived transactions (amount, merchant, category, income_source)
income_summaries     -- Calculated income data (monthly_average, annual_projection, stability_score)
documents            -- Uploaded files (type, s3_key, tax_year)
document_packages    -- Lender-ready bundles (status, checklist, document_ids)
package_shares       -- Sharing records (lender_id, expires_at, revoked status)
scenarios            -- AI scenario history (goal_type, inputs, results)
lenders              -- Professional accounts (professional_type, license_number, subscription_tier)
matches              -- Lender-borrower relationships (status, notes)
subscriptions        -- Subscription records (plan, status, billing)
audit_log            -- Immutable audit trail (actor, action, resource, timestamp, NO PII)
```

### API Endpoints

```
AUTH:
POST   /auth/register             -- Create account (Cognito)
POST   /auth/login                -- Login (rate limited: 5 attempts per 5 minutes)
POST   /auth/refresh              -- Refresh token
POST   /auth/forgot-password      -- Password reset
DELETE /auth/account               -- Full deletion cascade

PLAID:
POST   /plaid/create-link-token   -- Generate Plaid Link token
POST   /plaid/exchange-token      -- Exchange public token for access token
GET    /plaid/accounts            -- List connected accounts
POST   /plaid/sync-transactions   -- Pull latest transactions
DELETE /plaid/item/:itemId        -- Disconnect a bank account

INCOME:
GET    /income/summary            -- Get income normalization summary
POST   /income/calculate          -- Recalculate income from transactions

DOCUMENTS:
POST   /documents/upload          -- Upload document to S3
GET    /documents                 -- List documents
GET    /documents/:id             -- Get document metadata
DELETE /documents/:id             -- Delete document (S3 + DB)

PACKAGES:
POST   /packages                  -- Create document package
GET    /packages                  -- List packages
GET    /packages/:id              -- Get package with contents
PUT    /packages/:id              -- Update package
POST   /packages/:id/share        -- Share with professional (explicit consent)
POST   /packages/:id/revoke/:shareId -- Revoke a share
DELETE /packages/:id              -- Delete package

SCENARIOS:
POST   /scenarios/analyze         -- Submit to AI, get scenario results
GET    /scenarios                 -- List past scenarios
GET    /scenarios/:id             -- Get specific scenario

CALCULATOR:
POST   /calculator/mortgage       -- Calculate mortgage payment
POST   /calculator/auto           -- Calculate auto loan payment
POST   /calculator/affordability  -- Calculate max affordable price

RATES:
GET    /rates/mortgage            -- Current FRED mortgage rates + non-QM spreads
GET    /rates/auto                -- Current FRED auto rates + tier breakdowns
GET    /rates/history/:type       -- Historical rate data for charting

PROFESSIONAL PORTAL:
GET    /professional/packages     -- List shared packages (role-filtered)
GET    /professional/packages/:id -- View specific package
GET    /professional/analytics    -- Usage analytics
POST   /professional/contact/:userId -- Message a borrower (in-app only)
GET    /professional/pipeline     -- Get pipeline/lead data
PUT    /professional/pipeline/:id -- Update lead status
POST   /professional/pipeline     -- Create new lead
```

### AI Integration

Claude Sonnet and Claude Haiku via AWS Bedrock.

**Sonnet handles:** Scenario analysis, income projection modeling, loan qualification modeling, creative path-finding, document analysis, complex recommendation generation.

**Haiku handles:** Income categorization, transaction classification, onboarding routing, quick educational responses, form validation assistance.

**Zero-retention lifecycle:** Data is transmitted to the model, processed in memory, response returned, data discarded. No training on user data. No human review. No disk writes. No logs of financial data. API calls made with all available data retention opt-out flags.

### Infrastructure

- AWS CDK (Infrastructure as Code) across multiple CloudFormation stacks
- VPC with private subnets for database and Lambda functions
- API Gateway with WAF (OWASP Top 10, SQLi, XSS, rate limiting, size limits)
- CloudFront for portal delivery
- S3 for document storage and static assets
- RDS PostgreSQL in private subnet with encryption at rest
- DynamoDB for session management
- Cognito for authentication with MFA support
- KMS for encryption key management
- CloudWatch for monitoring and alerting
- GuardDuty for threat detection
- CloudTrail for audit logging

---

## Security Architecture

### Five Core Principles

**1. ZERO LOCAL STORAGE.** No user data stored on local devices, local servers, or any infrastructure outside encrypted AWS services within a VPC with private subnets. Everything goes to AWS. Nothing stays local.

**2. ZERO AI RETENTION.** AI processes data in volatile memory only. No disk writes. No logs. No cache. No training. No fine-tuning. Data discarded immediately after response generation.

**3. DELETE MEANS DELETE.** Account deletion triggers hard deletes across every data store. No soft deletes. No archive tables. No anonymization in lieu of deletion. No "we keep anonymized data for analytics." Complete, permanent, irreversible.

**4. ENCRYPTION EVERYWHERE.** Every byte of user data encrypted at rest (AES-256 via AWS KMS) and in transit (TLS 1.3). Zero exceptions.

**5. NO LOOPHOLES.** No administrative backdoor. No debug mode bypass. No god mode account. No bulk data export function. Audit logs record every access to financial data including by administrators.

### Encryption

- RDS: Encryption at rest with KMS CMK
- S3: Bucket policy enforces aws:SecureTransport, SSE-KMS default encryption
- DynamoDB: Encryption at rest with KMS
- Plaid tokens: Encrypted with KMS before INSERT, decrypted at moment of use only
- All API endpoints: HTTPS only, HSTS headers enforced
- Internal Lambda-to-Lambda: Encrypted via AWS internal network plus IAM auth

### Access Controls

- PostgreSQL Row Level Security on EVERY table containing user data
- RLS policy: user_id = auth.uid() on SELECT, INSERT, UPDATE, DELETE
- IAM roles: one role per Lambda function, minimum permissions
- Cognito: MFA available for all users
- API Gateway: Cognito authorizer on all authenticated endpoints
- S3: No public buckets, all access via presigned URLs with expiration
- VPC: Private subnets for RDS, Lambda in VPC for DB access
- Security groups: Minimum port access, no 0.0.0.0/0 inbound
- Login rate limiting: 5 attempts per 5 minutes per email

### Deletion Cascade

Eight-step process executed in order:

1. Revoke all Plaid access tokens (POST to Plaid /item/remove)
2. DELETE CASCADE from users table in PostgreSQL (verify row count = 0)
3. Delete all S3 objects under s3://bucket/users/{user_id}/
4. Delete all DynamoDB items with user partition key
5. Delete user from Cognito (AdminDeleteUser)
6. Delete Square customer if exists
7. Write immutable audit entry to CloudTrail
8. Send deletion confirmation email via Brevo

### Audit and Compliance

- CloudTrail enabled on all regions, S3 Object Lock for log integrity
- Application logs: structured JSON, NO PII, NO financial data
- Every DB read/write of financial data: log user_id, action, timestamp, data scope
- Log retention: 7 years (regulatory)
- 29 sensitive fields redacted recursively in request logging
- Architecture designed for SOC 2 Type II readiness

---

## Competitive Landscape

**NerdWallet / Bankrate / Zillow:** Massive traffic mortgage calculators and rate comparison tools. Built entirely for W-2 borrowers. Their calculators assume conventional loan rates and standard income documentation. They do not address non-QM loan types at all. A gig worker using these tools gets inaccurate numbers from the start.

**LendingTree / Credible:** Rate comparison marketplaces that are fundamentally lead generation businesses. The borrower is the product, not the customer. Not education-first. Not gig-worker specific.

**Steady:** Tracks gig worker income but makes zero connection to lending. It tells you what you earned but does nothing to help you use that information to qualify for a loan.

**Griffin Funding / Angel Oak / New American Funding:** Non-QM lenders with their own calculators, but they are selling their own loan products. They are not independent.

**Auto lending tools (Edmunds, TrueCar, Capital One Auto Navigator):** All built for W-2 income verification. None address self-employed car buyers or offer income organization for non-traditional earners.

**What does NOT exist:** No independent, education-first platform for non-W2 borrowers that combines non-QM rate tracking, calculators calibrated for non-traditional loan types, AI-powered scenario modeling, Plaid-connected document preparation, professional-side CRM, and coverage across mortgages, auto loans, and business loans in one product.

1099Pass is that platform.

---

## Regulatory Position

| Regulation | Status | Notes |
|-----------|--------|-------|
| GLBA Privacy Rule | Required | Privacy notice, NPI handling |
| GLBA Safeguards Rule | Required | Written security program, risk assessment |
| CCPA/CPRA | Required | California residents, all rights supported, deletion exceeds requirements |
| FCRA | NOT applicable | We do not generate consumer reports |
| ECOA / Fair Lending | NOT applicable | We do not make credit/lending decisions |
| RESPA | NOT applicable | We do not broker, originate, or service loans |
| SAFE Act / NMLS | NOT applicable (V1) | No lead gen, no compensated referrals |
| State Breach Laws | Required | 72-hour user notification |
| SOC 2 Type II | Readiness target | Architecture designed for it |

---

## What 1099Pass Is Not

- NOT a lender, loan originator, loan broker, mortgage broker, or financial advisor
- NOT a party to any loan transaction
- NOT a lead generator (no compensated referrals to lenders)
- NOT a consumer reporting agency (reports are educational tools, not FCRA consumer reports)
- Does NOT hold, process, or transmit consumer funds
- Does NOT make credit or lending decisions
- Does NOT pull credit reports (V1 uses self-reported credit scores)

---

## What's Built

### Completed

- Monorepo structure with npm workspaces
- AWS CDK infrastructure (VPC, RDS, S3, Cognito, Lambda, API Gateway) across 9+ stacks
- Database migrations (11+ tables with RLS)
- Shared TypeScript types with Zod validation
- Income Normalization Engine with Plaid integration
- Loan Readiness Score algorithm (6 weighted components)
- Report Generator (JSON + PDF, 10 sections)
- Borrower React Native app (Expo)
- Professional portal (Next.js) deployed at 1099pass.com
- CI/CD pipeline via CodeBuild
- Square integration for professional payments
- StoreKit 2 integration for iOS subscriptions
- Plaid integration with production keys
- Self-reported credit score feature
- WAF rules (OWASP Top 10, SQLi, XSS, rate limiting)
- Security audit completed (all critical and high severity issues resolved)
- GuardDuty threat detection enabled
- Full deletion cascade implemented
- Legal documents drafted (Terms of Service, Privacy Policy)

### In Progress

- Role-based professional onboarding (lender, real estate agent, car sales)
- Professional CRM dashboards with pipeline management
- Rate Center integration (FRED API for mortgage and auto rates)
- Professional education sections (role-specific content)
- End-to-end user flow (Plaid Link through report generation to professional viewing)
- AI integration layer (Claude Sonnet and Haiku via AWS Bedrock)
- Borrower onboarding with buyer category routing (home, car, loan)
- Auto loan calculator and education content
- App Store and Google Play submission
- CPA-verified document package exploration

---

## Design System

| Element | Value |
|---------|-------|
| Primary Color | #0A1628 (Navy) |
| Accent Color | #C4652A (Rust) |
| Background (Borrower App) | #F5F0E8 (Cream) |
| Background (Professional Portal) | #0A1628 (Navy) |
| Text Primary | #2D2D2D (Charcoal) |
| Text Secondary | #666666 |
| Heading Font | Georgia |
| Body Font | Inter / Arial |
| Borrower Style | Editorial/magazine aesthetic, clean, trustworthy |
| Professional Style | Bold, futuristic, professional |
| Rule | NO glassmorphism. This is fintech. Trust and clarity over flash. |

---

## Project Structure

```
1099Pass/
  packages/
    shared/                    -- Shared types, Zod schemas, utilities
      src/
        types/                 -- TypeScript type definitions
        schemas/               -- Zod validation schemas
        utils/
          encryption.ts        -- KMS encrypt/decrypt
          encryption-node.ts   -- Node-only crypto utilities
          income.ts            -- Income normalization algorithms
          calculator.ts        -- Loan calculation formulas

  apps/
    borrower/                  -- React Native + Expo (iOS and Android)
      src/
        screens/
          auth/                -- Login, Register, ForgotPassword
          onboarding/          -- Welcome, Employment Type, Goals, Category Selection
          education/           -- Loan Library, Rate Tracker, Credit Ed, Buyer Journey
          documents/           -- Plaid Connect, Upload, Package Builder
          scenarios/           -- AI Scenario Engine, Calculator
          settings/            -- Account, Privacy, Delete Account
        components/
          calculator/          -- Mortgage, auto, affordability calculators
          ai/                  -- Scenario display, path cards
          documents/           -- Upload UI, checklist, package preview
          education/           -- Loan type cards, rate display, credit tips
        hooks/                 -- usePlaid, useIncome, useScenarios, useRates, useAuth
        services/              -- API client, Plaid, AI

    lender-portal/             -- Next.js (professional desktop portal)
      src/
        app/
          dashboard/           -- Role-based dashboard (lender, agent, car sales)
          pipeline/            -- CRM pipeline management
          packages/            -- Borrower package viewer
          rates/               -- Rate Center (FRED API)
          education/           -- Role-specific education content
          analytics/           -- Usage analytics
          settings/            -- Account, subscription, billing
        components/
          pipeline/            -- Kanban board, table view, lead cards
          package-viewer/      -- Document package display
          rate-center/         -- Rate charts, tier breakdowns
          search-filters/      -- Search and filter controls
          education/           -- Educational content components

  infrastructure/              -- AWS CDK
    lib/
      stacks/
        networking-stack.ts    -- VPC, subnets, security groups
        database-stack.ts      -- RDS PostgreSQL, DynamoDB
        auth-stack.ts          -- Cognito user pools, clients
        api-stack.ts           -- API Gateway, WAF
        compute-stack.ts       -- Lambda functions
        storage-stack.ts       -- S3 buckets
        security-stack.ts      -- KMS, GuardDuty, Secrets Manager
        monitoring-stack.ts    -- CloudWatch, alarms
        cicd-stack.ts          -- CodeBuild, CodePipeline

  packages/api/                -- Lambda handlers
    src/
      handlers/
        auth/                  -- Login, register, refresh, delete
        financial/             -- Plaid connect, sync, disconnect
        reports/               -- Generate, list, share, PDF
        scoring/               -- Readiness score, history
        subscriptions/         -- Subscribe, cancel, webhook
        lender/                -- Package access, search, contact
        calculator/            -- Mortgage, auto, affordability
        rates/                 -- FRED API rate endpoints
      middleware/
        token-validator.ts     -- JWT validation, role-based access
        rate-limiter.ts        -- Rate limiting
        security-headers.ts    -- CORS, HSTS, CSP
        error-handler.ts       -- Error handling
        audit-logger.ts        -- Audit logging
      db/
        client.ts              -- PostgreSQL connection
        repositories/          -- Data access layer
      services/
        plaid-service.ts       -- Plaid API integration
        ai-document-analyzer.ts    -- Claude document analysis
        ai-transaction-classifier.ts -- Claude transaction classification
        report-generator-service.ts -- PDF and JSON report generation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- AWS CLI configured with appropriate credentials
- Expo CLI (`npm install -g expo-cli`)
- AWS CDK CLI (`npm install -g aws-cdk`)

### Installation

```bash
# Clone the repo
git clone https://github.com/get-sltr/1099pass.git
cd 1099pass

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in required values (Plaid keys, AWS config, Square keys, Cognito IDs)
```

### Running Locally

```bash
# Borrower app (mobile)
cd apps/borrower
npx expo start

# Professional portal (web)
cd apps/lender-portal
npm run dev

# Deploy infrastructure
cd infrastructure
cdk deploy --all
```

### Environment Variables

```
# Plaid
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=production

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=

# Cognito
COGNITO_USER_POOL_ID=
COGNITO_BORROWER_CLIENT_ID=
COGNITO_LENDER_CLIENT_ID=

# Square
SQUARE_ACCESS_TOKEN=
SQUARE_WEBHOOK_SIGNATURE_KEY=

# FRED API
FRED_API_KEY=

# AI (AWS Bedrock)
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_SONNET=anthropic.claude-sonnet
BEDROCK_MODEL_HAIKU=anthropic.claude-haiku
```

---

## Dev Standards

- Senior SWE level. Clean code, reliability, accountability.
- Security first. Always check DB state before destructive SQL operations.
- No quick fixes. Root cause fixes only.
- TypeScript strict mode everywhere.
- Zod validation on all inputs.
- Error handling on every async operation.
- Loading states on every data fetch.
- RLS on every table with user data.
- NO em dashes anywhere. Use commas, semicolons, or periods instead.
- NO local storage of any user data.
- NO PII in logs.
- NO hardcoded secrets.
- NO public S3 buckets.
- NO glassmorphism. This is fintech. Trust and clarity over flash.
- ALWAYS encrypt Plaid tokens before DB write.
- ALWAYS verify user ownership before any data operation.
- ALWAYS use parameterized queries (never string concatenation for SQL).
- DELETE means DELETE. Hard delete, not soft delete, not archive.

---

## Entity

**Company:** SLTR Digital LLC (California). Converting to Delaware C-Corp.
**Founder:** Kevin Minn, CEO, sole founder, 100% equity.
**Domain:** 1099pass.com
**Bundle ID:** com.sltrdigital.1099pass

---

*Built for the income they won't count.*
