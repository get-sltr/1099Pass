# ADR 001: Technology Stack Selection

## Status
Accepted

## Date
2025-01-15

## Context

We need to select a technology stack for 1099Pass that:
- Supports both mobile (borrowers) and web (lenders) clients
- Scales cost-effectively with usage
- Enables rapid development with a small team
- Meets security requirements for financial data
- Integrates with third-party financial services (Plaid, Stripe)

## Decision

### Frontend

**Borrower App: React Native with Expo**
- Cross-platform mobile development (iOS + Android)
- Expo simplifies build/deploy pipeline
- Large ecosystem and community support
- TypeScript for type safety

**Lender Portal: Next.js 14**
- Server-side rendering for SEO and performance
- App Router for modern React patterns
- API routes for BFF pattern if needed
- Tailwind CSS + shadcn/ui for rapid UI development

### Backend

**AWS Lambda + API Gateway**
- Serverless architecture scales with usage
- Pay-per-use cost model
- No server management overhead
- API Gateway handles auth, rate limiting, WAF

### Database

**PostgreSQL (RDS) for primary data**
- Relational data model fits borrower/lender/report entities
- Strong ACID compliance for financial data
- JSON support for flexible income source schemas

**DynamoDB for sessions and real-time data**
- Low-latency session storage
- WebSocket connection tracking
- Notification queues
- TTL for automatic cleanup

### Authentication

**AWS Cognito**
- Managed user pools and identity
- Built-in MFA support
- JWT tokens integrate with API Gateway
- Social login capability for future

### Infrastructure

**AWS CDK (TypeScript)**
- Infrastructure as code
- Same language as application code
- Strong typing and IDE support
- Modular stack organization

## Alternatives Considered

### Mobile: Flutter
- Rejected: Smaller talent pool, Dart learning curve

### Backend: Express.js on ECS/Fargate
- Rejected: Higher baseline cost, more operational overhead

### Database: MongoDB
- Rejected: Financial data benefits from relational model

### Auth: Auth0
- Rejected: Higher cost at scale, vendor lock-in concerns

## Consequences

### Positive
- Unified TypeScript across stack reduces context switching
- Serverless reduces operational burden
- AWS ecosystem provides security and compliance features
- Rapid iteration possible with chosen frameworks

### Negative
- Lambda cold starts may affect latency (mitigated with provisioned concurrency)
- Vendor lock-in to AWS
- Multiple deployment artifacts to manage

### Risks
- Team must learn AWS CDK patterns
- Cost monitoring needed as Lambda usage grows
