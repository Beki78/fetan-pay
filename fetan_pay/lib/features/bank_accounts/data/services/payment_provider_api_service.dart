import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../models/payment_provider_models.dart';
import '../../../transactions/data/models/transaction_models.dart';

class PaymentProviderApiService {
  final DioClient _dioClient;

  PaymentProviderApiService({required DioClient dioClient})
    : _dioClient = dioClient;

  /// Get all payment providers
  Future<PaymentProvidersResponse> getPaymentProviders() async {
    try {
      print('=== GET PAYMENT PROVIDERS DEBUG ===');

      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/payment-providers',
      );

      print('Payment providers response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        final providersResponse = PaymentProvidersResponse.fromJson(
          response.data,
        );
        print(
          'Successfully fetched ${providersResponse.providers.length} payment providers',
        );
        return providersResponse;
      } else {
        throw Exception(
          'Failed to load payment providers: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      print('=== GET PAYMENT PROVIDERS ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');

      // Extract backend error message if available
      String errorMessage = 'Failed to load payment providers';
      final responseData = e.response?.data;

      if (responseData is Map<String, dynamic>) {
        errorMessage =
            responseData['message'] as String? ??
            responseData['error'] as String? ??
            errorMessage;
      } else if (e.response?.statusCode == 401) {
        errorMessage = 'Unauthorized: Please login again';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }

      throw Exception(errorMessage);
    } catch (e) {
      print('=== GET PAYMENT PROVIDERS UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to load payment providers: $e');
    }
  }

  /// Set active receiver account
  Future<SetActiveReceiverAccountResponse> setActiveReceiverAccount(
    SetActiveReceiverAccountInput input,
  ) async {
    try {
      print('=== SET ACTIVE RECEIVER ACCOUNT DEBUG ===');
      print('Provider: ${input.provider}');
      print('Account: ${input.receiverAccount}');
      print('Enabled: ${input.enabled}');

      final response = await _dioClient.post(
        '${ApiConfig.paymentsEndpoint}/receiver-accounts/active',
        data: input.toJson(),
      );

      print(
        'Set active receiver account response status: ${response.statusCode}',
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.data != null) {
          final accountResponse = SetActiveReceiverAccountResponse.fromJson(
            response.data,
          );
          print('Successfully set active receiver account');
          return accountResponse;
        } else {
          throw Exception('Empty response from set active receiver account');
        }
      } else {
        throw Exception(
          'Failed to set active receiver account: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      print('=== SET ACTIVE RECEIVER ACCOUNT ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');
      print('Response data: ${e.response?.data}');

      if (e.response?.statusCode == 400) {
        final errorData = e.response?.data;
        if (errorData is Map<String, dynamic> && errorData['message'] != null) {
          throw Exception(errorData['message']);
        } else {
          throw Exception('Invalid account data');
        }
      } else if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else if (e.response?.statusCode == 403) {
        final errorData = e.response?.data;
        if (errorData is Map<String, dynamic> && errorData['message'] != null) {
          throw Exception(errorData['message']);
        } else {
          throw Exception('Forbidden: Insufficient permissions');
        }
      } else {
        throw Exception('Failed to set active receiver account: ${e.message}');
      }
    } catch (e) {
      print('=== SET ACTIVE RECEIVER ACCOUNT UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to set active receiver account: $e');
    }
  }

  /// Disable active receiver account
  Future<Map<String, dynamic>> disableActiveReceiverAccount(
    String provider,
  ) async {
    try {
      print('=== DISABLE ACTIVE RECEIVER ACCOUNT DEBUG ===');
      print('Provider: $provider');

      final response = await _dioClient.post(
        '${ApiConfig.paymentsEndpoint}/receiver-accounts/disable',
        data: {'provider': provider},
      );

      print('Disable receiver account response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        print('Successfully disabled receiver account');
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception(
          'Failed to disable receiver account: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      print('=== DISABLE RECEIVER ACCOUNT ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');

      // Extract backend error message if available
      String errorMessage = 'Failed to disable receiver account';
      final responseData = e.response?.data;

      if (responseData is Map<String, dynamic>) {
        errorMessage =
            responseData['message'] as String? ??
            responseData['error'] as String? ??
            errorMessage;
      } else if (e.response?.statusCode == 401) {
        errorMessage = 'Unauthorized: Please login again';
      } else if (e.message != null) {
        errorMessage = e.message!;
      }

      throw Exception(errorMessage);
    } catch (e) {
      print('=== DISABLE RECEIVER ACCOUNT UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to disable receiver account: $e');
    }
  }

  /// Enable last receiver account
  Future<Map<String, dynamic>> enableLastReceiverAccount(
    String provider,
  ) async {
    try {
      print('=== ENABLE LAST RECEIVER ACCOUNT DEBUG ===');
      print('Provider: $provider');

      final response = await _dioClient.post(
        '${ApiConfig.paymentsEndpoint}/receiver-accounts/enable',
        data: {'provider': provider},
      );

      print('Enable receiver account response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        print('Successfully enabled receiver account');
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception(
          'Failed to enable receiver account: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      print('=== ENABLE RECEIVER ACCOUNT ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else if (e.response?.statusCode == 403) {
        final errorData = e.response?.data;
        if (errorData is Map<String, dynamic> && errorData['message'] != null) {
          throw Exception(errorData['message']);
        } else {
          throw Exception('Forbidden: Insufficient permissions');
        }
      } else {
        throw Exception('Failed to enable receiver account: ${e.message}');
      }
    } catch (e) {
      print('=== ENABLE RECEIVER ACCOUNT UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to enable receiver account: $e');
    }
  }
}
