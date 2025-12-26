# Kifiya Auth - Complete Features & Technical Details

## Overview

Kifiya Auth is an instant payment verification system designed for Ethiopian businesses to automate payment verification across multiple banks. This document provides comprehensive details about all features and technical aspects of the platform.

## Core Features

### 1. Instant Verification

**Description**: Verify payments from multiple banks in seconds

**Technical Implementation**:
- Real-time transaction querying against bank APIs
- Response time: < 5 seconds
- Asynchronous processing for multiple verifications
- Caching mechanism for frequently accessed transactions

**Verification Methods**:
- **Transaction ID Verification**: 
  - Input: Transaction reference/ID string
  - Process: Query bank API with transaction reference
  - Output: Transaction details and verification status
  
- **QR Code Scanning**: 
  - Input: QR code image (base64) or QR string
  - Process: Parse QR code, extract transaction details, validate format
  - Output: Parsed transaction data and verification status

**Benefits**:
- Eliminates manual screenshot checking
- No delayed confirmations
- Instant business decisions

**Use Cases**:
- E-commerce order fulfillment
- Service payment confirmation
- Real-time inventory updates

**Icon**: Shield with checkmark

### 2. Fraud Prevention

**Description**: Prevent duplicate transaction usage and screenshot-based fraud

**Technical Implementation**:
- **Duplicate Detection**:
  - Database indexing on transaction references
  - Hash-based transaction tracking
  - Real-time duplicate checking before verification
  - Transaction fingerprinting (amount + sender + receiver + timestamp)
  
- **Screenshot Fraud Prevention**:
  - QR code validation (cannot be easily faked)
  - Transaction timestamp verification
  - Bank record cross-referencing
  - Amount validation against payment intent

**Database Schema**:
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY,
  transaction_reference VARCHAR UNIQUE,
  transaction_hash VARCHAR UNIQUE,
  vendor_id UUID,
  status VARCHAR,
  verified_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Benefits**:
- Prevents same transaction from being used multiple times
- Protects against screenshot manipulation
- Reduces financial losses

**Use Cases**:
- Preventing customer fraud
- Protecting merchant revenue
- Ensuring transaction integrity

**Icon**: Padlock

### 3. Real-time Webhooks

**Description**: Get instant notifications when payments are verified

**Technical Implementation**:
- **Event System**:
  - Event types: `payment.verified`, `payment.failed`, `payment.pending`
  - Event queue for reliable delivery
  - Retry mechanism with exponential backoff
  - Dead letter queue for failed deliveries

- **Webhook Delivery**:
  - HTTP POST requests to configured URLs
  - Signature verification using HMAC-SHA256
  - Timeout: 30 seconds
  - Retry attempts: Up to 3 attempts
  - Retry intervals: 1s, 5s, 30s

**Webhook Payload Structure**:
```json
{
  "event": "payment.verified",
  "data": {
    "id": "ver_1234567890",
    "payment_intent_id": "pi_1234567890",
    "transaction_reference": "TXN123456789",
    "amount": 1000.00,
    "status": "verified",
    "verified_at": "2025-01-01T12:05:00Z"
  },
  "timestamp": "2025-01-01T12:05:00Z",
  "signature": "hmac_signature"
}
```

**Security**:
- HMAC signature verification
- HTTPS-only webhook URLs
- Idempotency keys
- Rate limiting per webhook endpoint

**Benefits**:
- Seamless integration with existing systems
- Automatic workflow triggers
- Real-time updates

**Use Cases**:
- Order status updates
- Inventory management
- Customer notifications
- Accounting system integration

**Icon**: Lightning bolt

### 4. Developer-Friendly API

**Description**: Simple REST API with comprehensive documentation

**Technical Implementation**:
- **API Architecture**:
  - RESTful design principles
  - JSON request/response format
  - Standard HTTP status codes
  - Versioned endpoints (/v1/)

- **Authentication**:
  - API key-based authentication
  - Bearer token in Authorization header
  - 2 API keys per account (all plans)
  - Key rotation support
  - Rate limiting per API key

- **Endpoints**:
  - `POST /v1/payment-intents` - Create payment intent
  - `GET /v1/payment-intents/:id` - Get payment intent
  - `POST /v1/verifications` - Verify by transaction ID
  - `POST /v1/verifications/qr` - Verify by QR code
  - `GET /v1/verifications/:id` - Get verification details

**Documentation**:
- OpenAPI/Swagger specification
- Interactive API explorer
- Code examples in multiple languages
- SDK libraries (JavaScript, Python, PHP)

**Benefits**:
- Quick integration (minutes, not days)
- Well-documented endpoints
- Multiple language support

**Use Cases**:
- E-commerce platform integration
- Payment gateway development
- Custom payment flows
- Automated verification systems

**Icon**: Code tags (</>)

### 5. Analytics Dashboard

**Description**: Track all transactions, verification rates, and business metrics

**Technical Implementation**:
- **Data Aggregation**:
  - Real-time metrics calculation
  - Time-series data storage
  - Aggregated statistics (daily, weekly, monthly)
  - Caching for performance

- **Metrics Tracked**:
  - Total verifications
  - Success rate
  - Failed verifications
  - Revenue (if applicable)
  - Bank-wise statistics
  - Time-based trends

**Dashboard Components**:
- Overview cards (total, success rate, revenue)
- Charts (line, bar, pie)
- Transaction table with filters
- Export functionality (CSV, PDF)

**Database Queries**:
```sql
-- Daily verification stats
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
  SUM(amount) as total_amount
FROM verifications
WHERE vendor_id = ?
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Benefits**:
- Complete visibility into operations
- Data-driven decisions
- Performance monitoring

**Use Cases**:
- Business performance tracking
- Fraud pattern detection
- Revenue analysis
- Operational optimization

**Icon**: Bar chart


### 7. Waiter Tip & Bonus Management

**Description**: Track and manage tips/bonuses for cafe/restaurant waiters during payment verification

**Use Case**: Perfect for restaurants and cafes where waiters verify customer payments and receive tips

**How It Works**:
1. **Waiter Verification**: When a waiter verifies a payment (via vendor admin dashboard), they can input a tip amount
2. **Tip Recording**: Tip amount is automatically recorded and associated with the waiter
3. **Daily Tracking**: All tips are tracked per waiter, per day
4. **Bonus Viewing**: At end of day/night, waiters can request restaurant admin to view their accumulated tips/bonuses
5. **Admin Approval**: Restaurant admin can view, verify, and approve bonus payments to waiters

**Technical Implementation**:
- **Waiter Management**:
  - Waiters are created and managed by vendor admin
  - Each waiter has unique ID and profile
  - Waiters don't have separate UI/dashboard access
  - All operations go through vendor admin interface

- **Tip Input During Verification**:
  - Tip input field in verification form
  - Optional field (can be zero)
  - Validated for numeric input
  - Stored with verification record

- **Tip Tracking**:
  - Tips associated with waiter ID
  - Daily aggregation per waiter
  - Real-time tip calculation
  - Historical tip records

**Database Schema**:
```sql
CREATE TABLE waiters (
  id UUID PRIMARY KEY,
  vendor_id UUID,
  name VARCHAR,
  phone_number VARCHAR,
  employee_id VARCHAR,
  status VARCHAR, -- active, inactive
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE waiter_tips (
  id UUID PRIMARY KEY,
  verification_id UUID,
  waiter_id UUID,
  vendor_id UUID,
  tip_amount DECIMAL(10,2),
  verification_date DATE,
  status VARCHAR, -- pending, approved, paid
  approved_at TIMESTAMP,
  approved_by UUID, -- vendor admin user id
  created_at TIMESTAMP
);

-- Add tip_amount to verifications table
ALTER TABLE verifications ADD COLUMN tip_amount DECIMAL(10,2);
ALTER TABLE verifications ADD COLUMN waiter_id UUID;
```

**Vendor Admin Dashboard Features**:
- **Waiter Management**:
  - Add/edit/delete waiters
  - View waiter list
  - Activate/deactivate waiters
  
- **Tip Input During Verification**:
  - Tip input field in verifier page
  - Waiter selection dropdown
  - Tip amount input (optional)
  
- **Bonus Management**:
  - View all tips by waiter
  - Daily/weekly/monthly tip reports
  - Approve tips for payment
  - Export tip reports
  - Tip history per waiter

**API Endpoints**:
- `POST /v1/waiters` - Create waiter
- `GET /v1/waiters` - List waiters
- `GET /v1/waiters/:id` - Get waiter details
- `PUT /v1/waiters/:id` - Update waiter
- `DELETE /v1/waiters/:id` - Delete waiter
- `GET /v1/waiters/:id/tips` - Get waiter tips
- `GET /v1/waiters/:id/tips/daily` - Get daily tips
- `POST /v1/tips/:id/approve` - Approve tip
- `GET /v1/vendors/:id/tips-summary` - Get tips summary for vendor

**Verification Request with Tip**:
```json
{
  "payment_intent_id": "pi_1234567890",
  "transaction_reference": "TXN123456789",
  "bank_name": "CBE",
  "waiter_id": "waiter_123",
  "tip_amount": 50.00
}
```

**Tip Summary Response**:
```json
{
  "waiter_id": "waiter_123",
  "waiter_name": "John Doe",
  "date": "2025-01-01",
  "total_tips": 250.00,
  "verification_count": 5,
  "average_tip": 50.00,
  "status": "pending",
  "tips": [
    {
      "id": "tip_1",
      "verification_id": "ver_1",
      "amount": 50.00,
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

**Benefits**:
- Automated tip tracking
- No manual calculation needed
- Transparent tip management
- Easy bonus distribution
- Historical tip records
- Daily/weekly/monthly reports

**Use Cases**:
- Restaurant payment verification with tips
- Cafe order payment with waiter bonuses
- Service payment with tip tracking
- Staff performance tracking through tips

**Icon**: 💰 Tip/Bonus icon

## Additional Features

### Payment Intent Management

**Technical Details**:
- **Database Schema**:
```sql
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY,
  vendor_id UUID,
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  payer_name VARCHAR,
  payer_account VARCHAR,
  status VARCHAR,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

- **Status Flow**:
  - `pending` → `verified` / `failed` / `expired`
  - Automatic expiration after 24 hours
  - Status update triggers webhook

- **API Endpoints**:
  - `POST /v1/payment-intents` - Create
  - `GET /v1/payment-intents/:id` - Get details
  - `GET /v1/payment-intents` - List with pagination
  - `PUT /v1/payment-intents/:id` - Update
  - `DELETE /v1/payment-intents/:id` - Delete

### Multi-Bank Support

**Technical Implementation**:
- **Bank Integration Architecture**:
  - Abstract bank interface
  - Bank-specific adapters
  - Factory pattern for bank selection
  - Unified response format

- **Supported Banks**:
  - **BOA (Bank of Abyssinia)**: API integration
  - **Awash Bank**: API integration
  - **CBE (Commercial Bank of Ethiopia)**: API integration
  - **Telebirr**: API integration
  - **Extensible**: Plugin architecture for new banks

- **Bank Adapter Interface**:
```typescript
interface BankAdapter {
  verifyTransaction(reference: string): Promise<Transaction>;
  parseQRCode(qrData: string): Promise<TransactionData>;
  validateAccount(account: string): Promise<boolean>;
}
```

- **Database Schema**:
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  vendor_id UUID,
  bank_name VARCHAR,
  account_number VARCHAR,
  account_name VARCHAR,
  account_type VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP
);
```

### Transaction Verification

**Technical Implementation**:
- **Verification Process**:
  1. Receive verification request (transaction ID or QR code)
  2. Identify bank from request or QR code
  3. Route to appropriate bank adapter
  4. Query bank API for transaction
  5. Validate transaction details
  6. Check for duplicates
  7. Update payment intent status
  8. Trigger webhook (if configured)
  9. Return verification result

- **Validation Rules**:
  - Transaction must exist in bank records
  - Amount must match payment intent
  - Sender account must match payer
  - Receiver account must match vendor's bank account
  - Transaction must not be duplicate
  - Transaction timestamp must be recent (within 24 hours)

- **Error Handling**:
  - Transaction not found → `VERIFICATION_FAILED`
  - Amount mismatch → `AMOUNT_MISMATCH`
  - Duplicate transaction → `DUPLICATE_TRANSACTION`
  - Bank API error → `BANK_ERROR`
  - Timeout → `TIMEOUT_ERROR`

### Vendor Dashboard

**Technical Implementation**:
- **Frontend Stack**:
  - Next.js 14+ (App Router)
  - TypeScript
  - Tailwind CSS
  - React Hook Form
  - Zustand (state management)

- **Key Pages**:
  - Dashboard (overview, stats)
  - Bank Accounts (CRUD operations)
  - Verifier Page (transaction/QR verification)
  - Transactions (history, filters)
  - Settings (API keys, webhooks)
  - Analytics (charts, reports)

- **Verifier Page Components**:
  - Transaction ID input form
  - QR code scanner (camera/upload)
  - Bank selector dropdown
  - Verification button
  - Results display panel
  - History table

### Developer API Access

**Technical Implementation**:
- **API Key Management**:
  - 2 API keys per account (all plans)
  - Secure key generation (UUID v4)
  - Key hashing (bcrypt)
  - Key rotation endpoint
  - Key expiration (optional)
  - Rate limiting per key

- **API Security**:
  - HTTPS only
  - CORS configuration
  - Rate limiting (100 req/min default)
  - Request validation
  - Error sanitization


### Security Features

**Technical Implementation**:
- **Authentication**:
  - JWT tokens for user sessions
  - API keys for API access
  - OAuth 2.0 (future)

- **Data Protection**:
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS 1.3)
  - PII data masking
  - Secure password hashing (bcrypt)

- **Rate Limiting**:
  - Token bucket algorithm
  - Per-API-key limits
  - Per-IP limits
  - Distributed rate limiting (Redis)

- **Fraud Detection**:
  - Anomaly detection algorithms
  - Pattern recognition
  - Machine learning models (future)
  - Real-time monitoring

## Technical Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Queue**: Bull (Redis-based)
- **Authentication**: JWT, API Keys
- **Validation**: class-validator
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Charts**: Recharts

### Infrastructure
- **API Documentation**: Swagger/OpenAPI
- **Version Control**: Git
- **Package Manager**: npm/yarn/pnpm
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, DataDog
- **Logging**: Winston, ELK Stack

## Performance Metrics

### API Performance
- Response time: < 200ms (95th percentile)
- Verification time: < 5 seconds
- Throughput: 1000+ requests/second
- Uptime: 99.9%

### Database Performance
- Query optimization with indexes
- Connection pooling
- Read replicas for scaling
- Caching layer (Redis)

### Frontend Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Integration Examples

### JavaScript/TypeScript
```typescript
// Direct API calls using fetch
const API_KEY = 'YOUR_API_KEY'; // Use one of your 2 API keys

// Create payment intent
const intentResponse = await fetch('https://api.kifiya-auth.com/v1/payment-intents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000.00,
    currency: 'ETB',
    payer_name: 'John Doe'
  })
});

const intent = await intentResponse.json();

// Verify by transaction ID
const verificationResponse = await fetch('https://api.kifiya-auth.com/v1/verifications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    payment_intent_id: intent.data.id,
    transaction_reference: 'TXN123456789',
    bank_name: 'CBE'
  })
});

const verification = await verificationResponse.json();
```

### Python
```python
import requests

API_KEY = 'YOUR_API_KEY'  # Use one of your 2 API keys
BASE_URL = 'https://api.kifiya-auth.com/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Create payment intent
intent_response = requests.post(
    f'{BASE_URL}/payment-intents',
    headers=headers,
    json={
        'amount': 1000.00,
        'currency': 'ETB',
        'payer_name': 'John Doe'
    }
)

intent = intent_response.json()

# Verify payment
verification_response = requests.post(
    f'{BASE_URL}/verifications',
    headers=headers,
    json={
        'payment_intent_id': intent['data']['id'],
        'transaction_reference': 'TXN123456789',
        'bank_name': 'CBE'
    }
)

verification = verification_response.json()
```

## Future Enhancements

- Payment receipt OCR
- Advanced fraud detection (ML)
- Multi-currency support
- Batch verification API
- Custom verification rules
- GraphQL API
- WebSocket for real-time updates
- White-label solutions

---

For implementation details, see [Technical Documentation](./technical-documentation.md)

