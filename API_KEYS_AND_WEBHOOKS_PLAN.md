# API Keys & Webhooks Implementation Plan

## 📋 Overview

This document outlines the plan to enable developers to integrate FetanPay payment verification system into their applications using API keys and webhooks.

## 🎯 Goals

1. **API Key Authentication**: Allow developers to authenticate API requests using API keys instead of session cookies
2. **Webhook System**: Send real-time notifications to developer applications when payment events occur
3. **Developer Dashboard**: Provide UI for merchants to manage API keys and webhook endpoints
4. **Developer Documentation**: Clear API documentation with examples

---

## 🏗️ Architecture Overview

### Current System
- **Authentication**: Better Auth (session-based, cookies/bearer tokens)
- **API Endpoints**: Payment verification, transaction history, etc.
- **Access**: Only through merchant-admin UI or merchant mobile app

### Proposed System
- **API Key Auth**: Alternative authentication method for programmatic access
- **Webhook Events**: Real-time notifications for payment verification events
- **Developer Portal**: Self-service API key and webhook management

---

## 📊 Database Schema Changes

### 1. Add API Key Model

```prisma
model ApiKey {
  id            String   @id @default(uuid())
  merchantId    String
  merchant      Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  
  name          String   // User-friendly name (e.g., "Production API Key", "Test Key")
  keyHash       String   @unique // Hashed API key (never store plain text)
  keyPrefix     String   // First 8 chars for display (e.g., "fetan_live_")
  
  status        ApiKeyStatus @default(ACTIVE) // ACTIVE, REVOKED
  lastUsedAt    DateTime?
  expiresAt     DateTime? // Optional expiration
  
  // Permissions/Scopes (future: fine-grained access control)
  scopes        String[] // e.g., ["payments:verify", "payments:read"]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String? // merchantUserId who created it
  
  @@index([merchantId])
  @@index([keyHash])
}

enum ApiKeyStatus {
  ACTIVE
  REVOKED
}
```

### 2. Add Webhook Model

```prisma
model Webhook {
  id            String   @id @default(uuid())
  merchantId    String
  merchant      Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  
  url           String   // Webhook endpoint URL
  secret        String   // Secret for signature verification
  status        WebhookStatus @default(ACTIVE) // ACTIVE, PAUSED, FAILED
  
  // Event subscriptions
  events        String[] // e.g., ["payment.verified", "payment.failed"]
  
  // Retry configuration
  maxRetries    Int      @default(3)
  timeout       Int      @default(30000) // milliseconds
  
  // Statistics
  successCount  Int      @default(0)
  failureCount  Int      @default(0)
  lastTriggeredAt DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String? // merchantUserId who created it
  
  @@index([merchantId])
}

enum WebhookStatus {
  ACTIVE
  PAUSED
  FAILED
}

// Webhook delivery logs
model WebhookDelivery {
  id            String   @id @default(uuid())
  webhookId     String
  webhook       Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  
  event         String   // Event type
  payload       Json     // Event payload
  status        DeliveryStatus // PENDING, SUCCESS, FAILED
  statusCode    Int?     // HTTP status code from webhook endpoint
  responseBody  String?  // Response from webhook endpoint
  errorMessage  String?  // Error message if failed
  
  attemptNumber Int      @default(1)
  nextRetryAt   DateTime?
  
  createdAt     DateTime @default(now())
  deliveredAt   DateTime?
  
  @@index([webhookId])
  @@index([status])
  @@index([createdAt])
}
```

### 3. Update Merchant Model

```prisma
model Merchant {
  // ... existing fields ...
  
  apiKeys       ApiKey[]
  webhooks      Webhook[]
}
```

---

## 🔐 API Key Authentication Flow

### 1. API Key Generation

**Process:**
1. Merchant creates API key in dashboard
2. System generates:
   - Random secret key (e.g., `fetan_live_sk_1234567890abcdef...`)
   - Hash of the key (stored in database)
   - Prefix (first 8 chars, for display)
3. **Show key once** to merchant (never shown again)
4. Store only the hash in database

**Example:**
```
Generated Key: fetan_live_sk_1234567890abcdef1234567890abcdef
Display Prefix: fetan_live_sk_1234...
Stored Hash: sha256(fetan_live_sk_1234567890abcdef1234567890abcdef)
```

### 2. API Key Usage

**Request Format:**
```http
POST /api/v1/payments/verify
Authorization: Bearer fetan_live_sk_1234567890abcdef1234567890abcdef
Content-Type: application/json

{
  "provider": "CBE",
  "reference": "FT26017MLDG7755415774",
  "tipAmount": 50.0
}
```

**Authentication Middleware:**
1. Extract API key from `Authorization: Bearer <key>` header
2. Hash the provided key
3. Look up API key by hash
4. Verify:
   - Key exists
   - Status is ACTIVE
   - Not expired (if expiresAt is set)
   - Merchant is active
5. Attach merchant context to request (similar to session auth)

---

## 🔔 Webhook System

### 1. Webhook Events

**Event Types:**
- `payment.verified` - Payment successfully verified
- `payment.unverified` - Payment verification failed
- `payment.duplicate` - Duplicate payment detected
- `wallet.charged` - Wallet charged for verification fee
- `wallet.insufficient` - Insufficient wallet balance

### 2. Webhook Payload Structure

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
      "amount": 1000.00,
      "status": "VERIFIED",
      "verifiedAt": "2025-01-15T10:30:00Z"
    },
    "merchant": {
      "id": "merchant_123",
      "name": "Coffee Shop"
    }
  }
}
```

### 3. Webhook Delivery

**Process:**
1. Payment event occurs (e.g., verification succeeds)
2. Find all active webhooks for merchant subscribed to event
3. For each webhook:
   - Create `WebhookDelivery` record (status: PENDING)
   - Generate signature using webhook secret
   - Send HTTP POST to webhook URL with:
     - Headers: `X-FetanPay-Signature`, `X-FetanPay-Event`, `X-FetanPay-Delivery-Id`
     - Body: JSON payload
   - Update delivery record with response
   - Retry on failure (up to maxRetries)

**Signature Generation:**
```javascript
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
```

**Developer Verification:**
```javascript
const signature = req.headers['x-fetanpay-signature'];
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).send('Invalid signature');
}
```

### 4. Retry Logic

- **Initial attempt**: Immediate
- **Retry 1**: After 1 minute
- **Retry 2**: After 5 minutes
- **Retry 3**: After 15 minutes
- **Max retries**: 3 (configurable)
- **Timeout**: 30 seconds per request

---

## 🖥️ Developer Dashboard UI

### Location: Merchant-Admin Panel

**New Section: "Developer Tools" or "API Access"**

### 1. API Keys Management Page

**Features:**
- List all API keys (with masked display: `fetan_live_sk_1234...`)
- Create new API key
  - Name input (e.g., "Production", "Staging", "Test")
  - Expiration date (optional)
  - Scopes/permissions (future)
- Revoke API key
- View usage statistics (last used, request count)
- Copy key button (only on creation)

**UI Components:**
```
┌─────────────────────────────────────┐
│ API Keys                            │
│                                     │
│ [+ Create New API Key]              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Production Key                  │ │
│ │ fetan_live_sk_1234...           │ │
│ │ Last used: 2 hours ago          │ │
│ │ [Revoke] [View Details]         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Test Key                         │ │
│ │ fetan_test_sk_5678...           │ │
│ │ Last used: Never                │ │
│ │ [Revoke] [View Details]         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Webhooks Management Page

**Features:**
- List all webhook endpoints
- Create new webhook
  - URL input
  - Event subscriptions (checkboxes)
  - Test webhook button
- Edit webhook (URL, events, status)
- Pause/Resume webhook
- Delete webhook
- View delivery logs
  - Success/failure count
  - Recent deliveries with status
  - Retry history

**UI Components:**
```
┌─────────────────────────────────────┐
│ Webhooks                            │
│                                     │
│ [+ Add Webhook Endpoint]            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Production Webhook               │ │
│ │ https://api.myapp.com/webhooks   │ │
│ │ Events: payment.verified          │ │
│ │ Status: Active ✓                 │ │
│ │ Success: 1,234 | Failed: 5      │ │
│ │ [Edit] [Pause] [View Logs]      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3. API Documentation Page

**Features:**
- Interactive API documentation
- Code examples (cURL, JavaScript, Python, PHP)
- Authentication guide
- Webhook setup guide
- Rate limits information
- Error codes reference

---

## 🔧 Backend Implementation

### 1. API Key Service

**File:** `server/src/modules/api-keys/api-keys.service.ts`

**Methods:**
- `generateApiKey(merchantId, name, expiresAt?)` - Generate new key
- `validateApiKey(key)` - Validate and return merchant
- `revokeApiKey(keyId, merchantId)` - Revoke key
- `listApiKeys(merchantId)` - List merchant's keys
- `updateLastUsed(keyId)` - Update usage timestamp

### 2. API Key Authentication Guard

**File:** `server/src/modules/api-keys/guards/api-key.guard.ts`

**Logic:**
- Extract API key from Authorization header
- Validate key using ApiKeyService
- Attach merchant context to request
- Works alongside existing session auth (either/or)

### 3. Webhook Service

**File:** `server/src/modules/webhooks/webhooks.service.ts`

**Methods:**
- `createWebhook(merchantId, url, events, secret)` - Create webhook
- `triggerWebhook(event, merchantId, data)` - Trigger webhook delivery
- `deliverWebhook(webhookId, payload)` - Send HTTP request
- `retryFailedDelivery(deliveryId)` - Retry failed delivery
- `listWebhooks(merchantId)` - List merchant's webhooks
- `getDeliveryLogs(webhookId, filters)` - Get delivery history

### 4. Webhook Queue/Worker

**Option A: In-Memory Queue (Simple)**
- Use Bull or similar job queue
- Process webhook deliveries asynchronously
- Retry failed deliveries

**Option B: Database Polling (Simpler)**
- Cron job checks for pending deliveries
- Processes deliveries in batches
- Updates delivery status

### 5. Integration Points

**Payment Verification:**
- After successful verification → trigger `payment.verified` webhook
- After failed verification → trigger `payment.unverified` webhook
- After duplicate detection → trigger `payment.duplicate` webhook

**Wallet Charging:**
- After wallet charge → trigger `wallet.charged` webhook
- If insufficient balance → trigger `wallet.insufficient` webhook

---

## 📡 API Endpoints

### API Key Management

```
POST   /api/v1/api-keys                    - Create API key
GET    /api/v1/api-keys                    - List API keys
DELETE /api/v1/api-keys/:id                - Revoke API key
GET    /api/v1/api-keys/:id                - Get API key details
```

### Webhook Management

```
POST   /api/v1/webhooks                    - Create webhook
GET    /api/v1/webhooks                    - List webhooks
GET    /api/v1/webhooks/:id                - Get webhook details
PUT    /api/v1/webhooks/:id                - Update webhook
DELETE /api/v1/webhooks/:id                - Delete webhook
POST   /api/v1/webhooks/:id/test           - Test webhook
GET    /api/v1/webhooks/:id/deliveries     - Get delivery logs
POST   /api/v1/webhooks/:id/retry/:deliveryId - Retry failed delivery
```

### Public API (with API Key Auth)

```
POST   /api/v1/payments/verify             - Verify payment (API key auth)
GET    /api/v1/payments/verification-history - Get verification history
GET    /api/v1/payments/receiver-accounts/active - Get receiver accounts
```

---

## 🎨 Frontend Implementation

### Merchant-Admin UI

**New Routes:**
- `/developer/api-keys` - API keys management
- `/developer/webhooks` - Webhooks management
- `/developer/docs` - API documentation

**Components:**
- `ApiKeysPage.tsx` - List and manage API keys
- `CreateApiKeyModal.tsx` - Create new API key
- `WebhooksPage.tsx` - List and manage webhooks
- `CreateWebhookModal.tsx` - Create new webhook
- `WebhookDeliveryLogs.tsx` - View delivery history
- `ApiDocumentation.tsx` - Interactive API docs

**API Service:**
- `apiKeysServiceApi.ts` - RTK Query endpoints for API keys
- `webhooksServiceApi.ts` - RTK Query endpoints for webhooks

---

## 📝 Developer Experience

### 1. Getting Started Flow

1. **Sign up** as merchant (existing flow)
2. **Navigate** to Developer Tools section
3. **Create API key** → Copy key immediately
4. **Set up webhook** → Enter URL, select events
5. **Test integration** → Use API key to verify payment
6. **Receive webhook** → Handle payment.verified event

### 2. Code Examples

**JavaScript/Node.js:**
```javascript
const axios = require('axios');

// Verify payment
const response = await axios.post(
  'https://api.fetanpay.et/api/v1/payments/verify',
  {
    provider: 'CBE',
    reference: 'FT26017MLDG7755415774',
    tipAmount: 50.0
  },
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);

// Handle webhook
app.post('/webhooks/fetanpay', (req, res) => {
  const signature = req.headers['x-fetanpay-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSig) {
    return res.status(401).send('Invalid signature');
  }
  
  // Handle event
  if (req.body.type === 'payment.verified') {
    const payment = req.body.data.payment;
    // Update order status, send confirmation, etc.
    console.log(`Payment ${payment.reference} verified!`);
  }
  
  res.status(200).send('OK');
});
```

**Python:**
```python
import requests
import hmac
import hashlib

# Verify payment
response = requests.post(
    'https://api.fetanpay.et/api/v1/payments/verify',
    json={
        'provider': 'CBE',
        'reference': 'FT26017MLDG7755415774',
        'tipAmount': 50.0
    },
    headers={
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
)

# Handle webhook
@app.route('/webhooks/fetanpay', methods=['POST'])
def webhook():
    signature = request.headers.get('X-FetanPay-Signature')
    payload = request.get_data()
    
    # Verify signature
    expected_sig = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_sig:
        return 'Invalid signature', 401
    
    event = request.json
    if event['type'] == 'payment.verified':
        payment = event['data']['payment']
        # Handle verified payment
        print(f"Payment {payment['reference']} verified!")
    
    return 'OK', 200
```

---

## 🔒 Security Considerations

### API Keys
- ✅ Never store plain text keys in database
- ✅ Use strong hashing (SHA-256 or bcrypt)
- ✅ Show key only once on creation
- ✅ Allow key rotation (revoke old, create new)
- ✅ Rate limiting per API key
- ✅ IP whitelisting (optional, future)

### Webhooks
- ✅ HTTPS required for webhook URLs
- ✅ Signature verification mandatory
- ✅ Timeout protection (30s max)
- ✅ Retry with exponential backoff
- ✅ Webhook secret rotation support
- ✅ Delivery logs for audit trail

---

## 📈 Implementation Phases

### Phase 1: API Keys (MVP)
- [ ] Database schema (ApiKey model)
- [ ] API key generation service
- [ ] API key authentication guard
- [ ] API key management endpoints
- [ ] Merchant-admin UI for API keys
- [ ] Update payment endpoints to accept API key auth

### Phase 2: Webhooks (Core)
- [ ] Database schema (Webhook, WebhookDelivery models)
- [ ] Webhook service and delivery logic
- [ ] Webhook management endpoints
- [ ] Merchant-admin UI for webhooks
- [ ] Integration with payment verification flow
- [ ] Retry mechanism

### Phase 3: Developer Experience
- [ ] API documentation page
- [ ] Code examples and SDKs
- [ ] Webhook testing tool
- [ ] Usage analytics dashboard
- [ ] Rate limiting UI

### Phase 4: Advanced Features
- [ ] Webhook secret rotation
- [ ] IP whitelisting for API keys
- [ ] Fine-grained permissions/scopes
- [ ] Webhook event filtering
- [ ] Webhook replay functionality

---

## 🧪 Testing Strategy

### API Keys
- Test key generation and hashing
- Test authentication with valid/invalid keys
- Test key revocation
- Test expiration handling
- Test rate limiting per key

### Webhooks
- Test webhook delivery
- Test signature generation/verification
- Test retry logic
- Test webhook failure handling
- Test concurrent webhook deliveries
- Test webhook timeout scenarios

---

## 📚 Documentation Requirements

1. **API Reference**
   - Authentication guide
   - Endpoint documentation
   - Request/response examples
   - Error codes

2. **Webhook Guide**
   - Webhook setup
   - Event types
   - Payload structure
   - Signature verification
   - Retry handling

3. **SDKs & Examples**
   - JavaScript/Node.js
   - Python
   - PHP
   - cURL examples

4. **Best Practices**
   - Security recommendations
   - Error handling
   - Rate limiting
   - Webhook reliability

---

## 🎯 Success Metrics

- Number of API keys created
- API request volume
- Webhook delivery success rate
- Developer onboarding time
- API documentation views
- Support tickets related to API/webhooks

---

## 💡 Future Enhancements

- **OAuth 2.0** support (alternative to API keys)
- **GraphQL API** option
- **Webhook transformations** (customize payload format)
- **Webhook filtering** (conditional delivery)
- **API versioning** (v1, v2, etc.)
- **Sandbox environment** for testing
- **Webhook replay** from dashboard
- **Analytics dashboard** for API usage

---

## 📋 Summary

This plan enables developers to:
1. ✅ Authenticate using API keys (programmatic access)
2. ✅ Receive real-time webhook notifications
3. ✅ Manage API keys and webhooks via dashboard
4. ✅ Integrate FetanPay into their applications easily

**Key Benefits:**
- **For Developers**: Easy integration, real-time updates, self-service management
- **For FetanPay**: Platform expansion, developer ecosystem, additional revenue streams
- **For Merchants**: Better automation, custom integrations, workflow optimization

