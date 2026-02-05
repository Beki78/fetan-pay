# Active Receiver Accounts Endpoint Fix

## Issue Analysis
The `/payments/receiver-accounts/active` GET endpoint was not working correctly in the mobile app, while it worked fine in the merchant web app.

## Root Cause Analysis

### Merchant Web App Implementation
- Uses RTK Query with `credentials: "include"` for cookie-based authentication
- Makes GET request to `/payments/receiver-accounts/active`
- Properly handles the response format: `{data: MerchantReceiverAccount[]}`

### Mobile App Issues Found
1. **API Configuration**: Still using hardcoded IP address instead of localhost
2. **Cookie Handling**: Missing explicit cookie configuration for the specific endpoint
3. **Error Handling**: Limited error handling for different HTTP status codes
4. **Request Options**: Not explicitly ensuring cookies are sent with the request

## Fixes Applied

### 1. API Configuration Fix (`api_config.dart`)
```dart
// BEFORE
defaultValue: 'http://192.168.0.147:3003'

// AFTER  
defaultValue: 'http://localhost:3003'
```

### 2. DioClient Enhancement (`dio_client.dart`)
- Removed unused import `package:flutter/foundation.dart`
- Enhanced BaseOptions with proper redirect handling:
```dart
BaseOptions(
  // ... existing config
  followRedirects: true,
  maxRedirects: 5,
)
```

### 3. ScanApiService Enhancement (`scan_api_service.dart`)
- Added explicit request options to ensure cookies are sent:
```dart
final response = await _dioClient.get(
  ApiConfig.activeReceiverAccounts,
  options: Options(
    extra: {'withCredentials': true},
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  ),
);
```

- Enhanced error handling with specific status code messages:
  - 401: Authentication required
  - 403: Access denied
  - 404: Endpoint not found
  - 500: Server error

- Improved DioException handling vs generic Exception handling

## Expected Behavior After Fix

1. **Authentication**: Mobile app should properly send session cookies with the request
2. **API Compatibility**: Mobile app now matches merchant web app's request pattern
3. **Error Handling**: Better error messages for different failure scenarios
4. **Debugging**: Enhanced logging for troubleshooting

## Testing Recommendations

1. **Login Flow**: Ensure user is properly logged in before testing
2. **Cookie Verification**: Check that login sets proper session cookies
3. **Network Logs**: Monitor network requests to verify cookies are being sent
4. **Error Scenarios**: Test with invalid/expired sessions to verify error handling

## Key Differences from Merchant Web App

| Aspect | Merchant Web App | Mobile App |
|--------|------------------|------------|
| HTTP Client | fetch with credentials: "include" | Dio with CookieManager |
| Authentication | Cookie-based | Cookie-based (same) |
| Error Handling | RTK Query built-in | Custom Either<Exception, T> |
| Request Format | RTK Query builder | Manual Dio request |

## Notes

- The mobile app now properly mirrors the merchant web app's authentication approach
- Cookie-based authentication is maintained across both platforms
- Enhanced error handling provides better user experience
- API configuration is now consistent with merchant web app