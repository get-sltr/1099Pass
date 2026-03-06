# Borrower App — Readiness: Real vs Placeholder Data

The borrower app **UI and flows are built**, but in **development** it runs almost entirely on **placeholder/mock data**. Nothing you see (dashboard score, reports, documents, lenders, messages, etc.) is from a live backend unless you explicitly enable and connect to the API.

---

## What’s placeholder (fake) in dev

When you run the app locally (`npm run start`), the following use **hardcoded mock data**:

| Area | What you see | Source |
|------|----------------|--------|
| **Auth** | Login/signup “succeeds” with any email/password | `auth-store.ts` — mock user + token, no Cognito/API |
| **Dashboard** | Score, grade, activity list | `dashboard.tsx` — `MOCK_ACTIVITIES`; score from store (mock) |
| **Profile** | Name, income sources, financial summary | `profile-store.ts` — `MOCK_PROFILE`, `MOCK_INCOME_SOURCES` |
| **Reports** | List of reports, share links | `report-store.ts` + `reports.tsx` — `MOCK_REPORTS` |
| **Documents** | Uploaded docs list | `document-store.ts` + `documents.tsx` — `MOCK_DOCUMENTS` |
| **Lenders** | Lender cards, filters | `lender-store.ts` + `lenders.tsx` — `MOCK_LENDERS` + mock score |
| **Messages** | Conversations, chat | `messaging-store.ts` + `messages.tsx` — `MOCK_CONVERSATIONS` |
| **Notifications** | Bell icon, list | `notification-store.ts` — `MOCK_NOTIFICATIONS` |
| **Subscription** | Plan, billing, usage | `subscription-store.ts` — `MOCK_SUBSCRIPTION` |
| **Onboarding** | Connect accounts, income sources | `connect-accounts.tsx` — “Mock connected bank”; `income-sources.tsx` — mock data |
| **Profile complete** | Initial score | `profile-complete.tsx` — mock score |

So yes: **in dev, these are all place cards / fake data. The app is not “ready” for real users until these are wired to your API and services.**

---

## What’s implemented but not wired in the app

- **API client** (`src/services/api.ts`) — axios, auth header, retries, base URL from `EXPO_PUBLIC_API_URL`.
- **Stores** — Each store has a “real” path that calls the API when **not** in the mock branch (e.g. `api.get('/profile')`, `api.get('/reports')`). In dev they skip that and use mocks.
- **Backend** — The `packages/api` service has real endpoints (auth, profile, reports, documents, Plaid, etc.). The app just doesn’t call them by default in development.

So the app is structured to use real data once auth and API URL are correct; the gap is **default behavior and wiring**.

---

## What’s not implemented or only stubbed

| Feature | Status |
|--------|--------|
| **Real login/signup** | App uses mock auth in dev. Production path calls `POST /auth/login` (and similar); backend must implement Cognito (or your auth) and return token + user. |
| **Registration API** | `register.tsx` has `// TODO: Implement registration API call`. |
| **Forgot password** | `forgot-password.tsx` — TODOs for send code, verify code, reset password. |
| **Verify identity** | `verify-identity.tsx` — `// TODO: Call API to submit verification documents`. |
| **Plaid / connect accounts** | `connect-accounts.tsx` — `// TODO: Initialize Plaid Link`; currently mocks a connected bank. |
| **Document upload** | Store has upload flow; backend endpoints must be deployed and called. |
| **Delete account** | `settings.tsx` — `// TODO: Call API to delete account`. |
| **Support / new conversation** | `messages.tsx` — `// TODO: Create new support conversation`. |
| **Share report** | `reports.tsx` — `// TODO: Implement sharing functionality`. |
| **Profile save** | `profile.tsx` — `// TODO: Save profile changes`. |
| **Chat report selector** | `chat.tsx` — `// TODO: Show report selector modal`. |

---

## How to use real data (when backend is running)

1. **Point the app at your API**  
   Set in `apps/borrower-app/.env` (or your env source):
   ```bash
   EXPO_PUBLIC_API_URL=https://your-api.example.com
   EXPO_PUBLIC_USE_REAL_API=true
   ```
   Restart the app (`npx expo start --clear`).

2. **Use real auth**  
   Backend must expose login/signup (e.g. Cognito) and return the shape the app expects (token, refreshToken, user). Until that’s in place, the app will continue to use mock auth in dev.

3. **Stores**  
   When `EXPO_PUBLIC_USE_REAL_API=true`, the app will use the real API paths in the stores (profile, reports, documents, lenders, etc.) instead of mocks, so you can test against a live backend.

---

## Summary

- **UI/navigation:** Built; you can click through the whole flow.
- **Data in dev:** Almost all placeholder/fake (scores, reports, documents, lenders, messages, etc.).
- **Backend:** Exists in `packages/api`; app is designed to call it when not in mock mode.
- **To be “ready” for real users:** Wire auth (Cognito + login/signup/forgot password), set API URL and real-api flag, implement the TODOs above (registration, verify identity, Plaid, document upload, delete account, sharing, profile save, support), and test with real data.

So: **yes — right now these are all place cards and fake data; the app is not ready for production until those pieces are implemented and connected to your backend.**
