# FetanPay Webhook Testing - cURL Commands

## 🔔 **Webhook Management & Testing**

Use these cURL commands to create, manage, and test webhooks with your API key.

---

## 📋 **Prerequisites**

1. **Get your API key** from merchant-admin → Developer Tools → API Keys
2. **Replace `YOUR_API_KEY_HERE`** with your actual API key
3. **Set up a webhook endpoint** (see options below)

---

## 🌐 **Option 1: Quick Webhook Testing with webhook.site**

### Step 1: Get a Test URL
1. Go to **https://webhook.site**
2. Copy your unique URL (e.g., `https://webhook.site/12345678-1234-1234-1234-123456789abc`)
3. Use this URL in the commands below

---

## 🔧 **Option 2: Local Webhook Server**

### Create a Simple Local Webhook Receiver
```bash
# Terminal 1: Start a simple Python server to receive webhooks
python3 -c "
import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        print(f'\\n🔔 WEBHOOK RECEIVED:')
        print(f'Path: {self.path}')
        print(f'Headers: {dict(self.headers)}')
        print(f'Body: {post_data.decode()}')
        print('=' * 50)
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'OK')

with socketserver.TCPServer(('', 3001), WebhookHandler) as httpd:
    print('🚀 Webhook server running on http://localhost:3001')
    print('Press Ctrl+C to stop')
    httpd.serve_forever()
"
```

---

## 🔑 **1. Create a Webhook**

### Create Webhook with webhook.site
```bash
curl -X POST "http://localhost:3003/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "url": "https://webhook.site/YOUR_UNIQUE_ID_HERE",
    "events": ["payment.verified", "payment.unverified", "payment.duplicate"]
  }'
```

### Create Webhook with Local Server
```bash
curl -X POST "http://localhost:3003/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "url": "http://localhost:3001/webhooks/fetanpay",
    "events": ["payment.verified", "payment.unverified", "payment.duplicate", "wallet.charged", "wallet.insufficient"]
  }'
```

### Expected Response:
```json
{
  "id": "webhook_123456789",
  "url": "https://webhook.site/12345678-1234-1234-1234-123456789abc",
  "events": ["payment.verified", "payment.unverified", "payment.duplicate"],
  "status": "ACTIVE",
  "secret": "whsec_1234567890abcdef...",
  "warning": "Store this secret securely. It will not be shown again."
}
```

**⚠️ IMPORTANT: Copy the `secret` from the response - you'll need it for signature verification!**

---

## 📋 **2. List Your Webhooks**

```bash
curl -X GET "http://localhost:3003/api/v1/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🧪 **3. Test Webhook Delivery**

### Send Test Webhook
```bash
curl -X POST "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID/test" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

**Replace `YOUR_WEBHOOK_ID` with the ID from step 1**

---

## 🔄 **4. Trigger Real Webhooks via Payment Verification**

### Trigger payment.unverified Webhook
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00,
    "tipAmount": 50.00
  }'
```

### Trigger payment.verified Webhook (if amounts match)
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 700.00
  }'
```

---

## 📊 **5. Get Webhook Delivery Logs**

```bash
curl -X GET "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID/deliveries?limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🔧 **6. Update Webhook**

### Update Webhook URL
```bash
curl -X PUT "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "url": "https://webhook.site/NEW_UNIQUE_ID_HERE",
    "events": ["payment.verified", "payment.unverified", "wallet.charged"]
  }'
```

---

## 🔐 **7. Regenerate Webhook Secret**

```bash
curl -X POST "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID/regenerate-secret" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🗑️ **8. Delete Webhook**

```bash
curl -X DELETE "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🔍 **9. Expected Webhook Payloads**

### payment.verified Event
```json
{
  "id": "evt_1234567890",
  "type": "payment.verified",
  "created": 1640995200,
  "data": {
    "payment": {
      "id": "pay_123",
      "reference": "FT26017MLDG7755415774",
      "provider": "CBE",
      "amount": 700.00,
      "status": "VERIFIED",
      "verifiedAt": "2025-01-24T10:30:00Z"
    },
    "merchant": {
      "id": "merchant_123",
      "name": "Your Merchant Name"
    }
  }
}
```

### payment.unverified Event
```json
{
  "id": "evt_1234567891",
  "type": "payment.unverified",
  "created": 1640995260,
  "data": {
    "payment": {
      "reference": "FT26017MLDG7755415774",
      "provider": "CBE",
      "claimedAmount": 1000.00,
      "actualAmount": 700.00,
      "status": "UNVERIFIED",
      "mismatchReason": "Amount mismatch"
    },
    "merchant": {
      "id": "merchant_123",
      "name": "Your Merchant Name"
    }
  }
}
```

### test Event
```json
{
  "id": "evt_test_1640995300",
  "type": "test",
  "created": 1640995300,
  "data": {
    "message": "This is a test webhook event",
    "timestamp": "2025-01-24T10:35:00Z"
  }
}
```

---

## 🔐 **10. Webhook Signature Verification**

### Headers Sent with Webhooks
```
X-FetanPay-Signature: <HMAC-SHA256 signature>
X-FetanPay-Event: payment.verified
X-FetanPay-Delivery-Id: <delivery-id>
Content-Type: application/json
```

### Verify Signature (Node.js Example)
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

// Usage
const isValid = verifyWebhookSignature(
  JSON.stringify(req.body),
  req.headers['x-fetanpay-signature'],
  'your_webhook_secret_here'
);
```

---

## 🎯 **Complete Testing Workflow**

### Step 1: Set Up Webhook Endpoint
```bash
# Option A: Use webhook.site (easiest)
# Go to https://webhook.site and copy your URL

# Option B: Start local server (in separate terminal)
python3 -c "
import http.server
import socketserver
class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        data = self.rfile.read(length)
        print(f'Webhook: {self.headers}')
        print(f'Body: {data.decode()}')
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')
with socketserver.TCPServer(('', 3001), Handler) as httpd:
    print('Webhook server: http://localhost:3001')
    httpd.serve_forever()
"
```

### Step 2: Create Webhook
```bash
curl -X POST "http://localhost:3003/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "url": "https://webhook.site/YOUR_ID_OR_http://localhost:3001",
    "events": ["payment.verified", "payment.unverified", "test"]
  }'
```

### Step 3: Test Webhook
```bash
# Get webhook ID from step 2 response, then:
curl -X POST "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID/test" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### Step 4: Trigger Real Webhook
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

### Step 5: Check Delivery Logs
```bash
curl -X GET "http://localhost:3003/api/v1/webhooks/YOUR_WEBHOOK_ID/deliveries" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🚨 **Troubleshooting**

### Webhook Not Receiving
1. **Check URL**: Make sure your webhook URL is accessible
2. **Check Logs**: Use the delivery logs endpoint to see errors
3. **Test Connectivity**: Try `curl -X POST your_webhook_url -d "test"`

### Signature Verification Failing
1. **Use Raw Body**: Don't parse JSON before verifying signature
2. **Check Secret**: Make sure you're using the correct webhook secret
3. **Check Headers**: Look for `X-FetanPay-Signature` header

### Webhook Not Triggering
1. **Check Events**: Make sure webhook is subscribed to the right events
2. **Check Status**: Webhook must be ACTIVE status
3. **Check Payment**: Payment verification must complete (success or failure)

---

## 📝 **Quick Commands Summary**

```bash
# 1. Create webhook
curl -X POST "http://localhost:3003/api/v1/webhooks" -H "Authorization: Bearer YOUR_API_KEY" -d '{"url":"https://webhook.site/YOUR_ID","events":["payment.verified","test"]}'

# 2. Test webhook (replace WEBHOOK_ID)
curl -X POST "http://localhost:3003/api/v1/webhooks/WEBHOOK_ID/test" -H "Authorization: Bearer YOUR_API_KEY"

# 3. Trigger real webhook
curl -X POST "http://localhost:3003/api/v1/payments/verify" -H "Authorization: Bearer YOUR_API_KEY" -d '{"provider":"CBE","reference":"FT26017MLDG7755415774","claimedAmount":1000.00}'

# 4. Check delivery logs
curl -X GET "http://localhost:3003/api/v1/webhooks/WEBHOOK_ID/deliveries" -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 🎉 **Success Indicators**

✅ **Webhook Created**: You get a webhook ID and secret  
✅ **Test Webhook Sent**: You see the test payload in your endpoint  
✅ **Real Webhook Triggered**: Payment verification triggers webhook  
✅ **Delivery Logs**: You can see successful deliveries in logs  
✅ **Signature Valid**: Your endpoint can verify the signature  

Happy webhook testing! 🚀