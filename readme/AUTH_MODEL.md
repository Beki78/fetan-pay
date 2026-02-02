# Auth model and naming

This service uses **Better Auth** for credentials/sessions. We keep merchant membership data separate and
only store relationships in our own tables.

## Responsibilities
- **Better Auth (auth.ts + `@thallesp/nestjs-better-auth`)**
  - Owns users, accounts, sessions, OTP, social login.
  - Exposes `/api/auth` for both admin and merchant-side apps.
- **Merchant accounts (merchant-accounts controller/service)**
  - Creates merchants and their membership records (`MerchantUser` roles: OWNER, ADMIN, SALES/WAITER, ACCOUNTANT).
  - Does **not** manage passwords—invite flows should point users to sign up/sign in via Better Auth.

## Standard naming to use going forward
- Use **`auth`** when referring to Better Auth endpoints and credential lifecycle.
- Use **`merchant-accounts`** (module/tag/route prefix) for onboarding merchants and staff membership.
- Keep role terms consistent with the schema enums: `MERCHANT_OWNER`, `ADMIN`, `ACCOUNTANT`, `SALES`, `WAITER`.

## Next steps (not yet implemented)
- Link `MerchantUser` to Better Auth `User` records (add `userId` FK) once invite/accept flow is wired.
- Add endpoints to invite/accept staff (sales/waiter/etc.), and to verify membership before allowing transaction verification.
- Ensure frontend uses Better Auth for login, then calls merchant-accounts APIs to fetch merchant/staff context.
