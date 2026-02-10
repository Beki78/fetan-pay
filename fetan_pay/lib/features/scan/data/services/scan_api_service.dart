import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../../../../core/utils/secure_logger.dart';
import '../models/scan_models.dart';

abstract class ScanApiService {
  Future<Either<Exception, List<ActiveAccount>>> getActiveAccounts();
  Future<Either<Exception, VerificationResponse>> verifyPayment(
    VerificationRequest request,
  );
}

class ScanApiServiceImpl implements ScanApiService {
  final DioClient _dioClient;

  ScanApiServiceImpl(this._dioClient);

  @override
  Future<Either<Exception, List<ActiveAccount>>> getActiveAccounts() async {
    try {
      SecureLogger.debug(
        'Fetching active receiver accounts from: ${ApiConfig.activeReceiverAccounts}',
      );

      // Make the request exactly like merchant web app - with credentials included
      final response = await _dioClient.get(
        ApiConfig.activeReceiverAccounts,
        options: Options(
          // Match merchant web app's fetchOptions: { credentials: "include" }
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print("-----------------getActiveAccounts Response---------------");
      print('Status Code: ${response.statusCode}');
      print('Response Data: ${response.data}');
      print('Response Headers: ${response.headers}');

      SecureLogger.debug(
        'Active accounts response - Status: ${response.statusCode}',
      );
      SecureLogger.debug('Active accounts response - Data: ${response.data}');

      if (response.statusCode == 200 && response.data != null) {
        // API returns {data: []}, exactly like merchant web app expects
        final responseData = response.data as Map<String, dynamic>;
        final data = responseData['data'] as List<dynamic>? ?? [];

        SecureLogger.debug('Raw accounts data: $data');

        print('=== ALL RECEIVER ACCOUNTS DEBUG ===');
        for (var account in data) {
          final accountMap = account as Map<String, dynamic>;
          print('Provider: ${accountMap['provider']}');
          print('Status: ${accountMap['status']}');
          print('Account: ${accountMap['receiverAccount']}');
          print('Name: ${accountMap['receiverName']}');
          print('Label: ${accountMap['receiverLabel']}');
          print('---');
        }
        print('=== END DEBUG ===');

        // Filter only ACTIVE accounts - same logic as merchant web app
        final activeAccountsData = data.where((account) {
          final accountMap = account as Map<String, dynamic>;
          final status = accountMap['status'] as String?;
          SecureLogger.debug(
            'Account status: $status for account: ${accountMap['id']}',
          );
          return status == 'ACTIVE';
        }).toList();

        SecureLogger.debug(
          'Filtered active accounts: ${activeAccountsData.length} accounts',
        );

        final accounts = activeAccountsData.map((json) {
          try {
            return ActiveAccount.fromJson(json);
          } catch (e) {
            SecureLogger.error('Error parsing account: $json', error: e);
            rethrow;
          }
        }).toList();

        SecureLogger.debug(
          'Successfully parsed ${accounts.length} active accounts',
        );
        return Right(accounts);
      } else {
        print(
          'Failed response - Status: ${response.statusCode}, Data: ${response.data}',
        );
        SecureLogger.error(
          'Failed to load active accounts - Status: ${response.statusCode}, Data: ${response.data}',
        );
        return Left(
          Exception(
            'Failed to load active accounts - Status: ${response.statusCode}',
          ),
        );
      }
    } on DioException catch (e) {
      print('DioException in getActiveAccounts:');
      print('Status Code: ${e.response?.statusCode}');
      print('Response Data: ${e.response?.data}');
      print('Error Message: ${e.message}');

      SecureLogger.error('DioException fetching active accounts', error: e);

      // Extract backend error message if available
      String errorMessage = 'Network error';
      final responseData = e.response?.data;

      if (responseData is Map<String, dynamic>) {
        errorMessage =
            responseData['message'] as String? ??
            responseData['error'] as String? ??
            errorMessage;
      } else if (e.response?.statusCode == 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (e.response?.statusCode == 403) {
        errorMessage = 'Access denied. Check your permissions.';
      } else if (e.response?.statusCode == 404) {
        errorMessage = 'Endpoint not found. Please check server configuration.';
      } else if (e.response?.statusCode == 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }

      return Left(Exception(errorMessage));
    } catch (e) {
      print('Unexpected error in getActiveAccounts: $e');
      SecureLogger.error('Unexpected error fetching active accounts', error: e);
      return Left(Exception('Unexpected error: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Exception, VerificationResponse>> verifyPayment(
    VerificationRequest request,
  ) async {
    try {
      SecureLogger.debug('Starting payment verification');

      final response = await _dioClient.post(
        ApiConfig.verifyMerchantPayment,
        data: request.toJson(),
        options: Options(
          // Ensure cookies are sent with verification requests too
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      SecureLogger.debug('Payment verification response received');

      if (response.statusCode == 200 && response.data != null) {
        final verificationResponse = VerificationResponse.fromJson(
          response.data,
        );
        SecureLogger.debug('Payment verification completed successfully');
        return Right(verificationResponse);
      } else {
        SecureLogger.error(
          'Payment verification failed - Status: ${response.statusCode}',
        );
        return Left(Exception('Payment verification failed'));
      }
    } on DioException catch (e) {
      SecureLogger.error('DioException during payment verification', error: e);

      // Extract backend error message if available
      String errorMessage = 'Network error during verification';
      final responseData = e.response?.data;

      if (responseData is Map<String, dynamic>) {
        errorMessage =
            responseData['message'] as String? ??
            responseData['error'] as String? ??
            errorMessage;
      } else if (e.response?.statusCode == 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (e.response?.statusCode == 403) {
        errorMessage = 'Access denied. Check your permissions.';
      } else if (e.response?.statusCode == 404) {
        errorMessage = 'Verification endpoint not found.';
      } else if (e.response?.statusCode == 500) {
        errorMessage = 'Server error during verification. Please try again.';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }

      return Left(Exception(errorMessage));
    } catch (e) {
      SecureLogger.error(
        'Unexpected error during payment verification',
        error: e,
      );
      return Left(
        Exception('Unexpected error during verification: ${e.toString()}'),
      );
    }
  }
}
