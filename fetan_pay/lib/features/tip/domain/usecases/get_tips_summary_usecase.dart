import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/tip_repository.dart';
import '../../data/models/tip_models.dart';

class GetTipsSummaryUseCase implements UseCase<TipsSummary, TipsSummaryParams> {
  final TipRepository _repository;

  GetTipsSummaryUseCase(this._repository);

  @override
  Future<Either<Failure, TipsSummary>> call(TipsSummaryParams params) async {
    return await _repository.getTipsSummary(params.query);
  }
}

class TipsSummaryParams {
  final TipsSummaryQuery query;

  TipsSummaryParams({required this.query});
}
