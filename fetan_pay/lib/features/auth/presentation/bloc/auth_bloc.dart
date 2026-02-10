import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import '../../../../core/utils/secure_logger.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/config/api_config.dart';
import '../../data/models/user_model.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/sign_in_usecase.dart';
import '../../domain/usecases/sign_out_usecase.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/validate_qr_usecase.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final SignInUseCase _signInUseCase;
  final SignOutUseCase _signOutUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final ValidateQRUseCase _validateQRUseCase;
  final AuthRepository _authRepository;

  // Getter to access auth repository for connection testing
  AuthRepository get authRepository => _authRepository;

  AuthBloc({
    required SignInUseCase signInUseCase,
    required SignOutUseCase signOutUseCase,
    required GetCurrentUserUseCase getCurrentUserUseCase,
    required ValidateQRUseCase validateQRUseCase,
    required AuthRepository authRepository,
  }) : _signInUseCase = signInUseCase,
       _signOutUseCase = signOutUseCase,
       _getCurrentUserUseCase = getCurrentUserUseCase,
       _validateQRUseCase = validateQRUseCase,
       _authRepository = authRepository,
       super(AuthInitial()) {
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LoginRequested>(_onLoginRequested);
    on<QRLoginRequested>(_onQRLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      SecureLogger.auth('Checking authentication status...');

      // Add timeout to prevent infinite loading
      final authCheckFuture = _performAuthCheck();
      final timeoutFuture = Future.delayed(
        const Duration(seconds: 10),
        () => throw TimeoutException(
          'Authentication check timeout',
          const Duration(seconds: 10),
        ),
      );

      final result = await Future.any([authCheckFuture, timeoutFuture]);
      emit(result);
    } catch (e) {
      SecureLogger.error('Exception during auth status check', error: e);

      // On any exception during auth check, assume unauthenticated to prevent infinite loading
      SecureLogger.auth(
        'Exception occurred, marking as unauthenticated to prevent infinite loading',
      );
      emit(AuthUnauthenticated());
    }
  }

  Future<AuthState> _performAuthCheck() async {
    final isAuthenticated = await _authRepository.isAuthenticated();
    SecureLogger.auth('Initial authentication check: $isAuthenticated');

    if (isAuthenticated) {
      SecureLogger.auth(
        'User appears to be authenticated, getting user data...',
      );

      final userResult = await _getCurrentUserUseCase();
      return userResult.fold(
        (failure) {
          SecureLogger.auth(
            'Failed to get current user during auth check: ${failure.message}',
          );

          // If it's an auth failure, user is not really authenticated
          if (failure is AuthFailure) {
            SecureLogger.auth(
              'Auth failure detected, marking as unauthenticated',
            );
            return AuthUnauthenticated();
          } else {
            // For other failures (network, etc.), show error but don't assume unauthenticated
            SecureLogger.auth(
              'Non-auth failure, showing error: ${failure.message}',
            );
            return AuthError(
              'Unable to verify authentication. Please check your connection.',
            );
          }
        },
        (user) {
          if (user != null) {
            SecureLogger.auth('User authenticated successfully: ${user.email}');
            return AuthAuthenticated(user);
          } else {
            SecureLogger.auth('No user data found, marking as unauthenticated');
            return AuthUnauthenticated();
          }
        },
      );
    } else {
      SecureLogger.auth('User not authenticated');
      return AuthUnauthenticated();
    }
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    // Prevent multiple simultaneous login attempts
    if (state is AuthLoading) {
      SecureLogger.auth(
        'Login already in progress, ignoring duplicate request',
      );
      return;
    }

    emit(AuthLoading());

    try {
      SecureLogger.auth('Login requested for email: ${event.email}');

      // Add timeout to prevent infinite loading during login
      final loginFuture = _signInUseCase(
        SignInParams(email: event.email, password: event.password),
      );

      final timeoutFuture = Future.delayed(
        const Duration(seconds: 30), // Longer timeout for login
        () => throw TimeoutException(
          'Login timeout',
          const Duration(seconds: 30),
        ),
      );

      final result = await Future.any([loginFuture, timeoutFuture]);

      result.fold(
        (failure) {
          SecureLogger.auth('Login failed: ${failure.message}');

          // Provide more specific error messages based on failure type
          String errorMessage = failure.message;

          if (failure is AuthFailure) {
            // Authentication-specific errors
            if (failure.code == 'UNAUTHORIZED') {
              errorMessage =
                  'Incorrect email or password. Please check your credentials and try again.';
            } else if (failure.code == 'FORBIDDEN') {
              errorMessage =
                  'Your account has been suspended. Please contact support.';
            }
          } else if (failure is NetworkFailure) {
            // Network-specific errors
            if (failure.code == 'NO_CONNECTION') {
              errorMessage =
                  'No internet connection. Please check your network settings and try again.';
            } else if (failure.code == 'TIMEOUT') {
              errorMessage =
                  'Connection timeout. Please check your internet connection and try again.';
            }
          } else if (failure is ValidationFailure) {
            // Validation errors
            errorMessage = 'Please check your email and password format.';
          }

          emit(AuthError(errorMessage));
        },
        (user) {
          print('=== AUTH BLOC SUCCESS ===');
          print('Login successful for user: ${user.email}, role: ${user.role}');
          print('Current state before emit: ${state.runtimeType}');
          print('About to emit AuthAuthenticated state...');

          SecureLogger.auth(
            'Login successful for user: ${user.email}, role: ${user.role}',
          );

          // Ensure we emit the state properly
          emit(AuthAuthenticated(user));

          print('AuthAuthenticated state emitted successfully');
          print('Current state after emit: ${state.runtimeType}');
          print('=== END AUTH BLOC SUCCESS ===');
        },
      );
    } on TimeoutException catch (e) {
      SecureLogger.error('Login timeout occurred', error: e);
      emit(
        AuthError(
          'Login timeout. Please check your internet connection and try again.',
        ),
      );
    } catch (e) {
      SecureLogger.error('Login exception occurred', error: e);
      final failure = ErrorHandler.handleError(e, context: 'LoginRequested');

      // Provide user-friendly error message based on the failure type
      String errorMessage = 'An unexpected error occurred. Please try again.';

      if (failure is NetworkFailure) {
        errorMessage =
            'Network error. Please check your internet connection and try again.';
      } else if (failure is AuthFailure) {
        errorMessage = failure.message;
      } else if (e.toString().toLowerCase().contains('network') ||
          e.toString().toLowerCase().contains('connection')) {
        errorMessage =
            'Network error. Please check your internet connection and try again.';
      } else if (e.toString().toLowerCase().contains('timeout')) {
        errorMessage = 'Connection timeout. Please try again.';
      }

      emit(AuthError(errorMessage));
    }
  }

  Future<void> _onQRLoginRequested(
    QRLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      // QR Login Flow:
      // 1. Merchant system generates encrypted QR code with login credentials
      // 2. Mobile app scans QR code and sends raw data to backend
      // 3. Backend decrypts QR data and returns login credentials
      // 4. App uses returned credentials to perform normal login
      //
      // Use the base URL as origin - this should match the MERCHANT_APP_URL in server .env
      // The server validates that the origin matches the domain in the QR code
      final origin = ApiConfig.baseUrl;

      SecureLogger.qrEvent('QR login requested with origin: $origin');

      final qrResult = await _validateQRUseCase(
        ValidateQRParams(qrData: event.qrData, origin: origin),
      );

      SecureLogger.qrEvent('QR validation result received');

      // Handle QR validation result
      final qrFoldResult = await qrResult.fold(
        (failure) async {
          SecureLogger.auth('QR validation failed: ${failure.message}');
          return AuthError(failure.message);
        },
        (qrResponse) async {
          SecureLogger.auth('QR validation successful - attempting login');

          // Use the credentials from QR response to login
          final loginResult = await _signInUseCase(
            SignInParams(
              email: qrResponse.email.trim(),
              password: qrResponse.password.trim(),
            ),
          );

          return loginResult.fold(
            (failure) {
              SecureLogger.auth('Final login failed');
              return AuthError('QR login failed: ${failure.message}');
            },
            (user) {
              SecureLogger.auth('QR login complete - user authenticated');
              return AuthAuthenticated(user);
            },
          );
        },
      );

      // Emit the final result
      emit(qrFoldResult);
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'QRLoginRequested');
      final errorMessage = failure is QRFailure
          ? 'Invalid QR code. Please scan a valid login QR code from the merchant system.'
          : failure.message;
      emit(AuthError(errorMessage));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      final result = await _signOutUseCase();

      result.fold(
        (failure) {
          SecureLogger.auth('Logout failed');
          emit(AuthError(failure.message));
        },
        (_) {
          SecureLogger.auth('Logout successful');
          emit(AuthUnauthenticated());
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'LogoutRequested');
      emit(AuthError(failure.message));
    }
  }
}
