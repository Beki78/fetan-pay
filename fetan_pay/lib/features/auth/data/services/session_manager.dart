import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

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
  static const String _userKey = 'user_data';
  static const String _sessionTokenKey = 'session_token';
  static const String _loginEmailKey = 'login_email';
  static const String _loginPasswordKey = 'login_password';
  static const String _isLoggedInKey = 'is_logged_in';
  static const String _firstLaunchKey = 'first_launch';

  @override
  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = jsonEncode(user.toJson());
    await prefs.setString(_userKey, userJson);
  }

  @override
  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      try {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        return User.fromJson(userMap);
      } catch (e) {
        // If parsing fails, clear corrupted data
        await prefs.remove(_userKey);
        return null;
      }
    }
    return null;
  }

  @override
  Future<void> saveSessionToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionTokenKey, token);
  }

  @override
  Future<String?> getSessionToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_sessionTokenKey);
  }

  @override
  Future<void> saveLoginCredentials(String email, String password) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_loginEmailKey, email);
    await prefs.setString(_loginPasswordKey, password);
  }

  @override
  Future<Map<String, String>?> getLoginCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString(_loginEmailKey);
    final password = prefs.getString(_loginPasswordKey);

    if (email != null && password != null) {
      return {'email': email, 'password': password};
    }
    return null;
  }

  @override
  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await Future.wait([
      prefs.remove(_userKey),
      prefs.remove(_sessionTokenKey),
      prefs.remove(_loginEmailKey),
      prefs.remove(_loginPasswordKey),
      prefs.setBool(_isLoggedInKey, false),
    ]);
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
  Future<void> setLoggedIn(bool loggedIn) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_isLoggedInKey, loggedIn);
  }

  Future<void> saveLastLoginTime() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now().toIso8601String();
    await prefs.setString('last_login_time', now);
  }

  Future<DateTime?> getLastLoginTime() async {
    final prefs = await SharedPreferences.getInstance();
    final timeString = prefs.getString('last_login_time');
    if (timeString != null) {
      try {
        return DateTime.parse(timeString);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
