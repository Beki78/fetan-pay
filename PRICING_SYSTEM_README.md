# FetanPay Pricing System - Complete Implementation Guide

## Overview

This document outlines the comprehensive pricing system for FetanPay, covering the complete flow from plan creation by admin to merchant subscription management, billing, and automated notifications.

## System Architecture

The pricing system spans across 5 main applications:

- **Landing Page**: Public pricing display
- **Admin Dashboard**: Plan management and statistics
- **Merchant Admin**: Subscription and billing management
- **Server**: Backend APIs and database
- **Merchant App**: Feature access control

---

## 1. Landing Page Pricing Display

### Purpose

Display pricing plans to potential customers visiting the website.

### Features

- **Dynamic Plan Fetching**: Pricing cards are fetched from the admin-created plans via API
- **Real-time Updates**: When admin enables/disables plans, they automatically show/hide on landing page
- **Plan Details**: Each card shows:
  - Plan name and description
  - Monthly/yearly pricing
  - Feature list with checkmarks
  - "Most Popular" badge (admin configurable)
  - Call-to-action button

### Flow

1. Landing page loads
2. API call fetches all enabled plans from database
3. Plans are rendered as pricing cards
4. Users can click "Get Started" to register
5. Registration defaults to Free plan

---

## 2. Admin Dashboard - Plan Management

### 2.1 Sidebar Navigation Structure

#### Plans Dropdown Menu

Similar to the wallet dropdown, create a "Plans" dropdown in the admin sidebar containing:

- **Plans**: Plan creation and management page
- **Plan Stats**: Subscription statistics and analytics
- **Transactions**: Billing transaction history for all users

### 2.2 Plans Management Page

#### Features

- **Create New Plans**: Admin can create custom pricing plans
- **Edit Existing Plans**: Modify plan details, pricing, and features
- **Enable/Disable Plans**: Control plan visibility to merchants
- **Feature Management**: Enable/disable specific features per plan
- **Plan Ordering**: Set display order for plans

#### Plan Configuration Options

- Plan name and description
- Monthly/yearly pricing
- Verification limits
- Feature toggles:
  - API access level
  - Webhook support
  - Analytics depth
  - UI watermark removal
  - Export capabilities
  - Support level
  - Bank account limits
  - Transaction history duration

### 2.3 Plan Statistics Dashboard

#### Active Plans Tab

For each plan, display:

- **Plan Overview**:
  - Plan name and pricing
  - Total active subscribers
  - Monthly recurring revenue (MRR)
  - Average usage per subscriber
- **Subscriber List**:
  - Merchant ID and name
  - Email address
  - Subscription start date
  - Current usage statistics
  - Payment status
  - "View Details" button (opens merchant profile)

#### Inactive Users Tab

Shows two categories of inactive users:

**Free Plan Users (Never Upgraded)**:

- Merchants who registered and stayed on free plan
- Must be admin-verified merchants only
- Shows days since registration
- Usage statistics on free plan
- "Notify" button for each user

**Downgraded Users (Former Paid Subscribers)**:

- Users who were on paid plans but stopped paying
- Shows previous plan and downgrade date
- Reason for downgrade (payment failed, cancelled, etc.)
- Days since downgrade
- "Notify" button for each user

#### Notification Actions

- **Manual Notify Button**: Sends immediate email and in-app notification to specific user
- **Bulk Notify**: Select multiple users and send notifications
- **Notification Templates**: Pre-configured messages for different scenarios

### 2.4 Transactions Page

#### Billing Transaction History

Comprehensive table showing all billing transactions across all merchants:

**Table Columns:**

- **Transaction ID**: Unique identifier for each billing transaction
- **Merchant Name**: Name of the merchant
- **Merchant Email**: Contact email
- **Plan**: Subscription plan name (Free, Starter, Business, Custom)
- **Transaction Type**:
  - Plan Upgrade
  - Plan Renewal
  - Plan Downgrade
  - Refund
  - Admin Override
- **Amount**: Transaction amount in ETB
- **Payment Method**: Bank transfer, Receipt upload, Admin override
- **Payment Reference**: CBE reference or receipt ID
- **Status**: Pending, Completed, Failed, Refunded
- **Transaction Date**: Date and time of transaction
- **Processed By**: Admin user who processed (if manual)
- **Actions**: View details, Download invoice, Process refund

**Filtering Options:**

- Date range picker
- Plan type filter
- Transaction status filter
- Payment method filter
- Merchant search
- Amount range filter

**Export Features:**

- Export to CSV
- Export to PDF
- Generate financial reports
- Monthly/yearly revenue summaries

### 2.5 Merchant Plan Assignment

#### Admin Override Features

- **Assign Custom Plans**: Admin can assign any plan to any merchant
- **Set Custom Duration**:
  - Specific end date
  - Permanent assignment
  - Trial periods
- **Plan History Tracking**: Record all plan changes with timestamps and admin notes
- **Billing Override**: Admin can provide free access or custom pricing

---

## 3. Merchant Admin - Subscription Management

### 3.1 Billing Dashboard

#### Current Plan Section

- **Plan Details**: Name, pricing, billing cycle
- **Usage Tracking**:
  - Verifications used vs. limit
  - API calls made vs. limit
  - Feature usage statistics
- **Plan Status**: Active, expired, pending payment
- **Next Billing Date**: Countdown to next payment
- **Plan Features**: List of available features with status indicators

#### Available Plans Section

- **Plan Comparison Table**: Side-by-side feature comparison
- **Upgrade/Downgrade Options**: Available plan changes
- **Pricing Calculator**: Show cost differences and prorated amounts
- **Feature Preview**: What changes with plan upgrade/downgrade

### 3.2 Payment Processing

#### Payment Modal

When merchant selects a plan:

1. **Plan Confirmation**: Show selected plan details and pricing
2. **Payment Options**:
   - CBE Bank Transfer (enter transaction reference)
   - Receipt Upload (PDF/image upload)
   - Future: Credit card integration
3. **Payment Instructions**: Step-by-step guide for bank transfer
4. **Verification Process**:
   - 17-minute timer for payment completion
   - Real-time status updates
   - Manual admin verification fallback

#### Payment Verification Flow

1. Merchant initiates payment
2. System creates pending subscription record
3. Payment verification (automatic or manual)
4. Upon verification:
   - Activate new plan
   - Update feature access
   - Send confirmation email
   - Generate invoice
5. If verification fails:
   - Keep current plan active
   - Send failure notification
   - Allow retry

### 3.3 Billing History

#### Invoice Management

- **Invoice List**: All past invoices with download links
- **Payment History**: Successful payments with transaction details
- **Failed Payments**: Failed attempts with retry options
- **Refund Requests**: Ability to request refunds with admin approval

---

## 4. Feature Access Control

### 4.1 Plan-Based Feature Gating

#### Implementation Strategy

Each feature in merchant admin checks current plan permissions:

```
if (currentPlan.features.includes('ADVANCED_ANALYTICS')) {
  // Show advanced analytics
} else {
  // Show upgrade prompt
}
```

#### Feature Categories

- **API Limits**: Requests per minute/day based on plan
- **Verification Limits**: Monthly verification quota
- **UI Features**: Watermark removal, custom branding
- **Data Access**: Transaction history duration, export capabilities
- **Support Level**: Response time guarantees, dedicated support
- **Integration Features**: Webhook endpoints, custom integrations

### 4.2 Usage Monitoring

#### Real-time Tracking

- **API Usage**: Track requests per merchant per plan
- **Verification Usage**: Count monthly verifications
- **Feature Usage**: Log feature access for analytics
- **Overage Handling**: Warn when approaching limits, block when exceeded

---

## 5. Automated Notification System

### 5.1 Email Notifications

#### Merchant Notifications

- **Welcome Email**: Upon registration (Free plan)
- **Plan Upgrade Confirmation**: When upgrading to paid plan
- **Payment Receipt**: After successful payment
- **Plan Expiration Warning**: 7 days, 3 days, 1 day before expiration
- **Plan Expired**: When plan expires and reverts to free
- **Usage Limit Warning**: At 80%, 90%, 100% of monthly limits
- **Payment Failed**: When automatic renewal fails
- **Plan Downgrade**: When reverting to lower plan

#### Admin Notifications

- **New Subscription**: When merchant upgrades to paid plan
- **Payment Received**: Successful payment notifications
- **Payment Failed**: Failed payment alerts requiring attention
- **Plan Cancellation**: When merchant cancels subscription
- **High Usage Alert**: When merchant approaches plan limits
- **Inactive User Report**: Weekly summary of inactive users

### 5.2 Automated Email Campaigns

#### Free Plan User Nurturing

- **Day 7**: Welcome series - "Getting started with FetanPay"
- **Day 14**: Feature highlight - "Unlock advanced analytics"
- **Day 30**: Upgrade prompt - "Ready to grow your business?"
- **Every 30 days**: Ongoing nurturing emails with upgrade incentives

#### Downgraded User Re-engagement

- **Immediate**: "We miss you" email with special offer
- **Day 7**: Feature reminder - "What you're missing"
- **Day 30**: Win-back offer with discount
- **Every 30 days**: Continued re-engagement attempts

### 5.3 In-App Notifications

#### Notification Types

- **Plan Status Updates**: Subscription changes, renewals, expirations
- **Usage Alerts**: Approaching limits, overage warnings
- **Payment Reminders**: Upcoming payments, failed payments
- **Feature Announcements**: New features available in current plan
- **Upgrade Suggestions**: Contextual upgrade prompts based on usage

#### Notification Management

- **Notification Center**: Central hub for all notifications
- **Read/Unread Status**: Track notification engagement
- **Action Buttons**: Direct links to relevant pages (billing, upgrade, etc.)
- **Notification Preferences**: Allow users to customize notification types

---

## 6. Database Schema Requirements

### 6.1 Core Tables

#### Plans Table

```sql
- id (UUID, Primary Key)
- name (String)
- description (Text)
- price_monthly (Decimal)
- price_yearly (Decimal)
- verification_limit (Integer)
- api_limit_per_minute (Integer)
- features (JSON) // Array of feature flags
- is_enabled (Boolean)
- is_popular (Boolean) // For "Most Popular" badge
- display_order (Integer)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Subscriptions Table

```sql
- id (UUID, Primary Key)
- merchant_id (UUID, Foreign Key)
- plan_id (UUID, Foreign Key)
- status (Enum: ACTIVE, EXPIRED, CANCELLED, PENDING)
- billing_cycle (Enum: MONTHLY, YEARLY)
- start_date (DateTime)
- end_date (DateTime)
- auto_renew (Boolean)
- assigned_by_admin (Boolean)
- admin_notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Invoices Table

```sql
- id (UUID, Primary Key)
- subscription_id (UUID, Foreign Key)
- merchant_id (UUID, Foreign Key)
- amount (Decimal)
- currency (String)
- status (Enum: PENDING, PAID, FAILED, REFUNDED)
- payment_method (String)
- payment_reference (String)
- due_date (DateTime)
- paid_at (DateTime)
- invoice_pdf_url (String)
- created_at (DateTime)
```

#### Usage Tracking Table

```sql
- id (UUID, Primary Key)
- merchant_id (UUID, Foreign Key)
- subscription_id (UUID, Foreign Key)
- month_year (String) // "2024-01"
- verifications_used (Integer)
- api_calls_made (Integer)
- features_accessed (JSON)
- overage_charges (Decimal)
- created_at (DateTime)
- updated_at (DateTime)
```

### 6.2 Notification Tables

#### Email Templates Table

```sql
- id (UUID, Primary Key)
- template_key (String, Unique) // "plan_upgrade_confirmation"
- name (String)
- subject (String)
- html_content (Text)
- variables (JSON) // Available template variables
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Notification Queue Table

```sql
- id (UUID, Primary Key)
- recipient_id (UUID)
- recipient_type (Enum: MERCHANT, ADMIN)
- notification_type (String)
- title (String)
- message (Text)
- data (JSON) // Additional data for the notification
- is_read (Boolean)
- email_sent (Boolean)
- email_sent_at (DateTime)
- created_at (DateTime)
```

---

## 7. API Endpoints Required

### 7.1 Public APIs (Landing Page)

```
GET /api/public/plans
- Returns all enabled plans for public display
- Includes pricing, features, and display order
```

### 7.2 Merchant APIs

```
GET /api/merchant/subscription/current
- Returns current subscription details and usage

GET /api/merchant/plans/available
- Returns plans available for upgrade/downgrade

POST /api/merchant/subscription/upgrade
- Initiates plan upgrade process

POST /api/merchant/subscription/payment/verify
- Verifies payment for subscription

GET /api/merchant/billing/history
- Returns billing history and invoices

GET /api/merchant/usage/current
- Returns current month usage statistics
```

### 7.3 Admin APIs

```
GET /api/admin/plans
- Returns all plans (enabled and disabled)

POST /api/admin/plans
- Creates new pricing plan

PUT /api/admin/plans/:id
- Updates existing plan

DELETE /api/admin/plans/:id
- Deletes plan (if no active subscriptions)

GET /api/admin/subscriptions/stats
- Returns subscription statistics by plan

GET /api/admin/merchants/inactive
- Returns inactive merchants (free plan users and downgraded users)

POST /api/admin/merchants/:id/assign-plan
- Admin assigns specific plan to merchant

POST /api/admin/merchants/:id/notify
- Sends notification to specific merchant

GET /api/admin/transactions/billing
- Returns all billing transactions across all merchants
- Supports filtering by date, plan, status, payment method
- Includes pagination and export options

GET /api/admin/revenue/reports
- Returns revenue reports and analytics
```

---

## 8. Implementation Phases

### Phase 1: Database and Core APIs (Week 1-2)

- Create database schema
- Implement basic CRUD APIs for plans and subscriptions
- Set up payment verification system

### Phase 2: Admin Plan Management (Week 3)

- Build admin plan creation/editing interface
- Implement plan statistics dashboard
- Add merchant plan assignment features

### Phase 3: Merchant Subscription Flow (Week 4)

- Complete merchant billing dashboard
- Implement payment processing modal
- Add subscription upgrade/downgrade logic

### Phase 4: Feature Access Control (Week 5)

- Implement plan-based feature gating
- Add usage tracking and limits
- Build overage handling system

### Phase 5: Notification System (Week 6)

- Set up automated email campaigns
- Implement in-app notifications
- Add admin notification management

### Phase 6: Landing Page Integration (Week 7)

- Connect landing page to dynamic plan API
- Add plan comparison features
- Implement conversion tracking

### Phase 7: Analytics and Reporting (Week 8)

- Build revenue reporting dashboard
- Add subscription analytics
- Implement usage analytics

---

## 9. Key Features Summary

### For Admin

- ✅ Create, edit, enable/disable pricing plans
- ✅ View subscription statistics by plan
- ✅ View comprehensive billing transaction history for all users
- ✅ Manage inactive users (free plan and downgraded)
- ✅ Send manual notifications to merchants
- ✅ Assign custom plans to specific merchants
- ✅ Override billing and provide free access
- ✅ View revenue reports and analytics

### For Merchants

- ✅ View current plan and usage statistics
- ✅ Compare and upgrade/downgrade plans
- ✅ Process payments via bank transfer or receipt upload
- ✅ Access features based on current plan
- ✅ View billing history and download invoices
- ✅ Receive automated notifications about plan status

### For Landing Page Visitors

- ✅ View dynamically updated pricing plans
- ✅ See real-time plan availability
- ✅ Compare features across plans
- ✅ Direct signup with plan selection

### Automated Systems

- ✅ 30-day email campaigns for free plan users
- ✅ Re-engagement emails for downgraded users
- ✅ Payment reminders and expiration warnings
- ✅ Usage limit notifications
- ✅ Admin alerts for important events
- ✅ Automatic plan downgrades when payments fail

---

## 10. Success Metrics

### Business Metrics

- Monthly Recurring Revenue (MRR) growth
- Plan upgrade conversion rates
- Customer lifetime value by plan
- Churn rate by plan tier
- Average revenue per user (ARPU)

### Technical Metrics

- Payment success rate
- API response times for plan-related endpoints
- Email delivery rates
- Notification engagement rates
- Feature usage by plan tier

### User Experience Metrics

- Time to complete plan upgrade
- Support ticket volume related to billing
- User satisfaction scores
- Plan comparison page engagement

---

This comprehensive pricing system will provide a complete subscription management solution that scales with the business while providing excellent user experience for both merchants and administrators.
