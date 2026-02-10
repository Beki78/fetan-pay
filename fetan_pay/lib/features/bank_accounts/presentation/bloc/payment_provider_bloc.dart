import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/usecases/usecase.dart';
import '../../domain/usecases/get_payment_providers_usecase.dart';
import '../../domain/usecases/set_active_receiver_account_usecase.dart';
import '../../domain/usecases/disable_receiver_account_usecase.dart';
import '../../domain/usecases/enable_receiver_account_usecase.dart';
import '../../../transactions/domain/usecases/get_receiver_accounts_usecase.dart';
import '../../../transactions/data/models/transaction_models.dart';
import '../../data/models/payment_provider_models.dart';
import 'payment_provider_event.dart';
import 'payment_provider_state.dart';

class PaymentProviderBloc
    extends Bloc<PaymentProviderEvent, PaymentProviderState> {
  final GetPaymentProvidersUseCase _getPaymentProvidersUseCase;
  final GetReceiverAccountsUseCase _getReceiverAccountsUseCase;
  final SetActiveReceiverAccountUseCase _setActiveReceiverAccountUseCase;
  final DisableReceiverAccountUseCase _disableReceiverAccountUseCase;
  final EnableReceiverAccountUseCase _enableReceiverAccountUseCase;

  PaymentProviderBloc({
    required GetPaymentProvidersUseCase getPaymentProvidersUseCase,
    required GetReceiverAccountsUseCase getReceiverAccountsUseCase,
    required SetActiveReceiverAccountUseCase setActiveReceiverAccountUseCase,
    required DisableReceiverAccountUseCase disableReceiverAccountUseCase,
    required EnableReceiverAccountUseCase enableReceiverAccountUseCase,
  }) : _getPaymentProvidersUseCase = getPaymentProvidersUseCase,
       _getReceiverAccountsUseCase = getReceiverAccountsUseCase,
       _setActiveReceiverAccountUseCase = setActiveReceiverAccountUseCase,
       _disableReceiverAccountUseCase = disableReceiverAccountUseCase,
       _enableReceiverAccountUseCase = enableReceiverAccountUseCase,
       super(PaymentProviderInitial()) {
    on<LoadPaymentProvidersAndAccounts>(_onLoadPaymentProvidersAndAccounts);
    on<ConfigureProvider>(_onConfigureProvider);
    on<EnableProvider>(_onEnableProvider);
    on<DisableProvider>(_onDisableProvider);
    on<ResetPaymentProviderState>(_onResetPaymentProviderState);
  }

  Future<void> _onLoadPaymentProvidersAndAccounts(
    LoadPaymentProvidersAndAccounts event,
    Emitter<PaymentProviderState> emit,
  ) async {
    try {
      print('=== PAYMENT PROVIDER BLOC DEBUG ===');
      print('Loading payment providers and receiver accounts');

      emit(PaymentProviderLoading());

      // Load both providers and receiver accounts in parallel
      final providersResult = await _getPaymentProvidersUseCase(NoParams());
      final accountsResult = await _getReceiverAccountsUseCase(
        const GetReceiverAccountsParams(),
      );

      // Check if both succeeded
      if (providersResult.isLeft() || accountsResult.isLeft()) {
        final errorMessage = providersResult.fold(
          (failure) => failure.message,
          (_) => accountsResult.fold(
            (failure) => failure.message,
            (_) => 'Unknown error',
          ),
        );
        print('Failed to load data: $errorMessage');
        emit(PaymentProviderError(message: errorMessage));
        return;
      }

      // Extract data
      final providers = providersResult.getOrElse(
        () => const PaymentProvidersResponse(providers: []),
      );
      final accounts = accountsResult.getOrElse(
        () => const ReceiverAccountsResponse(data: []),
      );

      print('Successfully loaded ${providers.providers.length} providers');
      print('Successfully loaded ${accounts.data.length} receiver accounts');

      emit(
        PaymentProviderLoaded(
          providers: providers.providers,
          receiverAccounts: accounts.data,
        ),
      );
    } catch (e) {
      print('=== PAYMENT PROVIDER BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(PaymentProviderError(message: 'An unexpected error occurred: $e'));
    }
  }

  Future<void> _onConfigureProvider(
    ConfigureProvider event,
    Emitter<PaymentProviderState> emit,
  ) async {
    try {
      print('=== CONFIGURE PROVIDER BLOC DEBUG ===');
      print('Provider: ${event.provider}');
      print('Account: ${event.accountNumber}');
      print('Enabled: ${event.isEnabled}');

      emit(ProviderConfiguring());

      final input = SetActiveReceiverAccountInput(
        provider: event.provider,
        receiverAccount: event.accountNumber,
        receiverName: event.accountHolderName,
        receiverLabel: '${event.provider} Merchant Receiver',
        enabled: event.isEnabled,
      );

      final result = await _setActiveReceiverAccountUseCase(input);

      result.fold(
        (failure) {
          print('Failed to configure provider: ${failure.message}');
          emit(ProviderConfigurationError(message: failure.message));
        },
        (response) {
          print('Successfully configured provider: ${event.provider}');
          emit(ProviderConfigured(provider: event.provider));

          // Reload data after configuration
          add(const LoadPaymentProvidersAndAccounts());
        },
      );
    } catch (e) {
      print('=== CONFIGURE PROVIDER BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(
        ProviderConfigurationError(message: 'An unexpected error occurred: $e'),
      );
    }
  }

  Future<void> _onEnableProvider(
    EnableProvider event,
    Emitter<PaymentProviderState> emit,
  ) async {
    try {
      print('=== ENABLE PROVIDER BLOC DEBUG ===');
      print('Provider: ${event.provider}');

      emit(ProviderEnabling());

      final result = await _enableReceiverAccountUseCase(
        EnableReceiverAccountParams(provider: event.provider),
      );

      result.fold(
        (failure) {
          print('Failed to enable provider: ${failure.message}');
          emit(ProviderEnableError(message: failure.message));
        },
        (response) {
          print('Successfully enabled provider: ${event.provider}');
          emit(ProviderEnabled(provider: event.provider));

          // Reload data after enabling
          add(const LoadPaymentProvidersAndAccounts());
        },
      );
    } catch (e) {
      print('=== ENABLE PROVIDER BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(ProviderEnableError(message: 'An unexpected error occurred: $e'));
    }
  }

  Future<void> _onDisableProvider(
    DisableProvider event,
    Emitter<PaymentProviderState> emit,
  ) async {
    try {
      print('=== DISABLE PROVIDER BLOC DEBUG ===');
      print('Provider: ${event.provider}');

      emit(ProviderDisabling());

      final result = await _disableReceiverAccountUseCase(
        DisableReceiverAccountParams(provider: event.provider),
      );

      result.fold(
        (failure) {
          print('Failed to disable provider: ${failure.message}');
          emit(ProviderDisableError(message: failure.message));
        },
        (response) {
          print('Successfully disabled provider: ${event.provider}');
          emit(ProviderDisabled(provider: event.provider));

          // Reload data after disabling
          add(const LoadPaymentProvidersAndAccounts());
        },
      );
    } catch (e) {
      print('=== DISABLE PROVIDER BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(ProviderDisableError(message: 'An unexpected error occurred: $e'));
    }
  }

  void _onResetPaymentProviderState(
    ResetPaymentProviderState event,
    Emitter<PaymentProviderState> emit,
  ) {
    emit(PaymentProviderInitial());
  }
}
