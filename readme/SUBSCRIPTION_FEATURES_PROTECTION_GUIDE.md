# FetanPay Subscription Features Protection Guide

## Overview

This document outlines all the features and limits that can be protected with subscription-based access control in the FetanPay system. Each feature can be configured per plan by administrators, allowing flexible pricing tiers and feature combinations.

---

## 1. Core Payment Features

### 1.1 Payment Verification Limits

- **Feature**: Monthly payment verification quota
- **Type**: Numerical limit
- **Current Plans**:
  - Free: 100 verifications/month
  - Starter: 1,000 verifications/month
  - Business: 10,000 verifications/month
  - Custom: Unlimited
- **API Endpoints Protected**:
  - `POST /payments/verify`
  - `POST /payments/claims`
- **Admin Configuration**: Set monthly verification limit per plan
- **Overage Handling**: Block requests when limit exceeded, show upgrade prompt

### 1.2 API Rate Limits

- **Feature**: API requests per minute
- **Type**: Rate limiting
- **Current Plans**:
  - Free: 60 requests/minute
  - Starter: 60 requests/minute
  - Business: 120 requests/minute
  - Custom: Unlimited (or higher limit)
- **API Endpoints Protected**: All API endpoints
- **Admin Configuration**: Set requests per minute per plan
- **Overage Handling**: Throttle requests, return 429 status

---

## 2. Account & Team Management

### 2.1 API Keys Limit

- **Feature**: Number of API keys per merchant
- **Type**: Numerical limit
- **Current Plans**:
  - Free: 2 API keys
  - Starter: 2 API keys
  - Business: 2 API keys
  - Custom: Unlimited
- **API Endpoints Protected**:
  - `POST /api-keys`
- **Admin Configuration**: Set maximum API keys per plan
- **Overage Handling**: Block creation when limit reached

### 2.2 Team Members Limit

- **Feature**: Number of merchant users/employees
- **Type**: Numerical limit
- **Suggested Plans**:
  - Free: 2 team members
  - Starter: 5 team members
  - Business: 15 team members
  - Custom: Unlimited
- **API Endpoints Protected**:
  - `POST /merchant-accounts/:id/users`
- **Admin Configuration**: Set maximum team size per plan
- **Overage Handling**: Block user creation when limit reached

### 2.3 Bank Account Management

- **Feature**: Number of receiver bank accounts
- **Type**: Numerical limit
- **Current Plans**:
  - Free: 2 bank accounts
  - Starter: 5 bank accounts
  - Business: Unlimited
  - Custom: Unlimited
- **API Endpoints Protected**:
  - `POST /payments/receiver-accounts/active`
- **Admin Configuration**: Set maximum bank accounts per plan
- **Overage Handling**: Block account addition when limit reached

---

## 3. Integration & Automation Features

### 3.1 Webhook Endpoints

- **Feature**: Number of webhook endpoints
- **Type**: Numerical limit
- **Suggested Plans**:
  - Free: 1 webhook
  - Starter: 3 webhooks
  - Business: 10 webhooks
  - Custom: Unlimited
- **API Endpoints Protected**:
  - `POST /webhooks`
- **Admin Configuration**: Set maximum webhooks per plan
- **Overage Handling**: Block webhook creation when limit reached

### 3.2 Webhook Features

- **Feature**: Advanced webhook capabilities
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: Basic webhooks only
  - Starter: Basic webhooks + retry logic
  - Business: All webhook features + custom endpoints
  - Custom: All features + priority delivery
- **API Endpoints Protected**:
  - `POST /webhooks/:id/test`
  - `POST /webhooks/:id/retry/:deliveryId`
- **Admin Configuration**: Enable/disable webhook features per plan

---

## 4. Data & Analytics Features

### 4.1 Transaction History Retention

- **Feature**: How long transaction data is kept
- **Type**: Time-based limit
- **Current Plans**:
  - Free: 30 days
  - Starter: 6 months (180 days)
  - Business: 12 months (365 days)
  - Custom: Unlimited
- **API Endpoints Protected**:
  - `GET /payments/verification-history`
  - `GET /payments/tips`
- **Admin Configuration**: Set retention period in days per plan
- **Overage Handling**: Filter results by date range

### 4.2 Export Functionality

- **Feature**: Data export capabilities
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: No export
  - Starter: Basic CSV export
  - Business: CSV + PDF export
  - Custom: All formats + automated exports
- **API Endpoints Protected**:
  - Export endpoints (when implemented)
- **Admin Configuration**: Enable/disable export formats per plan

### 4.3 Analytics Depth

- **Feature**: Level of analytics and reporting
- **Type**: Feature toggle
- **Current Plans**:
  - Free: Basic analytics
  - Starter: Advanced analytics
  - Business: Advanced analytics & reporting
  - Custom: Custom analytics + real-time dashboards
- **API Endpoints Protected**:
  - Analytics endpoints
- **Admin Configuration**: Set analytics level per plan

---

## 5. Branding & Customization

### 5.1 UI Watermark Removal

- **Feature**: Remove "Powered by FetanPay" watermark
- **Type**: Feature toggle
- **Current Plans**:
  - Free: Watermark shown
  - Starter: Watermark shown
  - Business: Watermark removed
  - Custom: Watermark removed
- **API Endpoints Protected**:
  - Frontend UI components
- **Admin Configuration**: Enable/disable watermark removal per plan

### 5.2 Custom Branding

- **Feature**: Custom logos, colors, and branding
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: No custom branding
  - Starter: Basic branding (colors only)
  - Business: Full branding (logo + colors)
  - Custom: White-label solution
- **API Endpoints Protected**:
  - `PUT /merchants/:merchantId/branding`
- **Admin Configuration**: Enable/disable branding features per plan

### 5.3 Custom Domain Support

- **Feature**: Use custom domain for payment pages
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: No custom domain
  - Starter: No custom domain
  - Business: Subdomain support
  - Custom: Full custom domain
- **API Endpoints Protected**:
  - Domain configuration endpoints
- **Admin Configuration**: Enable/disable custom domains per plan

---

## 6. Wallet & Financial Features

### 6.1 Wallet Functionality

- **Feature**: Access to wallet system
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: No wallet
  - Starter: Basic wallet
  - Business: Full wallet features
  - Custom: Advanced wallet + custom rules
- **API Endpoints Protected**:
  - `POST /wallet/create-deposit`
  - `POST /wallet/verify-deposit`
  - `GET /wallet/transactions`
- **Admin Configuration**: Enable/disable wallet per plan

### 6.2 Wallet Transaction Limits

- **Feature**: Monthly wallet transaction limits
- **Type**: Numerical limit
- **Suggested Plans**:
  - Free: N/A (no wallet)
  - Starter: 50 transactions/month
  - Business: 500 transactions/month
  - Custom: Unlimited
- **API Endpoints Protected**: Wallet transaction endpoints
- **Admin Configuration**: Set transaction limits per plan

---

## 7. Support & Service Features

### 7.1 Support Level

- **Feature**: Level of customer support
- **Type**: Service tier
- **Suggested Plans**:
  - Free: Community support only
  - Starter: Email support (48h response)
  - Business: Priority support (24h response)
  - Custom: Dedicated support (4h response)
- **Implementation**: Support ticket priority system
- **Admin Configuration**: Set support tier per plan

### 7.2 API Documentation Access

- **Feature**: Access to advanced API documentation
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: Basic API docs
  - Starter: Full API docs
  - Business: API docs + code examples
  - Custom: API docs + dedicated integration support
- **Implementation**: Documentation access control
- **Admin Configuration**: Set documentation level per plan

---

## 8. Advanced Features

### 8.1 IP Whitelisting

- **Feature**: Restrict API access to specific IP addresses
- **Type**: Feature toggle + numerical limit
- **Suggested Plans**:
  - Free: No IP whitelisting
  - Starter: Up to 5 IP addresses
  - Business: Up to 20 IP addresses
  - Custom: Unlimited IP addresses
- **API Endpoints Protected**:
  - `POST /ip-addresses`
- **Admin Configuration**: Enable IP whitelisting + set IP limit per plan

### 8.2 Custom Integration Support

- **Feature**: Custom API integrations and development
- **Type**: Service tier
- **Suggested Plans**:
  - Free: Self-service only
  - Starter: Basic integration guidance
  - Business: Custom integration support
  - Custom: Dedicated integration team
- **Implementation**: Service level agreement
- **Admin Configuration**: Set integration support level per plan

### 8.3 Notification Limits

- **Feature**: Number of email/SMS notifications
- **Type**: Numerical limit
- **Suggested Plans**:
  - Free: 100 notifications/month
  - Starter: 1,000 notifications/month
  - Business: 10,000 notifications/month
  - Custom: Unlimited
- **API Endpoints Protected**: Notification sending endpoints
- **Admin Configuration**: Set notification limits per plan

---

## 9. Compliance & Security Features

### 9.1 Audit Logs

- **Feature**: Detailed audit logging and compliance reports
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: Basic logs (7 days)
  - Starter: Standard logs (30 days)
  - Business: Full audit logs (1 year)
  - Custom: Comprehensive logs (unlimited)
- **API Endpoints Protected**: Audit log endpoints
- **Admin Configuration**: Enable audit logging per plan

### 9.2 Advanced Security Features

- **Feature**: Two-factor authentication, session management
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: Basic security
  - Starter: 2FA available
  - Business: 2FA + advanced session controls
  - Custom: Enterprise security features
- **Implementation**: Security middleware
- **Admin Configuration**: Enable security features per plan

---

## 10. Performance & Reliability

### 10.1 SLA Guarantees

- **Feature**: Service level agreement guarantees
- **Type**: Service tier
- **Suggested Plans**:
  - Free: No SLA
  - Starter: 99% uptime
  - Business: 99.5% uptime
  - Custom: 99.9% uptime + dedicated infrastructure
- **Implementation**: Monitoring and alerting
- **Admin Configuration**: Set SLA level per plan

### 10.2 Priority Processing

- **Feature**: Priority queue for payment processing
- **Type**: Feature toggle
- **Suggested Plans**:
  - Free: Standard processing
  - Starter: Standard processing
  - Business: Priority processing
  - Custom: Highest priority processing
- **Implementation**: Queue management system
- **Admin Configuration**: Set processing priority per plan

---

## Implementation Strategy

### Phase 1: Core Limits (Week 1-2)

- Payment verification limits
- API rate limits
- API keys limit
- Team members limit

### Phase 2: Integration Features (Week 3-4)

- Webhook limits and features
- Bank account limits
- Transaction history retention

### Phase 3: Advanced Features (Week 5-6)

- Branding and customization
- Wallet functionality
- Export capabilities

### Phase 4: Service Features (Week 7-8)

- Support levels
- Security features
- Compliance features

---

## Admin Configuration Interface

Each feature should be configurable through the admin interface with:

1. **Feature Toggle**: Enable/disable the feature for a plan
2. **Numerical Limits**: Set specific numbers (verifications, API keys, etc.)
3. **Time Limits**: Set retention periods, response times
4. **Service Tiers**: Select service levels (support, SLA, etc.)
5. **Usage Tracking**: Monitor current usage against limits
6. **Overage Handling**: Define what happens when limits are exceeded

---

## Benefits of This Approach

1. **Flexible Pricing**: Create any combination of features for different plans
2. **Scalable Growth**: Easy to add new features and limits
3. **Revenue Optimization**: Encourage upgrades through feature restrictions
4. **Resource Management**: Control system load through limits
5. **Customer Segmentation**: Serve different customer needs with appropriate features

This comprehensive feature protection system will enable FetanPay to offer flexible, scalable pricing plans that grow with customer needs while protecting system resources and encouraging plan upgrades.
