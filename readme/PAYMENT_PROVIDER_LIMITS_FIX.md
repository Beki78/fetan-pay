# Payment Provider Limits Fix

## Problem

The subscription system was only enforcing payment provider limits during **creation/configuration** but not during **enabling/disabling** actions. This allowed users to enable more payment providers than their plan allowed.

## Root Cause

- The `setActiveReceiverAccount` endpoint had subscription protection (`@ProtectPaymentProviders()`)
- The `enableLastReceiverAccount` endpoint was missing subscription protection
- The `disableActiveReceiverAccount` endpoint didn't need protection (disabling doesn't increase usage)

## Changes Made

### 1. Backend Controller (`server/src/modules/payments/payments.controller.ts`)

- Added `@UseGuards(SubscriptionGuard)` and `@ProtectPaymentProviders()` to the `enableReceiver` endpoint
- Updated API documentation to reflect the subscription limit enforcement

### 2. Subscription Guard (`server/src/common/guards/subscription.guard.ts`)

- Added `payment_providers` case to `getCurrentFeatureUsage()` method
- Added `payment_providers: 2` to free plan limits
- The guard already had proper error handling for payment providers

### 3. Frontend Payment Providers Page (`merchant-admin/src/app/(admin)/payment-providers/page.tsx`)

- Enhanced `handleEnableProvider()` to check limits before enabling and handle backend subscription errors
- Improved `handleConfigure()` logic to distinguish between:
  - Adding new providers (blocked when at limit)
  - Enabling inactive providers (blocked when at limit)
  - Editing active providers (allowed)
- Updated `handleSubmitConfiguration()` to handle subscription limit errors from backend

## How It Works Now

### Creation/Configuration Flow:

1. Frontend checks current usage vs plan limit
2. If at limit, prevents new configurations or enabling inactive providers
3. Backend enforces the same limits with subscription guard
4. Returns 403 error with upgrade message if limit exceeded

### Enable/Disable Flow:

1. **Enable**: Frontend checks limits, backend enforces with subscription guard
2. **Disable**: No limits needed (reduces usage)

### Error Handling:

- Frontend shows user-friendly warnings about plan limits
- Backend returns structured error responses with upgrade information
- Both frontend and backend distinguish between different limit scenarios

## Testing

- Users at their plan limit can still edit existing active providers
- Users at their plan limit cannot enable additional inactive providers
- Users at their plan limit cannot configure new providers
- Error messages are clear and actionable (suggest upgrading)

## Plan Limits

- **Free Plan**: 2 payment providers
- **Paid Plans**: Defined in plan limits (`payment_providers` field)
- **Unlimited Plans**: Set `payment_providers: -1` for unlimited

## API Endpoints Affected

- `POST /payments/receiver-accounts/active` - Creation/configuration (already protected)
- `POST /payments/receiver-accounts/enable` - Enabling (now protected)
- `POST /payments/receiver-accounts/disable` - Disabling (no protection needed)
