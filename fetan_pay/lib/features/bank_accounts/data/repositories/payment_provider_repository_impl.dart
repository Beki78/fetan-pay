import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/repositories/payment_provider_repository.dart';
import '../models/payment_provider_models.dart';
import '../services/payment_provider_api_service.dart';
import '../../../transactions/data/models/transaction_models.dart';

class PaymentProviderRepositoryImpl implements PaymentProviderRepository {
  final PaymentProviderApiService _apiService;
  final NetworkInfo _networkInfo;

  PaymentProviderRepositoryImpl({
    required PaymentProviderApiService apiService,
    required NetworkInfo networkInfo,
  }) : _apiService = apiService,
       _networkInfo = networkInfo;

  @override
  Future<Either<Failure, PaymentProvidersResponse>>
  getPaymentProviders() async {
    try {
      print('=== PAYMENT PROVIDER REPOSITORY DEBUG ===');
      print('Getting payment providers');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Fetch from API
      final response = await _apiService.getPaymentProviders();

      print(
        'Successfully fetched ${response.providers.length} payment providers',
      );
      return Right(response);
    } catch (e) {
      print('=== PAYMENT PROVIDER REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(
        e,
        context: 'getPaymentProviders',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, ReceiverAccountsResponse>> getActiveReceiverAccounts({
    String? provider,
  }) async {
    try {
      print('=== GET ACTIVE RECEIVER ACCOUNTS REPOSITORY DEBUG ===');
      print('Provider filter: $provider');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Fetch from API - reuse transaction API service method
      // This is already implemented in transaction repository
      // For now, return empty list as placeholder
      return const Right(ReceiverAccountsResponse(data: []));
    } catch (e) {
      print('=== GET RECEIVER ACCOUNTS REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(
        e,
        context: 'getActiveReceiverAccounts',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, SetActiveReceiverAccountResponse>>
  setActiveReceiverAccount(SetActiveReceiverAccountInput input) async {
    try {
      print('=== SET ACTIVE RECEIVER ACCOUNT REPOSITORY DEBUG ===');
      print('Provider: ${input.provider}');
      print('Account: ${input.receiverAccount}');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Set via API
      final response = await _apiService.setActiveReceiverAccount(input);

      print('Successfully set active receiver account');
      return Right(response);
    } catch (e) {
      print('=== SET ACTIVE RECEIVER ACCOUNT REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(
        e,
        context: 'setActiveReceiverAccount',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> disableActiveReceiverAccount(
    String provider,
  ) async {
    try {
      print('=== DISABLE RECEIVER ACCOUNT REPOSITORY DEBUG ===');
      print('Provider: $provider');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Disable via API
      final response = await _apiService.disableActiveReceiverAccount(provider);

      print('Successfully disabled receiver account');
      return Right(response);
    } catch (e) {
      print('=== DISABLE RECEIVER ACCOUNT REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(
        e,
        context: 'disableActiveReceiverAccount',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> enableLastReceiverAccount(
    String provider,
  ) async {
    try {
      print('=== ENABLE RECEIVER ACCOUNT REPOSITORY DEBUG ===');
      print('Provider: $provider');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Enable via API
      final response = await _apiService.enableLastReceiverAccount(provider);

      print('Successfully enabled receiver account');
      return Right(response);
    } catch (e) {
      print('=== ENABLE RECEIVER ACCOUNT REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(
        e,
        context: 'enableLastReceiverAccount',
      );
      return Left(failure);
    }
  }
}
