import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/secure_logger.dart';
import '../../domain/repositories/history_repository.dart';
import '../models/history_models.dart';
import '../services/history_api_service.dart';

class HistoryRepositoryImpl implements HistoryRepository {
  final HistoryApiService _apiService;

  HistoryRepositoryImpl(this._apiService);

  @override
  Future<Either<Failure, ListVerificationHistoryResponse>>
  listVerificationHistory(ListVerificationHistoryQuery query) async {
    try {
      SecureLogger.info('Repository: Loading verification history');

      final result = await _apiService.listVerificationHistory(query);

      return result.fold(
        (exception) {
          SecureLogger.error(
            'Repository: Failed to load verification history',
            error: exception,
          );
          return Left(ServerFailure(message:exception.toString()));
        },
        (response) {
          SecureLogger.info(
            'Repository: Verification history loaded successfully',
          );
          return Right(response);
        },
      );
    } catch (e) {
      SecureLogger.error(
        'Repository: Unexpected error loading verification history',
        error: e,
      );
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
