# Admin App Features

This is a comprehensive super admin dashboard for managing the entire FetanPay platform, merchants, subscriptions, and system operations.

## 🔹 A. Authentication & User Management Features
**Email/password authentication**
**Social authentication (Google, Facebook, TikTok)**
**OTP-based authentication**
**Session management with auto-refresh**
**Role-based access control (admin role guard)**
**Password reset with OTP verification**
**Multi-factor authentication support**

**Tests**
- Valid login works with all methods
- Wrong credentials → error
- OTP verification works
- Session persistence works
- Role-based access enforced
- Password reset flow works

## 🔹 B. Merchant Management & Oversight Features
**Merchant listing with search and filtering**
**Merchant status management (PENDING, ACTIVE)**
**Merchant approval/rejection workflow**
**Merchant details view (contact info, TIN, status)**
**Merchant user management (activate/deactivate team members)**
**Merchant banning with notifications**
**Merchant branding oversight (logo, colors, display name)**
**Merchant wallet configuration**

**Tests**
- Merchant listing loads correctly
- Search and filtering work
- Approval/rejection process works
- Status updates properly
- User management functions
- Branding settings accessible

## 🔹 C. Plan & Subscription Management Features
**Plan creation with flexible pricing**
**Plan management (edit, update, delete, archive)**
**Plan statistics (active subscribers, monthly revenue)**
**Plan assignment to merchants (immediate/scheduled)**
**Plan duration types (permanent/temporary)**
**Subscription tracking and monitoring**
**Billing cycles (MONTHLY, YEARLY, WEEKLY, DAILY)**
**Plan features and limits definition**
**Plan comparison displays**

**Tests**
- Plan CRUD operations work
- Statistics display correctly
- Assignment process works
- Billing cycles function
- Feature limits enforced

## 🔹 D. Payment & Transaction Oversight Features
**Payment listing with filtering and search**
**Payment details view (provider, amount, status)**
**Payment verification system**
**Payment provider management (CBE, TELEBIRR, AWASH, BOA, DASHEN)**
**Payment provider configuration (enable/disable)**
**Transaction analytics and breakdown**
**Payment intent creation**
**Transaction export functionality**

**Supported Payment Providers:**
- CBE (Commercial Bank of Ethiopia)
- TELEBIRR
- AWASH
- BOA (Bank of Abyssinia)
- DASHEN
- AMHARA
- BIRHAN
- CBEBIRR
- COOP
- ENAT
- GADDA
- HIBRET
- WEGAGEN

**Tests**
- Payment listing works
- Provider management functions
- Verification process works
- Analytics display correctly
- Export functionality works

## 🔹 E. Billing & Pricing Management Features
**Billing transaction tracking (PENDING, VERIFIED, FAILED, EXPIRED)**
**Billing history and records**
**Pricing receiver management**
**Pricing receiver status control**
**Pricing payment verification**
**Billing period tracking**
**Revenue tracking per plan and merchant**

**Tests**
- Billing transactions tracked correctly
- Receiver management works
- Payment verification functions
- Revenue calculations accurate

## 🔹 F. Wallet Management Features
**Wallet receiver account management**
**Wallet transaction tracking (deposits, charges, refunds, adjustments)**
**Merchant wallet configuration (charge type, minimum balance)**
**Manual deposit functionality**
**Wallet balance monitoring**
**Wallet analytics and trends**

**Wallet Transaction Types:**
- DEPOSIT
- CHARGE
- REFUND
- ADJUSTMENT

**Tests**
- Wallet receivers managed correctly
- Transaction tracking works
- Configuration updates properly
- Manual deposits function
- Analytics display correctly

## 🔹 G. Communications & Notifications Features
**Email campaign creation and management**
**SMS campaign functionality**
**Email template management with variables**
**Campaign management (draft, schedule, send, pause, cancel)**
**Audience segmentation (all merchants, pending, active, high-volume, new signups)**
**Campaign analytics (delivery rate, open rate, click rate)**
**Email and SMS delivery logs**
**Engagement tracking (opens, clicks, bounces, unsubscribes)**
**Cost tracking and cost per engagement metrics**

**Audience Segments:**
- ALL_MERCHANTS
- PENDING_MERCHANTS
- ACTIVE_MERCHANTS
- BANNED_USERS
- INACTIVE_MERCHANTS
- HIGH_VOLUME_MERCHANTS
- NEW_SIGNUPS
- MERCHANT_OWNERS
- WAITERS
- CUSTOM_FILTER

**Tests**
- Campaign creation works
- Email/SMS delivery functions
- Template management works
- Segmentation works correctly
- Analytics track properly

## 🔹 H. Notification System Features
**Centralized notification management**
**Multiple notification types (merchant registration, approval, payment events, wallet events, API key creation, webhook failures, system alerts)**
**Priority levels (LOW, MEDIUM, HIGH, CRITICAL)**
**Unread count tracking with badge display**
**Notification filtering by type and priority**
**Mark as read (individual and bulk)**
**Email notification delivery**

**Notification Types:**
- Merchant registration
- Approval/rejection
- Payment events
- Wallet events
- Team invitations
- API key creation
- Webhook failures
- System alerts
- Campaign completion
- Branding updates

**Tests**
- Notifications display correctly
- Filtering works
- Mark as read functions
- Unread count accurate
- Email delivery works

## 🔹 I. Analytics & Reporting Features
**Dashboard metrics with platform overview**
**Transaction analytics (daily charts, type breakdown, status breakdown)**
**Revenue analytics and trends**
**Payment provider usage statistics**
**Vendor performance metrics**
**Wallet analytics and deposit trends**
**Payment confirmation rates**
**Date range filtering for custom analysis**
**Multiple chart visualizations (line, bar, pie)**

**Tests**
- Dashboard loads with correct metrics
- Charts display proper data
- Date filtering works
- Analytics calculations accurate
- Visualizations render correctly

## 🔹 J. Webhooks & API Management Features
**Webhook management for merchants**
**IP whitelisting for webhook security**
**Webhook delivery statistics (success/failure rates)**
**API request logs with status and response times**
**Webhook delivery tracking and attempts**
**Platform-wide webhook adoption metrics**
**API key generation, management, and revocation**
**API documentation access**
**Usage analytics and rate limiting**

**Tests**
- Webhook management works
- IP whitelisting functions
- Statistics display correctly
- Request logs accurate
- API key management works

## 🔹 K. System Administration & Monitoring Features
**System health monitoring**
**System metrics (CPU, memory, disk, network usage)**
**Process monitoring (Node.js metrics)**
**System information (platform, architecture, hostname, uptime)**
**Auto-refresh for real-time metrics**
**Performance monitoring and resource utilization**

**Tests**
- System metrics display correctly
- Auto-refresh works
- Performance monitoring accurate
- Health status updates properly

## 🔹 L. Branding & Customization Features
**Platform logo management**
**Color customization (primary, secondary)**
**Display settings (name, tagline)**
**Powered by attribution toggle**

**Tests**
- Logo upload works
- Color changes apply
- Display settings update
- Attribution toggle functions

## 🔹 M. Tips & Payout Tracking Features
**Tips overview and totals**
**Tips by transaction tracking**
**Tips by vendor analytics**
**Payout tracking and monitoring**

**Tests**
- Tips overview displays correctly
- Transaction-level tips tracked
- Vendor analytics accurate
- Payout tracking works

## 🔹 N. Profile & Settings Features
**Admin profile management**
**Business information management**
**Password change functionality**
**Active session management**
**Admin panel branding configuration**

**Tests**
- Profile updates work
- Password changes function
- Session management works
- Branding settings apply

## 🔹 O. Vendor Management Features
**Vendor listing with search and filtering**
**Vendor details and information**
**Vendor modal for add/edit operations**

**Tests**
- Vendor listing works
- Search and filtering function
- Add/edit operations work

## 🔹 P. Users & Team Management Features
**User listing with search and filtering**
**Comprehensive user profiles**
**Merchant team member management**
**User metrics and analytics**

**Tests**
- User listing displays correctly
- Profile information accurate
- Team management functions
- Analytics display properly

## 🔹 Q. UI/UX & Technical Features
**Responsive design (mobile-friendly)**
**Dark mode support with theme toggle**
**Redux state management with RTK Query**
**Collapsible sidebar with hover expansion**
**Data tables with pagination, sorting, filtering**
**Modal system (confirmation, detail, action modals)**
**Dynamic forms with validation**
**ApexCharts integration for visualizations**
**Toast notifications (Sonner)**
**Loading states and skeleton screens**
**Error handling and user feedback**

**Tests**
- Responsive design works on all devices
- Dark mode toggles properly
- State management functions
- Tables work with all features
- Modals display and function correctly
- Charts render properly
- Notifications work
- Loading states display

## 🔹 R. Security Features
**Better Auth integration**
**Role-based access control**
**API credential handling**
**Secure authentication flows**
**Session management**
**Protected routes**

**Tests**
- Authentication required for access
- Role-based access enforced
- API security works
- Sessions managed securely
- Route protection works

## 🔹 S. Data Management Features
**Search functionality across all entities**
**Global filtering capabilities**
**Pagination with customizable page sizes**
**Data export (PDF, CSV)**
**Bulk operations**
**Status indicators**

**Tests**
- Search works across all data
- Filtering functions correctly
- Pagination works
- Export functionality works
- Bulk operations function

## 🔹 T. Integration Features
**Multiple payment provider integrations**
**Email service integration**
**SMS service integration**
**Webhook system integration**
**Database integration (Prisma ORM)**
**External API integrations**

**Tests**
- Payment providers integrate correctly
- Email/SMS services work
- Webhook system functions
- Database operations work
- External APIs respond properly

## Navigation Structure
**Main Sections:**
- Dashboard (platform overview)
- Transactions (payment management)
- Payment Providers (provider configuration)
- Analytics (reporting and insights)
- Plans (subscription management with sub-items)
- Merchants (merchant oversight)
- Communications (email/SMS campaigns)
- Wallet (wallet management with sub-items)
- Webhooks Management
- System Monitoring
- API Documentation
- Settings

**Sub-sections:**
- Plans: Plans, Plan Stats, Transactions, Pricing Receivers
- Wallet: Deposit Receivers, Merchant Wallets, Transactions

## Summary
- **Total Routes**: 25+ main application routes
- **Components**: 100+ reusable UI components
- **API Services**: 15+ service modules
- **Custom Hooks**: 10+ utility hooks
- **Features**: 100+ distinct features
- **Payment Providers**: 13 supported providers
- **Notification Types**: 10+ notification categories
- **Campaign Types**: Email, SMS, and combined campaigns
- **Analytics Charts**: 10+ chart types and visualizations

This comprehensive admin application provides complete oversight and management of the entire FetanPay platform, including merchant management, subscription billing, payment processing, communications, system monitoring, and advanced analytics.