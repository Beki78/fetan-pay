# Merchant Admin Features

This is a comprehensive admin dashboard for merchants managing payments, subscriptions, and business operations.

## 🔹 A. Authentication Features
**Register merchant user**
**Login / Logout**
**Password reset**
**Session management**
**Account approval status**

**Tests**
- Valid login works
- Wrong password → error
- Too many attempts → rate limit
- Password reset link expires properly
- Cannot login if account disabled by admin
- Pending approval status blocks access

## 🔹 B. Dashboard & Analytics Features
**Dashboard metrics display**
**Transaction overview (total, verified, pending)**
**Wallet balance display**
**Recent transactions list**
**Quick actions menu**
**Subscription status overview**

**Analytics page**
**Transaction metrics (success rate, revenue)**
**Statistics trend charts**
**Status distribution charts**
**Period selection (7 days, 30 days, 90 days, year)**
**Advanced analytics (subscription-gated)**

**Tests**
- Dashboard loads with correct metrics
- Charts display proper data
- Period filters work correctly
- Subscription protection works for advanced features

## 🔹 C. Payment & Transaction Management Features
**Unified transactions table**
**Create payment intents manually**
**Payment verification system**
**Multiple payment providers (CBE, TELEBIRR, AWASH, BOA, DASHEN)**
**Transaction status tracking (PENDING, VERIFIED, FAILED, EXPIRED)**
**Payment reference management**
**Verification history tracking**
**Payment claim submission**

**Tests**
- Payment creation works
- Verification process functions correctly
- Status updates properly
- Provider selection works
- Reference validation works

## 🔹 D. Billing & Subscription Features
**Current plan display**
**Plan comparison view**
**Plan upgrade functionality**
**Billing history**
**Usage tracking (verifications used vs limit)**
**Trial period management**
**Subscription status (ACTIVE, CANCELLED, EXPIRED, SUSPENDED, PENDING)**
**Feature gating based on subscription**

**Tests**
- Plan comparison displays correctly
- Upgrade process works
- Usage limits enforced
- Feature access controlled by subscription
- Billing transactions recorded

## 🔹 E. Wallet Management Features
**Wallet balance display**
**Top-up functionality**
**Wallet transaction history**
**Deposit verification**
**Bank selection for deposits**
**Pending deposits tracking**
**Wallet configuration (fees, status)**
**Balance-based verification limits**

**Tests**
- Balance updates correctly
- Top-up process works
- Deposit verification functions
- Transaction history accurate
- Fee calculations correct

## 🔹 F. Tips Management Features
**Tips overview dashboard**
**Tips by vendor tracking**
**Tips by transaction view**
**Payout tracking system**
**Vendor assignment**
**Tips verification status**

**Tests**
- Tips recording works
- Vendor assignment functions
- Payout tracking accurate
- Summary calculations correct

## 🔹 G. User Management Features
**Team member creation**
**User roles management (MERCHANT_OWNER, EMPLOYEE)**
**User status (Active/Inactive)**
**QR code generation for users**
**User details and transaction history**
**Team member limits (subscription-based)**

**Tests**
- User creation works
- Role assignment functions
- Status changes work
- QR codes generate correctly
- Subscription limits enforced

## 🔹 H. Settings & Configuration Features

### Branding (Subscription-gated)
**Custom logo upload**
**Brand colors (primary, secondary)**
**Display name customization**
**Business tagline**
**Powered by badge toggle**
**Live preview**

### API Keys
**API key generation**
**Key display (masked/full)**
**Key revocation**
**Usage examples**
**Rate limiting information**
**Security warnings**

### Payment Providers
**Provider configuration**
**Receiver account management**
**Provider status (enable/disable)**
**Multiple provider support**

### Webhooks
**Webhook endpoint configuration**
**Secret management and regeneration**
**Event selection**
**Delivery logs**
**Test webhook functionality**
**IP whitelisting**
**Signature verification (HMAC-SHA256)**

**Webhook Events:**
- payment.verified
- payment.unverified
- payment.duplicate
- wallet.charged
- wallet.insufficient
- test

**Tests**
- Branding updates work
- API keys generate and revoke properly
- Webhook delivery functions
- Secret regeneration works
- IP whitelist enforced

## 🔹 I. Vendor Management Features
**Vendor creation and editing**
**Vendor details (name, email, phone, branch, team)**
**Vendor status management**
**Vendor listing and actions**

**Tests**
- Vendor CRUD operations work
- Status changes function
- Vendor details update correctly

## 🔹 J. Notifications Features
**Notification center**
**Multiple notification types (PAYMENT_RECEIVED, PAYMENT_FAILED, SYSTEM_ALERT, etc.)**
**Priority levels (HIGH, MEDIUM, LOW, CRITICAL)**
**Mark as read functionality**
**Notification filtering**
**Unread count display**
**Real-time updates**

**Tests**
- Notifications display correctly
- Mark as read functions
- Filtering works
- Unread count accurate
- Real-time updates work

## 🔹 K. Subscription-Based Feature Protection
**Custom branding protection**
**Advanced analytics protection**
**API key limits**
**Webhook limits**
**Team member limits**
**Payment provider limits**
**Verification limits**
**Export functionality protection**

**Feature Limits:**
- customBranding: Boolean
- apiKeys: Number limit
- webhooks: Number limit
- teamMembers: Number limit
- bankAccounts: Number limit
- paymentProviders: Number limit
- verificationsMonthly: Number limit
- advancedAnalytics: Boolean
- exportFunctionality: Boolean
- transactionHistoryDays: Number

**Tests**
- Feature access controlled properly
- Limits enforced correctly
- Upgrade prompts shown
- Feature unlocking works

## 🔹 L. Security Features
**Session-based authentication**
**Protected routes**
**Account approval verification**
**API key authentication**
**Webhook signature verification**
**IP whitelisting**
**Rate limiting (10 requests/minute)**
**Masked sensitive data**

**Tests**
- Authentication required for access
- Protected routes redirect properly
- API security measures work
- Webhook signatures validate
- Rate limits enforced

## 🔹 M. UI/UX Features
**Responsive design (mobile-first)**
**Dark mode support**
**Collapsible sidebar**
**Modal system**
**Toast notifications**
**Loading states**
**Data tables with pagination**
**Form validation**
**Real-time updates**

**Tests**
- Responsive design works on all devices
- Dark mode toggles properly
- Modals function correctly
- Forms validate input
- Loading states display

## 🔹 N. Integration Features
**Multiple payment provider support**
**External API documentation links**
**Email notifications**
**Webhook delivery to external systems**
**Real-time data synchronization**

**Supported Payment Providers:**
- CBE (Commercial Bank of Ethiopia)
- TELEBIRR
- AWASH
- BOA (Bank of Abyssinia)
- DASHEN

**Tests**
- Provider integrations work
- External links function
- Webhook delivery successful
- Data sync accurate

## Summary
- **Total Routes**: 15+ main application routes
- **Components**: 50+ reusable UI components
- **API Services**: 8+ service modules
- **Custom Hooks**: 7+ utility hooks
- **Features**: 50+ distinct features
- **Payment Providers**: 5 supported providers
- **Webhook Events**: 6+ event types
- **Subscription Tiers**: Multiple (Free, Premium, Enterprise)