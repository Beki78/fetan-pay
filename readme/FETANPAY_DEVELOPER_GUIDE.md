# FetanPay Developer Integration Guide

## 📚 **Complete Guide to APIs, Webhooks, and Security**

This guide explains everything you need to know about integrating with FetanPay, including the differences between APIs and webhooks, and how to properly use API keys and webhook secrets.

---

## 🤔 **What's the Difference: APIs vs Webhooks?**

### 🔄 **APIs (Application Programming Interfaces)**
**Think of APIs like making a phone call** - you call FetanPay when you need something.

#### How APIs Work:
1. **Your app asks** FetanPay for information
2. **FetanPay responds** with the data
3. **You control when** the request happens

#### Example API Flow:
```
Your E-commerce Site → "Hey FetanPay, verify this payment" → FetanPay
Your E-commerce Site ← "Payment verified successfully" ← FetanPay
```

#### When to Use APIs:
- ✅ Check payment status on demand
- ✅ Get list of transactions
- ✅ Verify a payment when customer clicks "Pay"
- ✅ Get account information

---

### 🔔 **Webhooks**
**Think of webhooks like getting a text message** - FetanPay calls you when something happens.

#### How Webhooks Work:
1. **Something happens** in FetanPay (payment verified, wallet charged, etc.)
2. **FetanPay automatically sends** a notification to your app
3. **Your app receives** the notification instantly

#### Example Webhook Flow:
```
Customer pays → FetanPay verifies payment → FetanPay sends webhook → Your app gets notified
```

#### When to Use Webhooks:
- ✅ Get notified instantly when payments are verified
- ✅ Update order status automatically
- ✅ Send confirmation emails to customers
- ✅ Update inventory in real-time

---

## 🆚 **API vs Webhook Comparison**

| Aspect | API (You Call FetanPay) | Webhook (FetanPay Calls You) |
|--------|-------------------------|-------------------------------|
| **Direction** | Your App → FetanPay | FetanPay → Your App |
| **Timing** | When you want | When something happens |
| **Control** | You control when | FetanPay controls when |
| **Use Case** | Check status, get data | Get notified of events |
| **Speed** | You have to ask | Instant notification |
| **Reliability** | Always available | Depends on your server |

---

## 🔑 **API Keys: Your Identity Card**

### What is an API Key?
An API key is like your **identity card** that proves to FetanPay that you are who you say you are.

### Format:
```
fetan_live_sk_00aa8dc4e1396f2dea55a74dbf0d3ad5183c7252e80150ebea41fd66b1a87aea
```

### How to Use API Keys:

#### 1. **Get Your API Key**
1. Go to **Merchant Admin** → **Developer Tools** → **API Keys**
2. Click **"Create API Key"**
3. **Copy the key immediately** (shown only once!)
4. Store it securely

#### 2. **Use API Key in Requests**
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fetan_live_sk_YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

#### 3. **Programming Examples**

**JavaScript/Node.js:**
```javascript
const apiKey = 'fetan_live_sk_YOUR_API_KEY_HERE';

const response = await fetch('http://localhost:3003/api/v1/payments/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    provider: 'CBE',
    reference: 'FT26017MLDG7755415774',
    claimedAmount: 1000.00
  })
});

const result = await response.json();
console.log(result);
```

**Python:**
```python
import requests

api_key = 'fetan_live_sk_YOUR_API_KEY_HERE'

response = requests.post(
    'http://localhost:3003/api/v1/payments/verify',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    },
    json={
        'provider': 'CBE',
        'reference': 'FT26017MLDG7755415774',
        'claimedAmount': 1000.00
    }
)

result = response.json()
print(result)
```

**PHP:**
```php
<?php
$apiKey = 'fetan_live_sk_YOUR_API_KEY_HERE';

$data = [
    'provider' => 'CBE',
    'reference' => 'FT26017MLDG7755415774',
    'claimedAmount' => 1000.00
];

$options = [
    'http' => [
        'header' => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents('http://localhost:3003/api/v1/payments/verify', false, $context);
$response = json_decode($result, true);

print_r($response);
?>
```

---

## 🔐 **Webhook Secrets: Your Security Guard**

### What is a Webhook Secret?
A webhook secret is like a **password** that proves the webhook actually came from FetanPay and wasn't sent by a hacker.

### Format:
```
74a247fb9a26b0e915e93a86a1c92833282c872d9785e8092f7f4dc6d1cca5b9
```

### How Webhook Security Works:

#### 1. **FetanPay Creates Signature**
When FetanPay sends a webhook:
1. Takes the webhook payload (JSON data)
2. Uses your webhook secret to create a signature
3. Sends the signature in `X-FetanPay-Signature` header

#### 2. **Your App Verifies Signature**
When you receive a webhook:
1. Take the same payload
2. Use the same webhook secret to create a signature
3. Compare with the signature FetanPay sent
4. If they match → webhook is authentic ✅
5. If they don't match → webhook is fake ❌

### Webhook Verification Examples:

#### **Node.js/JavaScript:**
```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

// Your webhook secret (from FetanPay dashboard)
const WEBHOOK_SECRET = '74a247fb9a26b0e915e93a86a1c92833282c872d9785e8092f7f4dc6d1cca5b9';

app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/fetanpay', (req, res) => {
  const signature = req.headers['x-fetanpay-signature'];
  const payload = req.body.toString();
  
  // Create expected signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  // Verify signature
  if (signature === expectedSignature) {
    console.log('✅ Webhook is authentic!');
    
    // Parse and process the webhook
    const event = JSON.parse(payload);
    
    if (event.type === 'payment.verified') {
      console.log('Payment verified:', event.data.payment);
      // Update order status, send email, etc.
    }
    
    res.status(200).send('OK');
  } else {
    console.log('❌ Invalid webhook signature!');
    res.status(401).send('Unauthorized');
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

#### **Python (Flask):**
```python
import hmac
import hashlib
import json
from flask import Flask, request

app = Flask(__name__)

# Your webhook secret (from FetanPay dashboard)
WEBHOOK_SECRET = '74a247fb9a26b0e915e93a86a1c92833282c872d9785e8092f7f4dc6d1cca5b9'

@app.route('/webhooks/fetanpay', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-FetanPay-Signature')
    payload = request.get_data()
    
    # Create expected signature
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    # Verify signature
    if signature == expected_signature:
        print('✅ Webhook is authentic!')
        
        # Parse and process the webhook
        event = json.loads(payload)
        
        if event['type'] == 'payment.verified':
            print('Payment verified:', event['data']['payment'])
            # Update order status, send email, etc.
        
        return 'OK', 200
    else:
        print('❌ Invalid webhook signature!')
        return 'Unauthorized', 401

if __name__ == '__main__':
    app.run(port=3000)
```

#### **PHP:**
```php
<?php
// Your webhook secret (from FetanPay dashboard)
$webhookSecret = '74a247fb9a26b0e915e93a86a1c92833282c872d9785e8092f7f4dc6d1cca5b9';

// Get webhook data
$signature = $_SERVER['HTTP_X_FETANPAY_SIGNATURE'] ?? '';
$payload = file_get_contents('php://input');

// Create expected signature
$expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

// Verify signature
if ($signature === $expectedSignature) {
    echo "✅ Webhook is authentic!\n";
    
    // Parse and process the webhook
    $event = json_decode($payload, true);
    
    if ($event['type'] === 'payment.verified') {
        echo "Payment verified: " . json_encode($event['data']['payment']) . "\n";
        // Update order status, send email, etc.
    }
    
    http_response_code(200);
    echo 'OK';
} else {
    echo "❌ Invalid webhook signature!\n";
    http_response_code(401);
    echo 'Unauthorized';
}
?>
```

---

## 🏗️ **Complete Integration Example**

Let's build a simple e-commerce integration that uses both APIs and webhooks:

### **Scenario: Online Coffee Shop**

#### **Step 1: Customer Places Order**
```javascript
// When customer clicks "Pay with FetanPay"
async function initiatePayment(orderAmount, customerEmail) {
  // Show payment instructions to customer
  const paymentInstructions = {
    provider: 'CBE',
    amount: orderAmount,
    reference: generateUniqueReference(), // e.g., "COFFEE_ORDER_12345"
    instructions: 'Transfer money to account 1234567890 with reference COFFEE_ORDER_12345'
  };
  
  // Show instructions to customer
  displayPaymentInstructions(paymentInstructions);
  
  // Start checking payment status
  checkPaymentStatus(paymentInstructions.reference);
}
```

#### **Step 2: Check Payment Status (API)**
```javascript
const API_KEY = 'fetan_live_sk_YOUR_API_KEY_HERE';

async function checkPaymentStatus(reference) {
  try {
    const response = await fetch('http://localhost:3003/api/v1/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        provider: 'CBE',
        reference: reference,
        claimedAmount: orderAmount
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'VERIFIED') {
      // Payment successful!
      completeOrder(result.payment);
    } else {
      // Payment not found or failed
      console.log('Payment not verified yet:', result.checks);
      // Try again in 30 seconds
      setTimeout(() => checkPaymentStatus(reference), 30000);
    }
  } catch (error) {
    console.error('Error checking payment:', error);
  }
}
```

#### **Step 3: Receive Webhook Notification**
```javascript
// Webhook endpoint (runs on your server)
app.post('/webhooks/fetanpay', (req, res) => {
  const signature = req.headers['x-fetanpay-signature'];
  const payload = req.body.toString();
  
  // Verify webhook authenticity
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Unauthorized');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'payment.verified':
      // Payment was successful
      const payment = event.data.payment;
      console.log('Payment verified via webhook:', payment.reference);
      
      // Update order status in database
      updateOrderStatus(payment.reference, 'PAID');
      
      // Send confirmation email
      sendConfirmationEmail(payment.reference);
      
      // Update inventory
      updateInventory(payment.reference);
      break;
      
    case 'payment.unverified':
      // Payment failed or mismatched
      const failedPayment = event.data.payment;
      console.log('Payment failed:', failedPayment.mismatchReason);
      
      // Notify customer of issue
      notifyCustomerOfPaymentIssue(failedPayment.reference);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## 🔒 **Security Best Practices**

### **API Key Security:**
1. **Never expose API keys** in frontend code
2. **Store API keys** in environment variables
3. **Use HTTPS** for all API requests
4. **Rotate API keys** regularly
5. **Monitor API usage** for suspicious activity

### **Webhook Security:**
1. **Always verify signatures** before processing webhooks
2. **Use HTTPS** for webhook URLs
3. **Implement idempotency** (handle duplicate webhooks)
4. **Log webhook events** for debugging
5. **Set proper timeouts** (FetanPay waits 30 seconds max)

### **Environment Variables Example:**
```bash
# .env file
FETANPAY_API_KEY=fetan_live_sk_YOUR_API_KEY_HERE
FETANPAY_WEBHOOK_SECRET=74a247fb9a26b0e915e93a86a1c92833282c872d9785e8092f7f4dc6d1cca5b9
```

```javascript
// Use in your code
const API_KEY = process.env.FETANPAY_API_KEY;
const WEBHOOK_SECRET = process.env.FETANPAY_WEBHOOK_SECRET;
```

---

## 🚀 **Quick Start Checklist**

### **For APIs:**
- [ ] Get API key from merchant-admin
- [ ] Store API key securely (environment variable)
- [ ] Test API endpoints with curl/Postman
- [ ] Implement error handling
- [ ] Add rate limiting awareness (10 req/min)

### **For Webhooks:**
- [ ] Create webhook in merchant-admin
- [ ] Copy webhook secret securely
- [ ] Set up webhook endpoint on your server
- [ ] Implement signature verification
- [ ] Test with webhook.site first
- [ ] Handle different event types
- [ ] Implement idempotency

---

## 🎯 **Common Use Cases**

### **E-commerce Integration:**
1. **Customer checkout** → Show payment instructions
2. **API polling** → Check payment status every 30 seconds
3. **Webhook notification** → Instant order completion
4. **Email confirmation** → Send receipt to customer

### **Subscription Service:**
1. **Monthly billing** → Generate payment reference
2. **API verification** → Confirm subscription payment
3. **Webhook processing** → Activate/deactivate subscription
4. **Account management** → Update subscription status

### **Point of Sale (POS):**
1. **Transaction initiation** → Generate QR code with reference
2. **Real-time checking** → API calls every 10 seconds
3. **Instant confirmation** → Webhook for immediate receipt printing
4. **Inventory update** → Automatic stock management

---

## 🆘 **Troubleshooting**

### **API Issues:**
- **401 Unauthorized** → Check API key format and validity
- **429 Rate Limited** → Slow down requests (max 10/minute)
- **400 Bad Request** → Check request format and required fields

### **Webhook Issues:**
- **Webhooks not received** → Check URL accessibility and HTTPS
- **Signature verification fails** → Ensure you're using raw payload
- **Duplicate webhooks** → Implement idempotency with delivery IDs
- **Timeout errors** → Respond within 30 seconds

---

## 📞 **Support**

If you need help:
1. Check the **merchant-admin** documentation pages
2. Test with **webhook.site** for webhook debugging
3. Use **curl commands** for API testing
4. Check **delivery logs** in webhook management

---

## 🎉 **You're Ready!**

Now you understand:
- ✅ **APIs vs Webhooks** - When to use each
- ✅ **API Keys** - How to authenticate API requests
- ✅ **Webhook Secrets** - How to verify webhook authenticity
- ✅ **Security** - Best practices for production
- ✅ **Integration** - Complete examples in multiple languages

Start building your FetanPay integration with confidence! 🚀