# Deploying the Lender Portal (1099pass.com)

The lender portal is hosted entirely on **AWS**: static files are built and uploaded to **S3**, and **CloudFront** serves them. There is no Vercel or other external host.

---

## Overview

| Item | Details |
|------|---------|
| **URL** | https://1099pass.com (and https://www.1099pass.com, https://lender.1099pass.com per DNS) |
| **Origin** | S3 bucket `pass1099-{env}-lender-portal` |
| **CDN** | CloudFront (distribution ID in CDK outputs; prod example: `E2L2IO6SQNRKCZ`) |
| **Build type** | Static export (Next.js `output: 'export'`) when `BUILD_FOR_S3=true` |

---

## Quick deploy

From the **repo root**:

```bash
./scripts/deploy-lender-portal.sh
```

This:

1. Builds the lender portal with `BUILD_FOR_S3=true` (produces `apps/lender-portal/out/`)
2. Syncs `out/` to `s3://pass1099-prod-lender-portal` (delete removed files)
3. Creates a CloudFront invalidation for `/*`

For **dev** or **staging**:

```bash
./scripts/deploy-lender-portal.sh dev
```

Bucket will be `pass1099-dev-lender-portal`. Override CloudFront ID if needed:

```bash
CLOUDFRONT_ID=YOUR_DIST_ID ./scripts/deploy-lender-portal.sh prod
```

---

## Build requirements

- **Static export:** The portal must be built with **`BUILD_FOR_S3=true`** so Next.js uses `output: 'export'` and writes static HTML/JS to `out/`. A normal `npm run build` (no env var) uses `output: 'standalone'`, which is for running Next as a Node server — that output is **not** uploaded to S3.
- **Dynamic route:** `/dashboard/reports/[id]` has `generateStaticParams()` returning `[{ id: 'new' }]` so the route is valid for static export. Other report IDs are handled client-side after loading.

---

## Environment variables (optional)

Set these when building if you use them:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). Enables GA on all pages including the blog. |
| `NEXT_PUBLIC_API_URL` | API base URL when the portal calls the real backend. |

Example:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX BUILD_FOR_S3=true npm run build --workspace=@1099pass/lender-portal
```

Then run the sync and invalidation steps (or use the script with these set in the environment).

---

## What gets deployed

- **Landing page** (`/`)
- **Blog** (`/blog`, `/blog/[slug]`) — SEO content for gig workers / 1099 mortgages and loans
- **Auth** (`/login`, `/register`)
- **Legal** (`/privacy`, `/terms`, `/security`, `/data-use`, `/fcra-disclaimer`)
- **Dashboard** (reports, analytics, criteria, messages, team, settings)
- **Sitemap** (`/sitemap.xml`) and **robots** (`/robots.txt`)

---

## CI/CD (CodeBuild)

The main **buildspec.yml** builds the lender portal with the default config (standalone). It does **not** run `BUILD_FOR_S3=true` or sync to S3. So:

- **CDK deploy** (`./scripts/deploy.sh` or `cdk deploy --all`) updates **infrastructure** (including the S3 bucket and CloudFront) but does **not** upload portal files.
- To have the **live site** (1099pass.com) updated, run **`./scripts/deploy-lender-portal.sh`** (or equivalent) after the build, either:
  - Manually from a machine with AWS CLI and the repo, or
  - By adding a **post_build** step in CodeBuild that sets `BUILD_FOR_S3=true`, builds the portal, syncs `apps/lender-portal/out` to the bucket (name from CDK outputs), and invalidates CloudFront.

---

## DNS and CloudFront

See **[DNS-SETUP.md](./DNS-SETUP.md)** for mapping 1099pass.com, www, and lender.1099pass.com to the CloudFront distribution. The same distribution serves the static portal from S3.

---

## Troubleshooting

- **No Blog / old content:** Redeploy with `./scripts/deploy-lender-portal.sh` so the latest `out/` (including `/blog`) is synced and CloudFront is invalidated.
- **403/404 on direct URL:** CloudFront is configured to serve `/index.html` for 403/404 so client-side routing works. If a path still fails, check that the path was included in the static export (e.g. under `out/`).
- **Bucket name:** Use the bucket created by the Storage stack: `pass1099-{environment}-lender-portal`. For prod, `pass1099-prod-lender-portal`.
