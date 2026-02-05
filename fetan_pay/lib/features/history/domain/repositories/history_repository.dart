import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/history_models.dart';

abstract class HistoryRepository {
  Future<Either<Failure, ListVerificationHistoryResponse>>
  listVerificationHistory(ListVerificationHistoryQuery query);
}
