# FetanPay API Testing - cURL Commands

## 🧪 **Payment Verification API Testing**

Use these cURL commands to test the FetanPay payment verification API with your API key.

---

## 📋 **Prerequisites**

1. **Get your API key** from merchant-admin → Developer Tools → API Keys
2. **Replace `YOUR_API_KEY_HERE`** with your actual API key
3. **Server URL**: `http://localhost:3003` (development) or `https://api.fetanpay.et` (production)

---

## 🔑 **1. Basic Payment Verification**

### CBE Payment Verification
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

### Telebirr Payment Verification
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "TELEBIRR",
    "reference": "TB123456789",
    "claimedAmount": 500.00
  }'
```

### Awash Bank Payment Verification
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "AWASH",
    "reference": "AW987654321",
    "claimedAmount": 750.00
  }'
```

---

## 💰 **2. Payment Verification with Tips**

### Payment with Tip Amount
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

---

## 📱 **3. Payment Verification with QR Data**

### With Raw QR Payload
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00,
    "qrData": "raw_qr_payload_here"
  }'
```

---

## 📊 **4. Get Verification History**

### Recent Verification History
```bash
curl -X GET "http://localhost:3003/api/v1/payments/verification-history?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### Filtered by Status
```bash
curl -X GET "http://localhost:3003/api/v1/payments/verification-history?page=1&pageSize=10&status=VERIFIED" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### Filtered by Provider
```bash
curl -X GET "http://localhost:3003/api/v1/payments/verification-history?page=1&pageSize=10&provider=CBE" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🏦 **5. Get Active Receiver Accounts**

### All Active Receiver Accounts
```bash
curl -X GET "http://localhost:3003/api/v1/payments/receiver-accounts/active" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### Specific Provider Receiver Account
```bash
curl -X GET "http://localhost:3003/api/v1/payments/receiver-accounts/active?provider=CBE" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

---

## 🔍 **6. Expected Response Examples**

### Successful Verification Response
```json
{
  "success": true,
  "status": "VERIFIED",
  "transaction": {
    "id": "trans_123456789",
    "reference": "FT26017MLDG7755415774",
    "provider": "CBE",
    "amount": 1000.00,
    "tipAmount": 50.00,
    "status": "VERIFIED",
    "verifiedAt": "2025-01-24T10:30:00Z"
  },
  "checks": {
    "referenceExists": true,
    "amountMatches": true,
    "providerMatches": true,
    "receiverMatches": true
  }
}
```

### Failed Verification Response
```json
{
  "success": false,
  "status": "UNVERIFIED",
  "mismatchReason": "Amount mismatch: expected 1000.00, got 950.00",
  "checks": {
    "referenceExists": true,
    "amountMatches": false,
    "providerMatches": true,
    "receiverMatches": true
  }
}
```

### Rate Limited Response (429)
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## 🚨 **7. Error Testing**

### Invalid API Key
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_key_here" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

### Missing Authorization Header
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

### Invalid Provider
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "INVALID_PROVIDER",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

### Missing Required Fields
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE"
  }'
```

---

## 🔄 **8. Rate Limit Testing**

### Test Rate Limiting (Run Multiple Times Quickly)
```bash
# Run this command 15 times quickly to trigger rate limiting
for i in {1..15}; do
  echo "Request $i:"
  curl -X POST "http://localhost:3003/api/v1/payments/verify" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY_HERE" \
    -d '{
      "provider": "CBE",
      "reference": "FT26017MLDG7755415774",
      "claimedAmount": 1000.00
    }' \
    -w "Status: %{http_code}\n" \
    -s -o /dev/null
  sleep 1
done
```

---

## 🌐 **9. Production Testing**

### Production API Base URL
Replace `localhost:4000` with `https://api.fetanpay.et` for production testing:

```bash
curl -X POST "https://api.fetanpay.et/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PRODUCTION_API_KEY" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

---

## 📝 **10. Testing Checklist**

### ✅ **Basic Functionality**
- [ ] Successful payment verification with valid reference
- [ ] Failed verification with invalid reference
- [ ] Payment verification with tip amount
- [ ] All supported providers (CBE, TELEBIRR, AWASH, BOA, DASHEN)

### ✅ **Authentication**
- [ ] Valid API key authentication works
- [ ] Invalid API key returns 401
- [ ] Missing Authorization header returns 401
- [ ] API key rate limiting (10 requests/minute)

### ✅ **Data Validation**
- [ ] Invalid provider returns validation error
- [ ] Missing required fields return validation error
- [ ] Invalid amount values return validation error
- [ ] Negative amounts return validation error

### ✅ **Additional Endpoints**
- [ ] Verification history retrieval
- [ ] Active receiver accounts retrieval
- [ ] Pagination works correctly
- [ ] Filtering works correctly

---

## 🔧 **11. Debugging Tips**

### Verbose Output
Add `-v` flag for detailed request/response information:
```bash
curl -v -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"provider": "CBE", "reference": "FT26017MLDG7755415774", "claimedAmount": 1000.00}'
```

### Save Response to File
```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"provider": "CBE", "reference": "FT26017MLDG7755415774", "claimedAmount": 1000.00}' \
  -o response.json
```

### Check Response Headers
```bash
curl -I -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{"provider": "CBE", "reference": "FT26017MLDG7755415774", "claimedAmount": 1000.00}'
```

---

## 🎯 **Quick Start Command**

**Copy and run this command to test immediately** (replace YOUR_API_KEY_HERE):

```bash
curl -X POST "http://localhost:3003/api/v1/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00,
    "tipAmount": 50.00
  }' \
  | jq '.'
```

*Note: Install `jq` for pretty JSON formatting: `sudo apt install jq` (Ubuntu) or `brew install jq` (macOS)*

---

## 📞 **Support**

If you encounter issues:
1. Check your API key is correct and active
2. Verify the server is running on the correct port
3. Check rate limiting (wait 1 minute if you hit the limit)
4. Review the response for specific error messages
5. Use verbose mode (`-v`) to debug request/response details