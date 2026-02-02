# Notification Requirements - Admin vs Merchant-Admin

## Overview

This document outlines the notification requirements for the two main client applications in the Fetan Pay system:

- **Admin**: Platform-wide management dashboard for system administrators
- **Merchant-Admin**: Individual merchant management dashboard for business owners and their teams

## Client Applications Comparison

### Admin Dashboard

**Purpose**: System-wide management and monitoring
**Users**: Platform administrators
**Scope**: All merchants, system health, platform operations

**Key Sections**:

- Analytics & System Monitoring
- Communications (Email campaigns)
- Payment Providers Management
- Merchants Management (approve/reject)
- Unified Payments View (all merchants)
- Wallet Management (all merchants)
- System Branding & Configuration

### Merchant-Admin Dashboard

**Purpose**: Individual merchant business management
**Users**: Merchant owners and their team members
**Scope**: Single merchant operations

**Key Sections**:

- Payment Processing & Verification
- Wallet Management & Deposits
- Team Member Management
- API Keys & Webhooks
- Merchant-specific Branding
- Payment Provider Configuration

## Notification Requirements Table

| Action/Event                      | Admin Needs Notification | Merchant-Admin Needs Notification | Priority | Notification Type |
| --------------------------------- | ------------------------ | --------------------------------- | -------- | ----------------- |
| **MERCHANT MANAGEMENT**           |
| New merchant registration         | ✅                       | ❌                                | HIGH     | Email + In-app    |
| Merchant approval/rejection       | ✅                       | ✅ (own status)                   | HIGH     | Email             |
| Merchant Ban/Unban                | ✅                       | ✅ (own status)                   | HIGH   | Email + In-app      |
| **WALLET OPERATIONS**             |
| Deposit successful                | ✅                       | ✅                                | HIGH     | Email + In-app    |
| Wallet balance low                | ❌                       | ✅                                | MEDIUM   | Email + In-app    |
| **SYSTEM HEALTH**                 |
| High CPU/Memory usage             | ✅                       | ❌                                | CRITICAL | Email + In-app    |
| **COMMUNICATIONS**                |
| Campaign completed                | ✅                       | ❌                                | MEDIUM   | Email + In-app    |
| Campaign failed                   | ✅                       | ❌                                | HIGH     | Email + In-app    |
| **BRANDING**                      |
| Branding updated                  | ❌                       | ✅                                | LOW      | In-app            |

## Notification Types

### 1. **In-app Notifications**

- **Implementation**: Database-based notification system (no WebSocket required)
- **Display**: Notification bell icon with unread count
- **Features**:
  - Notification center/dropdown with history
  - Mark as read/unread functionality
  - Toast messages for immediate actions
  - Persistent notification list
- **Storage**: Notifications table in database
- **Polling**: Client polls for new notifications on page load/refresh

### 2. **Email Notifications**

- **Implementation**: Existing email service (Nodemailer)
- **Features**:
  - Important events and summaries
  - Daily/weekly digest options
  - Formatted HTML emails with action buttons
  - Email templates for different event types
- **Delivery**: Immediate for high/critical priority, batched for low priority

## Priority Levels

- **CRITICAL**: System failures, security breaches (Email + In-app immediately)
- **HIGH**: Payment events, merchant status changes (Email + In-app immediately)
- **MEDIUM**: Team changes, API events, wallet operations (Email + In-app, can be delayed)
- **LOW**: Branding updates, tips, minor events (In-app only, can be batched)

## Implementation Architecture

### Database Schema

```sql
-- Notifications table
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  user_type ENUM('ADMIN', 'MERCHANT_USER') NOT NULL,
  merchant_id VARCHAR NULL, -- NULL for admin notifications
  type VARCHAR NOT NULL, -- 'PAYMENT_RECEIVED', 'MERCHANT_APPROVED', etc.
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSON NULL, -- Additional event data
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email notifications log
CREATE TABLE email_notifications (
  id VARCHAR PRIMARY KEY,
  notification_id VARCHAR REFERENCES notifications(id),
  to_email VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  template VARCHAR NOT NULL,
  status ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// Get notifications for current user
GET /api/notifications
Query params: ?page=1&limit=20&unread_only=true

// Mark notification as read
PATCH /api/notifications/:id/read

// Mark all notifications as read
PATCH /api/notifications/mark-all-read

// Get unread count
GET /api/notifications/unread-count
```

### Notification Service

```typescript
class NotificationService {
  // Create notification (in-app + email if needed)
  async createNotification(params: {
    userId: string;
    userType: "ADMIN" | "MERCHANT_USER";
    merchantId?: string;
    type: string;
    title: string;
    message: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    data?: any;
    sendEmail?: boolean;
  });

  // Get notifications for user
  async getNotifications(userId: string, options: PaginationOptions);

  // Mark as read
  async markAsRead(notificationId: string);

  // Send email notification
  async sendEmailNotification(notificationId: string);
}
```

## Current State

### ✅ Already Implemented

- Email service (Nodemailer)
- Toast notifications in UI components
- Email templates system
- User authentication and roles

### ❌ Missing Components

- In-app notification system
- Notification database tables
- Notification API endpoints
- Notification preferences
- Notification history/logs
- Email notification triggers

## User Roles & Notification Access

### Admin Users

- **Scope**: System-wide notifications
- **Types**: System health, merchant management, communications
- **Delivery**: Email + In-app for all priorities

### Merchant Users

- **Scope**: Merchant-specific notifications only
- **Types**: Payments, wallet, team, API/webhooks
- **Delivery**: Email + In-app based on role permissions
- **Roles**:
  - **Owner**: All merchant notifications
  - **Admin**: Payment + team + API notifications
  - **Accountant**: Payment + wallet notifications
  - **Sales/Waiter**: Payment notifications only

## Implementation Steps

1. **Database Setup**
   - Create notifications and email_notifications tables
   - Add indexes for performance

2. **Backend API**
   - Create notification service
   - Add API endpoints for CRUD operations
   - Integrate with existing email service

3. **Frontend Components**
   - Notification bell icon with unread count
   - Notification dropdown/center
   - Toast notification system
   - Notification preferences page

4. **Event Triggers**
   - Add notification creation to existing business logic
   - Configure email sending based on priority
   - Set up notification cleanup/archiving

5. **Testing & Monitoring**
   - Test notification delivery
   - Monitor email delivery rates
   - Performance testing for notification queries

## Email Templates by Event Type

| Event Type          | Template                | Recipients                |
| ------------------- | ----------------------- | ------------------------- |
| MERCHANT_APPROVED   | merchant-approval.html  | Merchant Owner            |
| PAYMENT_RECEIVED    | payment-received.html   | Merchant Team             |
| DEPOSIT_VERIFIED    | deposit-verified.html   | Merchant Owner/Accountant |
| SYSTEM_ALERT        | system-alert.html       | Admin Users               |
| TEAM_MEMBER_INVITED | team-invite.html        | New Team Member           |
| WALLET_LOW_BALANCE  | wallet-low-balance.html | Merchant Owner/Accountant |
| CAMPAIGN_COMPLETED  | campaign-completed.html | Admin Users               |

This approach provides a simple, reliable notification system without the complexity of real-time WebSocket connections, while still delivering timely notifications through email and persistent in-app notifications.
