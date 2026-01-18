# FetanPay - Payment Verification System

## Overview

FetanPay is an instant payment verification system designed for Ethiopian businesses to automate payment verification across multiple banks. The platform supports two user types: normal merchants (vendors) who use the dashboard interface, and developers who integrate via API.

**Supported Banks**: BOA (Bank of Abyssinia), Awash Bank, CBE (Commercial Bank of Ethiopia), Telebirr, and more

## Documentation

This repository contains comprehensive documentation for the FetanPay project:

- **[FetanPay Overview](./kifiya-auth-overview.md)** - What FetanPay is and what it includes (non-technical overview)
- **[FetanPay Analysis](./pay-auth.md)** - Analysis of FetanPay (competitor/inspiration)
- **[FetanPay Features](./kifiya-feature.md)** - Complete feature list with technical details
- **[Technical Documentation](./technical-documentation.md)** - Detailed technical architecture and API documentation
- **[Pricing](./kifiya-pricing.md)** - Pricing plans and information

## What FetanPay Does

FetanPay **verifies** that bank transfers have been completed across multiple Ethiopian banks. It does **NOT**:

- Process payments
- Hold funds
- Transfer money
- Act as a payment processor

FetanPay validates payments in two ways:

1. **Transaction ID Verification**: Validates transaction references against bank records
2. **QR Code Verification**: Scans and validates QR codes from bank receipts

The system confirms payments by checking:

- Transaction existence
- Amount accuracy
- Sender account details
- Receiver account details
- Duplicate transaction prevention

## Key Features

### 🚀 Instant Verification

Verify payments from multiple banks (BOA, Awash, CBE, Telebirr) in seconds. Two verification methods:

- **Transaction ID**: Verify using transaction reference numbers
- **QR Code Scanning**: Scan QR codes from bank receipts

### 🏦 Multi-Bank Support

Support for all Ethiopian banks, starting with:

- BOA (Bank of Abyssinia)
- Awash Bank
- CBE (Commercial Bank of Ethiopia)
- Telebirr
- Extensible architecture for additional banks

### 🔒 Fraud Prevention

Prevent duplicate transaction usage and screenshot-based fraud with our anti-duplication system.

### 📱 Verifier Page (For Merchants)

Dedicated verification interface in the dashboard for normal merchants:

- Transaction ID input and verification
- QR code scanner for bank receipts
- Real-time verification analysis
- Verification history tracking

### 💰 Waiter Tip & Bonus Management (For Restaurants/Cafes)

Perfect for restaurants and cafes:

- Waiters verify payments through admin dashboard
- Tip input during payment verification
- Automatic tip tracking per waiter
- Daily/weekly/monthly tip reports
- Admin approval system for bonuses
- No separate UI needed for waiters

### ⚡ Real-time Webhooks

Get instant notifications when payments are verified. Integrate seamlessly with your systems.

### 💻 Developer-Friendly API

Simple REST API with comprehensive documentation. Get started in minutes, not days. 2 API keys provided for all plans.

### 📊 Analytics Dashboard

Track all your transactions, verification rates, and business metrics in one place.

## How It Works

### For Normal Merchants (Vendors)

1. **Setup Bank Accounts**

   - Add your bank accounts in the dashboard (BOA, Awash, CBE, Telebirr, etc.)
   - Configure account details for each bank

2. **Customer Makes Payment**

   - Customer makes a bank transfer to your account
   - Customer receives transaction reference and/or QR code

3. **Verify Payment (Two Methods)**

   **Method 1: Transaction ID**

   - Go to verifier page in dashboard
   - Enter transaction reference/ID
   - Select bank
   - Click verify
   - View verification results

   **Method 2: QR Code**

   - Go to verifier page in dashboard
   - Scan QR code from bank receipt (or upload image)
   - System automatically detects bank and extracts details
   - View verification results

4. **View Results**
   - Verification status displayed instantly
   - Transaction details shown
   - Verification history saved

### For Developers (API Users)

1. **Get API Keys**

   - Sign up for developer account
   - Obtain 2 API keys from dashboard

2. **Create Payment Intent**

   - Create payment intent via API with amount and payer details

3. **Customer Makes Payment**

   - Customer makes bank transfer
   - Customer provides transaction reference or QR code

4. **Verify Payment via API**

   - **Transaction ID**: Submit transaction reference via API
   - **QR Code**: Submit QR code data via API
   - System validates against bank records

5. **Receive Notification**
   - Get instant webhook notification when payment is verified
   - Check status via API

## Quick Start

### 1. Get Your API Keys (For Developers)

1. Sign up for a developer account
2. Navigate to your dashboard
3. Generate and copy your 2 API keys

### 2. Create a Payment Intent

```javascript
const response = await fetch(
  "https://api.FetanPay.amixmon.com/v1/payment-intents",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 1000.0,
      currency: "ETB",
      payer_name: "John Doe",
      payer_account: "1234567890",
    }),
  }
);

const paymentIntent = await response.json();
```

### 3. Verify Payment

**Option A: Transaction ID Verification**

```javascript
const response = await fetch("https://api.fetanpay.com/v1/verifications", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    payment_intent_id: paymentIntent.data.id,
    transaction_reference: "TXN123456789",
    bank_name: "CBE",
    amount: 1000.0,
    sender_account: "1234567890",
    receiver_account: "0987654321",
  }),
});

const verification = await response.json();
```

**Option B: QR Code Verification**

```javascript
const response = await fetch("https://api.fetanpay.com/v1/verifications/qr", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    payment_intent_id: paymentIntent.data.id,
    qr_code_data: "base64_encoded_qr_or_qr_string",
    bank_name: "CBE",
  }),
});

const verification = await response.json();
```

### 4. Handle Webhook (Optional)

```javascript
app.post("/webhooks/FetanPay", (req, res) => {
  // Verify webhook signature
  const signature = req.headers["x-FetanPay-signature"];

  // Handle payment.verified event
  if (req.body.event === "payment.verified") {
    // Update your order status
    // Send confirmation email
    // etc.
  }

  res.status(200).send("OK");
});
```

## API Endpoints

### Bank Accounts (For Vendors)

- `GET /bank-accounts` - List vendor's bank accounts
- `POST /bank-accounts` - Add a new bank account
- `PUT /bank-accounts/:id` - Update bank account
- `DELETE /bank-accounts/:id` - Delete bank account

### Payment Intents

- `POST /payment-intents` - Create a payment intent
- `GET /payment-intents/:id` - Get payment intent details
- `GET /payment-intents` - List payment intents

### Verification

- `POST /verifications` - Verify payment by transaction ID
- `POST /verifications/qr` - Verify payment by QR code
- `GET /verifications/:id` - Get verification details
- `GET /verifications` - List verifications

### Waiters (For Restaurants/Cafes)

- `POST /waiters` - Create waiter
- `GET /waiters` - List waiters
- `GET /waiters/:id` - Get waiter details
- `PUT /waiters/:id` - Update waiter
- `DELETE /waiters/:id` - Delete waiter
- `GET /waiters/:id/tips` - Get waiter tips
- `GET /waiters/:id/tips/daily` - Get daily tips
- `POST /tips/:id/approve` - Approve tip
- `GET /vendors/:id/tips-summary` - Get tips summary

### Webhooks

- `PUT /webhooks/configure` - Configure webhook URL
- `GET /webhooks/events` - List webhook events

For detailed API documentation, see [technical-documentation.md](./technical-documentation.md)

## Authentication

All API requests require authentication using one of your API keys:

```http
Authorization: Bearer YOUR_API_KEY
```

Or as a query parameter:

```
?api_key=YOUR_API_KEY
```

**Note**: All plans include 2 API keys. You can use different keys for different environments (production, development) or applications.

## Webhooks

Configure webhook URLs in your merchant dashboard to receive real-time notifications for:

- `payment.verified` - Payment successfully verified
- `payment.failed` - Payment verification failed

### Webhook Security

Always verify webhook signatures:

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Server Error

Error responses include detailed information:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Rate Limiting

API requests are rate limited to ensure fair usage:

- Default: 100 requests per minute per API key
- Each of your 2 API keys has its own rate limit
- Rate limit information is included in response headers

## Pricing

- **Free Trial**: 100 free verifications
- **Starter Plan**: Pay-as-you-go pricing
- **Enterprise**: Custom pricing for high-volume merchants

All plans include:

- Full API access
- 2 API keys
- Webhook support (Starter and above)
- Analytics dashboard
- Frontend UI Package

Contact sales for enterprise pricing: https://FetanPay.amixmon.com/#contact

## Use Cases

### E-commerce

Verify payments for online orders instantly, reducing manual verification time and improving customer experience.

### Service Providers

Confirm payments for services rendered, automating the payment confirmation process.

### Subscription Services

Verify recurring payments automatically, ensuring subscription continuity.

### Marketplaces

Verify payments between buyers and sellers, providing trust and security.

### Restaurants & Cafes

- Verify customer payments instantly
- Track tips for waiters automatically
- Manage waiter bonuses efficiently
- Daily tip reports and analytics
- No separate UI needed for waiters

## Security

- **API Key Security**: Secure key generation and management (2 keys per account)
- **Webhook Security**: Signature verification for all webhooks
- **Data Encryption**: All data encrypted in transit (HTTPS)
- **Fraud Prevention**: Built-in duplicate transaction detection
- **Rate Limiting**: Protection against abuse

## Legal

- **Terms of Use**: https://FetanPay.amixmon.com/terms
- **Privacy Policy**: https://FetanPay.amixmon.com/privacy
- **Merchant Agreement**: https://FetanPay.amixmon.com/merchant-agreement

## Important Disclaimers

1. **Not Affiliated with CBE**: FetanPay is not affiliated with Commercial Bank of Ethiopia
2. **Verification Only**: This platform verifies user-submitted payment receipts. It does not process, hold, or transfer funds
3. **No Fund Processing**: FetanPay does not process payments or hold funds

## Target Market

FetanPay is designed for two types of users:

### Normal Merchants (Vendors)

- Ethiopian businesses accepting bank transfers
- Small to medium businesses
- Retailers and service providers
- Restaurants and cafes
- Anyone who needs simple payment verification via dashboard

### Waiters (Restaurants/Cafes)

- Restaurant waiters verifying customer payments
- Cafe staff handling payments
- Service staff receiving tips
- No separate dashboard needed - work through admin

### Developers

- E-commerce platforms
- Payment gateway integrators
- Fintech companies
- Businesses needing programmatic payment verification
- API-first integrations

## Getting Started

### For Normal Merchants (Vendors)

1. **Sign Up**: Create a vendor account
2. **Add Bank Accounts**: Add your bank accounts (BOA, Awash, CBE, Telebirr, etc.) in the dashboard
3. **(Optional) Add Waiters**: If running a restaurant/cafe, add your waiters
4. **Use Verifier Page**: Navigate to the verifier page to verify payments
5. **Verify Payments**: Use transaction ID or QR code scanning to verify payments
6. **(Optional) Input Tips**: For restaurants/cafes, input tip amount during verification
7. **Track History**: View verification history and analytics
8. **(Optional) Manage Tips**: View and approve waiter tips/bonuses

### For Restaurants/Cafes with Waiters

1. **Setup**: Restaurant admin creates account and adds waiters
2. **Daily Operations**: Waiters verify payments through admin dashboard
3. **Tip Input**: During verification, waiter inputs tip amount (if any)
4. **End of Day**: Waiters request admin to view their accumulated tips
5. **Admin Approval**: Admin reviews and approves tips for payment
6. **Bonus Distribution**: Admin processes bonus payments to waiters

### For Developers

1. **Sign Up**: Create a developer account
2. **Get API Keys**: Generate your 2 API keys from the dashboard
3. **Read Documentation**: Review the technical documentation
4. **Integrate**: Use the API to integrate payment verification
5. **Test**: Test your integration with sample transactions
6. **Go Live**: Start verifying payments in production

## Quick Links

- **[Overview](./kifiya-auth-overview.md)** - Start here to understand what FetanPay is
- **[Features](./kifiya-feature.md)** - Complete feature list with technical details
- **[FetanPay Analysis](./pay-auth.md)** - Learn about the inspiration/competitor
- **[Technical Docs](./technical-documentation.md)** - API documentation and technical architecture
- **[Pricing](./kifiya-pricing.md)** - Pricing plans and information

## License

© 2025 FetanPay. All rights reserved.

---