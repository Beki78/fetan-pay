// import 'package:flutter_test/flutter_test.dart';
// import 'package:bloc_test/bloc_test.dart';
// import 'package:mockito/mockito.dart';
// import 'package:mockito/annotations.dart';
// import 'package:dartz/dartz.dart';

// import 'package:fetan_pay/features/auth/presentation/bloc/auth_bloc.dart';
// import 'package:fetan_pay/features/auth/domain/usecases/sign_in_usecase.dart';
// import 'package:fetan_pay/features/auth/domain/usecases/sign_out_usecase.dart';
// import 'package:fetan_pay/features/auth/domain/usecases/get_current_user_usecase.dart';
// import 'package:fetan_pay/features/auth/domain/usecases/validate_qr_usecase.dart';
// import 'package:fetan_pay/features/auth/domain/repositories/auth_repository.dart';
// import 'package:fetan_pay/features/auth/data/models/user_model.dart';
// import 'package:fetan_pay/core/error/failures.dart';

// import 'auth_bloc_login_test.mocks.dart';

// @GenerateMocks([
//   SignInUseCase,
//   SignOutUseCase,
//   GetCurrentUserUseCase,
//   ValidateQRUseCase,
//   AuthRepository,
// ])
// void main() {
//   late AuthBloc authBloc;
//   late MockSignInUseCase mockSignInUseCase;
//   late MockSignOutUseCase mockSignOutUseCase;
//   late MockGetCurrentUserUseCase mockGetCurrentUserUseCase;
//   late MockValidateQRUseCase mockValidateQRUseCase;
//   late MockAuthRepository mockAuthRepository;

//   setUp(() {
//     mockSignInUseCase = MockSignInUseCase();
//     mockSignOutUseCase = MockSignOutUseCase();
//     mockGetCurrentUserUseCase = MockGetCurrentUserUseCase();
//     mockValidateQRUseCase = MockValidateQRUseCase();
//     mockAuthRepository = MockAuthRepository();

//     authBloc = AuthBloc(
//       signInUseCase: mockSignInUseCase,
//       signOutUseCase: mockSignOutUseCase,
//       getCurrentUserUseCase: mockGetCurrentUserUseCase,
//       validateQRUseCase: mockValidateQRUseCase,
//       authRepository: mockAuthRepository,
//     );
//   });

//   tearDown(() {
//     authBloc.close();
//   });

//   group('AuthBloc Login Tests', () {
//     const testEmail = 'test@example.com';
//     const testPassword = 'password123';
//     final testUser = User(
//       id: '1',
//       email: testEmail,
//       name: 'Test User',
//       role: UserRole.waiter,
//       merchantId: 'merchant1',
//       isActive: true,
//       createdAt: DateTime.now(),
//       updatedAt: DateTime.now(),
//     );

//     blocTest<AuthBloc, AuthState>(
//       'emits [AuthLoading, AuthAuthenticated] when login is successful',
//       build: () {
//         when(mockSignInUseCase(any)).thenAnswer((_) async => Right(testUser));
//         return authBloc;
//       },
//       act: (bloc) =>
//           bloc.add(LoginRequested(testEmail, testPassword, UserRole.waiter)),
//       expect: () => [AuthLoading(), AuthAuthenticated(testUser)],
//       verify: (_) {
//         verify(
//           mockSignInUseCase(
//             SignInParams(email: testEmail, password: testPassword),
//           ),
//         ).called(1);
//       },
//     );

//     blocTest<AuthBloc, AuthState>(
//       'emits [AuthLoading, AuthError] when login fails',
//       build: () {
//         when(mockSignInUseCase(any)).thenAnswer(
//           (_) async => const Left(AuthFailure(message: 'Invalid credentials')),
//         );
//         return authBloc;
//       },
//       act: (bloc) =>
//           bloc.add(LoginRequested(testEmail, 'wrongpassword', UserRole.waiter)),
//       expect: () => [AuthLoading(), const AuthError('Invalid credentials')],
//       verify: (_) {
//         verify(
//           mockSignInUseCase(
//             SignInParams(email: testEmail, password: 'wrongpassword'),
//           ),
//         ).called(1);
//       },
//     );

//     blocTest<AuthBloc, AuthState>(
//       'emits [AuthLoading, AuthAuthenticated] for admin login',
//       build: () {
//         final adminUser = testUser.copyWith(role: UserRole.admin);
//         when(mockSignInUseCase(any)).thenAnswer((_) async => Right(adminUser));
//         return authBloc;
//       },
//       act: (bloc) =>
//           bloc.add(LoginRequested(testEmail, testPassword, UserRole.admin)),
//       expect: () => [
//         AuthLoading(),
//         AuthAuthenticated(testUser.copyWith(role: UserRole.admin)),
//       ],
//       verify: (_) {
//         verify(
//           mockSignInUseCase(
//             SignInParams(email: testEmail, password: testPassword),
//           ),
//         ).called(1);
//       },
//     );

//     blocTest<AuthBloc, AuthState>(
//       'emits [AuthLoading, AuthError] when sign in use case throws exception',
//       build: () {
//         when(mockSignInUseCase(any)).thenThrow(Exception('Network error'));
//         return authBloc;
//       },
//       act: (bloc) =>
//           bloc.add(LoginRequested(testEmail, testPassword, UserRole.waiter)),
//       expect: () => [AuthLoading(), const AuthError('Network error')],
//     );
//   });

//   group('AuthBloc CheckAuthStatus Tests', () {
//     final testUser = User(
//       id: '1',
//       email: 'test@example.com',
//       name: 'Test User',
//       role: UserRole.waiter,
//       merchantId: 'merchant1',
//       isActive: true,
//       createdAt: DateTime.now(),
//       updatedAt: DateTime.now(),
//     );

//     blocTest<AuthBloc, AuthState>(
//       'emits [AuthLoading, AuthAuthenticated] when user is authenticated',
//       build: () {
//         when(
//           mockAuthRepository.isAuthenticated(),
//         ).thenAnswer((_) async => true);
//         when(
//           mockGetCurrentUserUseCase(),
//         ).thenAnswer((_) async => Right(testUser));
//         return authBloc;
//       },
//       act: (bloc) => bloc.add(CheckAuthStatus()),
//       expect: () => [AuthLoading(), AuthAuthenticated(testUser)],
//     );

//     blocTest<AuthBloc, AuthState>(
//       'emits [AuthLoading, AuthUnauthenticated] when user is not authenticated',
//       build: () {
//         when(
//           mockAuthRepository.isAuthenticated(),
//         ).thenAnswer((_) async => false);
//         return authBloc;
//       },
//       act: (bloc) => bloc.add(CheckAuthStatus()),
//       expect: () => [AuthLoading(), AuthUnauthenticated()],
//     );
//   });
// }
