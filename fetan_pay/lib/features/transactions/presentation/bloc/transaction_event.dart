import 'package:equatable/equatable.dart';
import '../../data/models/transaction_models.dart';

abstract class TransactionEvent extends Equatable {
  const TransactionEvent();

  @override
  List<Object?> get props => [];
}

class LoadTransactions extends TransactionEvent {
  final TransactionProvider? provider;
  final TransactionStatus? status;
  final int page;
  final int pageSize;
  final bool isRefresh;

  const LoadTransactions({
    this.provider,
    this.status,
    this.page = 1,
    this.pageSize = 20,
    this.isRefresh = false,
  });

  @override
  List<Object?> get props => [provider, status, page, pageSize, isRefresh];
}

class LoadMoreTransactions extends TransactionEvent {
  const LoadMoreTransactions();
}

class RefreshTransactions extends TransactionEvent {
  const RefreshTransactions();
}

class FilterTransactions extends TransactionEvent {
  final TransactionProvider? provider;
  final TransactionStatus? status;

  const FilterTransactions({this.provider, this.status});

  @override
  List<Object?> get props => [provider, status];
}

class GetTransactionDetails extends TransactionEvent {
  final String idOrReference;

  const GetTransactionDetails({required this.idOrReference});

  @override
  List<Object> get props => [idOrReference];
}

class VerifyTransactionFromQr extends TransactionEvent {
  final String qrUrl;
  final TransactionProvider? provider;
  final String? reference;
  final String? accountSuffix;

  const VerifyTransactionFromQr({
    required this.qrUrl,
    this.provider,
    this.reference,
    this.accountSuffix,
  });

  @override
  List<Object?> get props => [qrUrl, provider, reference, accountSuffix];
}

class ClearTransactionError extends TransactionEvent {
  const ClearTransactionError();
}

class ResetTransactionState extends TransactionEvent {
  const ResetTransactionState();
}

class GetReceiverAccounts extends TransactionEvent {
  final TransactionProvider? provider;

  const GetReceiverAccounts({this.provider});

  @override
  List<Object?> get props => [provider];
}

class CreatePaymentIntent extends TransactionEvent {
  final double amount;
  final TransactionProvider provider;
  final String payerName;
  final String? notes;

  const CreatePaymentIntent({
    required this.amount,
    required this.provider,
    required this.payerName,
    this.notes,
  });

  @override
  List<Object?> get props => [amount, provider, payerName, notes];
}
