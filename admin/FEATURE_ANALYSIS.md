# Vendor Admin Dashboard - Complete Feature Analysis

## Overview
This document provides a detailed breakdown of all features required for the Vendor Admin Dashboard in the FetanPay Payment Verification System. The system automatically confirms payments - vendors cannot manually approve/reject.

---

## 1️⃣ Authentication & Profile Management

### 1.1 Login / Logout
**Current State**: Basic sign-in form exists (`SignInForm.tsx`)
**Required Implementation**:
- ✅ Email/password authentication (exists in template)
- ⚠️ OTP-based login (needs implementation)
- ✅ Logout functionality (needs integration with Better Auth)
- Session management with Better Auth
- Remember me functionality (checkbox exists in form)

**Components Needed**:
- `components/auth/SignInForm.tsx` - Enhance with OTP
- `components/auth/OTPVerification.tsx` - New component
- `app/(full-width-pages)/(auth)/signin/page.tsx` - Update
- `app/(full-width-pages)/(auth)/otp/page.tsx` - New page

**API Integration**:
- POST `/auth/login` - Email/password
- POST `/auth/login/otp` - Request OTP
- POST `/auth/verify-otp` - Verify OTP code
- POST `/auth/logout` - Logout

---

### 1.2 Two-Factor Authentication (2FA)
**Current State**: Not implemented
**Required Implementation**:
- Enable/disable 2FA in profile settings
- QR code generation for authenticator apps (Google Authenticator, Authy)
- Backup codes generation
- 2FA verification during login
- Recovery options

**Components Needed**:
- `components/profile/TwoFactorSetup.tsx` - New
- `components/profile/QRCodeDisplay.tsx` - New
- `components/profile/BackupCodes.tsx` - New
- `components/auth/TwoFactorVerification.tsx` - New

**API Integration**:
- POST `/auth/2fa/enable` - Enable 2FA
- POST `/auth/2fa/disable` - Disable 2FA
- GET `/auth/2fa/qr-code` - Get QR code
- POST `/auth/2fa/verify` - Verify 2FA code
- GET `/auth/2fa/backup-codes` - Get backup codes
- POST `/auth/2fa/regenerate-backup-codes` - Regenerate codes

---

### 1.3 Profile Management
**Current State**: Basic profile page exists (`app/(admin)/(others-pages)/profile/page.tsx`)
**Required Implementation**:

#### Business Information
- Business name, logo upload
- Contact information (phone, email, address)
- Business registration details
- Tax ID/VAT number

#### Personal Information
- Full name
- Email address
- Phone number
- Profile picture upload

#### Change Password
- Current password verification
- New password with strength indicator
- Password confirmation

**Components Needed**:
- `components/profile/BusinessInfoForm.tsx` - New
- `components/profile/PersonalInfoForm.tsx` - New
- `components/profile/ChangePasswordForm.tsx` - New
- `components/profile/LogoUpload.tsx` - New
- `components/profile/ProfilePictureUpload.tsx` - New
- `app/(admin)/(others-pages)/profile/page.tsx` - Enhance existing

**API Integration**:
- GET `/profile` - Get profile data
- PUT `/profile/business` - Update business info
- PUT `/profile/personal` - Update personal info
- PUT `/profile/password` - Change password
- POST `/profile/logo` - Upload logo
- POST `/profile/avatar` - Upload profile picture

---

### 1.4 Connected Devices & Sessions
**Current State**: Not implemented
**Required Implementation**:
- List all active sessions/devices
- Device information (browser, OS, location, IP)
- Last activity timestamp
- Revoke individual sessions
- Revoke all other sessions
- Current session indicator

**Components Needed**:
- `components/profile/ActiveSessions.tsx` - New
- `components/profile/SessionCard.tsx` - New
- `components/profile/RevokeSessionModal.tsx` - New

**API Integration**:
- GET `/sessions` - List all sessions
- DELETE `/sessions/:id` - Revoke specific session
- DELETE `/sessions/others` - Revoke all other sessions

---

### 1.5 Branding Settings
**Current State**: Not implemented
**Required Implementation**:
- Upload business logo (for receipts/invoices)
- Theme color picker (primary, secondary colors)
- QR code branding options:
  - QR code style selection
  - Logo overlay on QR codes
  - Color customization
- Preview of branded receipts/invoices
- Preview of branded QR codes

**Components Needed**:
- `components/branding/BrandingSettings.tsx` - New
- `components/branding/LogoUpload.tsx` - New
- `components/branding/ColorPicker.tsx` - New
- `components/branding/QRCodeCustomization.tsx` - New
- `components/branding/ReceiptPreview.tsx` - New
- `app/(admin)/branding/page.tsx` - New page

**API Integration**:
- GET `/branding` - Get branding settings
- PUT `/branding` - Update branding
- POST `/branding/logo` - Upload logo
- POST `/branding/qr-preview` - Generate preview

---

## 2️⃣ User (Vendor) Management

### 2.1 Add, Edit, Deactivate Vendors
**Current State**: Not implemented
**Required Implementation**:
- Create new vendor accounts
- Edit vendor information
- Deactivate/reactivate vendors
- Bulk operations (bulk deactivate)
- Vendor status indicators (Active/Inactive)

**Components Needed**:
- `components/vendors/VendorList.tsx` - New
- `components/vendors/VendorTable.tsx` - New
- `components/vendors/AddVendorModal.tsx` - New
- `components/vendors/EditVendorModal.tsx` - New
- `components/vendors/VendorForm.tsx` - New
- `components/vendors/DeactivateVendorModal.tsx` - New
- `app/(admin)/vendors/page.tsx` - New page
- `app/(admin)/vendors/[id]/page.tsx` - New detail page

**API Integration**:
- GET `/vendors` - List all vendors
- POST `/vendors` - Create vendor
- GET `/vendors/:id` - Get vendor details
- PUT `/vendors/:id` - Update vendor
- DELETE `/vendors/:id` - Deactivate vendor
- POST `/vendors/:id/activate` - Reactivate vendor

---

### 2.2 Assign Vendors to Branches/Teams
**Current State**: Not implemented
**Required Implementation**:
- Branch/Team management
- Assign vendors to branches
- Assign vendors to teams
- View vendors by branch/team
- Transfer vendors between branches/teams

**Components Needed**:
- `components/vendors/BranchManagement.tsx` - New
- `components/vendors/TeamManagement.tsx` - New
- `components/vendors/AssignVendorModal.tsx` - New
- `components/vendors/BranchSelector.tsx` - New

**API Integration**:
- GET `/branches` - List branches
- POST `/branches` - Create branch
- GET `/teams` - List teams
- POST `/teams` - Create team
- PUT `/vendors/:id/branch` - Assign to branch
- PUT `/vendors/:id/team` - Assign to team

---

### 2.3 Set Vendor Permissions
**Current State**: Not implemented
**Required Implementation**:
- Permission matrix/checklist
- Role-based permissions:
  - Submit payments
  - View own history
  - View all transactions
  - Export data
  - Manage API keys
- Custom permission sets
- Permission inheritance from roles

**Components Needed**:
- `components/vendors/PermissionManager.tsx` - New
- `components/vendors/PermissionMatrix.tsx` - New
- `components/vendors/RoleSelector.tsx` - New

**API Integration**:
- GET `/vendors/:id/permissions` - Get permissions
- PUT `/vendors/:id/permissions` - Update permissions
- GET `/roles` - List available roles
- GET `/permissions` - List all permissions

---

### 2.4 Monitor Vendor Activity & Performance
**Current State**: Not implemented
**Required Implementation**:
- Activity timeline/feed
- Performance metrics:
  - Transactions count
  - Success rate
  - Average transaction value
  - Activity hours
- Real-time activity indicators
- Activity filters (date range, action type)

**Components Needed**:
- `components/vendors/VendorActivity.tsx` - New
- `components/vendors/ActivityTimeline.tsx` - New
- `components/vendors/PerformanceMetrics.tsx` - New
- `components/vendors/ActivityFilters.tsx` - New

**API Integration**:
- GET `/vendors/:id/activity` - Get activity log
- GET `/vendors/:id/performance` - Get performance metrics
- GET `/vendors/:id/stats` - Get statistics

---

### 2.5 Reset Vendor Credentials
**Current State**: Not implemented
**Required Implementation**:
- Reset password functionality
- Send password reset email
- Force password change on next login
- Generate temporary password
- Reset 2FA (if enabled)

**Components Needed**:
- `components/vendors/ResetCredentialsModal.tsx` - New
- `components/vendors/PasswordResetForm.tsx` - New

**API Integration**:
- POST `/vendors/:id/reset-password` - Reset password
- POST `/vendors/:id/send-reset-email` - Send reset email
- POST `/vendors/:id/force-password-change` - Force change
- POST `/vendors/:id/reset-2fa` - Reset 2FA

---

### 2.6 Activity Log Per Vendor
**Current State**: Not implemented
**Required Implementation**:
- Detailed activity log per vendor
- Action types (login, transaction, settings change)
- Timestamps with timezone
- IP address and device info
- Export activity log
- Search and filter capabilities

**Components Needed**:
- `components/vendors/VendorActivityLog.tsx` - New
- `components/vendors/ActivityLogTable.tsx` - New
- `components/vendors/ActivityLogFilters.tsx` - New

**API Integration**:
- GET `/vendors/:id/activity-log` - Get activity log
- GET `/vendors/:id/activity-log/export` - Export log

---

## 3️⃣ Payment Confirmation & Transaction Management

### 3.1 Real-time Payment Dashboard
**Current State**: Dashboard exists but needs payment-specific data
**Required Implementation**:
- Real-time payment list (WebSocket or polling)
- Auto-refresh functionality
- Payment status indicators
- Summary cards (total, confirmed, unconfirmed)
- Recent payments widget

**Components Needed**:
- `components/payments/PaymentDashboard.tsx` - New
- `components/payments/PaymentList.tsx` - New
- `components/payments/PaymentCard.tsx` - New
- `components/payments/PaymentSummaryCards.tsx` - New
- `app/(admin)/payments/page.tsx` - New page (or update dashboard)

**API Integration**:
- GET `/payments` - List payments
- GET `/payments/stats` - Get summary statistics
- WebSocket `/payments/stream` - Real-time updates

---

### 3.2 Payment Status Indicators
**Current State**: Not implemented
**Required Implementation**:
- **Submitted** - Yellow/Warning badge
- **Confirmed ✅** - Green/Success badge (system confirmed)
- **Unconfirmed ❌** - Red/Error badge (system confirmation failed)
- Status change animations
- Status history timeline

**Components Needed**:
- `components/payments/PaymentStatusBadge.tsx` - New
- `components/payments/StatusIndicator.tsx` - New
- `components/payments/StatusHistory.tsx` - New

**API Integration**:
- GET `/payments/:id/status` - Get status
- GET `/payments/:id/status-history` - Get status history

---

### 3.3 Filter & Search
**Current State**: Basic filter UI exists in template
**Required Implementation**:
- Transaction ID search
- Vendor filter (dropdown)
- Payment method filter
- Status filter (Submitted/Confirmed/Unconfirmed)
- Date range picker
- Amount range filter
- Advanced filters panel
- Save filter presets

**Components Needed**:
- `components/payments/PaymentFilters.tsx` - New
- `components/payments/AdvancedFilters.tsx` - New
- `components/payments/FilterPresets.tsx` - New
- `components/common/DateRangePicker.tsx` - New (or use existing)

**API Integration**:
- GET `/payments?filters=...` - Filtered payments
- GET `/payments/search?q=...` - Search payments

---

### 3.4 System Confirmation Details
**Current State**: Not implemented
**Required Implementation**:
- Transaction exists check result
- Payment success verification
- Amount matched indicator
- Receiver matched indicator
- Confirmation timestamp
- Confirmation source (which bank/system)
- Detailed confirmation breakdown
- Failure reasons (if unconfirmed)

**Components Needed**:
- `components/payments/ConfirmationDetails.tsx` - New
- `components/payments/ConfirmationBreakdown.tsx` - New
- `components/payments/VerificationResult.tsx` - New
- `components/payments/PaymentDetailModal.tsx` - New

**API Integration**:
- GET `/payments/:id/confirmation` - Get confirmation details
- GET `/payments/:id/verification-result` - Get verification result

---

### 3.5 Transaction History
**Current State**: Not implemented
**Required Implementation**:
- Full payment details view
- Transaction timeline
- Related transactions
- Payment metadata
- Attachments/receipts
- Notes/comments

**Components Needed**:
- `components/payments/TransactionHistory.tsx` - New
- `components/payments/TransactionDetail.tsx` - New
- `components/payments/TransactionTimeline.tsx` - New
- `components/payments/PaymentMetadata.tsx` - New
- `app/(admin)/payments/[id]/page.tsx` - New detail page

**API Integration**:
- GET `/payments/:id` - Get payment details
- GET `/payments/:id/history` - Get transaction history
- GET `/payments/:id/related` - Get related transactions

---

### 3.6 Export Transactions
**Current State**: Not implemented
**Required Implementation**:
- Export as CSV
- Export as Excel (XLSX)
- Export as PDF
- Apply current filters to export
- Custom column selection
- Scheduled exports (optional)
- Export history

**Components Needed**:
- `components/payments/ExportModal.tsx` - New
- `components/payments/ExportOptions.tsx` - New
- `components/payments/ColumnSelector.tsx` - New
- `components/common/ExportButton.tsx` - New

**API Integration**:
- POST `/payments/export/csv` - Export CSV
- POST `/payments/export/excel` - Export Excel
- POST `/payments/export/pdf` - Export PDF
- GET `/exports` - List export history
- GET `/exports/:id/download` - Download export

---

### 3.7 Immutable Logs
**Current State**: Not implemented
**Required Implementation**:
- Audit trail for all transactions
- Immutable log entries
- Log viewer with search
- Export audit logs
- Compliance-ready logging

**Components Needed**:
- `components/payments/AuditLog.tsx` - New
- `components/payments/LogViewer.tsx` - New

**API Integration**:
- GET `/payments/:id/audit-log` - Get audit log
- GET `/audit-logs` - List all audit logs

---

## 4️⃣ Analytics & Reporting

### 4.1 Transaction Analytics
**Current State**: Basic charts exist in template
**Required Implementation**:

#### Total Payments
- Total count metric
- Total amount metric
- Growth percentage
- Period comparison

#### Confirmed vs Unconfirmed
- Pie chart
- Bar chart comparison
- Success rate percentage
- Trend over time

#### Revenue Trends
- Line chart (daily/weekly/monthly)
- Revenue by period
- Growth trends
- Forecast (optional)

#### Vendor Performance Metrics
- Top performing vendors
- Vendor comparison charts
- Performance rankings
- Individual vendor analytics

#### Payment Method Distribution
- Pie chart by method
- Method trends over time
- Method success rates

**Components Needed**:
- `components/analytics/TransactionAnalytics.tsx` - New
- `components/analytics/RevenueChart.tsx` - New
- `components/analytics/ConfirmationChart.tsx` - New
- `components/analytics/VendorPerformanceChart.tsx` - New
- `components/analytics/PaymentMethodChart.tsx` - New
- `components/analytics/AnalyticsFilters.tsx` - New
- `app/(admin)/analytics/page.tsx` - New page

**API Integration**:
- GET `/analytics/transactions` - Transaction analytics
- GET `/analytics/revenue` - Revenue analytics
- GET `/analytics/confirmation-rate` - Confirmation stats
- GET `/analytics/vendor-performance` - Vendor metrics
- GET `/analytics/payment-methods` - Method distribution

---

### 4.2 Billing & Plans
**Current State**: Not implemented
**Required Implementation**:
- Current plan display
- Plan features comparison
- Upgrade/downgrade options
- Plan change confirmation
- Billing cycle information
- Next billing date
- Usage limits display

**Components Needed**:
- `components/billing/CurrentPlan.tsx` - New
- `components/billing/PlanComparison.tsx` - New
- `components/billing/UpgradeModal.tsx` - New
- `components/billing/PlanCard.tsx` - New
- `components/billing/UsageLimits.tsx` - New
- `app/(admin)/billing/page.tsx` - New page

**API Integration**:
- GET `/billing/plan` - Get current plan
- GET `/billing/plans` - List available plans
- POST `/billing/upgrade` - Upgrade plan
- POST `/billing/downgrade` - Downgrade plan
- GET `/billing/usage` - Get usage stats

---

### 4.3 Payment History for Subscription
**Current State**: Not implemented
**Required Implementation**:
- Subscription payment history
- Invoice list
- Download invoices (PDF)
- Payment method management
- Billing address
- Tax information

**Components Needed**:
- `components/billing/PaymentHistory.tsx` - New
- `components/billing/InvoiceList.tsx` - New
- `components/billing/InvoiceCard.tsx` - New
- `components/billing/DownloadInvoiceButton.tsx` - New

**API Integration**:
- GET `/billing/invoices` - List invoices
- GET `/billing/invoices/:id` - Get invoice
- GET `/billing/invoices/:id/download` - Download invoice

---

### 4.4 Tips / Commissions
**Current State**: Not implemented
**Required Implementation**:
- View tips per vendor
- View tips per transaction
- Tip collection summary
- Commission rules display
- Commission calculations
- Payout tracking
- Tip approval workflow (if needed)

**Components Needed**:
- `components/tips/TipsOverview.tsx` - New
- `components/tips/TipsByVendor.tsx` - New
- `components/tips/TipsByTransaction.tsx` - New
- `components/tips/CommissionRules.tsx` - New
- `components/tips/PayoutTracking.tsx` - New
- `app/(admin)/tips/page.tsx` - New page

**API Integration**:
- GET `/tips` - List all tips
- GET `/tips/vendor/:id` - Tips by vendor
- GET `/tips/transaction/:id` - Tips by transaction
- GET `/commissions/rules` - Get commission rules
- GET `/commissions/payouts` - Get payout history
- POST `/tips/:id/approve` - Approve tip payout

---

## 5️⃣ API Management

### 5.1 API Key Management
**Current State**: Not implemented
**Required Implementation**:
- Generate new API keys (2 keys per account)
- Display API keys (masked by default, reveal option)
- Revoke API keys
- Rotate API keys
- Key naming/labeling
- Key creation date
- Last used timestamp
- Usage statistics per key

**Components Needed**:
- `components/api/ApiKeyManagement.tsx` - New
- `components/api/ApiKeyCard.tsx` - New
- `components/api/GenerateKeyModal.tsx` - New
- `components/api/RevokeKeyModal.tsx` - New
- `components/api/KeyUsageStats.tsx` - New
- `app/(admin)/api-keys/page.tsx` - New page

**API Integration**:
- GET `/api-keys` - List API keys
- POST `/api-keys` - Generate new key
- DELETE `/api-keys/:id` - Revoke key
- POST `/api-keys/:id/rotate` - Rotate key
- GET `/api-keys/:id/usage` - Get usage stats

---

### 5.2 View Usage Logs
**Current State**: Not implemented
**Required Implementation**:
- API call logs
- Request/response details
- Timestamp and duration
- Status codes
- Endpoint called
- IP address
- Filter by API key
- Filter by date range
- Filter by status
- Export logs

**Components Needed**:
- `components/api/UsageLogs.tsx` - New
- `components/api/LogTable.tsx` - New
- `components/api/LogFilters.tsx` - New
- `components/api/LogDetailModal.tsx` - New

**API Integration**:
- GET `/api-keys/:id/logs` - Get usage logs
- GET `/api-keys/logs` - Get all logs
- GET `/api-keys/logs/export` - Export logs

---

### 5.3 API Documentation
**Current State**: Not implemented
**Required Implementation**:
- Integrated API documentation
- Endpoint reference
- Request/response examples
- Authentication guide
- Code examples (JavaScript, Python, etc.)
- Interactive API explorer (optional)
- Webhook documentation

**Components Needed**:
- `components/api/ApiDocumentation.tsx` - New
- `components/api/EndpointReference.tsx` - New
- `components/api/CodeExamples.tsx` - New
- `components/api/ApiExplorer.tsx` - New (optional)
- `app/(admin)/api-docs/page.tsx` - New page

**API Integration**:
- GET `/api-docs` - Get API documentation (if served from backend)
- Or static documentation in frontend

---

### 5.4 API Usage Analytics
**Current State**: Not implemented
**Required Implementation**:
- Track API calls (total, success, failures)
- Rate limit monitoring
- Usage by endpoint
- Usage trends (charts)
- Error rate tracking
- Response time analytics
- Usage alerts (when approaching limits)

**Components Needed**:
- `components/api/UsageAnalytics.tsx` - New
- `components/api/UsageChart.tsx` - New
- `components/api/RateLimitIndicator.tsx` - New
- `components/api/ErrorRateChart.tsx` - New

**API Integration**:
- GET `/api-keys/:id/analytics` - Get usage analytics
- GET `/api-keys/analytics` - Get all analytics
- GET `/api-keys/rate-limits` - Get rate limit status

---

## 6️⃣ Notifications & Alerts

### 6.1 Real-time Notifications
**Current State**: NotificationDropdown exists but needs enhancement
**Required Implementation**:
- New payment submissions notification
- Confirmation failures (Unconfirmed) alerts
- High-value transaction alerts
- Notification center/bell icon
- Unread count badge
- Mark as read functionality
- Notification grouping
- Real-time updates (WebSocket)

**Components Needed**:
- `components/notifications/NotificationCenter.tsx` - Enhance existing
- `components/notifications/NotificationDropdown.tsx` - Enhance existing
- `components/notifications/NotificationItem.tsx` - New
- `components/notifications/NotificationList.tsx` - New
- `components/notifications/NotificationBadge.tsx` - New

**API Integration**:
- GET `/notifications` - List notifications
- PUT `/notifications/:id/read` - Mark as read
- PUT `/notifications/read-all` - Mark all as read
- DELETE `/notifications/:id` - Delete notification
- WebSocket `/notifications/stream` - Real-time updates

---

### 6.2 Notification Preferences
**Current State**: Not implemented
**Required Implementation**:
- In-app notifications toggle
- Email notifications toggle
- SMS notifications toggle (if available)
- Per-event notification settings:
  - New payment submissions
  - Confirmation failures
  - High-value transactions
  - System alerts
- Email frequency (instant/digest)
- Quiet hours settings

**Components Needed**:
- `components/notifications/NotificationPreferences.tsx` - New
- `components/notifications/PreferenceToggle.tsx` - New
- `components/notifications/QuietHours.tsx` - New
- `app/(admin)/settings/notifications/page.tsx` - New page

**API Integration**:
- GET `/notifications/preferences` - Get preferences
- PUT `/notifications/preferences` - Update preferences

---

### 6.3 Custom Alert Thresholds
**Current State**: Not implemented
**Required Implementation**:
- Set threshold for high-value transactions
- Set threshold for confirmation failure rate
- Set threshold for daily transaction volume
- Alert when thresholds are exceeded
- Multiple threshold rules
- Threshold history

**Components Needed**:
- `components/notifications/AlertThresholds.tsx` - New
- `components/notifications/ThresholdRule.tsx` - New
- `components/notifications/ThresholdForm.tsx` - New

**API Integration**:
- GET `/notifications/thresholds` - Get thresholds
- POST `/notifications/thresholds` - Create threshold
- PUT `/notifications/thresholds/:id` - Update threshold
- DELETE `/notifications/thresholds/:id` - Delete threshold

---

### 6.4 Notification History Log
**Current State**: Not implemented
**Required Implementation**:
- Complete notification history
- Filter by type, date, read status
- Search notifications
- Export notification history
- Clear old notifications

**Components Needed**:
- `components/notifications/NotificationHistory.tsx` - New
- `components/notifications/HistoryFilters.tsx` - New

**API Integration**:
- GET `/notifications/history` - Get history
- DELETE `/notifications/history/clear` - Clear history

---

## 7️⃣ Branding & Customization

### 7.1 Upload Logo for Receipts & Invoices
**Current State**: Not implemented (covered in 1.5)
**Required Implementation**:
- Logo upload with preview
- Logo size/format validation
- Logo positioning options
- Multiple logo variants (light/dark)
- Receipt/invoice preview

**Components Needed**:
- `components/branding/LogoUpload.tsx` - New (from 1.5)
- `components/branding/ReceiptPreview.tsx` - New (from 1.5)

---

### 7.2 Customize Theme Colors
**Current State**: Not implemented (covered in 1.5)
**Required Implementation**:
- Primary color picker
- Secondary color picker
- Accent colors
- Color preview
- Apply to dashboard
- Apply to receipts/invoices

**Components Needed**:
- `components/branding/ColorPicker.tsx` - New (from 1.5)
- `components/branding/ThemePreview.tsx` - New

---

### 7.3 Set Default QR Code Style
**Current State**: Not implemented (covered in 1.5)
**Required Implementation**:
- QR code style selection
- Logo overlay option
- Color customization
- Size options
- Error correction level
- Preview QR code

**Components Needed**:
- `components/branding/QRCodeCustomization.tsx` - New (from 1.5)

---

### 7.4 Business Info for Display
**Current State**: Not implemented (covered in 1.3)
**Required Implementation**:
- Business name, address, contact
- Tax information
- Legal information
- Display across dashboard
- Display in notifications
- Display in receipts/invoices

**Components Needed**:
- `components/branding/BusinessInfoDisplay.tsx` - New

---

## 8️⃣ Reporting & CSV / Export

### 8.1 Generate Reports
**Current State**: Not implemented
**Required Implementation**:
- CSV export (covered in 3.6)
- Excel export (covered in 3.6)
- PDF export (covered in 3.6)
- Custom report builder
- Report templates
- Scheduled reports

**Components Needed**:
- `components/reports/ReportBuilder.tsx` - New
- `components/reports/ReportTemplates.tsx` - New
- `components/reports/ScheduledReports.tsx` - New
- `app/(admin)/reports/page.tsx` - New page

**API Integration**:
- POST `/reports/generate` - Generate report
- GET `/reports/templates` - List templates
- POST `/reports/schedule` - Schedule report
- GET `/reports/scheduled` - List scheduled reports

---

### 8.2 Filter Before Exporting
**Current State**: Not implemented (covered in 3.3 and 3.6)
**Required Implementation**:
- Apply all filters to export
- Custom column selection
- Date range selection
- Format selection

---

### 8.3 Scheduled Automatic Report Generation
**Current State**: Not implemented
**Required Implementation**:
- Create scheduled reports
- Frequency options (daily, weekly, monthly)
- Recipient email list
- Report format selection
- Enable/disable schedules
- Schedule history

**Components Needed**:
- `components/reports/ScheduledReports.tsx` - New (from 8.1)
- `components/reports/ScheduleForm.tsx` - New

**API Integration**:
- POST `/reports/schedule` - Create schedule
- GET `/reports/schedules` - List schedules
- PUT `/reports/schedules/:id` - Update schedule
- DELETE `/reports/schedules/:id` - Delete schedule

---

## 9️⃣ User Management (Vendors / Team)

### 9.1 Add / Remove / Edit Vendor Accounts
**Current State**: Not implemented (covered in 2.1)
**Required Implementation**:
- Covered in section 2.1

---

### 9.2 Assign Roles and Permissions
**Current State**: Not implemented (covered in 2.3)
**Required Implementation**:
- Covered in section 2.3

---

### 9.3 Track Login Activity
**Current State**: Not implemented (covered in 2.4 and 2.6)
**Required Implementation**:
- Covered in sections 2.4 and 2.6

---

### 9.4 Reset Passwords
**Current State**: Not implemented (covered in 2.5)
**Required Implementation**:
- Covered in section 2.5

---

### 9.5 Bulk Import/Export Vendors via CSV
**Current State**: Not implemented
**Required Implementation**:
- CSV import template download
- Bulk import vendors from CSV
- Import validation and error reporting
- Bulk export vendors to CSV
- Import/export history

**Components Needed**:
- `components/vendors/BulkImport.tsx` - New
- `components/vendors/ImportTemplate.tsx` - New
- `components/vendors/ImportResults.tsx` - New
- `components/vendors/BulkExport.tsx` - New

**API Integration**:
- GET `/vendors/import-template` - Download template
- POST `/vendors/import` - Import vendors
- GET `/vendors/export` - Export vendors
- GET `/vendors/import-history` - Get import history

---

## 📋 Implementation Priority Summary

### Phase 1 - Core Features (Essential)
1. Authentication & Profile Management (1.1, 1.3)
2. Payment Confirmation Dashboard (3.1, 3.2, 3.3)
3. Transaction Management (3.4, 3.5)
4. Basic Vendor Management (2.1, 2.5)

### Phase 2 - Enhanced Features (Important)
5. Analytics & Reporting (4.1)
6. API Key Management (5.1, 5.2)
7. Notifications (6.1, 6.2)
8. Export Functionality (3.6, 8.1)

### Phase 3 - Advanced Features (Nice to Have)
9. 2FA (1.2)
10. Advanced Analytics (4.2, 4.3, 4.4)
11. Branding Customization (7.1-7.4)
12. Scheduled Reports (8.3)
13. Bulk Operations (9.5)

---

## 🛠️ Technical Requirements

### Frontend Stack (Already in place)
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Existing component library

### New Dependencies Needed
- `date-fns` or `dayjs` - Date handling
- `react-hook-form` - Form management
- `zod` - Schema validation
- `recharts` or `chart.js` - Advanced charts
- `xlsx` - Excel export
- `jspdf` - PDF generation
- `react-qr-code` - QR code generation
- `socket.io-client` - WebSocket for real-time
- `react-dropzone` - File uploads (already exists)

### Backend API Requirements
- RESTful API endpoints (as specified in each section)
- WebSocket support for real-time updates
- File upload handling
- Export generation (CSV, Excel, PDF)
- Authentication middleware
- Rate limiting
- Webhook support

---

## 📝 Notes

1. **System Confirmation Only**: Vendors cannot manually approve/reject payments. The system automatically determines Confirmed/Unconfirmed status.

2. **Better Auth Integration**: The project uses Better Auth for authentication. All auth features should integrate with the existing Better Auth setup.

3. **Template Reuse**: Many UI components from the template can be reused (tables, forms, modals, charts). Focus on adapting them for payment-specific use cases.

4. **Real-time Updates**: Consider WebSocket or Server-Sent Events for real-time payment updates and notifications.

5. **Mobile Responsiveness**: All features should be mobile-responsive using the existing Tailwind responsive utilities.

6. **Dark Mode**: All new components should support the existing dark mode theme system.

---

## ✅ Next Steps

After reviewing this analysis, please specify:
1. Which features to implement first
2. Any modifications to the feature list
3. API endpoint structure preferences
4. Design/UI preferences
5. Priority order for implementation

