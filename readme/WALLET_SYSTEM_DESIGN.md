# Merchant Wallet System - Design & Implementation Guide

## Overview

This document outlines the design for implementing a **deposit wallet system** for merchants that automatically charges fees when payments are successfully verified. The system supports flexible configuration per merchant, allowing some merchants to use wallet deduction while others operate without it.

---

## Current System Analysis

### Payment Verification Flow

1. **Merchant scans QR code** or enters transaction reference
2. **Backend verifies** payment against bank/provider API
3. **If verified** (`PaymentStatus.VERIFIED`):
   - Creates an `Order` record
   - Creates/updates a `Payment` record
   - Sets `verifiedAt` timestamp
4. **Current "wallet balance"** is just the sum of verified payment amounts (not a real wallet)

### Key Files

- **`server/src/modules/payments/payments.service.ts`** - `verifyMerchantPayment()` method (lines 211-434)
- **`server/prisma/schema.prisma`** - Database schema (Merchant model at line 73)
- **`server/src/modules/merchant-admin-dashboard/merchant-admin-dashboard.service.ts`** - Current wallet balance calculation

---

## Proposed Architecture

### 1. Database Schema Changes

#### Add to `Merchant` Model:

```prisma
model Merchant {
  // ... existing fields ...
  
  // Wallet System
  walletBalance        Decimal   @default(0) @db.Decimal(12, 2)  // Current deposit balance
  walletEnabled        Boolean   @default(false)                 // Feature flag: enable wallet deduction
  walletChargeType     String?   @default("PERCENTAGE")          // "PERCENTAGE" | "FIXED" | null
  walletChargeValue    Decimal?  @db.Decimal(10, 4)              // e.g., 2.5 for 2.5% or 10.00 for fixed ETB
  walletMinBalance     Decimal?  @db.Decimal(10, 2)              // Minimum balance threshold (optional)
  
  // Relations
  walletTransactions   WalletTransaction[]
  
  // ... rest of model ...
}
```

#### New `WalletTransaction` Model:

```prisma
model WalletTransaction {
  id              String   @id @default(uuid())
  merchantId      String
  merchant        Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  
  // Transaction details
  type            WalletTransactionType
  amount          Decimal  @db.Decimal(12, 2)  // Positive for deposits, negative for charges
  balanceBefore   Decimal  @db.Decimal(12, 2)
  balanceAfter    Decimal  @db.Decimal(12, 2)
  
  // Related entities
  paymentId       String?  // If this charge is related to a payment verification
  payment         Payment? @relation(fields: [paymentId], references: [id], onDelete: SetNull)
  orderId         String?  // If related to an order
  
  // Metadata
  description     String?  // e.g., "Payment verification fee for reference ABC123"
  metadata        Json?    // Additional data (charge rate, payment amount, etc.)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([merchantId])
  @@index([paymentId])
  @@index([createdAt])
  @@map("wallet_transaction")
}

enum WalletTransactionType {
  DEPOSIT           // Manual/admin deposit
  CHARGE            // Automatic charge on payment verification
  REFUND            // Refund of a charge
  ADJUSTMENT        // Manual balance adjustment
}
```

#### Update `Payment` Model:

```prisma
model Payment {
  // ... existing fields ...
  
  // Wallet integration
  walletCharged    Boolean  @default(false)  // Whether wallet was charged for this payment
  walletChargeAmount Decimal? @db.Decimal(10, 2)  // Amount charged from wallet
  walletTransactionId String?  // Link to WalletTransaction if charged
  
  // ... rest of model ...
}
```

#### New `WalletDepositReceiverAccount` Model:

```prisma
model WalletDepositReceiverAccount {
  id              String   @id @default(uuid())
  
  // Admin-configured receiver account for wallet deposits
  provider        TransactionProvider
  receiverAccount String
  receiverName    String?
  receiverLabel   String?  // e.g., "FetanPay Wallet Deposit - CBE"
  
  // Status
  status          String   @default("ACTIVE")  // "ACTIVE" | "INACTIVE"
  
  // Metadata
  meta            Json?    // Additional configuration
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  verifiedDeposits WalletDeposit[]
  
  @@unique([provider, receiverAccount], name: "wallet_deposit_receiver_unique")
  @@index([provider, status])
  @@map("wallet_deposit_receiver_account")
}
```

#### New `WalletDeposit` Model:

```prisma
model WalletDeposit {
  id              String   @id @default(uuid())
  merchantId      String
  merchant        Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  
  // Deposit verification details
  provider        TransactionProvider
  reference       String   // Transaction reference from bank/provider
  amount          Decimal  @db.Decimal(12, 2)  // Amount deposited
  
  // Receiver account used
  receiverAccountId String
  receiverAccount   WalletDepositReceiverAccount @relation(fields: [receiverAccountId], references: [id], onDelete: Restrict)
  
  // Verification status
  status          WalletDepositStatus @default(PENDING)
  verifiedAt      DateTime?
  verifiedBy      String?  // Merchant user ID who verified
  
  // Verification payload from bank API
  verificationPayload Json?
  
  // Related wallet transaction (created after verification)
  walletTransactionId String?  // Link to WalletTransaction
  walletTransaction   WalletTransaction? @relation(fields: [walletTransactionId], references: [id], onDelete: SetNull)
  
  // Metadata
  description     String?
  errorMessage    String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([merchantId, provider, reference], name: "wallet_deposit_unique")
  @@index([merchantId])
  @@index([provider, reference])
  @@index([status])
  @@map("wallet_deposit")
}

enum WalletDepositStatus {
  PENDING     // Awaiting verification
  VERIFIED    // Successfully verified and added to wallet
  UNVERIFIED  // Verification failed
  EXPIRED     // Verification timeout
}
```

#### Update `WalletTransaction` Model (add deposit reference):

```prisma
model WalletTransaction {
  // ... existing fields ...
  
  // Add deposit reference
  walletDepositId String?
  walletDeposit   WalletDeposit? @relation(fields: [walletDepositId], references: [id], onDelete: SetNull)
  
  // ... rest of model ...
}
```

---

### 2. Wallet Top-Up/Deposit Flow

#### Overview

Merchants can top up their wallet by:
1. **Admin configures** wallet deposit receiver accounts (one per provider)
2. **Merchant views** deposit receiver account details
3. **Merchant sends money** to the receiver account via their bank/provider app
4. **Merchant verifies** the deposit by scanning QR code or entering transaction reference
5. **System verifies** the deposit against the configured receiver account
6. **If verified**, amount is added to merchant's wallet balance

#### Top-Up Flow Diagram

```
Merchant wants to top up wallet
    ↓
View wallet deposit receiver accounts (admin-configured)
    ↓
Select provider (CBE, TeleBirr, Awash, etc.)
    ↓
See receiver account details (account number, name, QR code)
    ↓
Merchant sends money to that account via bank/provider app
    ↓
Merchant gets transaction reference
    ↓
Merchant verifies deposit (scan QR or enter reference)
    ↓
System verifies against WalletDepositReceiverAccount
    ↓
Check: Amount matches? Receiver account matches?
    ↓ YES
Create WalletDeposit record (status: VERIFIED)
    ↓
Add amount to merchant.walletBalance
    ↓
Create WalletTransaction (type: DEPOSIT)
    ↓
Link WalletDeposit to WalletTransaction
    ↓
Return success to merchant
```

#### Admin Configuration Flow

```
Admin Panel → Wallet Settings
    ↓
Configure Wallet Deposit Receiver Accounts
    ↓
For each provider (CBE, TeleBirr, Awash, BOA, Dashen):
  - Enter receiver account number
  - Enter receiver name
  - Set status (ACTIVE/INACTIVE)
  - Optional: Generate/upload QR code
    ↓
Save configuration
    ↓
Merchants can now see these accounts for top-up
```

#### Deposit Verification Logic

Similar to payment verification, but:
- **Verifies against** `WalletDepositReceiverAccount` (not merchant's receiver account)
- **No order creation** (direct wallet deposit)
- **No charge calculation** (deposit is the full amount)
- **Creates** `WalletDeposit` record instead of `Payment` record

#### Duplicate Deposit Prevention

- Use unique constraint: `[merchantId, provider, reference]`
- If same reference already verified → return error: "This deposit has already been processed"
- Prevent double-crediting wallet balance

---

### 3. Business Logic Design

#### Charge Calculation Strategy

**Option A: Percentage-based (Recommended)**
- Charge a percentage of the verified payment amount
- Example: 2.5% of payment = 2,500 ETB payment → 62.50 ETB charge

**Option B: Fixed amount**
- Charge a fixed fee per verification
- Example: 10 ETB per verified payment

**Option C: Tiered/Volume-based**
- Different rates based on transaction volume or amount
- Example: 2% for < 10,000 ETB, 1.5% for >= 10,000 ETB

**Recommendation**: Start with **Option A (Percentage)** as it's most flexible and fair.

#### Charge Flow

```
Payment Verification Success
    ↓
Check: merchant.walletEnabled === true?
    ↓ YES
Check: merchant.walletBalance >= calculatedCharge?
    ↓ YES
Calculate charge amount (percentage or fixed)
    ↓
Deduct from walletBalance
    ↓
Create WalletTransaction record (type: CHARGE)
    ↓
Update Payment record (walletCharged: true, walletChargeAmount: X)
    ↓
Continue with normal verification flow
```

#### Insufficient Balance Handling

**Option 1: Block Verification (Strict)**
- If balance < charge amount → **Reject verification**
- Return error: "Insufficient wallet balance. Please deposit funds."

**Option 2: Allow with Warning (Flexible)**
- If balance < charge amount → **Allow verification** but:
  - Set `walletCharged: false`
  - Log warning/notification
  - Send alert to merchant admin
  - Create pending charge record for later collection

**Option 3: Allow Negative Balance (Credit)**
- Allow verification even if balance goes negative
- Merchant must deposit to clear negative balance
- Optional: Set credit limit per merchant

**Recommendation**: Start with **Option 1 (Strict)** for simplicity. Can add flexibility later.

---

### 3. Implementation Plan

#### Phase 1: Database & Models

1. **Create migration** for new schema fields
2. **Update Prisma schema** with new models
3. **Run migration** and update seed data

#### Phase 2: Core Wallet Service

Create `server/src/modules/wallet/wallet.service.ts`:

```typescript
@Injectable()
export class WalletService {
  // Charge calculation
  async calculateCharge(
    merchantId: string,
    paymentAmount: Decimal,
  ): Promise<Decimal | null> {
    // Get merchant wallet config
    // Calculate charge based on type (percentage/fixed)
    // Return charge amount or null if wallet disabled
  }

  // Charge wallet for payment verification
  async chargeForPayment(
    merchantId: string,
    paymentId: string,
    paymentAmount: Decimal,
  ): Promise<{
    success: boolean;
    chargeAmount: Decimal | null;
    walletTransactionId: string | null;
    error?: string;
  }> {
    // Check if wallet enabled
    // Check balance
    // Calculate charge
    // Deduct from balance
    // Create WalletTransaction
    // Update Payment record
  }

  // Manual deposit (admin only)
  async deposit(
    merchantId: string,
    amount: Decimal,
    description?: string,
  ): Promise<WalletTransaction> {
    // Add to wallet balance
    // Create DEPOSIT transaction
  }

  // Verify wallet deposit (merchant-initiated)
  async verifyWalletDeposit(
    merchantId: string,
    provider: TransactionProvider,
    reference: string,
    req: Request,
  ): Promise<{
    success: boolean;
    status: WalletDepositStatus;
    amount: Decimal | null;
    walletDeposit: WalletDeposit | null;
    error?: string;
  }> {
    // 1. Get active wallet deposit receiver account for provider
    // 2. Verify transaction against bank/provider API
    // 3. Check receiver account matches
    // 4. Check amount
    // 5. Create WalletDeposit record
    // 6. Add to wallet balance
    // 7. Create WalletTransaction (type: DEPOSIT)
    // 8. Link WalletDeposit to WalletTransaction
  }

  // Get wallet deposit receiver accounts (for merchant to see where to send money)
  async getDepositReceiverAccounts(): Promise<WalletDepositReceiverAccount[]> {
    // Return all ACTIVE wallet deposit receiver accounts
  }

  // Admin: Configure wallet deposit receiver account
  async setDepositReceiverAccount(
    provider: TransactionProvider,
    receiverAccount: string,
    receiverName: string,
    receiverLabel?: string,
  ): Promise<WalletDepositReceiverAccount> {
    // Create or update wallet deposit receiver account
  }

  async getBalance(merchantId: string): Promise<Decimal> {
    // Return current wallet balance
  }

  async getTransactionHistory(
    merchantId: string,
    query: { page?: number; pageSize?: number },
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    // Paginated transaction history
  }
}
```

#### Phase 3: Integration with Payment Verification

Modify `payments.service.ts` → `verifyMerchantPayment()`:

```typescript
// After payment is verified (status === VERIFIED)
if (status === PaymentStatus.VERIFIED) {
  // ... existing payment creation logic ...
  
  // NEW: Charge wallet if enabled
  if (payment) {
    const walletChargeResult = await this.walletService.chargeForPayment(
      membership.merchantId,
      payment.id,
      claimedAmount,
    );
    
    if (!walletChargeResult.success && walletChargeResult.error) {
      // Handle insufficient balance or other errors
      // Option 1: Rollback payment verification
      // Option 2: Allow but flag for manual review
    }
  }
}
```

#### Phase 4: Admin Interface

1. **Merchant Admin Dashboard**:
   - Display current wallet balance
   - Show recent wallet transactions
   - **Top-up wallet section**:
     - View deposit receiver accounts (where to send money)
     - QR code scanner for deposit verification
     - Manual reference entry for deposit verification
     - Deposit history (pending, verified, failed)

2. **Super Admin Panel**:
   - **Wallet Deposit Receiver Accounts Management**:
     - Configure receiver accounts per provider (CBE, TeleBirr, Awash, etc.)
     - Set account number, name, status (ACTIVE/INACTIVE)
     - Generate/upload QR codes for each account
   - **Merchant Wallet Configuration**:
     - Enable/disable wallet per merchant
     - Configure charge rates (percentage/fixed) per merchant
     - Set initial wallet balance
   - **Wallet Management**:
     - Manual deposits/adjustments
     - View all wallet transactions
     - View all deposit verifications
     - Export wallet reports

#### Phase 5: API Endpoints

**Merchant Endpoints:**
```
GET    /api/v1/wallet/balance                    - Get current wallet balance
GET    /api/v1/wallet/transactions               - Wallet transaction history
GET    /api/v1/wallet/deposit-receivers          - Get deposit receiver accounts (where to send money)
POST   /api/v1/wallet/verify-deposit             - Verify wallet deposit (scan QR or enter reference)
```

**Admin Endpoints:**
```
POST   /api/v1/wallet/deposit                    - Manual deposit (admin only)
POST   /api/v1/wallet/adjust                      - Manual balance adjustment (admin only)
GET    /api/v1/wallet/deposit-receivers           - List all deposit receiver accounts
POST   /api/v1/wallet/deposit-receivers           - Configure deposit receiver account
PUT    /api/v1/wallet/deposit-receivers/:id      - Update deposit receiver account
DELETE /api/v1/wallet/deposit-receivers/:id       - Delete deposit receiver account
```

**Merchant Configuration (Admin):**
```
GET    /api/v1/merchants/:id/wallet-config        - Get merchant wallet configuration
PUT    /api/v1/merchants/:id/wallet-config        - Update merchant wallet configuration
  Body: {
    walletEnabled: boolean,
    walletChargeType: "PERCENTAGE" | "FIXED" | null,
    walletChargeValue: number | null
  }
```

---

### 4. Configuration Options

#### Merchant-Level Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `walletEnabled` | Boolean | `false` | Enable/disable wallet deduction |
| `walletChargeType` | String | `null` | `"PERCENTAGE"` or `"FIXED"` |
| `walletChargeValue` | Decimal | `null` | Rate (e.g., 2.5 for 2.5%) or fixed amount |
| `walletMinBalance` | Decimal | `null` | Minimum balance threshold (optional) |

#### Example Configurations

**Merchant A (Wallet Enabled, 2.5% charge)**:
```json
{
  "walletEnabled": true,
  "walletChargeType": "PERCENTAGE",
  "walletChargeValue": 2.5
}
```

**Merchant B (Wallet Enabled, Fixed 10 ETB)**:
```json
{
  "walletEnabled": true,
  "walletChargeType": "FIXED",
  "walletChargeValue": 10.00
}
```

**Merchant C (Wallet Disabled)**:
```json
{
  "walletEnabled": false,
  "walletChargeType": null,
  "walletChargeValue": null
}
```

---

### 5. Edge Cases & Considerations

#### 1. **Duplicate Verification Prevention**
- Current system already prevents duplicate verification via unique constraint
- Wallet charge should only happen once per payment
- Use `payment.walletCharged` flag to prevent double-charging

#### 2. **Refunds/Reversals**
- If a payment is later reversed/cancelled, should wallet charge be refunded?
- Create `WalletTransaction` with type `REFUND`
- Consider partial refunds if payment is partially refunded

#### 3. **Concurrent Verification**
- Use database transactions to ensure atomicity
- Lock merchant row during wallet deduction to prevent race conditions

#### 4. **Audit Trail**
- Every wallet transaction must be logged
- Include payment reference, amount, timestamps
- Store metadata (charge rate, payment amount, etc.)

#### 5. **Notifications**
- Notify merchant when balance is low
- Alert on failed charges (insufficient balance)
- Email/SMS for wallet transactions (optional)

---

### 6. Migration Strategy

#### For Existing Merchants

1. **Default**: `walletEnabled = false` (no breaking changes)
2. **Opt-in**: Merchants can enable wallet via admin panel
3. **Initial Balance**: Set to `0` or allow admin to set initial deposit

#### Data Migration

```sql
-- Add new columns with safe defaults
ALTER TABLE merchant 
  ADD COLUMN wallet_balance DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN wallet_enabled BOOLEAN DEFAULT false,
  ADD COLUMN wallet_charge_type VARCHAR(20),
  ADD COLUMN wallet_charge_value DECIMAL(10,4);

-- Update existing payments (set walletCharged = false for historical)
ALTER TABLE payment
  ADD COLUMN wallet_charged BOOLEAN DEFAULT false,
  ADD COLUMN wallet_charge_amount DECIMAL(10,2),
  ADD COLUMN wallet_transaction_id TEXT;
```

---

### 7. Testing Strategy

#### Unit Tests

- `WalletService.calculateCharge()` - Test percentage and fixed calculations
- `WalletService.chargeForPayment()` - Test successful charge, insufficient balance, disabled wallet
- `WalletService.deposit()` - Test deposit and balance updates

#### Integration Tests

- Payment verification with wallet enabled → charge deducted
- Payment verification with wallet disabled → no charge
- Payment verification with insufficient balance → error handling
- Concurrent verifications → race condition prevention

#### E2E Tests

- **Wallet Top-Up Flow**:
  - Admin configures deposit receiver account → Merchant views receiver account → Merchant sends money → Merchant verifies deposit → Wallet balance updated
  
- **Payment Verification with Wallet**:
  - Merchant enables wallet → deposits funds → verifies payment → balance deducted
  
- **Insufficient Balance**:
  - Merchant with insufficient balance → verification blocked → deposits → retry succeeds
  
- **Duplicate Deposit Prevention**:
  - Merchant verifies same deposit twice → second attempt rejected

---

### 8. Security Considerations

1. **Authorization**: Only merchant owners/admins can view wallet balance
2. **Deposits**: Should require payment gateway or admin approval
3. **Charges**: Automatic charges should be logged and auditable
4. **Balance Manipulation**: Only system can deduct (via verified payments), admins can deposit/adjust

---

### 9. Future Enhancements

1. **Payment Gateway Integration**: Allow merchants to top up wallet via card/bank transfer
2. **Auto-recharge**: Automatically charge merchant's card when balance is low
3. **Tiered Pricing**: Different rates based on transaction volume
4. **Promotional Credits**: Admin can add promotional credits to merchant wallets
5. **Wallet Reports**: Monthly statements, tax reports, etc.
6. **Multi-currency Support**: Support ETB, USD, etc.

---

## Implementation Checklist

- [ ] **Phase 1**: Database schema migration
  - [ ] Add wallet fields to `Merchant` model
  - [ ] Create `WalletTransaction` model
  - [ ] Create `WalletDepositReceiverAccount` model
  - [ ] Create `WalletDeposit` model
  - [ ] Update `Payment` model with wallet fields
  - [ ] Run migration

- [ ] **Phase 2**: Create `WalletService` with core methods
  - [ ] `calculateCharge()` - Calculate charge based on merchant config
  - [ ] `chargeForPayment()` - Charge wallet on payment verification
  - [ ] `verifyWalletDeposit()` - Verify merchant deposit
  - [ ] `getDepositReceiverAccounts()` - Get deposit accounts
  - [ ] `setDepositReceiverAccount()` - Admin: configure deposit accounts
  - [ ] `getBalance()` - Get wallet balance
  - [ ] `getTransactionHistory()` - Get transaction history

- [ ] **Phase 3**: Integrate wallet charging into `verifyMerchantPayment()`
  - [ ] Add wallet charge logic after payment verification
  - [ ] Handle insufficient balance errors

- [ ] **Phase 4**: Create wallet API endpoints
  - [ ] Merchant endpoints (balance, transactions, deposit verification)
  - [ ] Admin endpoints (configure receivers, manual deposits, adjustments)

- [ ] **Phase 5A**: Build Admin UI for wallet management
  - [ ] Create `walletServiceApi.ts` (RTK Query service)
  - [ ] Add to Redux store
  - [ ] Create deposit receiver accounts management page
  - [ ] Create merchant wallet configuration page
  - [ ] Create manual operations page (deposits/adjustments)
  - [ ] Create wallet transactions view page
  - [ ] Integrate wallet section into merchant detail page
  - [ ] Update navigation menu

- [ ] **Phase 5B**: Build Merchant-Admin UI for wallet
  - [ ] Create `walletServiceApi.ts` (RTK Query service)
  - [ ] Add to Redux store
  - [ ] Create wallet dashboard page (balance overview)
  - [ ] Create wallet top-up page (deposit verification)
  - [ ] Create wallet transactions history page
  - [ ] Integrate wallet balance into main dashboard
  - [ ] Reuse QR scanner component for deposit verification
  - [ ] Update navigation menu

- [ ] **Phase 7**: Write unit and integration tests
  - [ ] Wallet service tests
  - [ ] Deposit verification tests
  - [ ] Charge calculation tests
  - [ ] E2E wallet flow tests

- [ ] **Phase 8**: Update documentation
- [ ] **Phase 9**: Deploy and monitor

---

## Frontend Implementation Plans

### Phase 5A: Admin UI Implementation

#### Overview
The Admin UI allows super admins to:
- Configure wallet deposit receiver accounts
- Manage merchant wallet settings (enable/disable, charge rates)
- Perform manual deposits and balance adjustments
- View all wallet transactions and deposits

#### Step 1: Create Wallet API Service

**File**: `admin/src/lib/services/walletServiceApi.ts`

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config";

export interface WalletDepositReceiverAccount {
  id: string;
  provider: "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
  receiverAccount: string;
  receiverName: string | null;
  receiverLabel: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  merchantId: string;
  type: "DEPOSIT" | "CHARGE" | "REFUND" | "ADJUSTMENT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  payment?: {
    id: string;
    reference: string;
    provider: string;
    claimedAmount: number;
  };
  walletDeposit?: {
    id: string;
    reference: string;
    provider: string;
    amount: number;
  };
  createdAt: string;
}

export interface MerchantWalletConfig {
  walletEnabled: boolean;
  walletChargeType: "PERCENTAGE" | "FIXED" | null;
  walletChargeValue: number | null;
  walletMinBalance: number | null;
  walletBalance: number;
}

export interface SetDepositReceiverInput {
  provider: "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
  receiverAccount: string;
  receiverName: string;
  receiverLabel?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface ManualDepositInput {
  merchantId: string;
  amount: number;
  description?: string;
}

export interface AdjustBalanceInput {
  merchantId: string;
  amount: number; // Positive to add, negative to subtract
  description?: string;
}

export interface UpdateMerchantWalletConfigInput {
  walletEnabled?: boolean;
  walletChargeType?: "PERCENTAGE" | "FIXED" | null;
  walletChargeValue?: number | null;
  walletMinBalance?: number | null;
}

export const walletServiceApi = createApi({
  reducerPath: "walletServiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["WalletReceiver", "WalletTransaction", "MerchantWallet"],
  endpoints: (builder) => ({
    // Deposit Receiver Accounts
    getDepositReceivers: builder.query<WalletDepositReceiverAccount[], void>({
      query: () => "/wallet/deposit-receivers",
      providesTags: [{ type: "WalletReceiver", id: "LIST" }],
    }),

    setDepositReceiver: builder.mutation<
      WalletDepositReceiverAccount,
      SetDepositReceiverInput
    >({
      query: (body) => ({
        url: "/wallet/deposit-receivers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "WalletReceiver", id: "LIST" }],
    }),

    // Manual Operations
    manualDeposit: builder.mutation<WalletTransaction, ManualDepositInput>({
      query: (body) => ({
        url: "/wallet/deposit",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "WalletTransaction", id: "LIST" },
        { type: "MerchantWallet", id: "LIST" },
      ],
    }),

    adjustBalance: builder.mutation<WalletTransaction, AdjustBalanceInput>({
      query: (body) => ({
        url: "/wallet/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "WalletTransaction", id: "LIST" },
        { type: "MerchantWallet", id: "LIST" },
      ],
    }),

    // Merchant Wallet Configuration
    getMerchantWalletConfig: builder.query<
      MerchantWalletConfig,
      string
    >({
      query: (merchantId) => `/merchants/${merchantId}/wallet-config`,
      providesTags: (result, error, merchantId) => [
        { type: "MerchantWallet", id: merchantId },
      ],
    }),

    updateMerchantWalletConfig: builder.mutation<
      MerchantWalletConfig,
      { merchantId: string; config: UpdateMerchantWalletConfigInput }
    >({
      query: ({ merchantId, config }) => ({
        url: `/wallet/merchant/${merchantId}/config`,
        method: "PUT",
        body: config,
      }),
      invalidatesTags: (result, error, { merchantId }) => [
        { type: "MerchantWallet", id: merchantId },
        { type: "MerchantWallet", id: "LIST" },
      ],
    }),

    // Wallet Transactions (for admin view)
    getWalletTransactions: builder.query<
      {
        transactions: WalletTransaction[];
        total: number;
        page: number;
        pageSize: number;
      },
      { merchantId?: string; page?: number; pageSize?: number }
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.merchantId) query.set("merchantId", params.merchantId);
        query.set("page", String(params.page ?? 1));
        query.set("pageSize", String(params.pageSize ?? 20));
        return `/wallet/transactions?${query.toString()}`;
      },
      providesTags: [{ type: "WalletTransaction", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDepositReceiversQuery,
  useSetDepositReceiverMutation,
  useManualDepositMutation,
  useAdjustBalanceMutation,
  useGetMerchantWalletConfigQuery,
  useUpdateMerchantWalletConfigMutation,
  useGetWalletTransactionsQuery,
} = walletServiceApi;
```

**Integration Steps**:
1. Add `walletServiceApi` to Redux store in `admin/src/lib/redux/store.ts`
2. Import and add to `reducer` and `middleware` arrays

#### Step 2: Create Admin Wallet Pages

**Page 1: Wallet Deposit Receiver Accounts Management**

**File**: `admin/src/app/wallet/receivers/page.tsx`

**Features**:
- List all deposit receiver accounts (grouped by provider)
- Add/Edit receiver account form
- Toggle status (ACTIVE/INACTIVE)
- Show account details (account number, name, label)

**Components Needed**:
- `DepositReceiverList` - Table/list of receivers
- `DepositReceiverForm` - Form to add/edit receiver
- `DepositReceiverCard` - Card showing receiver details

**Page 2: Merchant Wallet Configuration**

**File**: `admin/src/app/wallet/merchants/page.tsx` or integrate into merchant detail page

**Features**:
- List merchants with wallet status
- Enable/disable wallet per merchant
- Configure charge type (PERCENTAGE/FIXED)
- Set charge value
- Set minimum balance
- View current wallet balance

**Components Needed**:
- `MerchantWalletList` - Table of merchants with wallet info
- `MerchantWalletConfigForm` - Form to configure wallet settings
- `WalletBalanceDisplay` - Display current balance

**Page 3: Manual Wallet Operations**

**File**: `admin/src/app/wallet/operations/page.tsx`

**Features**:
- Manual deposit form (select merchant, enter amount, description)
- Balance adjustment form (select merchant, enter amount, description)
- Recent manual operations history

**Components Needed**:
- `ManualDepositForm` - Form for manual deposits
- `BalanceAdjustmentForm` - Form for balance adjustments
- `WalletOperationsHistory` - List of recent operations

**Page 4: Wallet Transactions View**

**File**: `admin/src/app/wallet/transactions/page.tsx`

**Features**:
- Filterable table of all wallet transactions
- Filter by merchant, type (DEPOSIT/CHARGE/REFUND/ADJUSTMENT), date range
- Show transaction details (amount, balance before/after, description)
- Link to related payment or deposit

**Components Needed**:
- `WalletTransactionsTable` - Data table with filters
- `TransactionDetailModal` - Modal showing transaction details

#### Step 3: Integration with Existing Merchant Management

**Update Merchant Detail Page** (`admin/src/app/merchants/[id]/page.tsx`):

Add a "Wallet" tab/section that shows:
- Current wallet balance
- Wallet configuration (enable/disable, charge settings)
- Wallet transaction history for this merchant
- Quick actions (manual deposit, adjust balance)

#### Step 4: Navigation Updates

Add to admin navigation:
- **Wallet** menu item with sub-items:
  - Deposit Receivers
  - Merchant Wallets
  - Manual Operations
  - Transactions

---

### Phase 5B: Merchant-Admin UI Implementation

#### Overview
The Merchant-Admin UI allows merchants to:
- View their wallet balance
- Top up wallet by verifying deposits
- View wallet transaction history
- See wallet charges from payment verifications

#### Step 1: Create Wallet API Service

**File**: `merchant-admin/src/lib/services/walletServiceApi.ts`

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../config";

export interface WalletBalance {
  balance: number;
}

export interface WalletDepositReceiverAccount {
  id: string;
  provider: "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
  receiverAccount: string;
  receiverName: string | null;
  receiverLabel: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface WalletTransaction {
  id: string;
  type: "DEPOSIT" | "CHARGE" | "REFUND" | "ADJUSTMENT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: any;
  payment?: {
    id: string;
    reference: string;
    provider: string;
    claimedAmount: number;
  };
  walletDeposit?: {
    id: string;
    reference: string;
    provider: string;
    amount: number;
  };
  createdAt: string;
}

export interface WalletTransactionHistory {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VerifyDepositInput {
  provider: "CBE" | "TELEBIRR" | "AWASH" | "BOA" | "DASHEN";
  reference: string;
}

export interface VerifyDepositResponse {
  success: boolean;
  status: "VERIFIED" | "UNVERIFIED" | "PENDING";
  amount: number | null;
  walletDeposit: any;
  error?: string;
}

export const walletServiceApi = createApi({
  reducerPath: "walletServiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["WalletBalance", "WalletTransaction", "DepositReceiver"],
  endpoints: (builder) => ({
    // Wallet Balance
    getWalletBalance: builder.query<WalletBalance, void>({
      query: () => "/wallet/balance",
      providesTags: [{ type: "WalletBalance", id: "CURRENT" }],
    }),

    // Deposit Receivers (where to send money)
    getDepositReceivers: builder.query<WalletDepositReceiverAccount[], void>({
      query: () => "/wallet/deposit-receivers",
      providesTags: [{ type: "DepositReceiver", id: "LIST" }],
    }),

    // Verify Deposit
    verifyDeposit: builder.mutation<VerifyDepositResponse, VerifyDepositInput>({
      query: (body) => ({
        url: "/wallet/verify-deposit",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "WalletBalance", id: "CURRENT" },
        { type: "WalletTransaction", id: "LIST" },
      ],
    }),

    // Transaction History
    getWalletTransactions: builder.query<
      WalletTransactionHistory,
      { page?: number; pageSize?: number }
    >({
      query: (params) => {
        const query = new URLSearchParams();
        query.set("page", String(params.page ?? 1));
        query.set("pageSize", String(params.pageSize ?? 20));
        return `/wallet/transactions?${query.toString()}`;
      },
      providesTags: [{ type: "WalletTransaction", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWalletBalanceQuery,
  useGetDepositReceiversQuery,
  useVerifyDepositMutation,
  useGetWalletTransactionsQuery,
} = walletServiceApi;
```

**Integration Steps**:
1. Add `walletServiceApi` to Redux store in `merchant-admin/src/lib/store.ts`
2. Import and add to `reducer` and `middleware` arrays

#### Step 2: Create Wallet Dashboard Page

**File**: `merchant-admin/src/app/wallet/page.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│  Wallet Balance: 5,000.00 ETB      │
│  [Top Up Wallet] [View History]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Recent Transactions                │
│  - Deposit: +5,000 ETB (2 days ago)│
│  - Charge: -50 ETB (1 day ago)      │
│  - Charge: -25 ETB (today)          │
└─────────────────────────────────────┘
```

**Components Needed**:
- `WalletBalanceCard` - Large card showing current balance
- `QuickActions` - Buttons for top-up and view history
- `RecentTransactions` - List of recent wallet transactions

#### Step 3: Create Wallet Top-Up Page

**File**: `merchant-admin/src/app/wallet/top-up/page.tsx`

**Features**:
1. **Deposit Receiver Accounts List**
   - Show all active deposit receiver accounts
   - Display: Provider logo, account number, account name
   - QR code for each account (if available)
   - "Copy Account Number" button

2. **Deposit Verification Section**
   - Tabs: "Scan QR Code" | "Enter Reference"
   - QR Scanner (reuse `CameraScanner` component from merchant app)
   - Manual reference input form
   - Provider selection dropdown

3. **Verification Status**
   - Loading state during verification
   - Success message with amount added
   - Error message with details

**Components Needed**:
- `DepositReceiverList` - List of receiver accounts with QR codes
- `DepositVerificationForm` - Form with QR scanner and manual input
- `VerificationStatus` - Status display (loading/success/error)

**Flow**:
```
1. Merchant sees list of deposit receiver accounts
2. Merchant selects provider (e.g., CBE)
3. Merchant sees CBE account details and QR code
4. Merchant sends money to that account via CBE app
5. Merchant gets transaction reference
6. Merchant clicks "Verify Deposit"
7. Merchant scans QR or enters reference
8. System verifies and adds to wallet
9. Success message shows amount added
```

#### Step 4: Create Wallet Transactions History Page

**File**: `merchant-admin/src/app/wallet/transactions/page.tsx`

**Features**:
- Paginated table of wallet transactions
- Filter by type (DEPOSIT/CHARGE/REFUND/ADJUSTMENT)
- Filter by date range
- Show: Date, Type, Amount, Balance Before, Balance After, Description
- Color coding: Green for deposits, Red for charges
- Link to related payment (if charge type)

**Components Needed**:
- `WalletTransactionsTable` - Data table with filters
- `TransactionTypeBadge` - Badge showing transaction type
- `TransactionDetailModal` - Modal with full transaction details

#### Step 5: Integrate Wallet Balance into Dashboard

**Update Dashboard** (`merchant-admin/src/app/dashboard/page.tsx`):

Add wallet balance widget:
- Show current balance prominently
- Quick link to top-up page
- Show recent wallet activity (last 3 transactions)

#### Step 6: Update Navigation

Add to merchant-admin navigation:
- **Wallet** menu item with sub-items:
  - Overview (balance dashboard)
  - Top Up
  - Transactions

#### Step 7: Reuse Components from Merchant App

**Reuse QR Scanner**:
- Import `CameraScanner` from `merchant/src/components/camera-scanner.tsx`
- Or create shared component in a common location
- Use for deposit verification QR scanning

**Component Structure**:
```
merchant-admin/src/
  app/
    wallet/
      page.tsx              # Wallet dashboard
      top-up/
        page.tsx            # Top-up page
      transactions/
        page.tsx            # Transaction history
  components/
    wallet/
      WalletBalanceCard.tsx
      DepositReceiverList.tsx
      DepositVerificationForm.tsx
      WalletTransactionsTable.tsx
      TransactionTypeBadge.tsx
```

---

### Integration Checklist

#### Admin UI
- [ ] Create `walletServiceApi.ts` with all endpoints
- [ ] Add to Redux store
- [ ] Create `/wallet/receivers` page
- [ ] Create `/wallet/merchants` page (or integrate into merchant detail)
- [ ] Create `/wallet/operations` page
- [ ] Create `/wallet/transactions` page
- [ ] Add wallet section to merchant detail page
- [ ] Update navigation menu
- [ ] Add wallet balance to merchant list view
- [ ] Test all CRUD operations

#### Merchant-Admin UI
- [ ] Create `walletServiceApi.ts` with merchant endpoints
- [ ] Add to Redux store
- [ ] Create `/wallet` dashboard page
- [ ] Create `/wallet/top-up` page
- [ ] Create `/wallet/transactions` page
- [ ] Integrate wallet balance into main dashboard
- [ ] Reuse/import QR scanner component
- [ ] Update navigation menu
- [ ] Add wallet balance widget to sidebar/header
- [ ] Test deposit verification flow
- [ ] Test transaction history

---

### UI/UX Considerations

#### Admin UI
1. **Color Coding**:
   - Green for deposits/additions
   - Red for charges/deductions
   - Yellow for adjustments

2. **Validation**:
   - Validate charge values (percentage: 0-100, fixed: > 0)
   - Validate deposit amounts (must be positive)
   - Show confirmation dialogs for destructive actions

3. **Feedback**:
   - Toast notifications for success/error
   - Loading states for async operations
   - Clear error messages

4. **Data Display**:
   - Format currency with ETB symbol
   - Show dates in readable format
   - Pagination for large lists

#### Merchant-Admin UI
1. **Wallet Balance Display**:
   - Large, prominent display
   - Color: Green if balance > 0, Red if balance < 0
   - Show low balance warning if below threshold

2. **Top-Up Flow**:
   - Clear step-by-step instructions
   - Visual guide showing where to send money
   - QR code prominently displayed
   - Copy-to-clipboard for account numbers

3. **Transaction History**:
   - Group by date
   - Show running balance
   - Link to payment details for charges
   - Filter and search capabilities

4. **Mobile Responsiveness**:
   - Ensure QR scanner works on mobile
   - Responsive tables (use cards on mobile)
   - Touch-friendly buttons

---

### Testing Checklist

#### Admin UI
- [ ] Test creating deposit receiver account
- [ ] Test updating deposit receiver account
- [ ] Test toggling receiver status
- [ ] Test manual deposit
- [ ] Test balance adjustment
- [ ] Test merchant wallet configuration
- [ ] Test viewing all transactions
- [ ] Test filtering transactions

#### Merchant-Admin UI
- [ ] Test viewing wallet balance
- [ ] Test viewing deposit receivers
- [ ] Test QR code scanning for deposit
- [ ] Test manual reference entry for deposit
- [ ] Test successful deposit verification
- [ ] Test failed deposit verification
- [ ] Test viewing transaction history
- [ ] Test filtering transactions
- [ ] Test pagination
- [ ] Test mobile responsiveness

---

## Questions to Decide

1. **Default charge rate**: What percentage/fixed amount should be the default?
2. **Minimum balance**: Should there be a minimum balance requirement?
3. **Insufficient balance**: Strict block vs. allow with warning?
4. **Refund policy**: Should wallet charges be refunded if payment is reversed?
5. **Deposit receiver accounts**: 
   - Single account per provider (shared by all merchants)?
   - Or separate accounts per merchant?
   - **Recommendation**: Single account per provider (simpler, admin manages one account per bank)
6. **Deposit verification timeout**: How long should pending deposits wait before expiring? (e.g., 24 hours)
7. **Minimum deposit amount**: Should there be a minimum deposit amount? (e.g., 100 ETB)

---

## Recommended Next Steps

1. **Review this design** with stakeholders
2. **Decide on charge calculation** (percentage vs. fixed, default rates)
3. **Choose insufficient balance handling** strategy
4. **Start with Phase 1** (database migration)
5. **Implement incrementally** (wallet service → integration → UI)

---

---

## Wallet Top-Up Flow - Detailed Example

### Step-by-Step User Journey

**1. Admin Configuration (One-time setup)**
```
Admin → Wallet Settings → Deposit Receiver Accounts
  → Add CBE Account:
     - Account Number: 1000123456789
     - Account Name: FetanPay Wallet Deposits
     - Provider: CBE
     - Status: ACTIVE
  → Add TeleBirr Account:
     - Account Number: 0912345678
     - Account Name: FetanPay Wallet Deposits
     - Provider: TELEBIRR
     - Status: ACTIVE
  → Save
```

**2. Merchant Wants to Top Up**
```
Merchant → Wallet → Top Up
  → Sees list of deposit receiver accounts:
     - CBE: 1000123456789 (FetanPay Wallet Deposits)
     - TeleBirr: 0912345678 (FetanPay Wallet Deposits)
     - Awash: 013201175173801 (FetanPay Wallet Deposits)
  → Selects CBE
  → Sees QR code and account details
  → Opens CBE app and sends 5,000 ETB to 1000123456789
  → Gets transaction reference: "CBE-20250115-ABC123"
```

**3. Merchant Verifies Deposit**
```
Merchant → Wallet → Verify Deposit
  → Option A: Scan QR code from CBE receipt
  → Option B: Enter transaction reference manually
  → System verifies:
     - Checks transaction exists in CBE system
     - Verifies receiver account matches WalletDepositReceiverAccount
     - Verifies amount (5,000 ETB)
  → If verified:
     - Creates WalletDeposit (status: VERIFIED)
     - Adds 5,000 ETB to merchant.walletBalance
     - Creates WalletTransaction (type: DEPOSIT, amount: +5000)
     - Links WalletDeposit to WalletTransaction
  → Merchant sees: "Deposit verified! 5,000 ETB added to wallet"
```

**4. Merchant Uses Wallet for Payment Verification**
```
Merchant → Scan Payment → Verify
  → Payment verified (amount: 2,000 ETB)
  → System checks: merchant.walletEnabled = true
  → System calculates charge:
     - walletChargeType = "PERCENTAGE"
     - walletChargeValue = 2.5
     - Charge = 2,000 × 2.5% = 50 ETB
  → System checks: walletBalance (5,000) >= charge (50) ✓
  → Deducts 50 ETB from wallet
  → Creates WalletTransaction (type: CHARGE, amount: -50)
  → Updates Payment (walletCharged: true, walletChargeAmount: 50)
  → New wallet balance: 4,950 ETB
```

---

**Last Updated**: 2025-01-XX  
**Author**: System Design  
**Status**: Draft - Pending Review

