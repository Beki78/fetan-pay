# FetanPay Webhook Setup Guide

## Overview
This guide shows how to set up webhooks to receive automatic payment notifications from FetanPay.

## Webhook Endpoint
The sample e-commerce app has a webhook endpoint at:
```
http://localhost:3001/api/webhooks/fetanpay
```

## Supported Events
- `payment.verified` - Payment successfully verified
- `payment.unverified` - Payment verification failed
- `payment.failed` - Payment processing failed

## Setup Steps

### 1. Register Webhook in FetanPay
```bash
curl -X POST "http://localhost:3003/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "url": "http://localhost:3001/api/webhooks/fetanpay",
    "events": ["payment.verified", "payment.unverified", "payment.failed"]
  }'
```

### 2. Update Environment Variables
Add the webhook secret to `.env.local`:
```env
FETANPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Test Webhook
```bash
# Test webhook endpoint (will fail signature validation)
curl -X POST http://localhost:3001/api/webhooks/fetanpay \
  -H "Content-Type: application/json" \
  -H "X-FetanPay-Signature: test-signature" \
  -d '{
    "event": "payment.verified",
    "data": {
      "orderId": "ORDER_123",
      "reference": "TXN123456789"
    }
  }'
```

## Webhook Payload Examples

### Payment Verified
```json
{
  "event": "payment.verified",
  "data": {
    "orderId": "ORDER_1769259726603_j56y0n",
    "reference": "TXN123456789",
    "payment": {
      "amount": 520,
      "reference": "TXN123456789",
      "sender": "John Doe",
      "timestamp": "2026-01-24T13:19:32.754Z"
    }
  }
}
```

### Payment Unverified
```json
{
  "event": "payment.unverified",
  "data": {
    "orderId": "ORDER_1769259726603_j56y0n",
    "reference": "TXN123456789",
    "reason": {
      "referenceFound": true,
      "receiverMatches": false,
      "amountMatches": false
    }
  }
}
```

## What Happens When Webhook is Received

1. **Signature Verification** - Validates webhook authenticity
2. **Event Processing** - Handles different event types
3. **Order Updates** - Updates order status in database
4. **Logging** - Records webhook events for audit trail

## Automatic Order Updates

- `payment.verified` → Order status changes to `PAID`
- `payment.failed` → Order status changes to `CANCELLED`
- `payment.unverified` → Order remains `PAYMENT_PENDING`

## Security Features

- ✅ **Signature Verification** - Prevents unauthorized webhooks
- ✅ **Event Logging** - All webhook events are logged
- ✅ **Error Handling** - Graceful error handling and reporting
- ✅ **Idempotency** - Safe to receive duplicate webhooks

## Monitoring

Check webhook logs in the server console:
```
✅ Payment verified via webhook: ORDER_123 - TXN123456789
❌ Payment unverified via webhook: ORDER_123 - TXN123456789
💥 Payment failed via webhook: ORDER_123 - TXN123456789
```

## Production Deployment

For production, update the webhook URL to your live domain:
```bash
curl -X POST "https://api.fetanpay.com/v1/webhooks" \
  -H "Authorization: Bearer YOUR_PRODUCTION_API_KEY" \
  -d '{
    "url": "https://your-domain.com/api/webhooks/fetanpay",
    "events": ["payment.verified", "payment.unverified", "payment.failed"]
  }'
```