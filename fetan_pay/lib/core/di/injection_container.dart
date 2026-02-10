import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

import '../../features/transactions/data/services/transaction_api_service.dart';
import '../../features/transactions/data/repositories/transaction_repository_impl.dart';
import '../../features/transactions/domain/repositories/transaction_repository.dart';
import '../../features/transactions/domain/usecases/list_transactions_usecase.dart';
import '../../features/transactions/domain/usecases/get_transaction_usecase.dart';
import '../../features/transactions/domain/usecases/verify_qr_usecase.dart';
import '../../features/transactions/domain/usecases/get_receiver_accounts_usecase.dart';
import '../../features/transactions/domain/usecases/create_order_usecase.dart';
import '../../features/transactions/presentation/bloc/transaction_bloc.dart';

import '../../features/vendors/data/services/merchant_users_api_service.dart';
import '../../features/vendors/data/repositories/merchant_users_repository_impl.dart';
import '../../features/vendors/domain/repositories/merchant_users_repository.dart';
import '../../features/vendors/domain/usecases/get_merchant_users.dart';
import '../../features/vendors/domain/usecases/merchant_users_usecases.dart';
import '../../features/vendors/presentation/bloc/merchant_users_bloc.dart';

import '../../features/bank_accounts/data/services/payment_provider_api_service.dart';
import '../../features/bank_accounts/data/repositories/payment_provider_repository_impl.dart';
import '../../features/bank_accounts/domain/repositories/payment_provider_repository.dart';
import '../../features/bank_accounts/domain/usecases/get_payment_providers_usecase.dart';
import '../../features/bank_accounts/domain/usecases/set_active_receiver_account_usecase.dart';
import '../../features/bank_accounts/domain/usecases/disable_receiver_account_usecase.dart';
import '../../features/bank_accounts/domain/usecases/enable_receiver_account_usecase.dart';
import '../../features/bank_accounts/presentation/bloc/payment_provider_bloc.dart';

import '../../features/subscription/data/services/subscription_api_service.dart';
import '../../features/subscription/data/repositories/subscription_repository_impl.dart';
import '../../features/subscription/domain/repositories/subscription_repository.dart';
import '../../features/subscription/domain/usecases/get_public_plans_usecase.dart';
import '../../features/subscription/domain/usecases/get_merchant_subscription_usecase.dart';
import '../../features/subscription/domain/usecases/get_billing_transactions_usecase.dart';
import '../../features/subscription/domain/usecases/upgrade_merchant_plan_usecase.dart';
import '../../features/subscription/presentation/bloc/subscription_bloc.dart';

final getIt = GetIt.instance;

@InjectableInit()
Future<void> configureDependencies() async {
  await _registerCoreDependencies();
  await _registerAuthDependencies();
  await _registerScanDependencies();
  await _registerTipDependencies();
  await _registerHistoryDependencies();
  await _registerTransactionDependencies();
  await _registerMerchantUsersDependencies();
  await _registerPaymentProviderDependencies();
  await _registerSubscriptionDependencies();
}

/// Register core dependencies
Future<void> _registerCoreDependencies() async {
  // External dependencies
  getIt.registerLazySingleton<Connectivity>(() => Connectivity());

  // Register SharedPreferences
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerLazySingleton<SharedPreferences>(() => sharedPreferences);

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

/// Register transaction-related dependencies
Future<void> _registerTransactionDependencies() async {
  // Data layer
  getIt.registerLazySingleton<TransactionApiService>(
    () => TransactionApiService(dioClient: getIt<DioClient>()),
  );

  getIt.registerLazySingleton<TransactionRepository>(
    () => TransactionRepositoryImpl(
      apiService: getIt<TransactionApiService>(),
      networkInfo: getIt<NetworkInfo>(),
      sharedPreferences: getIt<SharedPreferences>(),
    ),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<ListTransactionsUseCase>(
    () => ListTransactionsUseCase(getIt<TransactionRepository>()),
  );

  getIt.registerLazySingleton<GetTransactionUseCase>(
    () => GetTransactionUseCase(getIt<TransactionRepository>()),
  );

  getIt.registerLazySingleton<VerifyQrUseCase>(
    () => VerifyQrUseCase(getIt<TransactionRepository>()),
  );

  getIt.registerLazySingleton<GetReceiverAccountsUseCase>(
    () => GetReceiverAccountsUseCase(getIt<TransactionRepository>()),
  );

  getIt.registerLazySingleton<CreateOrderUseCase>(
    () => CreateOrderUseCase(getIt<TransactionRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<TransactionBloc>(
    () => TransactionBloc(
      listTransactionsUseCase: getIt<ListTransactionsUseCase>(),
      getTransactionUseCase: getIt<GetTransactionUseCase>(),
      verifyQrUseCase: getIt<VerifyQrUseCase>(),
      getReceiverAccountsUseCase: getIt<GetReceiverAccountsUseCase>(),
      createOrderUseCase: getIt<CreateOrderUseCase>(),
    ),
  );
}

/// Register merchant users-related dependencies
Future<void> _registerMerchantUsersDependencies() async {
  // Data layer
  getIt.registerLazySingleton<MerchantUsersApiService>(
    () => MerchantUsersApiServiceImpl(getIt<DioClient>()),
  );

  getIt.registerLazySingleton<MerchantUsersRepository>(
    () => MerchantUsersRepositoryImpl(
      apiService: getIt<MerchantUsersApiService>(),
      networkInfo: getIt<NetworkInfo>(),
    ),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<GetMerchantUsers>(
    () => GetMerchantUsers(getIt<MerchantUsersRepository>()),
  );

  getIt.registerLazySingleton<GetMerchantUser>(
    () => GetMerchantUser(getIt<MerchantUsersRepository>()),
  );

  getIt.registerLazySingleton<CreateMerchantUser>(
    () => CreateMerchantUser(getIt<MerchantUsersRepository>()),
  );

  getIt.registerLazySingleton<UpdateMerchantUser>(
    () => UpdateMerchantUser(getIt<MerchantUsersRepository>()),
  );

  getIt.registerLazySingleton<DeactivateMerchantUser>(
    () => DeactivateMerchantUser(getIt<MerchantUsersRepository>()),
  );

  getIt.registerLazySingleton<ActivateMerchantUser>(
    () => ActivateMerchantUser(getIt<MerchantUsersRepository>()),
  );

  getIt.registerLazySingleton<GetUserQRCode>(
    () => GetUserQRCode(getIt<MerchantUsersRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<MerchantUsersBloc>(
    () => MerchantUsersBloc(
      getMerchantUsers: getIt<GetMerchantUsers>(),
      getMerchantUser: getIt<GetMerchantUser>(),
      createMerchantUser: getIt<CreateMerchantUser>(),
      updateMerchantUser: getIt<UpdateMerchantUser>(),
      deactivateMerchantUser: getIt<DeactivateMerchantUser>(),
      activateMerchantUser: getIt<ActivateMerchantUser>(),
      getUserQRCode: getIt<GetUserQRCode>(),
    ),
  );
}

/// Register payment provider-related dependencies
Future<void> _registerPaymentProviderDependencies() async {
  // Data layer
  getIt.registerLazySingleton<PaymentProviderApiService>(
    () => PaymentProviderApiService(dioClient: getIt<DioClient>()),
  );

  getIt.registerLazySingleton<PaymentProviderRepository>(
    () => PaymentProviderRepositoryImpl(
      apiService: getIt<PaymentProviderApiService>(),
      networkInfo: getIt<NetworkInfo>(),
    ),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<GetPaymentProvidersUseCase>(
    () => GetPaymentProvidersUseCase(getIt<PaymentProviderRepository>()),
  );

  getIt.registerLazySingleton<SetActiveReceiverAccountUseCase>(
    () => SetActiveReceiverAccountUseCase(getIt<PaymentProviderRepository>()),
  );

  getIt.registerLazySingleton<DisableReceiverAccountUseCase>(
    () => DisableReceiverAccountUseCase(getIt<PaymentProviderRepository>()),
  );

  getIt.registerLazySingleton<EnableReceiverAccountUseCase>(
    () => EnableReceiverAccountUseCase(getIt<PaymentProviderRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<PaymentProviderBloc>(
    () => PaymentProviderBloc(
      getPaymentProvidersUseCase: getIt<GetPaymentProvidersUseCase>(),
      getReceiverAccountsUseCase: getIt<GetReceiverAccountsUseCase>(),
      setActiveReceiverAccountUseCase: getIt<SetActiveReceiverAccountUseCase>(),
      disableReceiverAccountUseCase: getIt<DisableReceiverAccountUseCase>(),
      enableReceiverAccountUseCase: getIt<EnableReceiverAccountUseCase>(),
    ),
  );
}

/// Register subscription-related dependencies
Future<void> _registerSubscriptionDependencies() async {
  // Data layer
  getIt.registerLazySingleton<SubscriptionApiService>(
    () => SubscriptionApiServiceImpl(getIt<DioClient>()),
  );

  getIt.registerLazySingleton<SubscriptionRepository>(
    () => SubscriptionRepositoryImpl(
      apiService: getIt<SubscriptionApiService>(),
      networkInfo: getIt<NetworkInfo>(),
    ),
  );

  // Domain layer - Use cases
  getIt.registerLazySingleton<GetPublicPlansUseCase>(
    () => GetPublicPlansUseCase(getIt<SubscriptionRepository>()),
  );

  getIt.registerLazySingleton<GetMerchantSubscriptionUseCase>(
    () => GetMerchantSubscriptionUseCase(getIt<SubscriptionRepository>()),
  );

  getIt.registerLazySingleton<GetBillingTransactionsUseCase>(
    () => GetBillingTransactionsUseCase(getIt<SubscriptionRepository>()),
  );

  getIt.registerLazySingleton<UpgradeMerchantPlanUseCase>(
    () => UpgradeMerchantPlanUseCase(getIt<SubscriptionRepository>()),
  );

  // Presentation layer - BLoC
  getIt.registerFactory<SubscriptionBloc>(
    () => SubscriptionBloc(
      getPublicPlansUseCase: getIt<GetPublicPlansUseCase>(),
      getMerchantSubscriptionUseCase: getIt<GetMerchantSubscriptionUseCase>(),
      getBillingTransactionsUseCase: getIt<GetBillingTransactionsUseCase>(),
      upgradeMerchantPlanUseCase: getIt<UpgradeMerchantPlanUseCase>(),
    ),
  );
}

/// Reset all dependencies (useful for testing)
Future<void> resetDependencies() async {
  await getIt.reset();
}
