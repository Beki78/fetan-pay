import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/transaction_repository.dart';
import '../../data/models/transaction_models.dart';

class ListTransactionsUseCase
    implements UseCase<TransactionListResponse, ListTransactionsParams> {
  final TransactionRepository repository;

  ListTransactionsUseCase(this.repository);

  @override
  Future<Either<Failure, TransactionListResponse>> call(
    ListTransactionsParams params,
  ) async {
    return await repository.listTransactions(
      provider: params.provider,
      status: params.status,
      page: params.page,
      pageSize: params.pageSize,
    );
  }
}

class ListTransactionsParams extends Equatable {
  final TransactionProvider? provider;
  final TransactionStatus? status;
  final int page;
  final int pageSize;

  const ListTransactionsParams({
    this.provider,
    this.status,
    this.page = 1,
    this.pageSize = 20,
  });

  @override
  List<Object?> get props => [provider, status, page, pageSize];
}
