# 1099Pass -- Complete Build Specification
## For Claude Code / Cursor Implementation
## Last Updated: March 6, 2026
## Version: FINAL

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
2. **Document Preparation + AI Scenario Engine** -- Plaid-powered bank statement organization, income normalization, document packaging, AI-powered scenario analysis with multiple paths to approval, interactive calculators calibrated for non-QM loan types, blank template calculators for user-driven "what if" modeling.
3. **Professional Directory** -- Browse-only directory where lenders, agents, loan officers, and car salespeople subscribe for visibility. Borrowers connect at their own will. Weekly reshuffle for fairness. Recommended partners vetted by Kevin get premium placement.

## WHAT 1099PASS IS NOT

- NOT a lender, loan originator, loan broker, mortgage broker, or financial advisor
- NOT a party to any loan transaction
- NOT a lead generator (no compensated referrals, no per-lead fees, no matching algorithm, no pings)
- NOT a consumer reporting agency (reports are educational tools, not FCRA consumer reports)
- Does NOT hold, process, or transmit consumer funds
- Does NOT make credit or lending decisions
- Does NOT pull credit reports (V1 uses self-reported credit scores)
- Does NOT steer borrowers to specific professionals (directory only, borrower chooses)

---

## PRICING

### Borrower
**$29.99/month -- All Inclusive. No tiers. No paywalls.**
Everything: education, AI scenario engine, all calculators, document preparation, Plaid bank connection, rate tracker, credit education, buyer journey, professional directory access.

### Professional (Individual)
**$49.99/month**
Directory listing, profile page, visible to borrowers in their area, receive borrower-initiated contact. Listing reshuffled weekly for fairness.

### Professional (Enterprise)
**$299-$399/month (TBD)**
10 seats included. For brokerages, lending teams, dealership groups. Enhanced team profile.

### Recommended Partner
**Custom/Negotiated**
Curated by Kevin. Personally vetted. Premium placement with "Recommended by 1099Pass" badge. Example: Lydia Gable Realty Group at Compass.

### Payment Processing
- Borrower mobile: StoreKit 2 (iOS), Google Play Billing (Android)
- Professional/Lender web portal: Square (NOT Stripe)
- NO Stripe anywhere in this product

---

## TECH STACK

| Component | Technology |
|-----------|-----------|
| Borrower Mobile App | React Native + Expo (iOS and Android) |
| Professional Portal | Next.js (Desktop web) |
| Backend | AWS Lambda (serverless), API Gateway |
| Database | Amazon RDS (PostgreSQL), DynamoDB |
| Auth | AWS Cognito (MFA, OAuth 2.0, RBAC) |
| Financial Data | Plaid (Transactions, Auth, Identity, Balance) -- PRODUCTION ACCESS APPROVED |
| AI Engine | AWS Bedrock + Claude (Anthropic) for scenario analysis, income categorization, recommendations |
| Rate Data | FRED API (Freddie Mac PMMS) + non-QM lender published rate sheets |
| Document Storage | Amazon S3 (AES-256 encrypted via KMS) |
| Encryption | AWS KMS for data at rest, TLS 1.3 in transit |
| Payments (Borrower) | StoreKit 2 (iOS) / Google Play Billing (Android) |
| Payments (Professional) | Square |
| Infrastructure | AWS CDK (Infrastructure as Code), VPC with private subnets |
| Monitoring | AWS CloudWatch, X-Ray, CloudTrail |
| Email | Brevo (transactional only) |
| Credit Score | Self-reported by user (V1) |

---

## DESIGN SYSTEM

### Paper & Ink (Day Mode -- Default)
- **Background:** #FAF9F6 (Warm off-white)
- **Text Primary:** #111111 (Near black)
- **Text Secondary:** #444444
- **Text Muted:** #999999
- **Accent / CTA:** #FF6B00 (Vibrant orange)
- **Accent Soft:** #FFF5EC (Light orange tint)
- **Glass Cards:** White at 85% opacity, backdrop-blur(20px), subtle 1px border rgba(0,0,0,0.06)
- **Shadows:** Minimal, soft, 0 2px 16px rgba(0,0,0,0.04)
- **Feeling:** Editorial, trustworthy, clean, professional

### Midnight Ember (Night Mode)
- **Background:** #050505 (True black)
- **Text Primary:** #F0F0F0
- **Text Secondary:** #999999
- **Text Muted:** #555555
- **Accent / CTA:** #FF8C33 (Warm amber orange)
- **Accent Glow:** rgba(255, 140, 51, 0.2)
- **Glass Cards:** White at 4.5% opacity, backdrop-blur(20px), subtle 1px border rgba(255,255,255,0.07)
- **Shadows:** Warm amber glow, 0 4px 32px rgba(255, 140, 51, 0.12)
- **Ambient Orbs:** Subtle orange glow spots in corners for depth
- **Feeling:** Premium, cinematic, bold

### Shared Design Elements
- **Font Headings:** System bold (-apple-system), weight 800, tight letter-spacing
- **Font Body:** System regular, weight 500
- **Font Mono:** Courier New for brand mark "1099PASS"
- **Corner Radius:** 20px for cards, 12px for buttons, 20px for chips/pills
- **Liquid Glass:** backdrop-filter: blur(20px) on all cards and overlays
- **Micro-interactions:** Smooth transitions, progress animations on uploads, haptic feedback on calculations
- **AI Output Cards:** Orange-tinted glass with subtle glow to distinguish from static content
- **Dark/Light Toggle:** Follows system preference by default, manual override in settings
- **NO glassmorphism overuse:** Glass on cards and overlays only. Backgrounds stay solid.

---

## ONBOARDING FLOW

### Screen 1: Welcome
"What brings you to 1099Pass?"
- I'm looking for a loan (Borrower)
- I'm a professional (Lender/Agent/Sales)

### Screen 2 (Borrower): What do you do?
- Rideshare / Delivery (Uber, Lyft, DoorDash)
- Freelancer / Contractor
- Self-employed / Business owner
- Commission-based (real estate, insurance, sales)
- Content creator / Influencer
- Multiple income sources
- Other

### Screen 3 (Borrower): What's your goal?
- Buy a home
- Buy a car
- Refinance an existing loan
- Get a business loan
- Just learning / Not sure yet

### Screen 4 (Borrower): Where are you in the process?
- Just starting to explore
- Actively looking, haven't applied
- Applied and got denied
- Applied, need better terms

### Screen 5 (Borrower): Quick financial snapshot
- Approximate annual income range (dropdown: Under $50K, $50-100K, $100-150K, $150-250K, $250K+)
- Credit score range (dropdown: Below 580, 580-619, 620-659, 660-699, 700-739, 740+, Don't know)

### Screen 6: You're all set
Personalized home screen based on answers. Education content tailored to their goal. AI scenarios available immediately if they connect Plaid.

### Professional Onboarding:
- Company name, license number (if applicable), specialties, area served, languages
- Profile photo, bio, years of experience
- Select category: Lender / Loan Officer / Real Estate Agent / Auto Sales / Other
- Payment setup via Square
- Profile goes live after review

---

## BORROWER APP FEATURES

### Education Engine

**Loan Type Library:**

| Loan Type | Description | Docs Required |
|-----------|-------------|---------------|
| Bank Statement (12mo) | Lender uses 12 months of deposits instead of tax returns | 12 months bank statements, self-employment verification |
| Bank Statement (24mo) | Same but 24 months, sometimes better rates | 24 months bank statements, self-employment verification |
| 1099 Income | Uses 1099 forms + bank statements | 1-2 years 1099s, bank statements, higher credit score |
| P&L (Profit & Loss) | CPA-prepared P&L used instead of tax returns | CPA-prepared P&L, business license, bank statements |
| Asset Depletion | Liquid assets divided over loan term = theoretical monthly income | Proof of liquid assets (savings, investments, retirement) |
| DSCR | Investment property, qualified by rental income not personal income | Rental analysis/lease, property appraisal, no personal income docs |
| Conventional | Standard Fannie/Freddie, if tax returns support qualification | 2 years tax returns, W-2s/1099s, pay stubs, bank statements |
| FHA | Government-backed, lower down payment | 2 years tax returns, bank statements, self-employment verification |
| VA | Veterans, no down payment | COE, 2 years tax returns, bank statements |
| Auto Loan | Vehicle financing | Income verification, credit check, down payment |
| Business / SBA | Small business loans | Business plan, financials, tax returns, bank statements |
| Construction | Two-phase funding for building | Plans, contractor agreements, financials, down payment |
| Refinance | Replace existing loan with better terms | Current loan docs, income verification, appraisal |

Each page: what it is, who it's for, requirements, typical rate spreads, down payment minimums, credit score thresholds, pros/cons, "Is this right for me?" guidance.

**Rate Tracker:**
- FRED API (series: MORTGAGE30US, MORTGAGE15US) for conventional baseline, updated weekly
- Non-QM rate ranges: conventional + spread by loan type
  - Bank statement: +0.5% to +2.0%
  - 1099: +0.5% to +1.75%
  - P&L: +1.0% to +2.0%
- Break down by credit score tier: 620-659, 660-699, 700-739, 740+
- Break down by down payment: 5%, 10%, 15%, 20%, 25%+
- Optional push notifications when rates drop significantly

**Credit Education:**
- How FICO scores work (payment history 35%, utilization 30%, length 15%, mix 10%, inquiries 10%)
- Which accounts to pay down first for max score impact
- How to dispute errors on credit report
- Authorized user tradelines
- What NOT to do before applying (don't close cards, don't apply for new credit, don't make large purchases)
- Timeline projections: "Pay down $X on Card Y, estimated +Z points in W months"

**Buyer Journey (Guided 4-Stage Pathway):**
- Stage 1: Discovery -- understand options, explore loan types, see what's possible
- Stage 2: Preparation -- credit improvement plan, tax strategy awareness, document gathering
- Stage 3: Ready -- package complete, scenarios analyzed, know your numbers, walk into lender prepared
- Stage 4: Post-Close -- refinance monitoring, rate alerts, next purchase planning

### Document Preparation

**Plaid Integration:**
- Connect bank accounts via Plaid Link (OAuth)
- Pull up to 24 months transaction history
- Identify and categorize income deposits by source (Uber, DoorDash, Upwork, Etsy, freelance, etc.)
- Calculate monthly averages, annual projections, stability metrics, earning trends
- Flag anomalies (large one-time deposits vs. recurring)
- Organize into chronological, categorized bank statement summary

**Document Upload:**
- Upload 1099s, tax returns, CPA letters, P&L statements, self-employment verification
- Drag and drop, camera capture, file picker
- Auto-detect document type or manual select
- Preview before adding to package

**Document Package:**
- Combine Plaid data + uploaded documents into one lender-ready package
- Standardized format: cover page, income summary, bank statement analysis, supporting docs
- Checklist: what's complete, what's missing
- Shareable: borrower explicitly chooses when and with whom to share
- PDF export for offline use

### AI Scenario Engine

**How it works:**
User inputs goal ("I want to buy a $600K home"). AI knows their bank deposits, stated income, credit score (self-reported), savings. AI runs every viable loan scenario, presents multiple paths ranked by total cost and feasibility.

**AI behavior rules:**
- ALWAYS provide multiple paths (minimum 3-4 scenarios per goal)
- ALWAYS include the math (monthly payment, total interest, trade-offs)
- ALWAYS label outputs as "hypothetical" and "for educational purposes"
- ALWAYS suggest consulting a licensed professional
- NEVER claim to approve or deny a loan
- NEVER store any user data (zero retention)
- NEVER recommend specific professionals by name (that's what the directory is for)
- Personality: hardworking, creative, resourceful, relentless, on the consumer's side

**Blank Template Calculator:**
- User plugs in own numbers: property price, down payment, loan term, rate, credit score
- Auto-populate: estimated property taxes (by zip, public data), insurance, PMI
- Loan type toggles: conventional, bank statement, 1099, P&L, FHA, VA
- Each toggle adjusts rate range and requirements automatically
- "What if" sliders: adjust income shown, down payment, credit score, see real-time changes
- Accuracy target: within 1-2% of actual lender quotes

### Beyond Mortgages
Same education + calculator + scenario model for:
- Auto loans: rate comparison, dealer vs. credit union, pre-approval strategy
- Refinancing: when to refi, break-even calculator, rate monitoring
- Construction loans: two-phase process, draw schedules, builder requirements
- Business / SBA loans: documentation navigation, 7(a) vs. 504 vs. microloans

### Professional Directory (Borrower View)
- "Professionals" tab in bottom nav or main menu
- Browse by category: Lenders, Real Estate Agents, Auto Sales, Business Loans
- Filter by area, specialty, language, ratings
- Recommended Partners shown at top with badge
- All other professionals listed below, reshuffled weekly
- Borrower taps profile to view details
- Borrower initiates contact via message or call button
- 1099Pass does NOT push, suggest, match, or steer

---

## PROFESSIONAL PORTAL FEATURES

### Profile Management
- Company name, personal name, title, license number
- Photo, bio, years of experience
- Specialties (bank statement loans, 1099 loans, FHA, VA, auto, etc.)
- Area served (zip codes or radius)
- Languages spoken
- Contact preferences

### Dashboard
- Views: how many borrowers viewed their profile this month
- Contacts: how many borrowers initiated contact
- Profile strength meter
- Subscription status and billing

### Enterprise Features (10 seats)
- Team management: add/remove team members
- Team profile page with individual agent profiles underneath
- Shared analytics across team
- Enhanced placement in directory

### Lender-Specific Features (For loan officers subscribed to professional tier)
- View shared document packages from borrowers who chose to share with them
- Standardized format for easy review
- Download PDF reports

---

## SECURITY ARCHITECTURE (NON-NEGOTIABLE)

### Five Core Principles

**Principle 1: ZERO LOCAL STORAGE**
No user data on local devices, local servers, or any infrastructure outside encrypted AWS services. Everything in AWS VPC with private subnets. No exceptions.

**Principle 2: ZERO AI RETENTION**
AI processes data in volatile memory only. No disk writes. No logs. No cache. No training. Data discarded immediately after response. API calls with all data retention opt-out flags enabled.

**Principle 3: DELETE MEANS DELETE**
Hard deletes across every data store. No soft deletes. No archive tables. No anonymization. User data wiped from primary DB, S3 objects permanently deleted, Plaid tokens revoked, all references purged. Backup media overwritten within 30-day rotation.

**Principle 4: ENCRYPTION EVERYWHERE**
AES-256 via KMS at rest. TLS 1.3 in transit. Zero exceptions. No plaintext data anywhere at any time. Plaid tokens encrypted via KMS before database write.

**Principle 5: NO LOOPHOLES**
No admin backdoor. No debug bypass. No god mode. No bulk export. Audit logs record every access including admins. Logs immutable (S3 Object Lock) and encrypted.

### Deletion Cascade (8 Steps, Must Execute in Order)
1. Revoke all Plaid access tokens (POST to Plaid /item/remove)
2. DELETE CASCADE from users table in PostgreSQL (verify row count = 0 across all tables)
3. Permanently delete all S3 objects under s3://bucket/users/{user_id}/
4. Delete all DynamoDB items with user partition key
5. Delete user from Cognito (AdminDeleteUser)
6. Delete Square customer record if exists
7. Write immutable audit entry to CloudTrail
8. Send deletion confirmation email via Brevo

### Implementation Requirements
- PostgreSQL RLS on EVERY table with user data
- RLS policy: user_id = auth.uid() on SELECT, INSERT, UPDATE, DELETE
- IAM roles: one per Lambda, minimum permissions
- API Gateway: Cognito authorizer on all authenticated endpoints
- S3: no public buckets, presigned URLs with expiration only
- VPC: private subnets for RDS, Lambda in VPC for DB access
- No PII in application logs, error logs, or monitoring output
- bcrypt with cost factor >= 12 for passwords
- Automated secrets rotation via AWS Secrets Manager

---

## DATABASE SCHEMA

```sql
-- Users (Borrowers)
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  cognito_sub TEXT UNIQUE NOT NULL,
  user_type TEXT DEFAULT 'borrower', -- 'borrower' or 'professional'
  employment_type TEXT,
  goal TEXT,
  process_stage TEXT,
  income_range TEXT,
  credit_score_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professionals (Lenders, Agents, Sales)
professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT,
  license_number TEXT,
  category TEXT NOT NULL, -- 'lender', 'real_estate', 'auto_sales', 'business_loans', 'other'
  specialties TEXT[], -- ['bank_statement', '1099_loans', 'fha', 'va', 'auto']
  bio TEXT,
  years_experience INTEGER,
  languages TEXT[],
  area_zip_codes TEXT[],
  area_radius_miles INTEGER DEFAULT 20,
  photo_s3_key TEXT,
  is_recommended BOOLEAN DEFAULT FALSE,
  recommended_badge_text TEXT, -- 'Recommended by 1099Pass'
  square_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'individual', -- 'individual', 'enterprise'
  subscription_status TEXT DEFAULT 'active',
  profile_views_month INTEGER DEFAULT 0,
  contacts_received_month INTEGER DEFAULT 0,
  last_reshuffled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprise team members
team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plaid connections
plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL, -- KMS encrypted, NEVER plaintext
  item_id TEXT NOT NULL,
  institution_name TEXT,
  institution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank accounts
bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  name TEXT,
  type TEXT,
  subtype TEXT,
  mask TEXT,
  current_balance DECIMAL(12,2),
  available_balance DECIMAL(12,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT,
  date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  merchant_name TEXT,
  category TEXT,
  is_income BOOLEAN DEFAULT FALSE,
  income_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income summaries
income_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_months INTEGER NOT NULL,
  total_deposits DECIMAL(12,2),
  monthly_average DECIMAL(12,2),
  annual_projection DECIMAL(12,2),
  income_sources JSONB,
  stability_score DECIMAL(5,2),
  trend TEXT,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  filename TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  tax_year INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document packages
document_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Document Package',
  status TEXT DEFAULT 'draft',
  income_summary_id UUID REFERENCES income_summaries(id),
  document_ids UUID[],
  checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package shares
package_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES document_packages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ
);

-- Scenarios
scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT,
  target_amount DECIMAL(12,2),
  inputs JSONB,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Borrower-to-Professional messages
messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate data cache
rate_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_type TEXT NOT NULL, -- 'conventional_30', 'conventional_15', 'arm_5_1'
  rate_value DECIMAL(5,3),
  source TEXT DEFAULT 'fred_api',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional directory reshuffle tracking
directory_shuffle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  area_zip TEXT NOT NULL,
  shuffle_order UUID[], -- ordered array of professional IDs
  shuffled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log (immutable)
audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_type TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB, -- NO PII
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS ON EVERY TABLE WITH USER DATA
-- ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
-- Borrower tables: user_id = auth.uid()
-- Professional tables: user_id = auth.uid()
-- Messages: sender_id = auth.uid() OR recipient_id = auth.uid()
-- Audit log: admin read only
-- Rate cache: public read, admin write
-- Directory shuffle: public read, system write
```

---

## API ENDPOINTS

```
AUTH:
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/forgot-password
DELETE /auth/account              -- triggers full deletion cascade

ONBOARDING:
PUT    /onboarding/profile        -- save onboarding answers

PLAID:
POST   /plaid/create-link-token
POST   /plaid/exchange-token
GET    /plaid/accounts
POST   /plaid/sync-transactions
DELETE /plaid/item/:itemId

INCOME:
GET    /income/summary
POST   /income/calculate

DOCUMENTS:
POST   /documents/upload
GET    /documents
GET    /documents/:id
DELETE /documents/:id

PACKAGES:
POST   /packages
GET    /packages
GET    /packages/:id
PUT    /packages/:id
POST   /packages/:id/share
POST   /packages/:id/revoke/:shareId
DELETE /packages/:id

SCENARIOS:
POST   /scenarios/analyze
GET    /scenarios
GET    /scenarios/:id

CALCULATOR:
POST   /calculator/mortgage
POST   /calculator/auto
POST   /calculator/affordability
GET    /calculator/rates

DIRECTORY:
GET    /directory/professionals    -- browse by category, area, filters
GET    /directory/professionals/:id
GET    /directory/recommended      -- recommended partners only

MESSAGES:
POST   /messages
GET    /messages/conversations
GET    /messages/conversation/:recipientId

PROFESSIONAL PORTAL:
GET    /professional/dashboard
PUT    /professional/profile
GET    /professional/packages      -- shared packages from borrowers
GET    /professional/packages/:id
GET    /professional/analytics
POST   /professional/team/add      -- enterprise only
DELETE /professional/team/:memberId

ADMIN (internal):
POST   /admin/directory/reshuffle  -- weekly cron
POST   /admin/rates/refresh        -- weekly cron (FRED API)
```

---

## COMPLIANCE

| Regulation | Status | Notes |
|-----------|--------|-------|
| GLBA Privacy Rule | Required | Privacy notice, NPI handling |
| GLBA Safeguards Rule | Required | Written security program |
| CCPA/CPRA | Required | All rights supported, deletion exceeds requirements |
| FCRA | NOT applicable | No consumer reports generated |
| ECOA / Fair Lending | NOT applicable | No credit/lending decisions |
| RESPA | NOT applicable | No loan origination, no referral fees, directory is flat subscription |
| SAFE Act / NMLS | NOT applicable | No lead gen, no matching, directory model only |
| State Breach Laws | Required | 72-hour notification |
| SOC 2 Type II | Readiness target | Formal audit when revenue supports |

---

## LEGAL DISCLAIMERS (Required in-app)

**On calculator/scenario outputs:**
"Estimated scenarios for educational purposes only. Actual rates and terms depend on the lender and your financial situation. Consult a licensed mortgage professional."

**On AI outputs:**
"Generated by AI for educational purposes. May contain errors. Verify with a licensed professional."

**In-app footer:**
"1099Pass is an educational and document preparation platform by SLTR Digital LLC. Not a lender, broker, or financial advisor. Does not originate or guarantee loans."

**On professional directory:**
"Professionals listed are independent subscribers. 1099Pass does not endorse, guarantee, or verify the services of any listed professional except designated Recommended Partners. Conduct your own due diligence."

---

## DEV STANDARDS (Non-negotiable)

- Senior SWE level, clean code, reliability
- Security-first, always check DB before SQL ops
- No quick fixes, root cause only
- Award-winning UI/UX, built to scale to millions
- TypeScript strict mode
- Zod validation on all inputs
- Error handling on every async operation
- Loading states on every data fetch
- RLS on every table with user data
- NO em dashes anywhere (use commas, semicolons, periods)
- NO local storage of user data
- NO PII in logs
- NO hardcoded secrets
- NO public S3 buckets
- ALWAYS encrypt Plaid tokens before DB write
- ALWAYS verify user ownership before data ops
- DELETE means DELETE, hard delete, not soft delete

---

## EXISTING ASSETS

- Plaid production access: APPROVED
- AWS CDK infrastructure deployed (VPC, RDS, S3, Cognito, Lambda, API Gateway)
- Monorepo with npm workspaces, 11 DB migration tables
- Income normalization engine, report generator
- Borrower app scaffold (React Native), Lender portal scaffold (Next.js)
- CI/CD pipeline
- Domain: 1099pass.com
- Warm lead: Lydia Gable Realty Group at Compass
- Partnership target: Revve (revve.io) by Carol

### Known Issues to Fix First
- encryption.ts uses Node crypto, crashes React Native, must use expo-crypto
- API handlers need verification/completion
- Expo SDK compatibility check needed
- End-to-end flow not yet connected

---

## BUILD PRIORITY

1. Fix crypto import and verify existing infrastructure
2. Borrower auth flow (Cognito) + onboarding screens
3. Plaid integration: Link, token exchange, transaction sync, income calculation
4. Education engine: loan type library, rate tracker (FRED API), credit education
5. Document preparation: upload, organize, package builder, checklist
6. AI scenario engine: AWS Bedrock + Claude integration, multi-scenario output
7. Calculator suite: mortgage, auto, affordability, "what if" sliders
8. Professional portal: auth, profile, dashboard, subscription (Square)
9. Professional directory: browse, search, filter, weekly reshuffle
10. Messaging: borrower-to-professional in-app messaging
11. Deletion cascade: full implementation and testing
12. Design system: Paper & Ink (day) + Midnight Ember (night), liquid glass
13. Legal pages: Terms, Privacy Policy, in-app disclaimers
14. Landing page: deploy to 1099pass.com
15. App Store / Google Play submission

---

## SAFETY & SECURITY REMINDERS

- NEVER read, display, or log .env contents
- NEVER commit secrets to git
- NEVER store sensitive data in local storage or AsyncStorage
- NEVER store user data in AI
- NEVER log PII or financial data
- ALWAYS use RLS on all tables with user data
- ALWAYS encrypt Plaid tokens with KMS before DB write
- ALWAYS use presigned S3 URLs with expiration
- ALWAYS verify user_id matches authenticated user
- ALWAYS use parameterized queries
- DELETE means DELETE, complete, permanent, irreversible
- Account deletion triggers full 8-step cascade
- When in doubt, more security, not less
