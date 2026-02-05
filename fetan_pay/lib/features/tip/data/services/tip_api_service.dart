import 'package:dartz/dartz.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../models/tip_models.dart';

abstract class TipApiService {
  Future<Either<Exception, TipsSummary>> getTipsSummary(TipsSummaryQuery query);
  Future<Either<Exception, ListTipsResponse>> listTips(ListTipsQuery query);
}

class TipApiServiceImpl implements TipApiService {
  final DioClient _dioClient;

  TipApiServiceImpl(this._dioClient);

  @override
  Future<Either<Exception, TipsSummary>> getTipsSummary(
    TipsSummaryQuery query,
  ) async {
    try {
      final queryParams = query.toJson();

      final response = await _dioClient.dio.get(
        ApiConfig.tipsSummary,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      print('Tips Summary Response:');
      print(response);
      print('Response Data:');
      print(response.data);

      if (response.statusCode == 200 && response.data != null) {
        final tipsSummary = TipsSummary.fromJson(response.data);
        return Right(tipsSummary);
      } else {
        return Left(Exception('Failed to load tips summary'));
      }
    } catch (e) {
      return Left(Exception('Network error: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Exception, ListTipsResponse>> listTips(
    ListTipsQuery query,
  ) async {
    try {
      final queryParams = query.toJson();

      final response = await _dioClient.dio.get(
        ApiConfig.listTips,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      print('List Tips Response:');
      print(response);
      print('Response Data:');
      print(response.data);

      if (response.statusCode == 200 && response.data != null) {
        final listTipsResponse = ListTipsResponse.fromJson(response.data);
        return Right(listTipsResponse);
      } else {
        return Left(Exception('Failed to load tips'));
      }
    } catch (e) {
      return Left(Exception('Network error: ${e.toString()}'));
    }
  }
}
