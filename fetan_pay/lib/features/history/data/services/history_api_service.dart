import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
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
    } on DioException catch (e) {
      SecureLogger.error('DioException loading verification history', error: e);

      // Extract backend error message if available
      String errorMessage = 'Network error';
      final responseData = e.response?.data;

      if (responseData is Map<String, dynamic>) {
        errorMessage =
            responseData['message'] as String? ??
            responseData['error'] as String? ??
            errorMessage;
      } else if (e.message != null) {
        errorMessage = e.message!;
      }

      return Left(Exception(errorMessage));
    } catch (e) {
      SecureLogger.error(
        'Unexpected error loading verification history',
        error: e,
      );
      return Left(Exception('Network error: ${e.toString()}'));
    }
  }
}
