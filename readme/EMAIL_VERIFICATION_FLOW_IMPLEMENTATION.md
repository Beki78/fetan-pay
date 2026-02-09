# Email Verification Flow Implementation

## Overview

Implemented a two-stage merchant verification system where merchants are created as UNVERIFIED and only promoted to PENDING after email verification.

## Changes Made

### 1. Database Schema (`server/prisma/schema.prisma`)

- Added `UNVERIFIED` status to `MerchantStatus` enum
- Order: `UNVERIFIED` → `PENDING` → `ACTIVE` → `SUSPENDED`
- Migration created: `20260207084202_add_unverified_merchant_status`

### 2. Backend Service (`server/src/modules/merchants/merchants.service.ts`)

#### Updated Methods:

- **`selfRegister()`**: Changed to create merchants with `UNVERIFIED` status instead of `PENDING`
- Removed admin notification from signup (moved to after verification)

#### New Methods:

- **`promoteToVerified(email)`**: Promotes merchant from UNVERIFIED to PENDING after email verification
  - Checks if user has verified email in Better Auth
  - Updates merchant status to PENDING
  - Sends notification to admins about new merchant registration
- **`sendVerificationReminder(merchantId)`**: Sends reminder email to unverified merchants
  - Validates merchant is in UNVERIFIED status
  - Sends email via notification service

### 3. Backend Controller (`server/src/modules/merchants/merchants.controller.ts`)

#### New Endpoints:

- **POST `/merchant-accounts/promote-to-verified`**: Promotes merchant after email verification
  - Requires authentication
  - User can only promote their own merchant
  - Called from frontend after OTP verification

- **POST `/merchant-accounts/:id/send-verification-reminder`**: Sends verification reminder
  - Admin only endpoint
  - Sends email to merchant owner

### 4. Notification Service (`server/src/modules/notifications/notification.service.ts`)

#### New Method:

- **`sendVerificationReminder(ownerEmail, ownerName, merchantName)`**
  - Sends verification reminder email
  - Uses template if available, falls back to generic email
  - Creates email log entry

### 5. Frontend - Merchant Admin

#### Updated Files:

- **`merchant-admin/src/lib/services/merchantsServiceApi.ts`**
  - Added `promoteToVerified(email)` function

- **`merchant-admin/src/components/auth/EmailVerificationForm.tsx`**
  - Added call to `promoteToVerified()` after successful email verification
  - Only called for signup flow (not login flow)
  - Merchant is promoted from UNVERIFIED to PENDING

### 6. Frontend - Admin Panel

#### Updated Files:

- **`admin/src/app/(admin)/users/page.tsx`**
  - Added tab navigation (Pending Approval / Awaiting Verification)
  - Uses same tab component as profile page

- **`admin/src/components/users/UnverifiedMerchantsTable.tsx`** (NEW)
  - Shows merchants with UNVERIFIED status
  - "Notify" button to send verification reminders
  - Yellow badge for "Awaiting Verification" status
  - Info box explaining unverified merchants

- **`admin/src/lib/redux/features/merchantsApi.ts`**
  - Added `UNVERIFIED` to `MerchantStatus` type
  - Added `sendVerificationReminder` mutation
  - Exported `useSendVerificationReminderMutation` hook

## Flow Diagram

```
User Signup
    ↓
Create Merchant (UNVERIFIED)
Create MerchantUser (INVITED)
Create Better Auth User (emailVerified: false)
    ↓
Send OTP Email
    ↓
User Enters OTP
    ↓
Better Auth Verifies Email
    ↓
Frontend calls promoteToVerified()
    ↓
Merchant Status: UNVERIFIED → PENDING
    ↓
Admin Gets Notification
    ↓
Admin Sees Merchant in "Pending Approval" Tab
    ↓
Admin Approves
    ↓
Merchant Status: PENDING → ACTIVE
```

## Admin Panel Tabs

### Tab 1: Pending Approval

- Shows merchants with status: PENDING, ACTIVE
- These are verified users waiting for admin approval
- Actions: Approve, Reject, View Details

### Tab 2: Awaiting Verification

- Shows merchants with status: UNVERIFIED
- These are users who haven't verified email yet
- Actions: Notify (send verification reminder)
- Info box explaining the status

## API Endpoints

### Public Endpoints:

- `POST /merchant-accounts/self-register` - Create merchant (UNVERIFIED)
- `POST /merchant-accounts/promote-to-verified` - Promote after verification (requires auth)

### Admin Endpoints:

- `GET /merchant-accounts?status=UNVERIFIED` - List unverified merchants
- `POST /merchant-accounts/:id/send-verification-reminder` - Send reminder

## Benefits

1. **Cleaner Admin Panel**: Admins only see verified signups in pending list
2. **Reduced Spam**: Unverified accounts don't clutter the system
3. **Better UX**: Clear separation between verification and approval stages
4. **Reminder System**: Admins can nudge users to verify their email
5. **No Breaking Changes**: Existing merchants remain PENDING or ACTIVE

## Testing Checklist

- [ ] New signup creates merchant with UNVERIFIED status
- [ ] Admin panel shows UNVERIFIED merchants in "Awaiting Verification" tab
- [ ] Email verification promotes merchant to PENDING
- [ ] Admin gets notification after verification (not before)
- [ ] Admin can send verification reminder
- [ ] Existing merchants still work (PENDING/ACTIVE)
- [ ] Admin-created merchants skip UNVERIFIED stage

## Next Steps

1. Add cleanup job to delete UNVERIFIED merchants older than 7-30 days
2. Create email template for verification reminder
3. Add metrics to track verification rates
4. Consider adding rate limiting on verification reminders
