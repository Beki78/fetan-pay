import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import '../../data/models/transaction_models.dart';
import '../../domain/usecases/list_transactions_usecase.dart';
import '../../domain/usecases/get_transaction_usecase.dart';
import '../../domain/usecases/verify_qr_usecase.dart';
import '../../domain/usecases/get_receiver_accounts_usecase.dart';
import '../../domain/usecases/create_order_usecase.dart';
import 'transaction_event.dart';
import 'transaction_state.dart';

class TransactionBloc extends Bloc<TransactionEvent, TransactionState> {
  final ListTransactionsUseCase _listTransactionsUseCase;
  final GetTransactionUseCase _getTransactionUseCase;
  final VerifyQrUseCase _verifyQrUseCase;
  final GetReceiverAccountsUseCase _getReceiverAccountsUseCase;
  final CreateOrderUseCase _createOrderUseCase;

  TransactionBloc({
    required ListTransactionsUseCase listTransactionsUseCase,
    required GetTransactionUseCase getTransactionUseCase,
    required VerifyQrUseCase verifyQrUseCase,
    required GetReceiverAccountsUseCase getReceiverAccountsUseCase,
    required CreateOrderUseCase createOrderUseCase,
  }) : _listTransactionsUseCase = listTransactionsUseCase,
       _getTransactionUseCase = getTransactionUseCase,
       _verifyQrUseCase = verifyQrUseCase,
       _getReceiverAccountsUseCase = getReceiverAccountsUseCase,
       _createOrderUseCase = createOrderUseCase,
       super(TransactionInitial()) {
    on<LoadTransactions>(_onLoadTransactions);
    on<LoadMoreTransactions>(_onLoadMoreTransactions);
    on<RefreshTransactions>(_onRefreshTransactions);
    on<FilterTransactions>(_onFilterTransactions);
    on<GetTransactionDetails>(_onGetTransactionDetails);
    on<VerifyTransactionFromQr>(_onVerifyTransactionFromQr);
    on<ClearTransactionError>(_onClearTransactionError);
    on<ResetTransactionState>(_onResetTransactionState);
    on<GetReceiverAccounts>(_onGetReceiverAccounts);
    on<CreatePaymentIntent>(_onCreatePaymentIntent);
  }

  Future<void> _onLoadTransactions(
    LoadTransactions event,
    Emitter<TransactionState> emit,
  ) async {
    try {
      print('=== TRANSACTION BLOC DEBUG ===');
      print(
        'Loading transactions - Provider: ${event.provider}, Status: ${event.status}',
      );
      print(
        'Page: ${event.page}, PageSize: ${event.pageSize}, IsRefresh: ${event.isRefresh}',
      );

      if (!event.isRefresh) {
        emit(TransactionLoading());
      }

      final result = await _listTransactionsUseCase(
        ListTransactionsParams(
          provider: event.provider,
          status: event.status,
          page: event.page,
          pageSize: event.pageSize,
        ),
      );

      result.fold(
        (failure) {
          print('Failed to load transactions: ${failure.message}');

          // If we have cached data in the error, show it
          if (failure.message.contains('cached')) {
            // This is a network error but we have cached data
            // The repository should handle this case
          }

          emit(TransactionError(message: failure.message));
        },
        (response) {
          print('Successfully loaded ${response.data.length} transactions');

          final summary = TransactionSummary.fromTransactions(response.data);
          final hasReachedMax = response.data.length < event.pageSize;

          emit(
            TransactionLoaded(
              transactions: response.data,
              summary: summary,
              hasReachedMax: hasReachedMax,
              currentPage: event.page,
              currentProviderFilter: event.provider,
              currentStatusFilter: event.status,
            ),
          );
        },
      );
    } catch (e) {
      print('=== TRANSACTION BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(TransactionError(message: 'An unexpected error occurred: $e'));
    }
  }

  Future<void> _onLoadMoreTransactions(
    LoadMoreTransactions event,
    Emitter<TransactionState> emit,
  ) async {
    final currentState = state;
    if (currentState is! TransactionLoaded || currentState.hasReachedMax) {
      return;
    }

    try {
      print('=== LOAD MORE TRANSACTIONS DEBUG ===');
      print(
        'Loading more transactions - Current page: ${currentState.currentPage}',
      );

      emit(
        TransactionLoadingMore(
          currentTransactions: currentState.transactions,
          summary: currentState.summary,
        ),
      );

      final nextPage = currentState.currentPage + 1;
      final result = await _listTransactionsUseCase(
        ListTransactionsParams(
          provider: currentState.currentProviderFilter,
          status: currentState.currentStatusFilter,
          page: nextPage,
          pageSize: 20,
        ),
      );

      result.fold(
        (failure) {
          print('Failed to load more transactions: ${failure.message}');
          // Return to previous state on error
          emit(currentState);
        },
        (response) {
          print(
            'Successfully loaded ${response.data.length} more transactions',
          );

          final allTransactions = [
            ...currentState.transactions,
            ...response.data,
          ];
          final summary = TransactionSummary.fromTransactions(allTransactions);
          final hasReachedMax = response.data.length < 20;

          emit(
            TransactionLoaded(
              transactions: allTransactions,
              summary: summary,
              hasReachedMax: hasReachedMax,
              currentPage: nextPage,
              currentProviderFilter: currentState.currentProviderFilter,
              currentStatusFilter: currentState.currentStatusFilter,
            ),
          );
        },
      );
    } catch (e) {
      print('=== LOAD MORE TRANSACTIONS ERROR ===');
      print('Unexpected error: $e');
      // Return to previous state on error
      emit(currentState);
    }
  }

  Future<void> _onRefreshTransactions(
    RefreshTransactions event,
    Emitter<TransactionState> emit,
  ) async {
    final currentState = state;

    TransactionProvider? currentProvider;
    TransactionStatus? currentStatus;

    if (currentState is TransactionLoaded) {
      currentProvider = currentState.currentProviderFilter;
      currentStatus = currentState.currentStatusFilter;
    }

    add(
      LoadTransactions(
        provider: currentProvider,
        status: currentStatus,
        page: 1,
        pageSize: 20,
        isRefresh: true,
      ),
    );
  }

  Future<void> _onFilterTransactions(
    FilterTransactions event,
    Emitter<TransactionState> emit,
  ) async {
    print('=== FILTER TRANSACTIONS DEBUG ===');
    print(
      'Filtering transactions - Provider: ${event.provider}, Status: ${event.status}',
    );

    add(
      LoadTransactions(
        provider: event.provider,
        status: event.status,
        page: 1,
        pageSize: 20,
      ),
    );
  }

  Future<void> _onGetTransactionDetails(
    GetTransactionDetails event,
    Emitter<TransactionState> emit,
  ) async {
    try {
      print('=== GET TRANSACTION DETAILS DEBUG ===');
      print('Getting transaction details: ${event.idOrReference}');

      emit(TransactionDetailsLoading());

      final result = await _getTransactionUseCase(
        GetTransactionParams(idOrReference: event.idOrReference),
      );

      result.fold(
        (failure) {
          print('Failed to get transaction details: ${failure.message}');
          emit(TransactionDetailsError(message: failure.message));
        },
        (transaction) {
          print('Successfully loaded transaction details: ${transaction.id}');
          emit(TransactionDetailsLoaded(transaction: transaction));
        },
      );
    } catch (e) {
      print('=== GET TRANSACTION DETAILS ERROR ===');
      print('Unexpected error: $e');
      emit(
        TransactionDetailsError(message: 'An unexpected error occurred: $e'),
      );
    }
  }

  Future<void> _onVerifyTransactionFromQr(
    VerifyTransactionFromQr event,
    Emitter<TransactionState> emit,
  ) async {
    try {
      print('=== VERIFY TRANSACTION FROM QR DEBUG ===');
      print('Verifying QR: ${event.qrUrl}');

      emit(TransactionVerifying());

      final result = await _verifyQrUseCase(
        VerifyQrParams(
          qrUrl: event.qrUrl,
          provider: event.provider,
          reference: event.reference,
          accountSuffix: event.accountSuffix,
        ),
      );

      result.fold(
        (failure) {
          print('Failed to verify transaction: ${failure.message}');
          emit(TransactionVerificationError(message: failure.message));
        },
        (verificationResult) {
          print('Successfully verified transaction');
          emit(TransactionVerified(verificationResult: verificationResult));

          // Refresh the transaction list after successful verification
          add(const RefreshTransactions());
        },
      );
    } catch (e) {
      print('=== VERIFY TRANSACTION FROM QR ERROR ===');
      print('Unexpected error: $e');
      emit(
        TransactionVerificationError(
          message: 'An unexpected error occurred: $e',
        ),
      );
    }
  }

  void _onClearTransactionError(
    ClearTransactionError event,
    Emitter<TransactionState> emit,
  ) {
    if (state is TransactionError) {
      final errorState = state as TransactionError;
      if (errorState.cachedTransactions != null &&
          errorState.cachedSummary != null) {
        emit(
          TransactionLoaded(
            transactions: errorState.cachedTransactions!,
            summary: errorState.cachedSummary!,
          ),
        );
      } else {
        emit(TransactionInitial());
      }
    } else if (state is TransactionDetailsError) {
      emit(TransactionInitial());
    } else if (state is TransactionVerificationError) {
      emit(TransactionInitial());
    }
  }

  void _onResetTransactionState(
    ResetTransactionState event,
    Emitter<TransactionState> emit,
  ) {
    emit(TransactionInitial());
  }

  Future<void> _onGetReceiverAccounts(
    GetReceiverAccounts event,
    Emitter<TransactionState> emit,
  ) async {
    try {
      print('=== GET RECEIVER ACCOUNTS BLOC DEBUG ===');
      print('Provider filter: ${event.provider}');

      emit(ReceiverAccountsLoading());

      final result = await _getReceiverAccountsUseCase(
        GetReceiverAccountsParams(provider: event.provider),
      );

      result.fold(
        (failure) {
          print('Failed to get receiver accounts: ${failure.message}');
          emit(ReceiverAccountsError(message: failure.message));
        },
        (response) {
          print(
            'Successfully loaded ${response.data.length} receiver accounts',
          );
          emit(ReceiverAccountsLoaded(accounts: response.data));
        },
      );
    } catch (e) {
      print('=== GET RECEIVER ACCOUNTS BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(ReceiverAccountsError(message: 'An unexpected error occurred: $e'));
    }
  }

  Future<void> _onCreatePaymentIntent(
    CreatePaymentIntent event,
    Emitter<TransactionState> emit,
  ) async {
    try {
      print('=== CREATE PAYMENT INTENT BLOC DEBUG ===');
      print('Amount: ${event.amount}');
      print('Provider: ${event.provider}');
      print('Payer name: ${event.payerName}');

      emit(PaymentIntentCreating());

      final input = CreateOrderInput(
        expectedAmount: event.amount,
        currency: 'ETB',
        provider: event.provider,
        payerName: event.payerName,
      );

      final result = await _createOrderUseCase(input);

      result.fold(
        (failure) {
          print('Failed to create payment intent: ${failure.message}');
          emit(PaymentIntentCreationError(message: failure.message));
        },
        (orderResponse) {
          print(
            'Successfully created payment intent: ${orderResponse.order.id}',
          );
          emit(PaymentIntentCreated(orderResponse: orderResponse));

          // Refresh the transaction list after successful creation
          add(const RefreshTransactions());
        },
      );
    } catch (e) {
      print('=== CREATE PAYMENT INTENT BLOC ERROR ===');
      print('Unexpected error: $e');
      emit(
        PaymentIntentCreationError(message: 'An unexpected error occurred: $e'),
      );
    }
  }
}
