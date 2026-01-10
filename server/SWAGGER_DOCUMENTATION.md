# FetanPay API Documentation

## Overview

FetanPay is a comprehensive payment verification platform that enables merchants to verify customer payments from various Ethiopian payment providers including CBE, Telebirr, Awash, Dashen, and Abyssinia Bank.

## Base URL

- **Development**: `http://localhost:3003`
- **Production**: [Your production URL]

## API Version

All endpoints are prefixed with `/api/v1`

## Swagger UI

Interactive API documentation is available at:
- **Development**: `http://localhost:3003/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via Better Auth. You can authenticate using:

1. **Session Cookie**: Include the `better-auth.session_token` cookie in requests
2. **Bearer Token**: Include `Authorization: Bearer <token>` header

### Public Endpoints

The following endpoints do not require authentication:
- `/api/v1/verifier/*` - Payment verification endpoints
- `POST /api/v1/merchant-accounts/self-register` - Merchant self-registration

## Rate Limiting

Some endpoints (like payment verification) are rate-limited to prevent abuse:
- Rate limit: 10 requests per minute per IP

## API Endpoints

### Payments

#### Set Active Receiver Account
- **POST** `/api/v1/payments/receiver-accounts/active`
- **Description**: Sets or updates the active receiver account for a specific payment provider
- **Auth**: Required
- **Body**: `SetActiveReceiverDto`

#### Get Active Receiver Account
- **GET** `/api/v1/payments/receiver-accounts/active?provider={provider}`
- **Description**: Retrieves active receiver account(s) for the merchant
- **Auth**: Required
- **Query Params**: `provider` (optional) - Payment provider code

#### Disable Receiver Account
- **POST** `/api/v1/payments/receiver-accounts/disable`
- **Description**: Disables the currently active receiver account for a payment provider
- **Auth**: Required
- **Body**: `DisableReceiverDto`

#### Enable Receiver Account
- **POST** `/api/v1/payments/receiver-accounts/enable`
- **Description**: Enables the most recently configured receiver account
- **Auth**: Required
- **Body**: `DisableReceiverDto`

#### Create Order
- **POST** `/api/v1/payments/orders`
- **Description**: Creates a new order with expected payment amount
- **Auth**: Required
- **Body**: `CreateOrderDto`

#### Submit Payment Claim
- **POST** `/api/v1/payments/claims`
- **Description**: Submits a payment claim from a waiter and verifies it
- **Auth**: Required
- **Body**: `SubmitPaymentClaimDto`
- **Note**: Only VERIFIED transactions are saved to the database

#### Verify Merchant Payment
- **POST** `/api/v1/payments/verify`
- **Description**: Verifies a payment transaction against merchant's receiver account
- **Auth**: Required
- **Body**: `VerifyMerchantPaymentDto`
- **Rate Limited**: Yes (10 requests/minute)
- **Note**: Only VERIFIED transactions are saved to the database

#### List Verification History
- **GET** `/api/v1/payments/verification-history`
- **Description**: Retrieves paginated list of payment verification history
- **Auth**: Required
- **Query Params**: Pagination and filter parameters

#### Get Payment Claim
- **GET** `/api/v1/payments/claims/:paymentId`
- **Description**: Retrieves details of a specific payment claim
- **Auth**: Required

#### Get Tips Summary
- **GET** `/api/v1/payments/tips/summary?from={date}&to={date}`
- **Description**: Retrieves tip summary statistics for the authenticated user
- **Auth**: Required
- **Query Params**: 
  - `from` (optional) - Start date (ISO 8601)
  - `to` (optional) - End date (ISO 8601)
- **Note**: Only shows tips verified by the current user

#### List Tips
- **GET** `/api/v1/payments/tips`
- **Description**: Retrieves paginated list of tip transactions
- **Auth**: Required
- **Query Params**: Pagination and date range filters
- **Note**: Only shows tips verified by the current user

### Merchant Accounts

#### Self Register
- **POST** `/api/v1/merchant-accounts/self-register`
- **Description**: Merchant self-registration (creates pending merchant + owner membership)
- **Auth**: Not required (public)
- **Body**: `SelfRegisterMerchantDto`

#### List Merchants
- **GET** `/api/v1/merchant-accounts`
- **Description**: List merchants with users (paginated)
- **Auth**: Required (Admin)

#### Create Merchant (Admin)
- **POST** `/api/v1/merchant-accounts`
- **Description**: Admin creates a merchant with owner invite
- **Auth**: Required (Admin)
- **Body**: `AdminCreateMerchantDto`

#### Approve Merchant
- **PATCH** `/api/v1/merchant-accounts/:id/approve`
- **Description**: Approve merchant (set ACTIVE)
- **Auth**: Required (Admin)
- **Body**: `ApproveMerchantDto`

#### Reject Merchant
- **PATCH** `/api/v1/merchant-accounts/:id/reject`
- **Description**: Reject merchant (set SUSPENDED)
- **Auth**: Required (Admin)
- **Body**: `RejectMerchantDto`

#### Get Merchant
- **GET** `/api/v1/merchant-accounts/:id`
- **Description**: Get merchant with users
- **Auth**: Required

#### List Merchant Users
- **GET** `/api/v1/merchant-accounts/:id/users`
- **Description**: List users for a merchant account
- **Auth**: Required

#### Create Merchant User
- **POST** `/api/v1/merchant-accounts/:id/users`
- **Description**: Create a merchant employee with auth account
- **Auth**: Required
- **Body**: `CreateMerchantUserDto`

#### Get Merchant User
- **GET** `/api/v1/merchant-accounts/:merchantId/users/:userId`
- **Description**: Get a merchant employee by id
- **Auth**: Required

#### Update Merchant User
- **PATCH** `/api/v1/merchant-accounts/:merchantId/users/:userId`
- **Description**: Update a merchant employee (profile/role)
- **Auth**: Required
- **Body**: `UpdateMerchantUserDto`

#### Deactivate Merchant User
- **PATCH** `/api/v1/merchant-accounts/:merchantId/users/:userId/deactivate`
- **Description**: Deactivate/suspend a merchant employee
- **Auth**: Required
- **Body**: `SetMerchantUserStatusDto`

#### Activate Merchant User
- **PATCH** `/api/v1/merchant-accounts/:merchantId/users/:userId/activate`
- **Description**: Activate a merchant employee
- **Auth**: Required
- **Body**: `SetMerchantUserStatusDto`

### Merchant Users

#### Get Current User
- **GET** `/api/v1/merchant-users/me`
- **Description**: Get current merchant user membership + merchant info
- **Auth**: Required

### Transactions

#### Verify from QR
- **POST** `/api/v1/transactions/verify-from-qr`
- **Description**: Verify a transaction by parsing its QR URL
- **Auth**: Required
- **Body**: `VerifyFromQrDto`

#### List Transactions
- **GET** `/api/v1/transactions`
- **Description**: List stored transactions with optional filters
- **Auth**: Required
- **Query Params**: Filter and pagination parameters

#### List Verified by User
- **GET** `/api/v1/transactions/verified-by/:merchantUserId`
- **Description**: List transactions verified by a specific merchant user
- **Auth**: Required
- **Query Params**: Optional merchantId filter

### Payment Providers

#### List Payment Providers
- **GET** `/api/v1/payment-providers?status={status}`
- **Description**: List payment providers (for merchant UI)
- **Auth**: Required
- **Query Params**: `status` (optional) - Filter by status

#### Create/Update Payment Provider
- **POST** `/api/v1/payment-providers`
- **Description**: Admin: create/update a payment provider
- **Auth**: Required (Admin)
- **Body**: `UpsertPaymentProviderDto`

#### Delete Payment Provider
- **DELETE** `/api/v1/payment-providers/:code`
- **Description**: Admin: delete a payment provider
- **Auth**: Required (Admin)

### Verification (Public)

#### Get API Info
- **GET** `/api/v1/verifier/`
- **Description**: Get verification API information
- **Auth**: Not required

#### Health Check
- **GET** `/api/v1/verifier/health`
- **Description**: Health check endpoint
- **Auth**: Not required

#### Verify CBE
- **POST** `/api/v1/verifier/verify-cbe`
- **GET** `/api/v1/verifier/verify-cbe?reference={ref}&accountSuffix={suffix}`
- **Description**: Verify a CBE transaction
- **Auth**: Not required
- **Body**: `VerifyCbeDto`

#### Verify Telebirr
- **POST** `/api/v1/verifier/verify-telebirr`
- **Description**: Verify a Telebirr receipt reference
- **Auth**: Not required
- **Body**: `VerifyTelebirrDto`

#### Verify Dashen
- **POST** `/api/v1/verifier/verify-dashen`
- **Description**: Verify a Dashen Bank transaction reference
- **Auth**: Not required
- **Body**: `VerifyDashenDto`

#### Verify Abyssinia
- **POST** `/api/v1/verifier/verify-abyssinia`
- **Description**: Verify an Abyssinia Bank reference
- **Auth**: Not required
- **Body**: `VerifyAbyssiniaDto`

#### Verify CBE Birr
- **POST** `/api/v1/verifier/verify-cbebirr`
- **Description**: Verify a CBE Birr receipt
- **Auth**: Not required
- **Body**: `VerifyCbeBirrDto`

#### Verify Image
- **POST** `/api/v1/verifier/verify-image`
- **Description**: Verify a payment receipt from an image
- **Auth**: Not required
- **Body**: Multipart form data with image file

#### Verify CBE Smart
- **POST** `/api/v1/verifier/verify-cbe-smart`
- **Description**: Verify a CBE transaction with smart strategy
- **Auth**: Not required
- **Body**: `VerifyCbeSmartDto`

#### Verify Abyssinia Smart
- **POST** `/api/v1/verifier/verify-abyssinia-smart`
- **Description**: Verify an Abyssinia Bank transaction with smart strategy
- **Auth**: Not required
- **Body**: `VerifyAbyssiniaSmartDto`

#### Verify Awash Smart
- **POST** `/api/v1/verifier/verify-awash-smart`
- **Description**: Verify an Awash Bank transaction with smart strategy
- **Auth**: Not required
- **Body**: `VerifyAwashSmartDto`

## Data Models

### Transaction Provider Enum
- `CBE` - Commercial Bank of Ethiopia
- `TELEBIRR` - Telebirr mobile money
- `AWASH` - Awash Bank
- `BOA` - Bank of Abyssinia
- `DASHEN` - Dashen Bank

### Payment Status
- `VERIFIED` - Payment successfully verified
- `UNVERIFIED` - Payment verification failed
- `PENDING` - Payment verification in progress

### Merchant Status
- `PENDING` - Awaiting approval
- `ACTIVE` - Approved and active
- `SUSPENDED` - Rejected or suspended

### User Roles
- `MERCHANT_OWNER` - Merchant owner
- `EMPLOYEE` - General employee
- `ACCOUNTANT` - Accountant role
- `SALES` - Sales staff
- `WAITER` - Waiter/service staff

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

## Examples

### Verify Payment
```bash
curl -X POST http://localhost:3003/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=your-token" \
  -d '{
    "provider": "TELEBIRR",
    "reference": "FT123456789",
    "claimedAmount": 250,
    "tipAmount": 50
  }'
```

### Get Tips Summary
```bash
curl -X GET "http://localhost:3003/api/v1/payments/tips/summary?from=2024-01-01T00:00:00.000Z&to=2024-01-31T23:59:59.999Z" \
  -H "Cookie: better-auth.session_token=your-token"
```

### Self Register Merchant
```bash
curl -X POST http://localhost:3003/api/v1/merchant-accounts/self-register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Business",
    "ownerEmail": "owner@example.com",
    "ownerName": "John Doe",
    "contactEmail": "contact@example.com",
    "contactPhone": "+251911223344"
  }'
```

## Best Practices

1. **Always include authentication**: Most endpoints require authentication
2. **Handle rate limits**: Payment verification endpoints are rate-limited
3. **Use pagination**: List endpoints support pagination for better performance
4. **Validate input**: All DTOs are validated automatically
5. **Check response status**: Always check HTTP status codes
6. **Handle errors gracefully**: Implement proper error handling

## Support

For API support, please contact the development team or refer to the Swagger UI documentation at `/api`.

