# 1099Pass

Data intelligence and facilitation platform by SLTR Digital LLC. 1099Pass aggregates, normalizes, and translates gig worker and 1099 contractor income data into clean, standardized, lender-ready reports.

## Architecture

- **Borrower App** — React Native (iOS/Android) — gig workers build financial profiles and generate lender-ready income reports
- **Lender Portal** — Next.js (Desktop Web) — loan officers browse verified borrower income reports
- **API** — AWS Lambda handlers with API Gateway
- **Infrastructure** — AWS CDK (Infrastructure as Code)

## Monorepo Structure

```
packages/shared     — Shared types, constants, utilities
packages/api        — Backend Lambda handlers and services
apps/borrower-app   — React Native mobile app (Expo)
apps/lender-portal  — Next.js web application
infrastructure/     — AWS CDK stacks
```

## Getting Started

```bash
npm install
npm run build
```

## Deployment

```bash
./scripts/setup-aws.sh
./scripts/deploy.sh dev
```
