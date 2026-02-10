import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/di/injection_container.dart';

abstract class SessionManager {
  Future<void> saveUser(User user);
  Future<User?> getUser();
  Future<void> saveSessionToken(String token);
  Future<String?> getSessionToken();
  Future<void> saveLoginCredentials(String email, String password);
  Future<Map<String, String>?> getLoginCredentials();
  Future<void> clearSession();
  Future<bool> isLoggedIn();
  Future<void> setLoggedIn(bool loggedIn);
  Future<void> saveLastLoginTime();

  Future<void> setFirstLaunch(bool isFirst);
  Future<bool> isFirstLaunch();
}

class SessionManagerImpl implements SessionManager {
  // Non-sensitive data keys for SharedPreferences
  static const String _isLoggedInKey = 'is_logged_in';
  static const String _firstLaunchKey = 'first_launch';
  static const String _lastLoginTimeKey = 'last_login_time';

  // Sensitive data keys for FlutterSecureStorage
  static const String _userKey = 'user_data';
  static const String _sessionTokenKey = 'session_token';
  static const String _loginEmailKey = 'login_email';
  static const String _loginPasswordKey = 'login_password';

  // Secure storage instance with encryption options
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      sharedPreferencesName: 'fetan_pay_secure_prefs',
      preferencesKeyPrefix: 'fetan_',
    ),
    iOptions: IOSOptions(
      groupId: 'group.com.fetanpay.app',
      accountName: 'fetan_pay_keychain',
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  @override
  Future<void> saveUser(User user) async {
    try {
      final userJson = jsonEncode(user.toJson());
      await _secureStorage.write(key: _userKey, value: userJson);
    } catch (e) {
      if (kDebugMode) {
        print('Error saving user data: $e');
      }
      rethrow;
    }
  }

  @override
  Future<User?> getUser() async {
    try {
      final userJson = await _secureStorage.read(key: _userKey);
      if (userJson != null) {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        return User.fromJson(userMap);
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('Error reading user data: $e');
      }
      // Clear corrupted data
      await _secureStorage.delete(key: _userKey);
      return null;
    }
  }

  @override
  Future<void> saveSessionToken(String token) async {
    try {
      await _secureStorage.write(key: _sessionTokenKey, value: token);
    } catch (e) {
      if (kDebugMode) {
        print('Error saving session token');
      }
      rethrow;
    }
  }

  @override
  Future<String?> getSessionToken() async {
    try {
      return await _secureStorage.read(key: _sessionTokenKey);
    } catch (e) {
      if (kDebugMode) {
        print('Error reading session token');
      }
      return null;
    }
  }

  @override
  Future<void> saveLoginCredentials(String email, String password) async {
    try {
      await Future.wait([
        _secureStorage.write(key: _loginEmailKey, value: email),
        _secureStorage.write(key: _loginPasswordKey, value: password),
      ]);
    } catch (e) {
      if (kDebugMode) {
        print('Error saving login credentials');
      }
      rethrow;
    }
  }

  @override
  Future<Map<String, String>?> getLoginCredentials() async {
    try {
      final results = await Future.wait([
        _secureStorage.read(key: _loginEmailKey),
        _secureStorage.read(key: _loginPasswordKey),
      ]);

      final email = results[0];
      final password = results[1];

      if (email != null && password != null) {
        return {'email': email, 'password': password};
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('Error reading login credentials');
      }
      return null;
    }
  }

  @override
  Future<void> clearSession() async {
    try {
      print("=== CLEARING SESSION DATA ===");

      // Clear secure storage (sensitive data)
      print("Clearing secure storage...");
      await Future.wait([
        _secureStorage.delete(key: _userKey),
        _secureStorage.delete(key: _sessionTokenKey),
        _secureStorage.delete(key: _loginEmailKey),
        _secureStorage.delete(key: _loginPasswordKey),
      ]);
      print("Secure storage cleared");

      // Clear non-sensitive data from SharedPreferences
      print("Clearing SharedPreferences...");
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_isLoggedInKey, false);

      // Also clear any other app-specific data that might exist
      // This matches the merchant web app's localStorage.removeItem() calls
      await prefs.remove(_lastLoginTimeKey);
      print("SharedPreferences cleared");

      // CRITICAL: Clear cookies from DioClient cookie jar
      print("Clearing cookies from cookie jar...");
      try {
        final dioClient = getIt<DioClient>();
        await dioClient.clearAllCookies();
        print("Cookies cleared from cookie jar");
      } catch (cookieError) {
        print("Error clearing cookies (non-critical): $cookieError");
        // Don't fail the entire logout process if cookie clearing fails
      }

      print("=== SESSION CLEARED SUCCESSFULLY ===");

      // POST-LOGOUT VERIFICATION: Verify cleanup was successful
      await _verifySessionCleanup();
    } catch (e) {
      print('Error clearing session: $e');
      if (kDebugMode) {
        print('Error clearing session: $e');
      }

      // Try to clear individual items even if batch clear failed
      try {
        print("Attempting individual cleanup...");
        await _secureStorage.delete(key: _userKey);
        await _secureStorage.delete(key: _sessionTokenKey);
        await _secureStorage.delete(key: _loginEmailKey);
        await _secureStorage.delete(key: _loginPasswordKey);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(_isLoggedInKey, false);

        // Try to clear cookies in individual cleanup too
        try {
          final dioClient = getIt<DioClient>();
          await dioClient.clearAllCookies();
        } catch (cookieError) {
          print("Individual cookie cleanup failed: $cookieError");
        }

        print("Individual cleanup completed");
      } catch (individualError) {
        print('Individual cleanup also failed: $individualError');
        // Still rethrow the original error
      }

      rethrow;
    }
  }

  @override
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_isLoggedInKey) ?? false;
  }

  @override
  Future<void> setFirstLaunch(bool isFirst) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_firstLaunchKey, isFirst);
  }

  @override
  Future<bool> isFirstLaunch() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_firstLaunchKey) ?? true;
  }

  // Additional utility methods
  @override
  Future<void> setLoggedIn(bool loggedIn) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_isLoggedInKey, loggedIn);
  }

  @override
  Future<void> saveLastLoginTime() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now().toIso8601String();
    await prefs.setString(_lastLoginTimeKey, now);
  }

  Future<DateTime?> getLastLoginTime() async {
    final prefs = await SharedPreferences.getInstance();
    final timeString = prefs.getString(_lastLoginTimeKey);
    if (timeString != null) {
      try {
        return DateTime.parse(timeString);
      } catch (e) {
        if (kDebugMode) {
          print('Error parsing last login time: $e');
        }
        return null;
      }
    }
    return null;
  }

  /// Clear all secure storage data (for debugging/testing purposes)
  Future<void> clearAllSecureData() async {
    if (kDebugMode) {
      try {
        await _secureStorage.deleteAll();
        print('All secure storage data cleared');
      } catch (e) {
        print('Error clearing secure storage: $e');
      }
    }
  }

  /// Verify that session cleanup was successful
  Future<void> _verifySessionCleanup() async {
    try {
      print("=== POST-LOGOUT VERIFICATION ===");

      // Check if secure storage was cleared
      final userJson = await _secureStorage.read(key: _userKey);
      final tokenJson = await _secureStorage.read(key: _sessionTokenKey);
      final emailJson = await _secureStorage.read(key: _loginEmailKey);
      final passwordJson = await _secureStorage.read(key: _loginPasswordKey);

      if (userJson == null &&
          tokenJson == null &&
          emailJson == null &&
          passwordJson == null) {
        print("✅ Secure storage cleared successfully");
      } else {
        print(
          "⚠️ Some secure storage data remains: user=${userJson != null}, token=${tokenJson != null}, email=${emailJson != null}, password=${passwordJson != null}",
        );
      }

      // Check if SharedPreferences was cleared
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(_isLoggedInKey) ?? false;
      final lastLoginTime = prefs.getString(_lastLoginTimeKey);

      if (!isLoggedIn && lastLoginTime == null) {
        print("✅ SharedPreferences cleared successfully");
      } else {
        print(
          "⚠️ Some SharedPreferences data remains: isLoggedIn=$isLoggedIn, lastLoginTime=$lastLoginTime",
        );
      }

      print("=== END POST-LOGOUT VERIFICATION ===");
    } catch (e) {
      print("Error during post-logout verification: $e");
    }
  }
}
