import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/transaction_repository.dart';
import '../../data/models/transaction_models.dart';

class GetTransactionUseCase
    implements UseCase<TransactionRecord, GetTransactionParams> {
  final TransactionRepository repository;

  GetTransactionUseCase(this.repository);

  @override
  Future<Either<Failure, TransactionRecord>> call(
    GetTransactionParams params,
  ) async {
    return await repository.getTransaction(params.idOrReference);
  }
}

class GetTransactionParams extends Equatable {
  final String idOrReference;

  const GetTransactionParams({required this.idOrReference});

  @override
  List<Object> get props => [idOrReference];
}
