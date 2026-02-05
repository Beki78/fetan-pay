import 'package:dartz/dartz.dart';
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
            user = User.fromJson(loginResponse.user!);
          } catch (e) {
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
      // Try to get from cache first
      final cachedUser = await getCachedUser();
      if (cachedUser != null && await _networkInfo.isConnected) {
        // Verify with API if online
        final apiUser = await _authApiService.getCurrentUser();
        if (apiUser != null) {
          // Update cache with fresh data
          await _sessionManager.saveUser(apiUser);
          return Right(apiUser);
        } else {
          // API says no user, clear cache
          await _sessionManager.clearSession();
          return const Right(null);
        }
      } else if (cachedUser != null) {
        // Offline, return cached user
        return Right(cachedUser);
      } else if (await _networkInfo.isConnected) {
        // No cache, try API
        final apiUser = await _authApiService.getCurrentUser();
        if (apiUser != null) {
          await _sessionManager.saveUser(apiUser);
          await _sessionManager.setLoggedIn(true);
        }
        return Right(apiUser);
      }

      return const Right(null);
    } catch (e) {
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
    final cachedUser = await getCachedUser();
    final isLoggedIn = await _sessionManager.isLoggedIn();
    return cachedUser != null && isLoggedIn;
  }

  @override
  Future<User?> getCachedUser() async {
    return await _sessionManager.getUser();
  }

  @override
  Future<void> clearCache() async {
    await _sessionManager.clearSession();
  }
}
