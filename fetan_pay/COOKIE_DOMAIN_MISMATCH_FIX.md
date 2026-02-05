# Cookie Domain Mismatch Fix

## Critical Issue Identified

### Problem Analysis from Logs
The logs revealed the exact issue:

1. **Login Response Sets Cookies** ✅:
   ```
   set-cookie: better-auth.session_token=cJGlPuaNfzmJnbM19z8UWphr9x4zMPS0...; Domain=localhost
   set-cookie: better-auth.session_data=eyJzZXNzaW9uIjp7InNlc3Npb24i...; Domain=localhost
   ```

2. **But Cookies Are NOT Sent in Subsequent Requests** ❌:
   ```
   Request headers: {Content-Type: application/json, Accept: application/json, cookie: null}
   ```

3. **Domain Mismatch**: 
   - Server sets cookies for `Domain=localhost`
   - Mobile app makes requests to `192.168.0.147:3003`
   - Cookies don't match domain, so they're not sent

### Root Cause
**Cookie domain mismatch**: The Better Auth server is configured to set cookies for `localhost` domain, but the mobile app is connecting to the IP address `192.168.0.147`. This causes the cookies to not be sent with subsequent requests because they don't match the request domain.

## Solution Implemented

### 1. Custom Cookie Jar with Domain Mapping
Created `_CustomCookieJar` class that:

- **Maps IP to localhost**: Treats `192.168.0.147` as `localhost` for cookie storage
- **Modifies cookie domains**: Removes domain restrictions to allow cookies to work with both localhost and IP
- **Dual storage**: Saves cookies for both original and mapped URIs
- **Smart loading**: Loads cookies for both domains and deduplicates them

### 2. Enhanced Cookie Debugging
Added comprehensive cookie debugging:

```dart
void _checkCookiesInJar(Uri uri) {
  final cookies = _cookieJar.loadForRequest(uri);
  print('Cookies in jar for ${uri.host}: ${cookies.map((c) => '${c.name}=${c.value}').join('; ')}');
}

void _debugCookieJarAfterResponse() {
  // Check cookies for both localhost and IP
  final localhostCookies = _cookieJar.loadForRequest(localhostUri);
  final ipCookies = _cookieJar.loadForRequest(ipUri);
  
  print('Cookies for localhost: ${localhostCookies.map((c) => '${c.name}=${c.value}').join('; ')}');
  print('Cookies for IP: ${ipCookies.map((c) => '${c.name}=${c.value}').join('; ')}');
}
```

### 3. Cookie Domain Handling
The custom cookie jar:

```dart
// Modify cookies to work with IP address
final modifiedCookies = cookies.map((cookie) {
  final newCookie = Cookie(cookie.name, cookie.value)
    ..path = cookie.path
    ..httpOnly = cookie.httpOnly
    ..secure = cookie.secure
    ..expires = cookie.expires
    ..maxAge = cookie.maxAge;
  
  // If domain is localhost, also allow for IP
  if (cookie.domain == 'localhost' || cookie.domain == null) {
    newCookie.domain = null; // Allow for any domain
  }
  
  return newCookie;
}).toList();
```

## Expected Behavior After Fix

### Login Flow
1. **Login Request**: Sent to `192.168.0.147:3003/api/auth/sign-in/email`
2. **Login Response**: Sets cookies for `Domain=localhost`
3. **Cookie Storage**: Custom jar saves cookies for both localhost and IP
4. **Session Test**: Should now find and send cookies
5. **Active Accounts**: Should work with proper authentication

### Debug Output Expected
```
Request to: http://192.168.0.147:3003/api/auth/sign-in/email
Response from: http://192.168.0.147:3003/api/auth/sign-in/email
Cookies being set: [better-auth.session_token=...; Domain=localhost, ...]
Saving cookies for localhost: better-auth.session_token=... (domain: null)

Request to: http://192.168.0.147:3003/api/auth/get-session
Cookies in jar for 192.168.0.147: better-auth.session_token=...; better-auth.session_data=...
Loading cookies for 192.168.0.147: better-auth.session_token=...; better-auth.session_data=...

Request headers: {Content-Type: application/json, Accept: application/json, cookie: better-auth.session_token=...}
```

## Key Technical Details

### Cookie Domain Mapping
- `192.168.0.147` → `localhost` for storage
- Cookies stored without domain restrictions
- Both domains can access the same cookies

### Cookie Modification
- Original domain restrictions removed
- `domain: null` allows cookies to work with any host
- Maintains all other cookie properties (httpOnly, secure, expires, etc.)

### Dual Storage Strategy
- Cookies saved for both original URI and mapped URI
- Loading combines cookies from both sources
- Deduplication prevents duplicate cookies

## Alternative Solutions Considered

1. **Server Configuration**: Change Better Auth to set cookies for IP domain
   - Requires server-side changes
   - Not ideal for development flexibility

2. **Use localhost in mobile**: Connect to localhost instead of IP
   - May not work on physical devices
   - Network configuration dependent

3. **Custom Cookie Jar** ✅: Chosen solution
   - No server changes required
   - Works with existing setup
   - Handles domain mismatch transparently

## Testing Steps

1. **Clear App Data**: Ensure clean state
2. **Login**: Check for cookie saving debug output
3. **Session Test**: Should show cookies being loaded and sent
4. **Active Accounts**: Should return 200 instead of 401
5. **Monitor Headers**: Request headers should now include cookies

## Notes

- This fix addresses the fundamental cookie domain mismatch issue
- The custom cookie jar is transparent to the rest of the application
- Enhanced debugging will show exactly what cookies are being saved and loaded
- The solution maintains compatibility with both localhost and IP address connections