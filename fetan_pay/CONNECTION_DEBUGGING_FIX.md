# Connection Debugging Fix

## Issue Analysis
The log showed a **connection timeout error**:
```
Error message: The request connection took longer than 0:00:30.000000 and it was aborted
Error type: DioExceptionType.connectionTimeout
Network error - server not responding or connection failed
```

This indicates the mobile app cannot connect to the server at `http://192.168.0.147:3003`.

## Root Cause
The issue is likely one of the following:
1. **Server not running**: The NestJS server is not started
2. **Wrong IP address**: `192.168.0.147` may not be the correct IP of the server machine
3. **Network connectivity**: Mobile device and server are not on the same network
4. **Firewall/port blocking**: Port 3003 may be blocked

## Solution Implemented

### 1. Enhanced API Configuration with Debugging
```dart
class ApiConfig {
  // Increased timeouts for better debugging
  static const Duration connectTimeout = Duration(seconds: 60);
  static const Duration receiveTimeout = Duration(seconds: 60);

  // Debug method to print current configuration
  static void printConfig() {
    print('=== API CONFIG DEBUG ===');
    print('Base URL: $baseUrl');
    print('API Base URL: $apiBaseUrl');
    print('Better Auth Base URL: $betterAuthBaseUrl');
    print('Sign In Email: $signInEmail');
    print('Environment: ${isProduction ? 'production' : 'development'}');
    print('Connect Timeout: ${connectTimeout.inSeconds}s');
    print('Receive Timeout: ${receiveTimeout.inSeconds}s');
    print('=== END CONFIG DEBUG ===');
  }
}
```

### 2. Enhanced Connection Error Debugging
```dart
onError: (error, handler) {
  print('=== ERROR DEBUG ===');
  print('Error response from: ${error.requestOptions.uri}');
  print('Error type: ${error.type}');

  // Enhanced connection debugging
  if (error.type == DioExceptionType.connectionTimeout) {
    print('CONNECTION TIMEOUT - Server not responding or unreachable');
    print('Attempted to connect to: ${error.requestOptions.uri}');
    print('TROUBLESHOOTING:');
    print('1. Check if server is running on ${ApiConfig.baseUrl}');
    print('2. Verify IP address ${error.requestOptions.uri.host} is correct');
    print('3. Check network connectivity');
    print('4. Verify firewall/port settings');
  }
  // ... other error types
}
```

### 3. Connection Test Functionality
Added a connection test method to the auth API service:
```dart
Future<bool> testConnection() async {
  try {
    print('=== CONNECTION TEST ===');
    print('Testing connection to: ${ApiConfig.baseUrl}');
    
    final response = await _dioClient.get(
      '/',
      options: Options(
        sendTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ),
    );
    
    print('Connection test successful!');
    return true;
  } on DioException catch (e) {
    print('Connection test failed!');
    print('Error type: ${e.type}');
    
    if (e.type == DioExceptionType.connectionTimeout) {
      print('DIAGNOSIS: Server is not running or IP address is incorrect');
      print('SOLUTIONS:');
      print('1. Start the server: cd server && npm run start:dev');
      print('2. Check if IP address is correct');
      print('3. Try using localhost instead: http://localhost:3003');
    }
    
    return false;
  }
}
```

### 4. Connection Test Button in Login Screen
Added a "Test Connection" button to the login screen for easy debugging:
```dart
TextButton.icon(
  onPressed: isLoading ? null : _testConnection,
  icon: const Icon(Icons.wifi_find, size: 18),
  label: const Text('Test Connection'),
  // ... styling
)
```

The test method shows a loading dialog and provides clear feedback about connection status.

## Server Configuration Analysis
Based on the server code analysis:
- **Server runs on**: Port 3003 (configurable via `process.env.PORT`)
- **Server binds to**: `0.0.0.0` (accepts connections from any IP)
- **CORS enabled**: Allows requests with no origin (mobile apps)
- **Better Auth endpoints**: Available at `/api/auth`
- **API endpoints**: Available at `/api/v1`

## Troubleshooting Steps

### 1. Verify Server is Running
```bash
cd server
npm run start:dev
```
Look for: `Server running on port 3003`

### 2. Check Server IP Address
Find the correct IP address of the machine running the server:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### 3. Test Server from Browser
Open browser and navigate to:
- `http://localhost:3003` (if on same machine)
- `http://192.168.0.147:3003` (if on different machine)

You should see the NestJS server response or Swagger documentation.

### 4. Use Connection Test Button
1. Open the mobile app
2. On login screen, tap "Test Connection" button
3. Check the detailed logs for diagnosis

### 5. Update IP Address if Needed
If the IP address is wrong, update it in:
```dart
// fetan_pay/lib/core/config/api_config.dart
static const String baseUrl = String.fromEnvironment(
  'BASE_URL',
  defaultValue: 'http://YOUR_CORRECT_IP:3003', // Update this
);
```

## Expected Debug Output After Fix

### On App Start:
```
=== API CONFIG DEBUG ===
Base URL: http://192.168.0.147:3003
API Base URL: http://192.168.0.147:3003/api/v1
Better Auth Base URL: http://192.168.0.147:3003/api/auth
Sign In Email: http://192.168.0.147:3003/api/auth/sign-in/email
Environment: development
Connect Timeout: 60s
Receive Timeout: 60s
=== END CONFIG DEBUG ===
```

### On Connection Test Success:
```
=== CONNECTION TEST ===
Testing connection to: http://192.168.0.147:3003
Connection test successful!
Response status: 200
Server is reachable at: http://192.168.0.147:3003
```

### On Connection Test Failure:
```
=== CONNECTION TEST ===
Testing connection to: http://192.168.0.147:3003
Connection test failed!
Error type: DioExceptionType.connectionTimeout
DIAGNOSIS: Server is not running or IP address is incorrect
SOLUTIONS:
1. Start the server: cd server && npm run start:dev
2. Check if IP address 192.168.0.147 is correct
3. Try using localhost instead: http://localhost:3003
```

## Files Modified
- `fetan_pay/lib/core/config/api_config.dart` - Enhanced configuration with debugging
- `fetan_pay/lib/core/network/dio_client.dart` - Enhanced error debugging
- `fetan_pay/lib/features/auth/data/services/auth_api_service.dart` - Added connection test
- `fetan_pay/lib/features/auth/domain/repositories/auth_repository.dart` - Added connection test interface
- `fetan_pay/lib/features/auth/data/repositories/auth_repository_impl.dart` - Added connection test implementation
- `fetan_pay/lib/features/auth/presentation/bloc/auth_bloc.dart` - Added repository getter
- `fetan_pay/lib/features/auth/presentation/screens/login_screen.dart` - Added connection test button

## Next Steps
1. **Test the connection** using the new "Test Connection" button
2. **Start the server** if it's not running: `cd server && npm run start:dev`
3. **Verify IP address** is correct for your network setup
4. **Check network connectivity** between mobile device and server
5. **Review enhanced debug logs** for specific connection issues

This comprehensive debugging system will help identify exactly why the connection is failing and provide specific solutions.