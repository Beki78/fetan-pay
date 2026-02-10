# Cookie Debug Enhancement Fix

## Issue Analysis
Based on the log provided:
```
=== LOADING COOKIES ===
Loading cookies for URI: http://192.168.0.147:3003/api/auth/sign-in/email
Original cookies (0): 
=== COOKIES LOADED ===
No cookies available for this request
```

The issue shows that:
1. Cookies are being loaded for the login request (expected to be 0 for initial login)
2. **Missing**: No "SAVING COOKIES" logs in the output, indicating cookies aren't being saved after login response
3. **Missing**: No response debug logs showing Set-Cookie headers

## Root Cause
The problem was likely:
1. **Insufficient debugging**: Not enough visibility into what the server is sending back
2. **Cookie jar initialization**: Potential timing issues with async initialization
3. **Missing response analysis**: No detailed logging of response headers and Set-Cookie processing

## Solution Implemented

### 1. Enhanced Response Debugging
```dart
onResponse: (response, handler) {
  print('=== RESPONSE DEBUG ===');
  print('Response from: ${response.requestOptions.uri}');
  print('Response status: ${response.statusCode}');
  print('Response data: ${response.data}');
  print('All response headers: ${response.headers.map}');

  // Check if cookies were set
  final setCookieHeaders = response.headers['set-cookie'];
  if (setCookieHeaders != null && setCookieHeaders.isNotEmpty) {
    print('Set-Cookie headers received: $setCookieHeaders');
    print('Number of Set-Cookie headers: ${setCookieHeaders.length}');
    
    // Parse and log each cookie
    for (int i = 0; i < setCookieHeaders.length; i++) {
      print('Set-Cookie[$i]: ${setCookieHeaders[i]}');
    }
  } else {
    print('No Set-Cookie headers in response');
    print('Available response headers: ${response.headers.map.keys.toList()}');
  }
}
```

### 2. Enhanced Cookie Saving with Verification
```dart
Future<void> saveFromResponse(Uri uri, List<Cookie> cookies) async {
  await _ensureInitialized();

  print('=== SAVING COOKIES ===');
  print('URI: $uri');
  print('Cookies to save: ${cookies.length}');

  if (cookies.isEmpty) {
    print('No cookies to save');
    print('=== COOKIES SAVED (NONE) ===');
    return;
  }

  // Enhanced cookie logging with security flags
  final modifiedCookies = cookies.map((cookie) {
    print(
      'Original cookie: ${cookie.name}=${cookie.value}, domain=${cookie.domain}, path=${cookie.path}, secure=${cookie.secure}, httpOnly=${cookie.httpOnly}',
    );

    final newCookie = Cookie(cookie.name, cookie.value)
      ..path = cookie.path ?? '/'
      ..httpOnly = cookie.httpOnly
      ..secure = false // Disable secure flag for local development
      ..expires = cookie.expires
      ..maxAge = cookie.maxAge
      ..domain = null; // Remove domain restrictions

    print(
      'Modified cookie: ${newCookie.name}=${newCookie.value}, domain=${newCookie.domain}, path=${newCookie.path}, secure=${newCookie.secure}',
    );
    return newCookie;
  }).toList();

  try {
    await _delegate.saveFromResponse(uri, modifiedCookies);
    print('Saved cookies for URI: $uri');

    // Immediately verify cookies were saved
    final savedCookies = await _delegate.loadForRequest(uri);
    print('Verification: ${savedCookies.length} cookies now stored for URI');

    print('=== COOKIES SAVED SUCCESSFULLY ===');
  } catch (e) {
    print('Error saving cookies: $e');
    print('=== COOKIES SAVE FAILED ===');
  }
}
```

### 3. Improved Cookie Jar Initialization
```dart
void _initializeAsync() async {
  try {
    final appDocDir = await getApplicationDocumentsDirectory();
    final cookieDir = Directory('${appDocDir.path}/.cookies');

    // Ensure directory exists
    if (!await cookieDir.exists()) {
      await cookieDir.create(recursive: true);
      print('Created cookie directory: ${cookieDir.path}');
    }

    _delegate = PersistCookieJar(storage: FileStorage(cookieDir.path));
    _initialized = true;
    print('Initialized persistent cookie jar at: ${cookieDir.path}');
  } catch (e) {
    print('Failed to initialize persistent cookie jar, using in-memory: $e');
    _delegate = CookieJar();
    _initialized = true;
  }
}

Future<void> _ensureInitialized() async {
  int attempts = 0;
  while (!_initialized && attempts < 100) {
    // Wait up to 10 seconds
    await Future.delayed(const Duration(milliseconds: 100));
    attempts++;
  }
  if (!_initialized) {
    print('Cookie jar initialization timeout, using fallback');
    _delegate = CookieJar();
    _initialized = true;
  }
}
```

## Expected Debug Output After Fix

### For Login Request (Before Response):
```
=== LOADING COOKIES ===
Loading cookies for URI: http://192.168.0.147:3003/api/auth/sign-in/email
Original cookies (0): 
=== COOKIES LOADED ===
No cookies available for this request
```

### For Login Response (After Server Response):
```
=== RESPONSE DEBUG ===
Response from: http://192.168.0.147:3003/api/auth/sign-in/email
Response status: 200
Response data: {"redirect": false, "token": "...", "user": {...}}
All response headers: {set-cookie: [better-auth.session_token=...; Path=/; HttpOnly], ...}
Set-Cookie headers received: [better-auth.session_token=...; Path=/; HttpOnly]
Number of Set-Cookie headers: 1
Set-Cookie[0]: better-auth.session_token=...; Path=/; HttpOnly

=== SAVING COOKIES ===
URI: http://192.168.0.147:3003/api/auth/sign-in/email
Cookies to save: 1
Original cookie: better-auth.session_token=..., domain=null, path=/, secure=false, httpOnly=true
Modified cookie: better-auth.session_token=..., domain=null, path=/, secure=false
Saving 1 modified cookies
Saved cookies for URI: http://192.168.0.147:3003/api/auth/sign-in/email
Verification: 1 cookies now stored for URI
=== COOKIES SAVED SUCCESSFULLY ===
```

### For Subsequent Requests:
```
=== LOADING COOKIES ===
Loading cookies for URI: http://192.168.0.147:3003/api/v1/merchant-users/me
Original cookies (1): better-auth.session_token=...
=== COOKIES LOADED ===
```

## Diagnostic Steps

1. **Run the app and attempt login**
2. **Check for "RESPONSE DEBUG" logs** - Should show all response headers
3. **Check for "Set-Cookie headers received"** - Should show if server is sending cookies
4. **Check for "SAVING COOKIES" logs** - Should show cookie processing
5. **Check for "Verification: X cookies now stored"** - Should confirm cookies are saved
6. **Test subsequent requests** - Should show cookies being loaded and sent

## Possible Outcomes

### If Server Sends Cookies:
- You'll see detailed Set-Cookie header logs
- You'll see cookie saving process
- Subsequent requests will have cookies

### If Server Doesn't Send Cookies:
- You'll see "No Set-Cookie headers in response"
- You'll see "Available response headers" list
- This indicates a server-side issue

### If Cookie Saving Fails:
- You'll see "COOKIES SAVE FAILED" 
- Error details will be logged
- This indicates a client-side storage issue

## Files Modified
- `fetan_pay/lib/core/network/dio_client.dart`
  - Enhanced response debugging
  - Improved cookie saving with verification
  - More robust cookie jar initialization
  - Better error handling and logging