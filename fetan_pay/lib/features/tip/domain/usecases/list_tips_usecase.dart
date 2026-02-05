import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/tip_repository.dart';
import '../../data/models/tip_models.dart';

class ListTipsUseCase implements UseCase<ListTipsResponse, ListTipsParams> {
  final TipRepository _repository;

  ListTipsUseCase(this._repository);

  @override
  Future<Either<Failure, ListTipsResponse>> call(ListTipsParams params) async {
    return await _repository.listTips(params.query);
  }
}

class ListTipsParams {
  final ListTipsQuery query;

  ListTipsParams({required this.query});
}
