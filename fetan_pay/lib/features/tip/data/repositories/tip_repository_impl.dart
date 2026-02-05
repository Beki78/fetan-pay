import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/repositories/tip_repository.dart';
import '../models/tip_models.dart';
import '../services/tip_api_service.dart';

class TipRepositoryImpl implements TipRepository {
  final TipApiService _tipApiService;
  final NetworkInfo _networkInfo;

  TipRepositoryImpl({
    required TipApiService tipApiService,
    required NetworkInfo networkInfo,
  }) : _tipApiService = tipApiService,
       _networkInfo = networkInfo;

  @override
  Future<Either<Failure, TipsSummary>> getTipsSummary(
    TipsSummaryQuery query,
  ) async {
    if (await _networkInfo.isConnected) {
      try {
        final result = await _tipApiService.getTipsSummary(query);
        return result.fold(
          (exception) => Left(ServerFailure(message: exception.toString() )),
          (tipsSummary) => Right(tipsSummary),
        );
      } catch (e) {
        return Left(ServerFailure(message: e.toString()));
      }
    } else {
      return const Left(NetworkFailure(message:'No internet connection'));
    }
  }

  @override
  Future<Either<Failure, ListTipsResponse>> listTips(
    ListTipsQuery query,
  ) async {
    if (await _networkInfo.isConnected) {
      try {
        final result = await _tipApiService.listTips(query);
        return result.fold(
          (exception) => Left(ServerFailure(message: exception.toString())),
          (listTipsResponse) => Right(listTipsResponse),
        );
      } catch (e) {
        return Left(ServerFailure(message: e.toString()));
      }
    } else {
      return const Left(NetworkFailure(message:'No internet connection'));
    }
  }
}
