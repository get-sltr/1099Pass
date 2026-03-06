# 1099Pass — Test Accounts (All Access)

Use these accounts to sign in to the **1099Pass website** (lender portal) and **borrower app** for development, staging, and QA.

---

## Is the app ready?

**For UI/demo:** Yes. The borrower app runs and you can click through all screens. By default it uses **placeholder/mock data** (scores, reports, documents, lenders, messages, etc.).

**For real data:** Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_USE_REAL_API=true` in the app env, and ensure your API (and auth) are deployed. See **[APP-READINESS.md](./APP-READINESS.md)** for what’s real vs mock and what’s still TODO.

- **Development (local, mock):** Run `npm run start` from repo root. You can sign in with any email/password; all data is fake.
- **With real API:** In `apps/borrower-app` set `EXPO_PUBLIC_API_URL` to your API base URL and `EXPO_PUBLIC_USE_REAL_API=true`, then run the app. Use the test accounts below once auth is wired to Cognito.

---

## Credentials

| App | Email | Password |
|-----|--------|----------|
| **Borrower app** (mobile / web) | `test-borrower@1099pass.com` | `TestPass123!` |
| **Lender portal** (website) | `test-lender@1099pass.com` | `TestPass123!` |

Same password for both. **Do not use these in production.**

---

## How to create the accounts

After the **Auth stack** is deployed (Cognito User Pool exists), run:

```bash
# From repo root
./scripts/create-test-accounts.sh dev
```

This creates the two Cognito users with the credentials above.

To also **seed the database** with a borrower and lender record linked to these users (so API calls work end-to-end):

```bash
./scripts/create-test-accounts.sh dev --seed-db
```

Requires:

- AWS CLI configured
- Auth stack deployed: `cd infrastructure && npx cdk deploy Pass1099-Auth-dev`
- For `--seed-db`: DB secret `1099pass-dev-db-credentials` in Secrets Manager and network access to the DB

---

## Where to use them

### Borrower app (Expo / mobile or borrower web)

- **Run locally:** From repo root: `npm run start --workspace=@1099pass/borrower-app` or `cd apps/borrower-app && npm run start`. Then open in iOS simulator, Android emulator, or web.
- **URL / app:** Your borrower app build (e.g. Expo dev client or staging URL).
- **Login:** Use **Borrower** email + password above (or any email/password in dev mock mode).
- **Access:** Borrower dashboard, connect accounts (Plaid), generate reports, AI coach, documents.

### Lender portal (Next.js website)

- **URL:** https://1099pass.com (or https://lender.1099pass.com, or local `npm run dev` in `apps/lender-portal`).
- **Login:** Use **Lender** email + password above.
- **Access:** Lender dashboard, reports, criteria, messages, analytics; **Blog** at `/blog` (no login required).

---

## Development / mock auth

- **Borrower app:** In development (`NODE_ENV=development`), the app may use **mock auth** and accept any email/password without calling the API. To test real Cognito + API, use a non-dev build or point the app at your deployed API and use the test borrower credentials.
- **Lender portal:** Login may be mocked in dev (see `apps/lender-portal/src/store/auth-store.ts`). Use the test lender credentials when the portal is wired to Cognito and the API.

---

## Resetting the test accounts

To reset password or re-create users:

1. Delete the users in Cognito (AWS Console → Cognito → User Pools → pass1099-dev-users → Users), or
2. Re-run `./scripts/create-test-accounts.sh dev` (script creates or updates users and sets the password).

Then run `./scripts/create-test-accounts.sh dev --seed-db` again if you need DB rows updated with the new Cognito sub.

---

## Security

- **Staging/dev only.** Do not create or document these accounts in production.
- Rotate the password if the credentials are ever exposed.
- Cognito password policy: min 12 characters, upper + lower + digit + symbol (e.g. `TestPass123!`).
