import 'package:dartz/dartz.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../../../../core/utils/secure_logger.dart';
import '../models/history_models.dart';

abstract class HistoryApiService {
  Future<Either<Exception, ListVerificationHistoryResponse>>
  listVerificationHistory(ListVerificationHistoryQuery query);
}

class HistoryApiServiceImpl implements HistoryApiService {
  final DioClient _dioClient;

  HistoryApiServiceImpl(this._dioClient);

  @override
  Future<Either<Exception, ListVerificationHistoryResponse>>
  listVerificationHistory(ListVerificationHistoryQuery query) async {
    try {
      final queryParams = query.toJson();

      SecureLogger.info(
        'Loading verification history with params: $queryParams',
      );

      final response = await _dioClient.get(
        ApiConfig.verificationHistory,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      print('Verification History Response:');
      print(response.data);

      if (response.statusCode == 200 && response.data != null) {
        final historyResponse = ListVerificationHistoryResponse.fromJson(
          response.data,
        );
        SecureLogger.info(
          'Verification history loaded successfully: ${historyResponse.data.length} items',
        );
        return Right(historyResponse);
      } else {
        SecureLogger.error(
          'Failed to load verification history: ${response.statusCode}',
        );
        return Left(Exception('Failed to load verification history'));
      }
    } catch (e) {
      SecureLogger.error(
        'Network error loading verification history',
        error: e,
      );
      return Left(Exception('Network error: ${e.toString()}'));
    }
  }
}
