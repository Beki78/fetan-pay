import 'package:dartz/dartz.dart';
import '../../../../core/network/network_info.dart';
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
  })  : _authApiService = authApiService,
        _sessionManager = sessionManager,
        _networkInfo = networkInfo;

  @override
  Future<Either<AuthError, User>> signInWithEmail(String email, String password) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return Left(AuthError(message: 'No internet connection'));
      }

      // Attempt login via API
      final loginResponse = await _authApiService.signInWithEmail(email, password);

      if (loginResponse.success) {
        // Get user data after successful login
        final userResult = await getCurrentUser();

        return userResult.fold(
          (error) => Left(AuthError(message: 'Login successful but failed to get user data')),
          (user) {
            if (user != null) {
              // Cache user data and credentials
              _sessionManager.saveUser(user);
              _sessionManager.saveLoginCredentials(email, password);
              _sessionManager.setLoggedIn(true);
              _sessionManager.saveLastLoginTime();
              return Right(user);
            } else {
              return Left(AuthError(message: 'Failed to get user data after login'));
            }
          },
        );
      } else {
        return Left(AuthError(message: loginResponse.message));
      }
    } catch (e) {
      return Left(AuthError(message: e.toString()));
    }
  }

  @override
  Future<Either<AuthError, void>> signOut() async {
    try {
      // Attempt API logout (don't fail if it doesn't work)
      if (await _networkInfo.isConnected) {
        try {
          await _authApiService.signOut();
        } catch (e) {
          // API logout failed, but continue with local cleanup
          print('API logout failed: $e');
        }
      }

      // Clear local session data
      await _sessionManager.clearSession();

      return const Right(null);
    } catch (e) {
      return Left(AuthError(message: 'Failed to sign out: ${e.toString()}'));
    }
  }

  @override
  Future<Either<AuthError, User?>> getCurrentUser() async {
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
      return Left(AuthError(message: 'Failed to get current user: ${e.toString()}'));
    }
  }

  @override
  Future<Either<AuthError, QRLoginResponse>> validateQRCode(String qrData, String origin) async {
    try {
      if (!await _networkInfo.isConnected) {
        return Left(AuthError(message: 'No internet connection'));
      }

      final qrResponse = await _authApiService.validateQRCode(qrData, origin);
      return Right(qrResponse);
    } catch (e) {
      return Left(AuthError(message: e.toString()));
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
