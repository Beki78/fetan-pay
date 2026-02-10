import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/user_model.dart';
import '../../data/models/login_models.dart';

abstract class AuthRepository {
  /// Sign in with email and password
  Future<Either<Failure, User>> signInWithEmail(String email, String password);

  /// Sign out the current user
  Future<Either<Failure, void>> signOut();

  /// Get the current authenticated user
  Future<Either<Failure, User?>> getCurrentUser();

  /// Validate QR code for login
  Future<Either<Failure, QRLoginResponse>> validateQRCode(
    String qrData,
    String origin,
  );

  /// Check if user is authenticated
  Future<bool> isAuthenticated();

  /// Get cached user data
  Future<User?> getCachedUser();

  /// Clear all cached authentication data
  Future<void> clearCache();

  /// Test connection to server
  Future<bool> testConnection();
}
