import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/transaction_repository.dart';
import '../../data/models/transaction_models.dart';

class GetReceiverAccountsUseCase
    implements UseCase<ReceiverAccountsResponse, GetReceiverAccountsParams> {
  final TransactionRepository repository;

  GetReceiverAccountsUseCase(this.repository);

  @override
  Future<Either<Failure, ReceiverAccountsResponse>> call(
    GetReceiverAccountsParams params,
  ) async {
    return await repository.getActiveReceiverAccounts(
      provider: params.provider,
    );
  }
}

class GetReceiverAccountsParams extends Equatable {
  final TransactionProvider? provider;

  const GetReceiverAccountsParams({this.provider});

  @override
  List<Object?> get props => [provider];
}
