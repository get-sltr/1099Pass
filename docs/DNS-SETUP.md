# DNS Setup for 1099Pass (Porkbun)

This guide explains how to configure DNS records on Porkbun to connect your 1099pass.com domain to AWS.

## Overview

| Subdomain | Purpose | AWS Service |
|-----------|---------|-------------|
| `1099pass.com` | Marketing site | CloudFront |
| `www.1099pass.com` | Redirect to apex | CloudFront |
| `app.1099pass.com` | Borrower web app | CloudFront |
| `lender.1099pass.com` | Lender portal | CloudFront |
| `api.1099pass.com` | API Gateway | API Gateway Custom Domain |

## Step 1: SSL Certificate Validation

Before anything works, you must validate your SSL certificate.

1. Go to [AWS Certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. Find your certificate for `1099pass.com`
3. Click on it to see validation records
4. For each domain, you'll see a CNAME record needed

Add these to Porkbun:

| Type | Host | Answer |
|------|------|--------|
| CNAME | `_abc123.1099pass.com` | `_xyz789.acm-validations.aws.` |

(The actual values will be shown in ACM)

**Wait for validation** - This can take 5-30 minutes. The certificate status will change from "Pending validation" to "Issued".

## Step 2: Get AWS Endpoints

After running `./scripts/deploy.sh dev`, you'll get outputs like:

```
StorageStack.PortalDistributionDomain = d1234abcd.cloudfront.net
ApiStack.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/dev
```

Note these values for the DNS records below.

## Step 3: Add DNS Records on Porkbun

Log into [Porkbun](https://porkbun.com/) → Domain Management → 1099pass.com → DNS Records

### A. Root Domain (1099pass.com)

For the root domain, you have two options:

**Option 1: ALIAS/ANAME (if Porkbun supports it)**
| Type | Host | Answer |
|------|------|--------|
| ALIAS | ` ` (blank) | `d1234abcd.cloudfront.net` |

**Option 2: Use Porkbun URL Forwarding**
Forward `1099pass.com` to `https://www.1099pass.com`

### B. WWW Subdomain

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `www` | `d1234abcd.cloudfront.net` | 600 |

### C. Lender Portal

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `lender` | `d1234abcd.cloudfront.net` | 600 |

### D. Borrower App (Web)

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `app` | `d1234abcd.cloudfront.net` | 600 |

### E. API Gateway

After deploying, set up a custom domain in API Gateway:

1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Custom domain names → Create
3. Domain name: `api.1099pass.com`
4. Select your ACM certificate
5. Create

This gives you an "API Gateway domain name" like `d-abc123.execute-api.us-east-1.amazonaws.com`

Add to Porkbun:
| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `api` | `d-abc123.execute-api.us-east-1.amazonaws.com` | 600 |

## Step 4: Configure CloudFront Alternate Domains

For each CloudFront distribution, add alternate domain names:

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront)
2. Select your distribution
3. Edit settings
4. Add alternate domain names:
   - `www.1099pass.com`
   - `lender.1099pass.com`
   - `app.1099pass.com`
5. Select your ACM certificate
6. Save changes

## Step 5: Verify Setup

Test each endpoint:

```bash
# Check DNS propagation
dig www.1099pass.com
dig api.1099pass.com
dig lender.1099pass.com

# Test HTTPS
curl -I https://www.1099pass.com
curl -I https://api.1099pass.com/health
curl -I https://lender.1099pass.com
```

## Email Records (Optional)

If you want email for @1099pass.com:

### For Google Workspace
| Type | Host | Answer | Priority |
|------|------|--------|----------|
| MX | ` ` | `aspmx.l.google.com` | 1 |
| MX | ` ` | `alt1.aspmx.l.google.com` | 5 |
| MX | ` ` | `alt2.aspmx.l.google.com` | 5 |
| TXT | ` ` | `v=spf1 include:_spf.google.com ~all` | - |

### For AWS SES
| Type | Host | Answer |
|------|------|--------|
| MX | ` ` | `inbound-smtp.us-east-1.amazonaws.com` |
| TXT | ` ` | `v=spf1 include:amazonses.com ~all` |

## Troubleshooting

### Certificate not validating
- Ensure CNAME records are exact (no trailing dots in Porkbun)
- Wait up to 30 minutes
- Check for typos

### CloudFront 403 errors
- Ensure alternate domain name is added to distribution
- Ensure ACM certificate is selected
- Check S3 bucket policy allows CloudFront access

### API Gateway 403 errors
- Ensure custom domain is mapped to API stage
- Check base path mapping is correct

### DNS not resolving
- Use `dig` to check propagation
- TTL may need to expire (check existing records)
- Try flushing local DNS: `sudo dscacheutil -flushcache`
