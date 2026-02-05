import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/tip_models.dart';

abstract class TipRepository {
  Future<Either<Failure, TipsSummary>> getTipsSummary(TipsSummaryQuery query);
  Future<Either<Failure, ListTipsResponse>> listTips(ListTipsQuery query);
}
