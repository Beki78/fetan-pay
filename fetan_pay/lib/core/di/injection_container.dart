import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../network/dio_client.dart';
import '../network/network_info.dart';
import '../../features/auth/data/services/session_manager.dart';
import '../../features/auth/data/services/auth_api_service.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/sign_in_usecase.dart';
import '../../features/auth/domain/usecases/sign_out_usecase.dart';
import '../../features/auth/domain/usecases/get_current_user_usecase.dart';
import '../../features/auth/domain/usecases/validate_qr_usecase.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';

import '../../features/scan/data/services/scan_api_service.dart';
import '../../features/scan/data/repositories/scan_repository_impl.dart';
import '../../features/scan/domain/repositories/scan_repository.dart';
import '../../features/scan/domain/usecases/get_active_accounts_usecase.dart';
import '../../features/scan/domain/usecases/verify_payment_usecase.dart';
import '../../features/scan/presentation/bloc/scan_bloc.dart';

import '../../features/tip/data/services/tip_api_service.dart';
import '../../features/tip/data/repositories/tip_repository_impl.dart';
import '../../features/tip/domain/repositories/tip_repository.dart';
import '../../features/tip/domain/usecases/get_tips_summary_usecase.dart';
import '../../features/tip/domain/usecases/list_tips_usecase.dart';
import '../../features/tip/presentation/bloc/tip_bloc.dart';

import '../../features/history/data/services/history_api_service.dart';
import '../../features/history/data/repositories/history_repository_impl.dart';
import '../../features/history/domain/repositories/history_repository.dart';
import '../../features/history/domain/usecases/list_verification_history_usecase.dart';
import '../../features/history/presentation/bloc/history_bloc.dart';

final getIt = GetIt.instance;

@InjectableInit()
Future<void> configureDependencies() async {
  await _registerCoreDependencies();
  await _registerAuthDependencies();
  await _registerScanDependencies();
  await _registerTipDependencies();
  await _registerHistoryDependencies();
}

/// Register core dependencies
Future<void> _registerCoreDependencies() async {
  // External dependencies
  getIt.registerLazySingleton<Connectivity>(() => Connectivity());

  // Core services
  getIt.registerLazySingleton<DioClient>(() => DioClient());
  getIt.registerLazySingleton<NetworkInfo>(
    () => NetworkInfoImpl(getIt<Connectivity>()),
  );
  getIt.registerLazySingleton<SessionManager>(() => SessionManagerImpl());
}

/// Register authentication-related dependencies
Future<void> _registerAuthDependencies() async {
  // Data layer
  getIt.registerLazySingleton<AuthApiService>(
    () => AuthApiServiceImpl(getIt<DioClient>()),
  );

  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      authApiService: getIt<AuthApiService>(),
      sessionManager: getIt<SessionManager>(),
      networkInfo: getIt<NetworkInfo>(),
    ),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<SignInUseCase>(
    () => SignInUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<SignOutUseCase>(
    () => SignOutUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<GetCurrentUserUseCase>(
    () => GetCurrentUserUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<ValidateQRUseCase>(
    () => ValidateQRUseCase(getIt<AuthRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<AuthBloc>(
    () => AuthBloc(
      signInUseCase: getIt<SignInUseCase>(),
      signOutUseCase: getIt<SignOutUseCase>(),
      getCurrentUserUseCase: getIt<GetCurrentUserUseCase>(),
      validateQRUseCase: getIt<ValidateQRUseCase>(),
      authRepository: getIt<AuthRepository>(),
    ),
  );
}

/// Register scan-related dependencies
Future<void> _registerScanDependencies() async {
  // Data layer
  getIt.registerLazySingleton<ScanApiService>(
    () => ScanApiServiceImpl(getIt<DioClient>()),
  );

  getIt.registerLazySingleton<ScanRepository>(
    () => ScanRepositoryImpl(getIt<ScanApiService>()),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<GetActiveAccountsUseCase>(
    () => GetActiveAccountsUseCase(getIt<ScanRepository>()),
  );

  getIt.registerLazySingleton<VerifyPaymentUseCase>(
    () => VerifyPaymentUseCase(getIt<ScanRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<ScanBloc>(
    () => ScanBloc(
      getActiveAccountsUseCase: getIt<GetActiveAccountsUseCase>(),
      verifyPaymentUseCase: getIt<VerifyPaymentUseCase>(),
    ),
  );
}

/// Register tip-related dependencies
Future<void> _registerTipDependencies() async {
  // Data layer
  getIt.registerLazySingleton<TipApiService>(
    () => TipApiServiceImpl(getIt<DioClient>()),
  );

  getIt.registerLazySingleton<TipRepository>(
    () => TipRepositoryImpl(
      tipApiService: getIt<TipApiService>(),
      networkInfo: getIt<NetworkInfo>(),
    ),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<GetTipsSummaryUseCase>(
    () => GetTipsSummaryUseCase(getIt<TipRepository>()),
  );

  getIt.registerLazySingleton<ListTipsUseCase>(
    () => ListTipsUseCase(getIt<TipRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<TipBloc>(
    () => TipBloc(
      getTipsSummaryUseCase: getIt<GetTipsSummaryUseCase>(),
      listTipsUseCase: getIt<ListTipsUseCase>(),
    ),
  );
}

/// Register history-related dependencies
Future<void> _registerHistoryDependencies() async {
  // Data layer
  getIt.registerLazySingleton<HistoryApiService>(
    () => HistoryApiServiceImpl(getIt<DioClient>()),
  );

  getIt.registerLazySingleton<HistoryRepository>(
    () => HistoryRepositoryImpl(getIt<HistoryApiService>()),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<ListVerificationHistoryUseCase>(
    () => ListVerificationHistoryUseCase(getIt<HistoryRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<HistoryBloc>(
    () => HistoryBloc(
      listVerificationHistoryUseCase: getIt<ListVerificationHistoryUseCase>(),
    ),
  );
}

/// Reset all dependencies (useful for testing)
Future<void> resetDependencies() async {
  await getIt.reset();
}
