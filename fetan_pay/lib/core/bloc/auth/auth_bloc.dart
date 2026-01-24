// // This file has been moved to: lib/features/auth/presentation/bloc/
// // Please use the new location. This file should be deleted.
// import '../../network/dio_client.dart';
// import '../../network/network_info.dart';
// import '../../config/api_config.dart';
// import 'package:connectivity_plus/connectivity_plus.dart';
// import '../../features/auth/data/models/user_model.dart';
// import '../../features/auth/data/models/login_models.dart';
// import '../../features/auth/data/services/auth_api_service.dart';
// import '../../features/auth/data/services/session_manager.dart';
// import '../../features/auth/data/repositories/auth_repository_impl.dart';
// import '../../features/auth/domain/repositories/auth_repository.dart';
// import '../../features/auth/domain/usecases/sign_in_usecase.dart';
// import '../../features/auth/domain/usecases/sign_out_usecase.dart';
// import '../../features/auth/domain/usecases/get_current_user_usecase.dart';
// import '../../features/auth/domain/usecases/validate_qr_usecase.dart';

// enum UserRole { waiter, admin }

// abstract class AuthEvent {}

// class LoginRequested extends AuthEvent {
//   final String email;
//   final String password;
//   final UserRole role;

//   LoginRequested(this.email, this.password, this.role);
// }

// class QRLoginRequested extends AuthEvent {
//   final String qrData;

//   QRLoginRequested(this.qrData);
// }

// class LogoutRequested extends AuthEvent {}

// class CheckAuthStatus extends AuthEvent {}

// class AuthStatusChanged extends AuthEvent {
//   final bool isAuthenticated;

//   AuthStatusChanged(this.isAuthenticated);
// }

// abstract class AuthState {}

// class AuthInitial extends AuthState {}

// class AuthLoading extends AuthState {}

// class AuthAuthenticated extends AuthState {
//   final User user;

//   AuthAuthenticated(this.user);
// }

// class AuthUnauthenticated extends AuthState {}

// class AuthError extends AuthState {
//   final String message;

//   AuthError(this.message);
// }

// class AuthBloc extends Bloc<AuthEvent, AuthState> {
//   final SignInUseCase _signInUseCase;
//   final SignOutUseCase _signOutUseCase;
//   final GetCurrentUserUseCase _getCurrentUserUseCase;
//   final ValidateQRUseCase _validateQRUseCase;
//   final AuthRepository _authRepository;

//   AuthBloc({
//     required DioClient dioClient,
//     required SessionManager sessionManager,
//   })  : _signInUseCase = SignInUseCase(
//           AuthRepositoryImpl(
//             authApiService: AuthApiServiceImpl(dioClient),
//             sessionManager: sessionManager,
//             networkInfo: NetworkInfoImpl(Connectivity()),
//           ),
//         ),
//         _signOutUseCase = SignOutUseCase(
//           AuthRepositoryImpl(
//             authApiService: AuthApiServiceImpl(dioClient),
//             sessionManager: sessionManager,
//             networkInfo: NetworkInfoImpl(Connectivity()),
//           ),
//         ),
//         _getCurrentUserUseCase = GetCurrentUserUseCase(
//           AuthRepositoryImpl(
//             authApiService: AuthApiServiceImpl(dioClient),
//             sessionManager: sessionManager,
//             networkInfo: NetworkInfoImpl(Connectivity()),
//           ),
//         ),
//         _validateQRUseCase = ValidateQRUseCase(
//           AuthRepositoryImpl(
//             authApiService: AuthApiServiceImpl(dioClient),
//             sessionManager: sessionManager,
//             networkInfo: NetworkInfoImpl(Connectivity()),
//           ),
//         ),
//         _authRepository = AuthRepositoryImpl(
//           authApiService: AuthApiServiceImpl(dioClient),
//           sessionManager: sessionManager,
//           networkInfo: NetworkInfoImpl(Connectivity()),
//         ),
//         super(AuthInitial()) {
//     on<CheckAuthStatus>(_onCheckAuthStatus);
//     on<LoginRequested>(_onLoginRequested);
//     on<QRLoginRequested>(_onQRLoginRequested);
//     on<LogoutRequested>(_onLogoutRequested);
//   }

//   Future<void> _onCheckAuthStatus(CheckAuthStatus event, Emitter<AuthState> emit) async {
//     emit(AuthLoading());

//     try {
//       final isAuthenticated = await _authRepository.isAuthenticated();

//       if (isAuthenticated) {
//         final userResult = await _getCurrentUserUseCase();
//         userResult.fold(
//           (error) => emit(AuthUnauthenticated()),
//           (user) {
//             if (user != null) {
//               emit(AuthAuthenticated(user));
//             } else {
//               emit(AuthUnauthenticated());
//             }
//           },
//         );
//       } else {
//         emit(AuthUnauthenticated());
//       }
//     } catch (e) {
//       emit(AuthError('Failed to check authentication status: ${e.toString()}'));
//     }
//   }

//   Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
//     emit(AuthLoading());

//     try {
//       final result = await _signInUseCase(
//         SignInParams(email: event.email, password: event.password),
//       );

//       result.fold(
//         (error) => emit(AuthError(error.message)),
//         (user) => emit(AuthAuthenticated(user)),
//       );
//     } catch (e) {
//       emit(AuthError('Login failed: ${e.toString()}'));
//     }
//   }

//   Future<void> _onQRLoginRequested(QRLoginRequested event, Emitter<AuthState> emit) async {
//     emit(AuthLoading());

//     try {
//       final origin = ApiConfig.isProduction
//           ? 'https://client.fetanpay.et'
//           : 'http://localhost:3002';

//       final qrResult = await _validateQRUseCase(
//         ValidateQRParams(qrData: event.qrData, origin: origin),
//       );

//       qrResult.fold(
//         (error) => emit(AuthError(error.message)),
//         (qrResponse) async {
//           // Use the credentials from QR response to login
//           final loginResult = await _signInUseCase(
//             SignInParams(email: qrResponse.email, password: qrResponse.password),
//           );

//           loginResult.fold(
//             (error) => emit(AuthError(error.message)),
//             (user) => emit(AuthAuthenticated(user)),
//           );
//         },
//       );
//     } catch (e) {
//       emit(AuthError('QR login failed: ${e.toString()}'));
//     }
//   }

//   Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
//     try {
//       final result = await _signOutUseCase();

//       result.fold(
//         (error) => emit(AuthError(error.message)),
//         (_) => emit(AuthUnauthenticated()),
//       );
//     } catch (e) {
//       emit(AuthError('Logout failed: ${e.toString()}'));
//     }
//   }
// }
