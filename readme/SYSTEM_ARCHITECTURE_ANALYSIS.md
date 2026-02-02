# FetanPay System Architecture Analysis

## Overview

FetanPay is a payment verification system with multiple frontend applications and a centralized NestJS backend server. The system uses Better Auth for authentication and Prisma with PostgreSQL for data persistence.

---

## System Components

### 1. **Server (Backend)** - Port 3003

**Technology Stack:**

- NestJS (Node.js framework)
- Better Auth (authentication)
- Prisma ORM (PostgreSQL database)
- Swagger (API documentation)

**Key Features:**

- RESTful API with `/api/v1` prefix
- Better Auth integration at `/api/auth`
- CORS enabled for all frontend ports
- Throttling protection
- Email service for OTP verification

**Main Modules:**

- **Merchants Module** (`/api/v1/merchant-accounts`)
  - Self-registration
  - Admin merchant creation
  - Merchant approval/rejection
  - Merchant user management (employees)
- **Payments Module** (`/api/v1/payments`)
  - Order creation
  - Payment verification
  - Receiver account management
  - Payment claims submission
  - Tips summary
- **Transactions Module** (`/api/v1/transactions`)
  - QR code verification
  - Transaction listing
  - Verified-by-user queries
- **Payment Providers Module** (`/api/v1/payment-providers`)
  - Provider catalog management
  - Provider status (ACTIVE, COMING_SOON, DISABLED)
- **Verifier Module** (`/api/v1/verify`)
  - Bank-specific verification strategies
  - Supports: CBE, TeleBirr, Awash, BOA, Dashen
  - PDF parsing, web scraping, image processing

**Database Schema (Prisma):**

- `User` - Better Auth users
- `Session` - User sessions
- `Account` - OAuth accounts
- `Merchant` - Business accounts (PENDING/ACTIVE/SUSPENDED)
- `MerchantUser` - Employee memberships (OWNER/ADMIN/ACCOUNTANT/SALES/WAITER)
- `Transaction` - Verified payment transactions
- `Payment` - Payment claims/verifications
- `Order` - Payment orders
- `PaymentProvider` - Bank/provider catalog
- `MerchantReceiverAccount` - Merchant bank account configurations

---

### 2. **Merchant Admin** (Vendor Dashboard) - Port 3001

**Technology Stack:**

- Next.js 16 (App Router)
- Better Auth Client
- React 19
- Tailwind CSS
- Redux Toolkit

**Purpose:**
Full-featured dashboard for merchants to manage their business operations.

**Key Features:**

- **Authentication:**

  - Sign in/Sign up with Better Auth
  - Session management via `useSession` hook
  - Protected routes with authentication guards
  - API route handler at `/api/auth/[...all]`

- **Dashboard Pages:**
  - **Home** - Overview metrics, subscription status, quick actions
  - **Payments** - Transaction history, payment intents, filters
  - **Analytics** - Revenue trends, transaction metrics
  - **Wallet** - Balance, top-up, transaction history
  - **Billing** - Subscription plans, upgrade/downgrade
  - **Payment Providers** - Configure bank accounts (CBE, TeleBirr, etc.)
  - **Users/Team** - Manage employees (create, edit, deactivate)
  - **Settings** - Profile, business info, payment accounts
  - **Branding** - Customize logo and colors
  - **Webhooks** - API integration
  - **API Docs** - Documentation

**API Integration:**

- Base URL: `http://localhost:3003`
- Uses Better Auth client for authentication
- Redux Toolkit for state management
- Custom hooks: `useSession`, `useAuth`, `useAccountStatus`

**Authentication Flow:**

1. User signs in via Better Auth (`authClient.signIn`)
2. Session stored in cookies (httpOnly, secure)
3. `useSession` hook checks session on mount
4. Protected routes redirect to `/signin` if unauthenticated
5. API calls include credentials for session validation

---

### 3. **Admin Panel** - Port 3001 (or different port)

**Technology Stack:**

- Next.js 16 (App Router)
- Better Auth Client
- React 19
- Tailwind CSS

**Purpose:**
Administrative dashboard for system administrators to manage merchants, users, and system settings.

**Key Features:**

- Merchant management (approve, reject, suspend)
- User management across all merchants
- System-wide analytics
- Payment provider catalog management
- Role-based access control (SUPERADMIN, ADMIN)

**Similar Structure to Merchant Admin:**

- Uses same Better Auth integration
- Same authentication flow
- Different UI/UX for admin-specific tasks

---

### 4. **Merchant App** (Mobile/Point-of-Sale) - Port 3000

**Technology Stack:**

- Next.js 16
- Better Auth Client
- React 19
- React Hook Form + Zod
- HTML5 QR Scanner
- Redux Toolkit

**Purpose:**
Lightweight app for waiters/staff to verify payments in real-time.

**Key Features:**

- **Login Page** (`/login`)
  - Email/password authentication
  - Better Auth integration
  - Session management
- **Scan Page** (`/scan`)
  - Bank selection (CBE, TeleBirr, Awash, BOA)
  - QR code scanning (camera)
  - Manual transaction reference entry
  - Amount verification
  - Tip capture
  - Real-time verification results
  - Verification history sidebar

**API Integration:**

- Base URL: `http://localhost:3003/api/v1`
- Endpoints:
  - `POST /payments/verify` - Verify payment
  - `GET /payments/verification-history` - Get history
  - `POST /transactions/verify-from-qr` - QR verification

**Authentication:**

- Uses Better Auth client
- `useSession` hook for session management
- Protected routes redirect to `/login` if unauthenticated

---

## Authentication Architecture

### Better Auth Configuration (Server)

Located in `server/auth.ts`:

```typescript
- Base URL: http://localhost:3003
- Base Path: /api/auth
- Database: Prisma adapter (PostgreSQL)
- Social Providers: Google OAuth
- Email/Password: Enabled
- Email Verification: Disabled in dev, enabled in production
- OTP Plugin: 6-digit codes, 5-minute expiry
- Admin Plugin: Role-based access (SUPERADMIN, ADMIN, MERCHANT_OWNER, etc.)
- Session: 7-day expiry, cookie-based
```

### Frontend Auth Clients

**Merchant Admin & Admin:**

```typescript
// lib/auth-client.ts
- Base URL: http://localhost:3003
- Plugins: phoneNumberClient, customSessionClient, adminClient
- Credentials: include (for cookie-based sessions)
```

**Merchant App:**

```typescript
// hooks/useAuth.ts
- Uses Better Auth client
- Email/password sign in
- Session management
```

---

## Data Flow Examples

### 1. **Merchant Registration Flow**

```
1. Merchant fills self-registration form (merchant-admin)
2. POST /api/v1/merchant-accounts/self-register
3. Server creates:
   - Merchant record (status: PENDING)
   - MerchantUser record (role: MERCHANT_OWNER, status: INVITED)
4. Owner receives email invite
5. Owner signs up via Better Auth (/api/auth/sign-up)
6. MerchantUser.userId linked to User record
7. Admin approves merchant → status: ACTIVE
```

### 2. **Payment Verification Flow (Merchant App)**

```
1. Waiter logs in via Better Auth
2. Selects bank (e.g., CBE)
3. Enters amount or scans QR code
4. POST /api/v1/payments/verify
   - Body: { provider, reference, claimedAmount }
5. Server:
   - Fetches transaction from bank (via verifier module)
   - Checks receiver account matches merchant config
   - Checks amount matches
   - Creates/updates Transaction record
   - Creates Payment record (status: VERIFIED/UNVERIFIED)
6. Response returned to frontend
7. UI displays verification result
```

### 3. **Transaction History Flow (Merchant Admin)**

```
1. User authenticated via Better Auth session
2. GET /api/v1/payments/verification-history
   - Headers: Cookie (session token)
   - Query: merchantId (from session), filters
3. Server:
   - Validates session
   - Extracts merchantId from MerchantUser relationship
   - Queries Payment records for merchant
   - Returns paginated results
4. Frontend displays in table with filters
```

---

## API Endpoints Summary

### Authentication (Better Auth)

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/verify-email` - Email verification

### Merchants

- `POST /api/v1/merchant-accounts/self-register` - Self-registration
- `POST /api/v1/merchant-accounts` - Admin creates merchant
- `GET /api/v1/merchant-accounts` - List merchants
- `PATCH /api/v1/merchant-accounts/:id/approve` - Approve merchant
- `PATCH /api/v1/merchant-accounts/:id/reject` - Reject merchant
- `POST /api/v1/merchant-accounts/:id/users` - Create employee
- `GET /api/v1/merchant-accounts/:id/users` - List employees

### Payments

- `POST /api/v1/payments/orders` - Create order
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/claims` - Submit payment claim
- `GET /api/v1/payments/verification-history` - Get history
- `GET /api/v1/payments/tips/summary` - Tips summary
- `POST /api/v1/payments/receiver-accounts/active` - Set active receiver

### Transactions

- `POST /api/v1/transactions/verify-from-qr` - Verify from QR
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/verified-by/:userId` - Get by verifier

### Payment Providers

- `GET /api/v1/payment-providers` - List providers
- `POST /api/v1/payment-providers` - Create/update provider

---

## Environment Variables

### Server (.env)

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_BASE_URL=http://localhost:3003
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
REQUIRE_EMAIL_VERIFICATION=false (dev) / true (prod)
PORT=3003
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003/api/v1
```

---

## Security Features

1. **Authentication:**

   - Better Auth handles password hashing
   - Session tokens in httpOnly cookies
   - CSRF protection
   - OAuth integration (Google)

2. **Authorization:**

   - Role-based access control (RBAC)
   - Merchant-scoped data access
   - Admin-only endpoints

3. **API Protection:**

   - Throttling (10 requests/minute)
   - CORS configuration
   - Input validation (class-validator)

4. **Data Security:**
   - Prisma ORM prevents SQL injection
   - Parameterized queries
   - Transaction isolation

---

## Database Relationships

```
User (Better Auth)
  ├── MerchantUser (many-to-one)
  │     └── Merchant (many-to-one)
  │           ├── Payment (one-to-many)
  │           ├── Transaction (one-to-many)
  │           ├── Order (one-to-many)
  │           └── MerchantReceiverAccount (one-to-many)
  └── Session (one-to-many)

Transaction
  └── Payment (one-to-many, optional)

Payment
  ├── Order (many-to-one)
  ├── Transaction (many-to-one, optional)
  ├── MerchantReceiverAccount (many-to-one, optional)
  └── MerchantUser (many-to-one, verifiedBy)
```

---

## Development Workflow

1. **Start Server:**

   ```bash
   cd server
   npm run start:dev
   # Runs on http://localhost:3003
   ```

2. **Start Merchant Admin:**

   ```bash
   cd merchant-admin
   npm run dev
   # Runs on http://localhost:3001
   ```

3. **Start Admin Panel:**

   ```bash
   cd admin
   npm run dev
   # Runs on http://localhost:3001 (or different port)
   ```

4. **Start Merchant App:**
   ```bash
   cd merchant
   npm run dev
   # Runs on http://localhost:3000
   ```

---

## Integration Points for Better Auth

### Current State:

✅ Server has Better Auth configured
✅ Merchant Admin uses Better Auth client
✅ Admin Panel uses Better Auth client
✅ Merchant App uses Better Auth client
✅ Session management implemented
✅ Protected routes implemented

### Future Enhancements:

- [ ] Add more OAuth providers (GitHub, Facebook)
- [ ] Implement 2FA/MFA
- [ ] Add password reset flow
- [ ] Email verification in production
- [ ] Session refresh tokens
- [ ] API key authentication for webhooks

---

## Key Files Reference

### Server

- `server/auth.ts` - Better Auth configuration
- `server/src/main.ts` - NestJS bootstrap
- `server/src/app.module.ts` - Main module
- `server/prisma/schema.prisma` - Database schema

### Merchant Admin

- `merchant-admin/src/lib/auth-client.ts` - Auth client
- `merchant-admin/src/hooks/useSession.ts` - Session hook
- `merchant-admin/src/app/api/auth/[...all]/route.ts` - Auth API route
- `merchant-admin/src/app/(admin)/layout.tsx` - Protected layout

### Admin

- `admin/src/lib/auth-client.ts` - Auth client
- `admin/src/lib/auth.ts` - Auth config

### Merchant

- `merchant/src/hooks/useAuth.ts` - Auth hook
- `merchant/src/hooks/useSession.ts` - Session hook
- `merchant/src/app/login/page.tsx` - Login page
- `merchant/src/app/scan/page.tsx` - Verification page

---

## Summary

The FetanPay system is a well-architected payment verification platform with:

- **Centralized authentication** via Better Auth
- **Multi-tenant architecture** (merchants, users, roles)
- **Real-time payment verification** via bank integrations
- **Scalable frontend** with Next.js and React
- **RESTful API** with NestJS
- **Type-safe database** with Prisma

All components are integrated and working together, with Better Auth handling authentication across all applications.
