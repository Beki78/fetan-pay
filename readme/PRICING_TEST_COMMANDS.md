# FetanPay Pricing System - Test Commands

## 🧪 **Pricing API Testing**

Use these cURL commands to test the FetanPay pricing system APIs.

---

## 📋 **Prerequisites**

1. **Server running** on `http://localhost:3003` (development)
2. **Admin authentication** (replace `YOUR_ADMIN_TOKEN` with actual token)
3. **Valid merchant ID** (replace `MERCHANT_ID_HERE` with actual merchant ID)

---

## 🏷️ **1. Plan Management**

### Get All Plans

```bash
curl -X GET "http://localhost:3003/pricing/plans" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Active Plans Only

```bash
curl -X GET "http://localhost:3003/pricing/plans?status=ACTIVE&limit=100" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Create New Plan

```bash
curl -X POST "http://localhost:3003/pricing/plans" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Plan",
    "description": "A test plan for API testing",
    "price": 500,
    "billingCycle": "MONTHLY",
    "limits": {
      "verifications_monthly": 500,
      "api_keys": 2,
      "webhooks": 2
    },
    "features": [
      "500 verifications/month",
      "2 API keys",
      "Basic analytics",
      "Webhook support"
    ],
    "isPopular": false,
    "displayOrder": 10
  }'
```

### Get Specific Plan

```bash
curl -X GET "http://localhost:3003/pricing/plans/PLAN_ID_HERE" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🎯 **2. Plan Assignment**

### Assign Plan Immediately

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "IMMEDIATE",
    "durationType": "PERMANENT",
    "notes": "Test assignment via API"
  }'
```

### Schedule Plan Assignment

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "SCHEDULED",
    "scheduledDate": "2024-02-01T00:00:00Z",
    "durationType": "PERMANENT",
    "notes": "Scheduled plan change for February"
  }'
```

### Temporary Plan Assignment

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "IMMEDIATE",
    "durationType": "TEMPORARY",
    "endDate": "2024-03-31T23:59:59Z",
    "notes": "Temporary promotional plan for Q1"
  }'
```

---

## 📊 **3. Subscription Management**

### Get Merchant Subscription

```bash
curl -X GET "http://localhost:3003/pricing/merchants/MERCHANT_ID_HERE/subscription" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Public Plans (No Auth Required)

```bash
curl -X GET "http://localhost:3003/pricing/public/plans" \
  -H "Content-Type: application/json"
```

---

## 💳 **4. Billing Transactions**

### Create Billing Transaction

```bash
curl -X POST "http://localhost:3003/pricing/billing/transactions" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "amount": 1740,
    "paymentReference": "FT26017MLDG7755415774",
    "paymentMethod": "Bank Transfer",
    "billingPeriodStart": "2024-01-01T00:00:00Z",
    "billingPeriodEnd": "2024-01-31T23:59:59Z",
    "notes": "Monthly subscription payment"
  }'
```

### Get Billing Transactions

```bash
curl -X GET "http://localhost:3003/pricing/billing/transactions?limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Merchant Billing Transactions

```bash
curl -X GET "http://localhost:3003/pricing/billing/transactions?merchantId=MERCHANT_ID_HERE&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📈 **5. Statistics & Analytics**

### Get Plan Statistics

```bash
curl -X GET "http://localhost:3003/pricing/statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🚨 **6. Error Testing**

### Test Duplicate Plan Assignment (Should Fail)

```bash
# First assignment (should succeed)
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "IMMEDIATE",
    "durationType": "PERMANENT"
  }'

# Second assignment (should fail with "already a pending assignment")
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "IMMEDIATE",
    "durationType": "PERMANENT"
  }'
```

### Test Invalid Merchant ID

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "invalid-merchant-id",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "IMMEDIATE",
    "durationType": "PERMANENT"
  }'
```

### Test Invalid Plan ID

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "invalid-plan-id",
    "assignmentType": "IMMEDIATE",
    "durationType": "PERMANENT"
  }'
```

### Test Missing Required Fields

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE"
  }'
```

### Test Scheduled Assignment Without Date

```bash
curl -X POST "http://localhost:3003/pricing/plans/assign" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "MERCHANT_ID_HERE",
    "planId": "PLAN_ID_HERE",
    "assignmentType": "SCHEDULED",
    "durationType": "PERMANENT"
  }'
```

---

## 🔍 **7. Expected Response Examples**

### Successful Plan Assignment

```json
{
  "id": "assignment_123456789",
  "merchantId": "merchant_123",
  "planId": "plan_456",
  "assignmentType": "IMMEDIATE",
  "durationType": "PERMANENT",
  "notes": "Test assignment via API",
  "isApplied": true,
  "appliedAt": "2024-01-24T10:30:00Z",
  "createdAt": "2024-01-24T10:30:00Z",
  "assignedBy": "admin_user_id",
  "merchant": {
    "id": "merchant_123",
    "name": "Test Merchant",
    "contactEmail": "test@example.com"
  },
  "plan": {
    "id": "plan_456",
    "name": "Starter Plan",
    "price": 1740,
    "billingCycle": "MONTHLY"
  }
}
```

### Error Response - Duplicate Assignment

```json
{
  "statusCode": 400,
  "message": "There is already a pending assignment for this merchant and plan",
  "error": "Bad Request"
}
```

### Error Response - Merchant Not Found

```json
{
  "statusCode": 404,
  "message": "Merchant not found",
  "error": "Not Found"
}
```

---

## 🎯 **Quick Test Script**

Create a test script to run multiple tests:

```bash
#!/bin/bash

# Set your variables
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
MERCHANT_ID="YOUR_MERCHANT_ID"
PLAN_ID="YOUR_PLAN_ID"
BASE_URL="http://localhost:3003"

echo "🧪 Testing FetanPay Pricing API..."

echo "1. Getting all plans..."
curl -s -X GET "$BASE_URL/pricing/plans" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

echo -e "\n2. Getting merchant subscription..."
curl -s -X GET "$BASE_URL/pricing/merchants/$MERCHANT_ID/subscription" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

echo -e "\n3. Assigning plan..."
curl -s -X POST "$BASE_URL/pricing/plans/assign" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchantId\": \"$MERCHANT_ID\",
    \"planId\": \"$PLAN_ID\",
    \"assignmentType\": \"IMMEDIATE\",
    \"durationType\": \"PERMANENT\",
    \"notes\": \"Test assignment\"
  }" | jq '.'

echo -e "\n4. Testing duplicate assignment (should fail)..."
curl -s -X POST "$BASE_URL/pricing/plans/assign" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchantId\": \"$MERCHANT_ID\",
    \"planId\": \"$PLAN_ID\",
    \"assignmentType\": \"IMMEDIATE\",
    \"durationType\": \"PERMANENT\"
  }" | jq '.'

echo -e "\n✅ Test completed!"
```

Save as `test-pricing.sh`, make executable with `chmod +x test-pricing.sh`, and run with `./test-pricing.sh`.

---

## 📝 **Testing Checklist**

### ✅ **Plan Management**

- [ ] Create new plan
- [ ] Get all plans
- [ ] Get specific plan
- [ ] Update plan
- [ ] Delete plan (without active subscriptions)

### ✅ **Plan Assignment**

- [ ] Immediate plan assignment
- [ ] Scheduled plan assignment
- [ ] Temporary plan assignment
- [ ] Duplicate assignment prevention
- [ ] Invalid merchant/plan handling

### ✅ **Subscription Management**

- [ ] Get merchant subscription
- [ ] Subscription creation on immediate assignment
- [ ] Subscription cancellation on plan change

### ✅ **Error Handling**

- [ ] Invalid authentication
- [ ] Missing required fields
- [ ] Invalid merchant/plan IDs
- [ ] Duplicate assignments
- [ ] Scheduled assignment without date

---

## 🔧 **Debugging Tips**

### Check Server Logs

```bash
# If using Docker
docker logs fetanpay-server

# If running directly
tail -f server/logs/combined-$(date +%Y-%m-%d).log
```

### Database Inspection

```bash
# Connect to database and check plan assignments
# Replace with your database connection details
psql -h localhost -U your_user -d fetanpay_db -c "
SELECT
  pa.id,
  pa.merchantId,
  pa.planId,
  pa.assignmentType,
  pa.isApplied,
  pa.createdAt,
  p.name as plan_name,
  m.name as merchant_name
FROM plan_assignment pa
JOIN plan p ON pa.planId = p.id
JOIN merchant m ON pa.merchantId = m.id
ORDER BY pa.createdAt DESC
LIMIT 10;
"
```

---

## 📞 **Support**

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify authentication tokens are valid
3. Ensure merchant and plan IDs exist in database
4. Check for pending assignments before creating new ones
5. Use verbose mode (`-v`) with cURL for debugging

---

## 🏪 **Merchant-Admin Specific Testing**

### Test Merchant Subscription Endpoint (Used by Billing Page)

```bash
# Replace YOUR_SESSION_TOKEN with actual session token from browser cookies
curl -X GET "http://localhost:3003/api/v1/pricing/merchants/MERCHANT_ID_HERE/subscription" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Public Plans Endpoint (Used by Billing Page)

```bash
curl -X GET "http://localhost:3003/api/v1/pricing/public/plans?status=ACTIVE&limit=100&sortBy=displayOrder&sortOrder=asc" \
  -H "Content-Type: application/json"
```

### Test Merchant Billing Transactions

```bash
curl -X GET "http://localhost:3003/api/v1/pricing/billing/transactions?merchantId=MERCHANT_ID_HERE&limit=10" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Session Token from Browser

To get your session token:

1. Open merchant-admin in browser and login
2. Open Developer Tools (F12)
3. Go to Application/Storage tab
4. Look for Cookies under your domain
5. Find `better-auth.session_token` cookie value
6. Use that value in the curl commands above

### Expected Response - Merchant Subscription

```json
{
  "subscription": {
    "id": "subscription_123",
    "merchantId": "merchant_456",
    "planId": "plan_789",
    "status": "ACTIVE",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": null,
    "nextBillingDate": "2024-02-01T00:00:00Z",
    "monthlyPrice": 1740,
    "billingCycle": "MONTHLY",
    "currentUsage": {
      "verifications": 150,
      "apiCalls": 1200
    },
    "plan": {
      "id": "plan_789",
      "name": "Starter",
      "description": "Perfect for small businesses",
      "price": 1740,
      "billingCycle": "MONTHLY",
      "features": [
        "1,000 verifications/month",
        "Full API access",
        "Advanced analytics"
      ]
    }
  }
}
```

### Expected Response - No Subscription (Free Plan)

```json
{
  "subscription": {
    "id": "virtual_free_subscription",
    "merchantId": "merchant_456",
    "planId": "free_plan_id",
    "status": "ACTIVE",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": null,
    "nextBillingDate": null,
    "monthlyPrice": 0,
    "billingCycle": "MONTHLY",
    "currentUsage": {
      "verifications": 25,
      "apiCalls": 180
    },
    "plan": {
      "id": "free_plan_id",
      "name": "Free",
      "description": "Perfect for testing the platform",
      "price": 0,
      "billingCycle": "MONTHLY",
      "features": [
        "100 verifications/month",
        "Basic API access",
        "Basic analytics"
      ]
    }
  }
}
```

---

## 🔧 **Troubleshooting Merchant-Admin Issues**

### Issue: "Demo Mode" showing instead of real data

**Possible Causes:**

1. Merchant ID not found in localStorage
2. Session not properly authenticated
3. API endpoints returning errors
4. Network connectivity issues

**Solutions:**

1. Check browser localStorage for `merchantId` key
2. Verify session token in cookies
3. Check browser network tab for API errors
4. Test API endpoints directly with curl

### Issue: "Plan assignment already applied" error

**Cause:** Trying to assign a plan that has already been processed

**Solution:**

1. Check for existing pending assignments
2. Wait for current assignment to complete
3. Contact admin to resolve duplicate assignments

### Debug Commands

```bash
# Check if merchant exists
curl -X GET "http://localhost:3003/api/v1/merchant-accounts/MERCHANT_ID_HERE" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"

# Check merchant profile
curl -X GET "http://localhost:3003/api/v1/merchant-accounts/MERCHANT_ID_HERE/profile" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```
