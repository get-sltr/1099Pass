# 1099Pass

**Income Verification for the Gig Economy** by SLTR Digital LLC

1099Pass aggregates, normalizes, and translates gig worker and 1099 contractor income data into clean, standardized, lender-ready reports.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         1099Pass Platform                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Borrower App │  │ Lender Portal│  │    API Gateway       │  │
│  │ (React Native)│  │  (Next.js)   │  │ (REST + WebSocket)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┴──────────────────────┘              │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                    AWS Lambda Functions                  │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │
│  │  │  Auth   │ │ Reports │ │ Matching│ │  Messaging  │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                     Data Layer                           │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │PostgreSQL│  │ DynamoDB │  │    S3    │  │  Redis  │ │    │
│  │  │ (RDS)    │  │(Sessions)│  │(Documents)│  │(Cache)  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              External Integrations                       │    │
│  │  ┌──────┐  ┌─────────┐  ┌─────────┐  ┌───────────────┐ │    │
│  │  │Plaid │  │ Cognito │  │StoreKit │  │ Gig Platforms │ │    │
│  │  └──────┘  └─────────┘  └─────────┘  └───────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
1099pass/
├── apps/
│   ├── borrower-app/       # React Native mobile app (Expo)
│   └── lender-portal/      # Next.js web application
├── packages/
│   ├── api/                # Lambda handlers and business logic
│   ├── shared/             # Shared types, constants, utilities
│   └── database/           # Database migrations and schemas
├── infrastructure/
│   └── lib/
│       ├── stacks/         # CDK stacks (API, Auth, DB, etc.)
│       └── constructs/     # Reusable CDK constructs
├── scripts/                # Deployment and utility scripts
└── docs/                   # ADRs and documentation
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native, Expo, TypeScript |
| Web Portal | Next.js 14, React, Tailwind CSS, shadcn/ui |
| API | AWS Lambda, API Gateway, Node.js |
| Database | PostgreSQL (RDS), DynamoDB |
| Auth | AWS Cognito |
| Storage | S3, CloudFront |
| Infrastructure | AWS CDK, TypeScript |
| CI/CD | AWS CodePipeline, CodeBuild |
| Monitoring | CloudWatch, X-Ray |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- AWS CLI configured
- Docker (for local PostgreSQL)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
# Start lender portal (http://localhost:3000)
pnpm --filter @1099pass/lender-portal dev

# Start borrower app (Expo)
pnpm --filter @1099pass/borrower-app start

# Run all tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build all packages
pnpm build
```

## Deployment

### AWS Setup (First Time)

```bash
# Configure AWS credentials
aws configure

# Bootstrap CDK (one-time per account/region)
cd infrastructure && npx cdk bootstrap

# Set up secrets
./scripts/setup-aws.sh
```

### Deploy to Environment

```bash
# Deploy to dev
./scripts/deploy.sh dev

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh prod
```

### Seed Test Data

```bash
# Load test data into dev/staging
./scripts/seed-data.sh dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | dev, staging, or prod |
| `AWS_REGION` | AWS region (default: us-east-1) |
| `PLAID_CLIENT_ID` | Plaid API client ID |
| `PLAID_SECRET` | Plaid API secret |

Secrets are stored in AWS Secrets Manager and accessed at runtime.

**Note:** Payments are handled via Apple App Store (StoreKit) and Google Play Billing, not through server-side payment processing.

## Key Features

### For Borrowers
- Connect gig platforms (Uber, Lyft, DoorDash, Upwork, etc.)
- Link bank accounts for income verification via Plaid
- Generate shareable income verification reports
- Track loan readiness score (0-100)
- Communicate with interested lenders
- Subscribe to premium features

### For Lenders
- Browse verified borrower income reports
- Set lending criteria (income, geography, gig types)
- Filter and search reports
- Contact qualified borrowers
- View analytics dashboard
- Manage team members and permissions

## Infrastructure Stacks

| Stack | Purpose |
|-------|---------|
| NetworkingStack | VPC, subnets, security groups |
| SecurityStack | KMS keys, Secrets Manager |
| DatabaseStack | RDS PostgreSQL, DynamoDB tables |
| AuthStack | Cognito user pools |
| StorageStack | S3 buckets, CloudFront |
| ComputeStack | Lambda functions |
| ApiStack | API Gateway, WAF |
| MonitoringStack | CloudWatch alarms, dashboards |
| CicdStack | CodePipeline, CodeBuild |

## Monitoring

- **Dashboard**: CloudWatch dashboard at `1099pass-{env}`
- **Alarms**: SNS alerts for API errors, high latency, DB issues
- **Logs**: CloudWatch Logs with 30-day retention
- **Tracing**: X-Ray for request tracing

## Security

- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- AWS WAF with OWASP Top 10 protection
- Cognito authentication with MFA support
- Role-based access control
- Audit logging for sensitive operations
- See [docs/SECURITY.md](./docs/SECURITY.md) for details

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Authenticate user |
| GET | /borrowers/me | Get borrower profile |
| GET | /reports | List income reports |
| POST | /reports | Generate new report |
| GET | /reports/:id | Get report details |
| POST | /reports/:id/share | Create share token |
| GET | /messages | List messages |
| POST | /messages | Send message |

## License

Proprietary - SLTR Digital LLC. All Rights Reserved.

## Support

- Documentation: https://docs.1099pass.com
- Email: support@1099pass.com
