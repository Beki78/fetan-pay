import 'package:dartz/dartz.dart';
import '../../data/models/user_model.dart';
import '../../data/models/login_models.dart';

abstract class AuthRepository {
  /// Sign in with email and password
  Future<Either<AuthError, User>> signInWithEmail(String email, String password);

  /// Sign out the current user
  Future<Either<AuthError, void>> signOut();

  /// Get the current authenticated user
  Future<Either<AuthError, User?>> getCurrentUser();

  /// Validate QR code for login
  Future<Either<AuthError, QRLoginResponse>> validateQRCode(String qrData, String origin);

  /// Check if user is authenticated
  Future<bool> isAuthenticated();

  /// Get cached user data
  Future<User?> getCachedUser();

  /// Clear all cached authentication data
  Future<void> clearCache();
}
