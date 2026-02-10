import 'package:equatable/equatable.dart';
import '../../data/models/transaction_models.dart';

abstract class TransactionState extends Equatable {
  const TransactionState();

  @override
  List<Object?> get props => [];
}

class TransactionInitial extends TransactionState {}

class TransactionLoading extends TransactionState {}

class TransactionLoadingMore extends TransactionState {
  final List<TransactionRecord> currentTransactions;
  final TransactionSummary summary;

  const TransactionLoadingMore({
    required this.currentTransactions,
    required this.summary,
  });

  @override
  List<Object> get props => [currentTransactions, summary];
}

class TransactionLoaded extends TransactionState {
  final List<TransactionRecord> transactions;
  final TransactionSummary summary;
  final bool hasReachedMax;
  final int currentPage;
  final TransactionProvider? currentProviderFilter;
  final TransactionStatus? currentStatusFilter;

  const TransactionLoaded({
    required this.transactions,
    required this.summary,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.currentProviderFilter,
    this.currentStatusFilter,
  });

  TransactionLoaded copyWith({
    List<TransactionRecord>? transactions,
    TransactionSummary? summary,
    bool? hasReachedMax,
    int? currentPage,
    TransactionProvider? currentProviderFilter,
    TransactionStatus? currentStatusFilter,
  }) {
    return TransactionLoaded(
      transactions: transactions ?? this.transactions,
      summary: summary ?? this.summary,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      currentProviderFilter:
          currentProviderFilter ?? this.currentProviderFilter,
      currentStatusFilter: currentStatusFilter ?? this.currentStatusFilter,
    );
  }

  @override
  List<Object?> get props => [
    transactions,
    summary,
    hasReachedMax,
    currentPage,
    currentProviderFilter,
    currentStatusFilter,
  ];
}

class TransactionError extends TransactionState {
  final String message;
  final List<TransactionRecord>? cachedTransactions;
  final TransactionSummary? cachedSummary;

  const TransactionError({
    required this.message,
    this.cachedTransactions,
    this.cachedSummary,
  });

  @override
  List<Object?> get props => [message, cachedTransactions, cachedSummary];
}

class TransactionDetailsLoading extends TransactionState {}

class TransactionDetailsLoaded extends TransactionState {
  final TransactionRecord transaction;

  const TransactionDetailsLoaded({required this.transaction});

  @override
  List<Object> get props => [transaction];
}

class TransactionDetailsError extends TransactionState {
  final String message;

  const TransactionDetailsError({required this.message});

  @override
  List<Object> get props => [message];
}

class TransactionVerifying extends TransactionState {}

class TransactionVerified extends TransactionState {
  final Map<String, dynamic> verificationResult;

  const TransactionVerified({required this.verificationResult});

  @override
  List<Object> get props => [verificationResult];
}

class TransactionVerificationError extends TransactionState {
  final String message;

  const TransactionVerificationError({required this.message});

  @override
  List<Object> get props => [message];
}

class ReceiverAccountsLoading extends TransactionState {}

class ReceiverAccountsLoaded extends TransactionState {
  final List<ReceiverAccount> accounts;

  const ReceiverAccountsLoaded({required this.accounts});

  @override
  List<Object> get props => [accounts];
}

class ReceiverAccountsError extends TransactionState {
  final String message;

  const ReceiverAccountsError({required this.message});

  @override
  List<Object> get props => [message];
}

class PaymentIntentCreating extends TransactionState {}

class PaymentIntentCreated extends TransactionState {
  final CreateOrderResponse orderResponse;

  const PaymentIntentCreated({required this.orderResponse});

  @override
  List<Object> get props => [orderResponse];
}

class PaymentIntentCreationError extends TransactionState {
  final String message;

  const PaymentIntentCreationError({required this.message});

  @override
  List<Object> get props => [message];
}
