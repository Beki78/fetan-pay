import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../../data/models/history_models.dart';
import '../repositories/history_repository.dart';

class ListVerificationHistoryUseCase
    implements
        UseCase<
          ListVerificationHistoryResponse,
          ListVerificationHistoryParams
        > {
  final HistoryRepository repository;

  ListVerificationHistoryUseCase(this.repository);

  @override
  Future<Either<Failure, ListVerificationHistoryResponse>> call(
    ListVerificationHistoryParams params,
  ) async {
    return await repository.listVerificationHistory(params.query);
  }
}

class ListVerificationHistoryParams extends Equatable {
  final ListVerificationHistoryQuery query;

  const ListVerificationHistoryParams({required this.query});

  @override
  List<Object?> get props => [query];
}
