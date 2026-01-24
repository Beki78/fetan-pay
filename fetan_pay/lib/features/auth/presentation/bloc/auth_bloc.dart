import 'dart:developer' as developer;
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/network/network_info.dart';
import '../../../../core/config/api_config.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../data/models/user_model.dart';
import '../../data/models/login_models.dart';
import '../../data/services/auth_api_service.dart';
import '../../data/services/session_manager.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/sign_in_usecase.dart';
import '../../domain/usecases/sign_out_usecase.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/validate_qr_usecase.dart';
import 'auth_types.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final SignInUseCase _signInUseCase;
  final SignOutUseCase _signOutUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final ValidateQRUseCase _validateQRUseCase;
  final AuthRepository _authRepository;

  AuthBloc({
    required DioClient dioClient,
    required SessionManager sessionManager,
  })  : _signInUseCase = SignInUseCase(
          AuthRepositoryImpl(
            authApiService: AuthApiServiceImpl(dioClient),
            sessionManager: sessionManager,
            networkInfo: NetworkInfoImpl(Connectivity()),
          ),
        ),
        _signOutUseCase = SignOutUseCase(
          AuthRepositoryImpl(
            authApiService: AuthApiServiceImpl(dioClient),
            sessionManager: sessionManager,
            networkInfo: NetworkInfoImpl(Connectivity()),
          ),
        ),
        _getCurrentUserUseCase = GetCurrentUserUseCase(
          AuthRepositoryImpl(
            authApiService: AuthApiServiceImpl(dioClient),
            sessionManager: sessionManager,
            networkInfo: NetworkInfoImpl(Connectivity()),
          ),
        ),
        _validateQRUseCase = ValidateQRUseCase(
          AuthRepositoryImpl(
            authApiService: AuthApiServiceImpl(dioClient),
            sessionManager: sessionManager,
            networkInfo: NetworkInfoImpl(Connectivity()),
          ),
        ),
        _authRepository = AuthRepositoryImpl(
          authApiService: AuthApiServiceImpl(dioClient),
          sessionManager: sessionManager,
          networkInfo: NetworkInfoImpl(Connectivity()),
        ),
        super(AuthInitial()) {
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LoginRequested>(_onLoginRequested);
    on<QRLoginRequested>(_onQRLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckAuthStatus(CheckAuthStatus event, Emitter<AuthState> emit) async {
    emit(AuthLoading());

    try {
      final isAuthenticated = await _authRepository.isAuthenticated();

      if (isAuthenticated) {
        final userResult = await _getCurrentUserUseCase();
        userResult.fold(
          (error) => emit(AuthUnauthenticated()),
          (user) {
            if (user != null) {
              emit(AuthAuthenticated(user));
            } else {
              emit(AuthUnauthenticated());
            }
          },
        );
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      emit(AuthError('Failed to check authentication status: ${e.toString()}'));
    }
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());

    try {
      final result = await _signInUseCase(
        SignInParams(email: event.email, password: event.password),
      );

      result.fold(
        (error) => emit(AuthError(error.message)),
        (user) => emit(AuthAuthenticated(user)),
      );
    } catch (e) {
      emit(AuthError('Login failed: ${e.toString()}'));
    }
  }

  Future<void> _onQRLoginRequested(QRLoginRequested event, Emitter<AuthState> emit) async {
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
      

      developer.log('QR validation result received');

      // Handle QR validation result synchronously
      final qrFoldResult = await qrResult.fold(
        (error) async {
          developer.log('QR validation failed: ${(error as AuthError).message}');
          return AuthError((error as AuthError).message);
        },
        (qrResponse) async {
          developer.log('QR validation successful - attempting login with: ${qrResponse.email}');

          // Use the credentials from QR response to login
          final loginResult = await _signInUseCase(
            SignInParams(email: qrResponse.email.trim(), password: qrResponse.password.trim()),
          );

          return loginResult.fold(
            (error) {
              developer.log('Final login failed: ${error.message}');
              return AuthError('QR login failed: ${error.message}');
            },
            (user) {
              developer.log('QR login complete - user authenticated: ${user.email}');
              return AuthAuthenticated(user);
            },
          );
        },
      );

      // Emit the final result
      emit(qrFoldResult);
    } catch (e) {
      final errorMessage = e.toString().contains('QR code authentication failed')
          ? 'Invalid QR code. Please scan a valid login QR code from the merchant system.'
          : 'QR login failed: ${e.toString()}';
      emit(AuthError(errorMessage));
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    try {
      final result = await _signOutUseCase();

      result.fold(
        (error) => emit(AuthError((error as AuthError).message)),
        (_) => emit(AuthUnauthenticated()),
      );
    } catch (e) {
      emit(AuthError('Logout failed: ${e.toString()}'));
    }
  }
}
