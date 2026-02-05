# Pricing System Fix Testing Script

## Prerequisites

- Server running on localhost:3001 (or your configured port)
- Valid merchant ID and plan IDs
- Authentication cookies/tokens set up

## Test Cases

### 1. Test Duplicate Upgrade Prevention (Fixed Issue)

```bash
# Get a valid merchant ID and plan ID first
MERCHANT_ID="your-merchant-id"
PLAN_ID="your-plan-id"
BASE_URL="http://localhost:3001"

# Test 1: Try upgrading to same plan twice quickly
echo "Testing duplicate upgrade prevention..."

# First request
curl -X POST "$BASE_URL/pricing/merchants/$MERCHANT_ID/upgrade" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "planId": "'$PLAN_ID'",
    "paymentMethod": "Test Payment",
    "paymentReference": "TEST001"
  }' &

# Second request (should be handled gracefully)
curl -X POST "$BASE_URL/pricing/merchants/$MERCHANT_ID/upgrade" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "planId": "'$PLAN_ID'",
    "paymentMethod": "Test Payment",
    "paymentReference": "TEST002"
  }' &

wait
echo "Duplicate upgrade test completed"
```

### 2. Test Cleanup Functionality

```bash
# Test manual cleanup
echo "Testing manual cleanup..."

curl -X POST "$BASE_URL/pricing/cleanup/assignments" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"

echo "Cleanup test completed"
```

### 3. Test Pending Assignments Management

```bash
# View pending assignments
echo "Fetching pending assignments..."

curl -X GET "$BASE_URL/pricing/assignments/pending" \
  -H "Cookie: your-auth-cookie"

# View pending assignments for specific merchant
curl -X GET "$BASE_URL/pricing/assignments/pending?merchantId=$MERCHANT_ID" \
  -H "Cookie: your-auth-cookie"

echo "Pending assignments test completed"
```

### 4. Test Error Handling

```bash
# Test with invalid plan ID
echo "Testing error handling with invalid plan..."

curl -X POST "$BASE_URL/pricing/merchants/$MERCHANT_ID/upgrade" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "planId": "invalid-plan-id",
    "paymentMethod": "Test Payment"
  }'

# Test with invalid merchant ID
echo "Testing error handling with invalid merchant..."

curl -X POST "$BASE_URL/pricing/merchants/invalid-merchant-id/upgrade" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "planId": "'$PLAN_ID'",
    "paymentMethod": "Test Payment"
  }'

echo "Error handling tests completed"
```

### 5. Test Current Subscription Retrieval

```bash
# Get current subscription
echo "Testing subscription retrieval..."

curl -X GET "$BASE_URL/pricing/merchants/$MERCHANT_ID/subscription" \
  -H "Cookie: your-auth-cookie"

echo "Subscription retrieval test completed"
```

## Expected Results

### 1. Duplicate Upgrade Test

- **Before Fix**: Second request fails with "pending assignment" error
- **After Fix**: Second request either succeeds (updates existing) or fails with clear message

### 2. Cleanup Test

- Should return: `{"message": "Cleaned up X stale assignments", "count": X}`
- No errors should occur

### 3. Pending Assignments Test

- Should return array of pending assignments (may be empty)
- Each assignment should have merchant and plan details

### 4. Error Handling Test

- Invalid plan: `{"message": "Plan not found", "error": "Not Found", "statusCode": 404}`
- Invalid merchant: `{"message": "Merchant not found", "error": "Not Found", "statusCode": 404}`

### 5. Subscription Retrieval Test

- Should return current subscription or virtual free plan
- No errors should occur

## Frontend Testing

### Test Merchant-Admin Billing Page

1. **Navigate to billing page**: `/billing`
2. **Try upgrading to same plan twice**: Should show better error message
3. **Try upgrading to different plan**: Should work smoothly
4. **Check error messages**: Should be user-friendly, not technical

### Test Admin Change Plan Page

1. **Navigate to merchant details**: `/merchants/{id}`
2. **Click "Change Plan"**: Should load available plans
3. **Try assigning same plan**: Should show appropriate message
4. **Try assigning different plan**: Should work correctly

## Monitoring Tests

### Check Logs

```bash
# Check for cleanup service logs
grep "PricingCleanupService" server/logs/combined-*.log

# Check for upgrade errors
grep "upgradeMerchantPlan" server/logs/error-*.log

# Check for assignment conflicts
grep "pending assignment" server/logs/combined-*.log
```

### Database Verification

```sql
-- Check for stale assignments (should be minimal)
SELECT COUNT(*) FROM plan_assignment
WHERE is_applied = false
AND created_at < NOW() - INTERVAL '30 minutes';

-- Check recent subscription changes
SELECT * FROM subscription
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- Check billing transactions
SELECT status, COUNT(*) FROM billing_transaction
GROUP BY status;
```

## Performance Tests

### Load Test Upgrades

```bash
# Test multiple concurrent upgrades
for i in {1..10}; do
  curl -X POST "$BASE_URL/pricing/merchants/$MERCHANT_ID/upgrade" \
    -H "Content-Type: application/json" \
    -H "Cookie: your-auth-cookie" \
    -d '{
      "planId": "'$PLAN_ID'",
      "paymentMethod": "Load Test '$i'",
      "paymentReference": "LOAD'$i'"
    }' &
done
wait
```

## Success Criteria

✅ **No "pending assignment" errors** for legitimate upgrade requests  
✅ **Clear, actionable error messages** for users  
✅ **Automatic cleanup** removes stale data  
✅ **Fast upgrade processing** (< 2 seconds)  
✅ **Consistent database state** after all operations  
✅ **Proper audit trail** in billing transactions  
✅ **Admin tools work** for managing assignments

## Troubleshooting

### If Tests Fail

1. **Check server logs** for detailed error messages
2. **Verify database connection** and schema
3. **Confirm authentication** is working
4. **Check environment variables** and configuration
5. **Restart services** if needed

### Common Issues

- **Authentication errors**: Ensure cookies/tokens are valid
- **Database errors**: Check Prisma connection and migrations
- **Network errors**: Verify server is running and accessible
- **Permission errors**: Ensure user has required permissions

### Reset Test Environment

```bash
# Clean up test data
curl -X POST "$BASE_URL/pricing/cleanup/assignments" \
  -H "Cookie: your-auth-cookie"

# Or manually clean database
# DELETE FROM plan_assignment WHERE notes LIKE '%Test%';
```
