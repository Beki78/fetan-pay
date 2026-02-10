# Cookie Jar Simplification Fix

## Issue
The Flutter app was experiencing cookie-related authentication issues due to domain mapping complexity. The logs showed:
- "Original cookies (0)" indicating no session cookies were available
- Infinite loading states during authentication
- Domain mapping between IP address and localhost causing confusion

## Root Cause
The `_CustomCookieJar` was attempting to map IP addresses (`192.168.0.147`) to localhost for cookie compatibility, but this was creating issues as requested by the user. The domain mapping logic was:
1. Saving cookies for both IP and localhost
2. Loading cookies from multiple URIs
3. Complex delete operations across multiple domains

## Solution
Simplified the `_CustomCookieJar` to remove all domain mapping and use IP address consistently:

### Changes Made

1. **Removed Domain Mapping Function**
   - Deleted `_mapUriToLocalhost()` function entirely
   - No more URI transformation logic

2. **Simplified Cookie Saving**
   - Save cookies only for the original URI (IP address)
   - Remove domain restrictions by setting `cookie.domain = null`
   - No duplicate saving for localhost

3. **Simplified Cookie Loading**
   - Load cookies only from the original URI
   - No complex merging of cookies from multiple domains
   - Direct return of cookies from delegate

4. **Simplified Cookie Deletion**
   - Delete cookies only from the original URI
   - No multiple delete operations

5. **Updated Comments and Logging**
   - Updated class documentation to reflect "persistence only"
   - Simplified debug logging to show IP address only
   - Removed localhost-related debug output

### Key Benefits

1. **Consistency**: Always uses `http://192.168.0.147:3003` as requested
2. **Simplicity**: No complex domain mapping logic
3. **Reliability**: Cookies are saved and loaded from a single, consistent location
4. **Performance**: Fewer operations per cookie save/load/delete

### Files Modified

- `fetan_pay/lib/core/network/dio_client.dart`
  - Simplified `_CustomCookieJar` class
  - Removed unused import `../utils/secure_logger.dart`
  - Updated comments and debug output

### Configuration Verification

- `fetan_pay/lib/core/config/api_config.dart` already uses IP address consistently
- `fetan_pay/lib/features/auth/data/services/auth_api_service.dart` already uses print statements for debugging

## Expected Results

1. **Cookie Persistence**: Cookies should now be saved and loaded consistently
2. **Session Management**: Authentication sessions should persist between app restarts
3. **No Infinite Loading**: App should not get stuck in loading states
4. **Consistent Debugging**: All cookie operations will show IP address only

## Testing Recommendations

1. Test login flow and verify cookies are saved
2. Test app restart and verify session persistence
3. Test logout and verify cookies are cleared
4. Monitor debug logs for consistent IP address usage

## Notes

- Print statements are intentionally used instead of SecureLogger as requested by user
- All operations now use IP address `http://192.168.0.147:3003` consistently
- No domain mapping or localhost references remain in cookie handling