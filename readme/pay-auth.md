# FetanPay - Competitor Analysis

## Overview

FetanPay is an instant payment verification system designed specifically for Ethiopian businesses to automate CBE (Commercial Bank of Ethiopia) payment verification. The platform eliminates manual verification processes and provides real-time confirmation when customers make payments.

**Website**: https://FetanPay.amixmon.com  
**API Documentation**: https://FetanPay.amixmon.com/docs/v1

## What FetanPay Does

FetanPay **verifies** that bank transfers to CBE have been completed. It does **NOT**:

- Process payments
- Hold funds
- Transfer money
- Act as a payment processor

FetanPay simply validates transaction references against CBE records to confirm that payments have been made.

## Key Features

### 1. Instant Verification

- Verify CBE payments in seconds
- No more manual screenshot checking
- Delayed confirmations eliminated

### 2. Fraud Prevention

- Prevent duplicate transaction usage
- Screenshot-based fraud prevention
- Anti-duplication system

### 3. Real-time Webhooks

- Instant notifications when payments are verified
- Seamless integration with existing systems
- Automatic event triggers

### 4. Developer-Friendly API

- Simple REST API
- Comprehensive documentation
- Quick integration (minutes, not days)

### 5. Analytics Dashboard

- Track all transactions
- Verification rates monitoring
- Business metrics in one place

### 6. Reliable Support

- Dedicated support team
- Integration assistance
- Scaling support

## How FetanPay Works

### 1. Create Payment Intent

When a customer wants to make a payment:

- Create a payment intent with amount and payer details
- System generates unique payment intent ID

### 2. Customer Makes Payment

- Customer makes bank transfer to CBE account
- Customer receives transaction reference number

### 3. Verify Payment

- Submit transaction reference to FetanPay
- System queries CBE records
- Validates amount, sender, and receiver
- Checks for duplicate usage
- Returns verification status

### 4. Receive Notification

- Webhook notification sent to merchant
- Status update in dashboard
- Real-time confirmation

## API Structure

### Authentication

- API key-based authentication
- Keys obtained from merchant dashboard
- Bearer token in Authorization header

### Main Endpoints

- `GET /payment-providers` - List payment providers
- `POST /payment-intents` - Create payment intent
- `GET /payment-intents/:id` - Get payment intent
- `POST /verifications` - Verify payment
- `PUT /webhooks/configure` - Configure webhooks

## Target Market

FetanPay is specifically designed for:

- Ethiopian businesses
- E-commerce platforms operating in Ethiopia
- Service providers accepting CBE payments
- Online merchants

## Business Model

### Free Trial

- 100 free verifications
- No credit card required
- Full API access during trial

### Pricing

- Multiple pricing tiers
- Pay-as-you-go model
- Enterprise pricing available
- All plans include API access and email support

## Technical Stack (Inferred)

- RESTful API architecture
- Webhook system for notifications
- Merchant dashboard
- API documentation
- Rate limiting
- Error handling

## Key Differentiators

1. **CBE Focus**: Specifically designed for CBE payments
2. **Instant Verification**: No manual confirmation needed
3. **Fraud Prevention**: Built-in anti-duplication
4. **Developer-Friendly**: Easy API integration
5. **Real-time Updates**: Webhook support
6. **Analytics**: Complete visibility

## Important Disclaimers

1. **Not Affiliated with CBE**: FetanPay is not affiliated with Commercial Bank of Ethiopia
2. **Verification Only**: Platform verifies user-submitted payment receipts
3. **No Fund Processing**: Does not process, hold, or transfer funds

## Lessons for Kifiya Auth

### What FetanPay Does Well

- Simple, focused service (CBE only)
- Clear value proposition
- Developer-friendly API
- Good documentation
- Free trial to get started

### Areas for Improvement (Kifiya Auth Advantages)

- **Multi-Bank Support**: FetanPay only supports CBE, Kifiya Auth supports multiple banks
- **QR Code Verification**: FetanPay uses transaction ID only, Kifiya Auth adds QR code scanning
- **Vendor Dashboard**: FetanPay focuses on API, Kifiya Auth provides dashboard for non-technical users
- **Flexibility**: Kifiya Auth offers both dashboard and API options

## Comparison: FetanPay vs Kifiya Auth

| Feature              | FetanPay                   | Kifiya Auth                              |
| -------------------- | -------------------------- | ---------------------------------------- |
| Banks Supported      | CBE only                   | BOA, Awash, CBE, Telebirr, and more      |
| Verification Methods | Transaction ID             | Transaction ID + QR Code                 |
| User Types           | API only                   | Vendors (Dashboard) + Developers (API)   |
| Interface            | API + Dashboard            | Vendor Dashboard + Admin Dashboard + API |
| Bank Management      | Limited                    | Full bank account management             |
| Target Market        | Ethiopian businesses (CBE) | Ethiopian businesses (all banks)         |

## Resources

- **Website**: https://FetanPay.amixmon.com
- **API Docs**: https://FetanPay.amixmon.com/docs/v1
- **Support**: support@FetanPay.et

## Conclusion

FetanPay is a well-designed payment verification system focused on CBE payments. Kifiya Auth aims to build upon this concept by:

- Supporting multiple banks
- Adding QR code verification
- Providing dashboard for non-technical users
- Offering more flexibility for different user types

This analysis helps inform the development of Kifiya Auth as a more comprehensive solution for Ethiopian businesses.

---

**Note**: This analysis is based on publicly available information from the FetanPay website and documentation. For the most current information, please visit https://FetanPay.amixmon.com
