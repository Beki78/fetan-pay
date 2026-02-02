# Test CURL Commands for Payment Verification API

## Base URL
```bash
BASE_URL="http://localhost:3003/api/v1"
```

## 1. Verify CBE (Smart - No Account Suffix Required)
```bash
curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "FT2600611K9273730328"
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 2. Verify CBE (Traditional - Requires Account Suffix)
```bash
curl -X POST "${BASE_URL}/verifier/verify-cbe" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "FT2600611K9273730328",
    "accountSuffix": "12345"
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 3. Verify Telebirr
```bash
curl -X POST "${BASE_URL}/verifier/verify-telebirr" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "CLU7E7C9DH"
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 4. Verify Abyssinia (Smart)
```bash
curl -X POST "${BASE_URL}/verifier/verify-abyssinia-smart" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "FT251060KZQ920679"
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 5. Verify Awash (Smart)
```bash
curl -X POST "${BASE_URL}/verifier/verify-awash-smart" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "-2H1RJ8MA49-35BMW3"
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 6. Verify Dashen
```bash
curl -X POST "${BASE_URL}/verifier/verify-dashen" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionReference": "659WDTS253610003"
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 7. Verify CBE Birr
```bash
curl -X POST "${BASE_URL}/verifier/verify-cbebirr" \
  -H "Content-Type: application/json" \
  -d '{
    "receiptNumber": "1234567890",
    "phoneNumber": "251911000000",
    "apiKey": ""
  }' \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 8. Verify Image (Upload Receipt)
```bash
curl -X POST "${BASE_URL}/verifier/verify-image?autoVerify=true" \
  -F "file=@/path/to/receipt.png" \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 9. Test Caching (Run Same Request Twice)
```bash
# First request (should be slower - no cache)
echo "=== First Request (No Cache) ==="
curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
  -H "Content-Type: application/json" \
  -d '{"reference": "FT2600611K9273730328"}' \
  -w "\nResponse Time: %{time_total}s\n" \
  -s

# Wait 1 second
sleep 1

# Second request (should be faster - cached)
echo -e "\n=== Second Request (Cached) ==="
curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
  -H "Content-Type: application/json" \
  -d '{"reference": "FT2600611K9273730328"}' \
  -w "\nResponse Time: %{time_total}s\n" \
  -s
```

## 10. Test Browser Pool (Multiple Concurrent Requests)
```bash
# Run 5 concurrent CBE verifications to test browser pool
for i in {1..5}; do
  curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
    -H "Content-Type: application/json" \
    -d "{\"reference\": \"FT2600611K9273730328\"}" \
    -w "\nRequest $i - Response Time: %{time_total}s\n" \
    -s &
done
wait
```

## 11. Health Check
```bash
curl -X GET "${BASE_URL}/verifier/health" \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## 12. API Info
```bash
curl -X GET "${BASE_URL}/verifier/" \
  -w "\n\nResponse Time: %{time_total}s\n" \
  -s
```

## Performance Testing Script

Create a file `test-performance.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3003/api/v1"
REFERENCE="FT2600611K9273730328"

echo "=== Performance Test: CBE Smart Verification ==="
echo ""

# Test 1: First request (no cache)
echo "1. First Request (No Cache):"
START=$(date +%s%N)
curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
  -H "Content-Type: application/json" \
  -d "{\"reference\": \"${REFERENCE}\"}" \
  -s -o /dev/null
END=$(date +%s%N)
DURATION=$((($END - $START) / 1000000))
echo "   Response Time: ${DURATION}ms"
echo ""

# Wait 1 second
sleep 1

# Test 2: Cached request
echo "2. Cached Request:"
START=$(date +%s%N)
curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
  -H "Content-Type: application/json" \
  -d "{\"reference\": \"${REFERENCE}\"}" \
  -s -o /dev/null
END=$(date +%s%N)
DURATION=$((($END - $START) / 1000000))
echo "   Response Time: ${DURATION}ms"
echo ""

# Test 3: Concurrent requests (browser pool)
echo "3. Concurrent Requests (Browser Pool):"
START=$(date +%s%N)
for i in {1..3}; do
  curl -X POST "${BASE_URL}/verifier/verify-cbe-smart" \
    -H "Content-Type: application/json" \
    -d "{\"reference\": \"${REFERENCE}\"}" \
    -s -o /dev/null &
done
wait
END=$(date +%s%N)
DURATION=$((($END - $START) / 1000000))
echo "   Total Time for 3 concurrent: ${DURATION}ms"
echo "   Average per request: $((DURATION / 3))ms"
```

Make it executable:
```bash
chmod +x test-performance.sh
./test-performance.sh
```

## Expected Results

### First Request (No Cache)
- Response Time: 1-5 seconds
- Status: 200 OK
- Browser Pool: Creates new browser instance

### Cached Request
- Response Time: <100ms
- Status: 200 OK
- Cache Hit: Yes

### Concurrent Requests
- Total Time: 2-6 seconds (vs 9-15 seconds without pool)
- Browser Pool: Reuses browser instances
- Efficiency: 70% faster

## Notes

- Replace `FT2600611K9273730328` with actual valid references
- First request may be slower due to browser initialization
- Cached requests should be <100ms
- Browser pool improves concurrent request handling
- Response times include network latency

