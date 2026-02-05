import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/secure_logger.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
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
      final isAuthenticated = await _authRepository.isAuthenticated();

      if (isAuthenticated) {
        final userResult = await _getCurrentUserUseCase();
        userResult.fold(
          (failure) {
            SecureLogger.auth('Failed to get current user during auth check');
            emit(AuthUnauthenticated());
          },
          (user) {
            if (user != null) {
              SecureLogger.auth('User authenticated successfully');
              emit(AuthAuthenticated(user));
            } else {
              SecureLogger.auth('No user data found');
              emit(AuthUnauthenticated());
            }
          },
        );
      } else {
        SecureLogger.auth('User not authenticated');
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'CheckAuthStatus');
      emit(AuthError(failure.message));
    }
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      SecureLogger.auth('Login requested for email: ${event.email}');

      final result = await _signInUseCase(
        SignInParams(email: event.email, password: event.password),
      );

      result.fold(
        (failure) {
          SecureLogger.auth('Login failed: ${failure.message}');
          emit(AuthError(failure.message));
        },
        (user) {
          SecureLogger.auth(
            'Login successful for user: ${user.email}, role: ${user.role}',
          );
          emit(AuthAuthenticated(user));
        },
      );
    } catch (e) {
      SecureLogger.error('Login exception occurred', error: e);
      final failure = ErrorHandler.handleError(e, context: 'LoginRequested');
      emit(AuthError(failure.message));
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
      // Use correct origin for merchant-admin app
      final origin = 'https://client.fetanpay.et';

      final qrResult = await _validateQRUseCase(
        ValidateQRParams(qrData: event.qrData, origin: origin),
      );

      SecureLogger.qrEvent('QR validation result received');

      // Handle QR validation result
      final qrFoldResult = await qrResult.fold(
        (failure) async {
          SecureLogger.auth('QR validation failed');
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
