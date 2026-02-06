# Onboarding Bank Setup Fix

## Problem

Merchants were unable to add a bank account during signup because:

1. The MerchantUser was created with `status: 'INVITED'` and `userId: null`
2. The `merchantUsersService.me()` method rejected INVITED users
3. The `requireMembership()` method couldn't find the merchant membership
4. Result: "Merchant membership required" error

## Root Cause Analysis

### The Flow:

1. **User signs up** → Creates:
   - Merchant (status: `PENDING`)
   - MerchantUser (status: `INVITED`, userId: null initially)
   - Better Auth User (via `signUpWithEmailAndPassword`)

2. **After signup**, user is authenticated with Better Auth session

3. **User tries to add bank account** → Calls `/api/v1/payments/receiver-accounts/active`

4. **In `requireMembership()` method:**
   - Calls `merchantUsersService.me(req)`
   - **The `me()` method THROWS** because:
     ```typescript
     if (membership.status !== "ACTIVE") {
       throw new UnauthorizedException(
         `Your account is ${membership.status}. Please contact support.`,
       );
     }
     ```
   - Code never reaches fallback logic

5. **Additional Issue:**
   - MerchantUser created with `userId: existingUser?.id`
   - But `existingUser` looked up BEFORE Better Auth user created
   - So MerchantUser has `userId: null`
   - Query `where: { userId: authUserId }` in `me()` won't find membership

## Solution Implemented

### 1. Added User Linking Endpoint

**File:** `server/src/modules/merchants/merchants.service.ts`

- Added `linkUserToMerchant(email, userId)` method
- Links Better Auth user to MerchantUser after signup
- Updates the `userId` field in MerchantUser

**File:** `server/src/modules/merchants/merchants.controller.ts`

- Added `POST /merchant-accounts/link-user` endpoint
- Called after Better Auth signup completes

### 2. Updated Frontend to Link User

**File:** `merchant-admin/src/lib/services/merchantsServiceApi.ts`

- Added `linkUserToMerchant()` function
- Calls the link-user endpoint with session credentials

**File:** `merchant-admin/src/components/auth/SignUpForm.tsx`

- Calls `linkUserToMerchant()` after successful Better Auth signup
- Ensures MerchantUser has correct userId before bank setup

### 3. Fixed requireMembership to Handle INVITED Users

**File:** `server/src/modules/payments/payments.service.ts`

- Wrapped `merchantUsersService.me()` in try-catch
- If `me()` throws, falls back to direct query for INVITED membership
- Allows PENDING merchants with INVITED status to add bank accounts

### 4. Conditional Subscription Guard

**File:** `server/src/modules/payments/payments.controller.ts`

- Removed `@UseGuards(SubscriptionGuard)` from `setActiveReceiver` and `enableReceiver`
- Moved subscription checking to service layer

**File:** `server/src/modules/payments/payments.service.ts`

- Added `setActiveReceiverAccountWithGuard()` wrapper method
- Checks if merchant is PENDING with 0 active accounts (onboarding exception)
- Bypasses subscription limits for first bank account during onboarding
- Enforces subscription limits for ACTIVE (approved) merchants

## Onboarding Flow (After Fix)

1. **User fills signup form** → Step 1: Account Creation
2. **Submit form:**
   - Call `selfRegisterMerchant()` → Creates Merchant + MerchantUser (INVITED)
   - Call `signUpWithEmailAndPassword()` → Creates Better Auth user + session
   - Call `linkUserToMerchant()` → Links userId to MerchantUser
   - Move to Step 2: Bank Setup

3. **User selects bank and enters account details**
4. **Submit bank form:**
   - Call `setActiveReceiverAccount()` API
   - `requireMembership()` finds INVITED membership (now with userId)
   - `setActiveReceiverAccountWithGuard()` checks:
     - Merchant status: PENDING ✓
     - Active accounts: 0 ✓
     - Onboarding exception: ALLOWED ✓
   - Bank account created successfully

5. **User can skip bank setup** → Redirect to dashboard

## Key Changes

### Backend Changes:

1. **merchants.service.ts**: Added `linkUserToMerchant()` method
2. **merchants.controller.ts**: Added `POST /merchant-accounts/link-user` endpoint
3. **payments.service.ts**:
   - Updated `requireMembership()` to catch exceptions and check INVITED status
   - Added `setActiveReceiverAccountWithGuard()` for conditional subscription checking
   - Added `enableLastReceiverAccountWithGuard()` for conditional subscription checking
4. **payments.controller.ts**: Removed guards, delegated to service layer

### Frontend Changes:

1. **merchantsServiceApi.ts**: Added `linkUserToMerchant()` function
2. **SignUpForm.tsx**: Call `linkUserToMerchant()` after Better Auth signup

## Benefits

1. **Seamless Onboarding**: Users can add one bank account during signup without admin approval
2. **Subscription Enforcement**: After merchant approval, subscription limits apply
3. **Better UX**: No "Merchant membership required" errors during onboarding
4. **Proper User Linking**: MerchantUser correctly linked to Better Auth user

## Testing

### Test Scenario 1: New Merchant Signup with Bank Setup

1. Go to signup page
2. Fill in all fields (business name, personal info, password, phone)
3. Accept terms and submit
4. Should move to Step 2: Bank Setup
5. Select a bank (CBE, Telebirr, etc.)
6. Enter account number and holder name
7. Submit bank setup
8. Should redirect to dashboard with bank account configured

### Test Scenario 2: New Merchant Signup without Bank Setup

1. Complete Step 1: Account Creation
2. On Step 2: Bank Setup, click "Skip for Now"
3. Should redirect to dashboard without bank account

### Test Scenario 3: Approved Merchant Adding Second Bank

1. Admin approves merchant (status: ACTIVE)
2. Merchant tries to add second bank account
3. Should check subscription limits
4. If limit reached, show upgrade message

## Files Modified

### Backend:

- `server/src/modules/merchants/merchants.service.ts`
- `server/src/modules/merchants/merchants.controller.ts`
- `server/src/modules/payments/payments.service.ts`
- `server/src/modules/payments/payments.controller.ts`

### Frontend:

- `merchant-admin/src/lib/services/merchantsServiceApi.ts`
- `merchant-admin/src/components/auth/SignUpForm.tsx`

## Notes

- PENDING merchants can add ONE bank account without subscription limits
- After merchant approval (status → ACTIVE), subscription limits are enforced
- The first bank account can be added during signup before admin approval
- User linking happens automatically after Better Auth signup
- The system gracefully handles cases where linking fails (non-critical operation)
