import 'package:dartz/dartz.dart';
import 'dart:async';
import '../../../../core/network/network_info.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/utils/secure_logger.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';
import '../models/login_models.dart';
import '../services/auth_api_service.dart';
import '../services/session_manager.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthApiService _authApiService;
  final SessionManager _sessionManager;
  final NetworkInfo _networkInfo;

  AuthRepositoryImpl({
    required AuthApiService authApiService,
    required SessionManager sessionManager,
    required NetworkInfo networkInfo,
  }) : _authApiService = authApiService,
       _sessionManager = sessionManager,
       _networkInfo = networkInfo;

  @override
  Future<Either<Failure, User>> signInWithEmail(
    String email,
    String password,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message:
                'No internet connection. Please check your network settings.',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Attempt login via API
      final loginResponse = await _authApiService.signInWithEmail(
        email,
        password,
      );

      if (loginResponse.success) {
        // Save session token if available
        if (loginResponse.token != null) {
          await _sessionManager.saveSessionToken(loginResponse.token!);
        }

        // Try to get user data from login response first
        User? user;
        if (loginResponse.user != null) {
          try {
            print('=== AUTH REPOSITORY DEBUG ===');
            print('Login response contains user data');
            print('Login response user data: ${loginResponse.user}');

            // Parse user from login response
            user = User.fromJson(loginResponse.user!);
            print('Successfully parsed user from login response');
            print('User role: ${user.role}');
            print('=== END AUTH REPOSITORY DEBUG ===');
          } catch (e) {
            print('=== AUTH REPOSITORY ERROR ===');
            print('Failed to parse user from login response: $e');
            print('Will try to fetch from membership API');
            print('=== END AUTH REPOSITORY ERROR ===');
            // If parsing fails, we'll try to get user data from API
            user = null;
          }
        }

        // If no user data in login response, get it from API
        // This is important because Better Auth might not return user data in login response
        if (user == null) {
          // Wait a bit for session to be established
          await Future.delayed(const Duration(milliseconds: 500));

          final userResult = await getCurrentUser();
          final userFromApi = userResult.fold(
            (failure) => null,
            (userData) => userData,
          );

          if (userFromApi != null) {
            user = userFromApi;
          } else {
            return const Left(
              AuthFailure(
                message: 'Login successful but failed to get user data',
                code: 'USER_DATA_ERROR',
              ),
            );
          }
        }

        // Cache user data and credentials
        await _sessionManager.saveUser(user);
        await _sessionManager.saveLoginCredentials(email, password);
        await _sessionManager.setLoggedIn(true);
        await _sessionManager.saveLastLoginTime();

        print('=== AUTH REPOSITORY SUCCESS ===');
        print('User data cached successfully');
        print('Returning Right(user) with role: ${user.role}');
        print('=== END AUTH REPOSITORY SUCCESS ===');

        return Right(user);
      } else {
        return Left(
          AuthFailure(message: loginResponse.message, code: 'LOGIN_FAILED'),
        );
      }
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'signInWithEmail');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, void>> signOut() async {
    try {
      // Following merchant web app pattern: Clear local session data FIRST
      // This prevents data leakage between users and ensures logout even if API fails
      print("=== REPOSITORY SIGN OUT ===");
      print("Clearing local session data first (merchant web app pattern)");
      await _sessionManager.clearSession();
      print("Local session data cleared successfully");

      // Attempt API logout (don't fail if it doesn't work)
      if (await _networkInfo.isConnected) {
        try {
          print("Network available, attempting server sign out");
          await _authApiService.signOut();
          print("Server sign out completed (check API logs for details)");
        } catch (e) {
          // API logout failed, but we already cleared local data
          // This matches merchant web app behavior - local cleanup is prioritized
          print("API logout failed but local cleanup already completed: $e");
          SecureLogger.auth(
            'API logout failed but local cleanup successful: ${e.toString()}',
          );
        }
      } else {
        print("No network connection, skipping server sign out");
        SecureLogger.auth('No network - local logout only');
      }

      print("Sign out process completed successfully");
      return const Right(null);
    } catch (e) {
      print("Error during sign out process: $e");
      final failure = ErrorHandler.handleError(e, context: 'signOut');

      // Even if there's an error, try to clear session as fallback
      try {
        await _sessionManager.clearSession();
        print("Fallback session clear completed");
        // Return success since we managed to clear local data
        return const Right(null);
      } catch (clearError) {
        print("Failed to clear session in fallback: $clearError");
        return Left(failure);
      }
    }
  }

  @override
  Future<Either<Failure, User?>> getCurrentUser() async {
    try {
      // First check if we have a cached user and are marked as logged in
      final cachedUser = await getCachedUser();
      final isLoggedIn = await _sessionManager.isLoggedIn();

      // If no cached user or not marked as logged in, return null immediately
      if (cachedUser == null || !isLoggedIn) {
        SecureLogger.auth('No cached user or not logged in, returning null');
        return const Right(null);
      }

      // If we have cached user and network connection, verify with API
      if (await _networkInfo.isConnected) {
        try {
          // Add timeout to prevent infinite loading
          final apiUserFuture = _authApiService.getCurrentUser();
          final timeoutFuture = Future.delayed(
            const Duration(seconds: 10),
            () => throw TimeoutException(
              'Get user timeout',
              const Duration(seconds: 10),
            ),
          );

          final apiUser = await Future.any([apiUserFuture, timeoutFuture]);

          if (apiUser != null) {
            // Update cache with fresh data
            await _sessionManager.saveUser(apiUser);
            SecureLogger.auth('User verified with API and cache updated');
            return Right(apiUser);
          } else {
            // API says no user (401/403), clear cache and session
            SecureLogger.auth('API returned no user, clearing session');
            await _sessionManager.clearSession();
            return const Right(null);
          }
        } on TimeoutException catch (e) {
          SecureLogger.auth(
            'API timeout, returning cached user: ${e.toString()}',
          );
          return Right(cachedUser);
        } catch (e) {
          // API call failed, but we have cached user
          SecureLogger.auth(
            'API call failed, but have cached user: ${e.toString()}',
          );

          // If it's an auth error (401/403), clear session
          if (e.toString().contains('401') ||
              e.toString().contains('403') ||
              e.toString().contains('Authentication') ||
              e.toString().contains('Unauthorized')) {
            SecureLogger.auth(
              'Authentication error detected, clearing session',
            );
            await _sessionManager.clearSession();
            return const Right(null);
          }

          // For other errors (network, timeout), return cached user
          SecureLogger.auth('Network error, returning cached user');
          return Right(cachedUser);
        }
      } else {
        // Offline, return cached user
        SecureLogger.auth('Offline, returning cached user');
        return Right(cachedUser);
      }
    } catch (e) {
      SecureLogger.error('Error in getCurrentUser', error: e);

      // On any error, try to clear session to prevent infinite loops
      try {
        await _sessionManager.clearSession();
      } catch (clearError) {
        SecureLogger.error(
          'Failed to clear session on error',
          error: clearError,
        );
      }

      final failure = ErrorHandler.handleError(e, context: 'getCurrentUser');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, QRLoginResponse>> validateQRCode(
    String qrData,
    String origin,
  ) async {
    try {
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message:
                'No internet connection. Please check your network settings.',
            code: 'NO_CONNECTION',
          ),
        );
      }

      final qrResponse = await _authApiService.validateQRCode(qrData, origin);
      return Right(qrResponse);
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'validateQRCode');
      // Convert to QR-specific failure if it's a generic failure
      if (failure is! QRFailure) {
        return Left(
          QRFailure(
            message: failure.message,
            code: failure.code,
            originalError: failure.originalError,
          ),
        );
      }
      return Left(failure);
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    try {
      final cachedUser = await getCachedUser();
      final isLoggedIn = await _sessionManager.isLoggedIn();

      // Both conditions must be true for authentication
      final hasValidSession = cachedUser != null && isLoggedIn;

      SecureLogger.auth(
        'Authentication check: cachedUser=${cachedUser != null}, isLoggedIn=$isLoggedIn, result=$hasValidSession',
      );

      return hasValidSession;
    } catch (e) {
      SecureLogger.error('Error checking authentication status', error: e);
      return false;
    }
  }

  @override
  Future<User?> getCachedUser() async {
    return await _sessionManager.getUser();
  }

  @override
  Future<void> clearCache() async {
    await _sessionManager.clearSession();
  }

  @override
  Future<bool> testConnection() async {
    try {
      return await _authApiService.testConnection();
    } catch (e) {
      print('Repository connection test error: $e');
      return false;
    }
  }
}
