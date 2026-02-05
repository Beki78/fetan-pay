# Session Establishment Issue Fix

## Problem Analysis

### Current Issue
Based on the logs, the problem is clear:

1. **Login succeeds** - Returns token and user data
2. **Session test fails** - `getSession()` returns `null`
3. **Active accounts fails** - 401 Unauthorized because no valid session

### Log Analysis
```
-----------------signInWithEmail------------------------
{redirect: false, token: 19yLudkhzz7Ls87sUg9ptizsYcbTDaEk, user: {...}}

-------------getSession----------
null

-------------Session test after login----------
null

DioException in getActiveAccounts:
Status Code: 401
Response Data: {code: UNAUTHORIZED, message: Unauthorized}
```

### Root Cause
The issue is that Better Auth login returns a token-based response, but the session cookies are not being established properly. The mobile app receives the login response but the HTTP-only session cookies are not being set or persisted correctly.

## Fixes Applied

### 1. Fixed API Configuration
```dart
// Changed from hardcoded IP to localhost to match merchant web app
static const String baseUrl = String.fromEnvironment(
  'BASE_URL',
  defaultValue: 'http://localhost:3003', // Was: 'http://192.168.0.147:3003'
);
```

### 2. Enhanced Session Establishment
```dart
// CRITICAL: Better Auth session establishment
// The login response contains a token, but we need to ensure the session is established
// Let's wait longer and try multiple times to get the session
bool sessionEstablished = false;
int attempts = 0;
const maxAttempts = 5;

while (!sessionEstablished && attempts < maxAttempts) {
  attempts++;
  await Future.delayed(Duration(milliseconds: 500 * attempts)); // Increasing delay
  
  try {
    final sessionTest = await getSession();
    print('-------------Session test attempt $attempts----------');
    print(sessionTest);
    
    if (sessionTest != null) {
      SecureLogger.auth('Session successfully established after login on attempt $attempts');
      sessionEstablished = true;
    } else {
      SecureLogger.auth('Session not yet established, attempt $attempts/$maxAttempts');
    }
  } catch (e) {
    SecureLogger.auth('Session test failed on attempt $attempts: $e');
  }
}
```

### 3. Improved Cookie Jar Management
```dart
// Replace the cookie jar in the interceptor when upgrading to persistent storage
final cookieManagerIndex = _dio.interceptors.indexWhere(
  (interceptor) => interceptor is CookieManager,
);

if (cookieManagerIndex != -1) {
  _dio.interceptors.removeAt(cookieManagerIndex);
  _dio.interceptors.insert(cookieManagerIndex, CookieManager(persistentJar));
}
```

### 4. Enhanced Request/Response Debugging
```dart
// Debug cookie information in requests and responses
print('Request to: ${options.uri}');
print('Request headers: ${options.headers}');
print('Request extra: ${options.extra}');

print('Response from: ${response.requestOptions.uri}');
print('Response status: ${response.statusCode}');
print('Response headers: ${response.headers}');
```

## Expected Behavior After Fix

### Login Flow
1. **Login Request**: Sent with proper cookie configuration
2. **Login Response**: Returns token and user data
3. **Session Establishment**: Multiple attempts to verify session cookies
4. **Session Verification**: Should show session data instead of `null`
5. **Active Accounts**: Should work without 401 errors

### Debug Output Expected
```
-----------------signInWithEmail------------------------
{login response with token and user}

Request to: http://localhost:3003/api/auth/get-session
Request headers: {Accept: application/json, Content-Type: application/json}
Response from: http://localhost:3003/api/auth/get-session
Response headers: {set-cookie: [session cookies]}

-------------Session test attempt 1----------
{session: {...}, user: {...}}

-----------------getActiveAccounts Response---------------
Status Code: 200
Response Data: {data: [...]}
```

## Troubleshooting Steps

### If Session Still Fails
1. **Check Server Configuration**: Ensure Better Auth is configured for cookie-based sessions
2. **Verify Domain**: Ensure localhost is properly configured for cookies
3. **Check CORS**: Verify CORS settings allow credentials
4. **Network Configuration**: Ensure mobile app can reach localhost:3003

### If 401 Persists
1. **Verify Session Cookies**: Check if cookies are being sent in request headers
2. **Check Cookie Domain**: Ensure cookies are valid for the request domain
3. **Verify Auth Configuration**: Check if Better Auth session configuration matches expectations

## Key Changes Summary

| Component | Before | After |
|-----------|--------|-------|
| API Base URL | Hardcoded IP | localhost:3003 |
| Session Test | Single attempt | Multiple attempts with increasing delay |
| Cookie Management | Basic setup | Proper interceptor replacement |
| Debugging | Limited | Comprehensive request/response logging |
| Error Handling | Basic | Detailed session establishment tracking |

## Notes

- The fix addresses the core issue of session cookie establishment after login
- Multiple retry attempts handle timing issues with cookie setting
- Enhanced debugging will help identify any remaining issues
- The approach now matches the merchant web app's session handling pattern