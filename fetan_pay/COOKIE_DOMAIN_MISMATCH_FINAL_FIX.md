# Cookie Domain Mismatch - Final Fix

## Problem Summary

The Flutter mobile app was experiencing authentication issues where:

1. **Login succeeds** ✅ - Returns token and user data
2. **Cookies are set by server** ✅ - `better-auth.session_token` and `better-auth.session_data` with `Domain=localhost`
3. **Cookies are NOT sent in subsequent requests** ❌ - Causing 401 Unauthorized errors
4. **Session endpoints return null** ❌ - Because no cookies are sent

### Root Cause
**Domain Mismatch**: The Better Auth server sets cookies for `Domain=localhost`, but the mobile app connects to `192.168.0.147:3003`. Browsers/HTTP clients don't send cookies when the domain doesn't match.

## Solution Implemented

### 1. Enhanced Custom Cookie Jar
Created `_CustomCookieJar` that:

- **Removes domain restrictions**: Sets `cookie.domain = null` to allow cookies to work with any host
- **Maps IP to localhost**: Treats `192.168.0.147` as `localhost` for cookie storage compatibility
- **Dual storage**: Saves cookies for both original and mapped URIs
- **Smart loading**: Loads and deduplicates cookies from both domains
- **Comprehensive debugging**: Detailed logging of cookie save/load operations

### 2. Fixed CookieManager Integration
- **Proper instantiation**: Store `CookieManager` instance to ensure custom jar is used
- **Correct interceptor order**: Cookie manager before logging interceptor
- **Enhanced debugging**: Clear logging of cookie operations

### 3. Merchant Web App Pattern Matching
Based on merchant web app analysis:
- Uses `credentials: "include"` for cookie handling
- Connects to `localhost:3003` in development
- Better Auth client configured with proper base URL

### 4. Key Technical Changes

#### DioClient.dart
```dart
class DioClient {
  late final CookieManager _cookieManager;
  
  DioClient() {
    _cookieJar = _CustomCookieJar(); // Custom jar with domain mapping
    _cookieManager = CookieManager(_cookieJar); // Proper instantiation
    
    _dio.interceptors.addAll([
      _createAuthInterceptor(),
      _cookieManager, // Use stored instance
      _createLoggingInterceptor(),
      _createRetryInterceptor(),
    ]);
  }
}
```

#### Custom Cookie Jar
```dart
@override
Future<void> saveFromResponse(Uri uri, List<Cookie> cookies) async {
  final modifiedCookies = cookies.map((cookie) {
    final newCookie = Cookie(cookie.name, cookie.value)
      ..path = cookie.path ?? '/'
      ..httpOnly = cookie.httpOnly
      ..secure = cookie.secure
      ..expires = cookie.expires
      ..maxAge = cookie.maxAge;
    
    // CRITICAL: Remove domain restrictions
    newCookie.domain = null; // Allow for any domain
    
    return newCookie;
  }).toList();
  
  // Save for both original and mapped URI
  await _delegate.saveFromResponse(uri, modifiedCookies);
  if (uri != mappedUri) {
    await _delegate.saveFromResponse(mappedUri, modifiedCookies);
  }
}
```

## Expected Behavior After Fix

### Login Flow
1. **Login Request**: `POST /api/auth/sign-in/email`
2. **Login Response**: Sets cookies with `Domain=localhost`
3. **Cookie Processing**: Custom jar removes domain restrictions and saves cookies
4. **Session Test**: `GET /api/auth/get-session` - should now send cookies
5. **Active Accounts**: `GET /api/v1/payments/receiver-accounts/active` - should work with authentication

### Debug Output Expected
```
=== SAVING COOKIES ===
Original URI: http://192.168.0.147:3003/api/auth/sign-in/email
Cookies to save: 2
Original cookie: better-auth.session_token=..., domain=localhost
Modified cookie: better-auth.session_token=..., domain=null
Saving 2 modified cookies
=== COOKIES SAVED ===

=== REQUEST DEBUG ===
Request to: http://192.168.0.147:3003/api/auth/get-session
=== LOADING COOKIES ===
Loading cookies for URI: http://192.168.0.147:3003/api/auth/get-session
Final cookies (2): better-auth.session_token=...; better-auth.session_data=...
=== COOKIES LOADED ===
Cookies being sent: better-auth.session_token=...; better-auth.session_data=...
```

## Key Differences from Previous Attempts

### What Was Wrong Before
1. **CookieManager not using custom jar**: Created new `CookieManager(_cookieJar)` inline instead of storing instance
2. **Domain mapping incomplete**: Only mapped URI, didn't remove cookie domain restrictions
3. **Insufficient debugging**: Couldn't see exactly what was happening with cookie save/load

### What's Fixed Now
1. **Proper CookieManager integration**: Store and reuse `_cookieManager` instance
2. **Complete domain fix**: Remove `cookie.domain` restrictions entirely
3. **Comprehensive debugging**: Detailed logging of every cookie operation
4. **Simplified session logic**: Removed retry loops, rely on proper cookie handling

## Testing Steps

1. **Clear app data** to ensure clean state
2. **Login** and watch for cookie saving debug output
3. **Check session test** - should show cookies being sent and session data returned
4. **Test active accounts** - should return 200 with account data instead of 401

## Alternative Solutions Considered

1. **Change server configuration**: Modify Better Auth to set cookies for IP domain
   - Requires server changes
   - Not flexible for different network configurations

2. **Use localhost in mobile**: Connect to localhost instead of IP
   - Doesn't work on physical devices
   - Network routing issues

3. **Custom Cookie Jar** ✅: **Chosen solution**
   - No server changes required
   - Works with existing Better Auth setup
   - Handles domain mismatch transparently
   - Maintains compatibility with both localhost and IP connections

## Technical Notes

- **Domain-less cookies**: Setting `cookie.domain = null` allows cookies to work with any host
- **Dual storage**: Ensures compatibility with both localhost and IP address requests
- **Better Auth compatibility**: Maintains full compatibility with Better Auth session management
- **Development flexibility**: Works regardless of whether server is accessed via localhost or IP

This fix addresses the fundamental cookie domain mismatch issue that was preventing proper session authentication in the Flutter mobile app.