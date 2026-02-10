import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../models/transaction_models.dart';

class TransactionApiService {
  final DioClient _dioClient;

  TransactionApiService({required DioClient dioClient})
    : _dioClient = dioClient;

  /// List transactions with optional filters
  Future<TransactionListResponse> listTransactions({
    TransactionProvider? provider,
    TransactionStatus? status,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      print('=== TRANSACTION API DEBUG ===');
      print('Fetching transactions with filters:');
      print('Provider: $provider');
      print('Status: $status');
      print('Page: $page, PageSize: $pageSize');

      final queryParams = <String, dynamic>{'page': page, 'pageSize': pageSize};

      if (provider != null) {
        queryParams['provider'] = provider.name;
      }

      if (status != null) {
        queryParams['status'] = status.name;
      }

      final response = await _dioClient.get(
        ApiConfig.transactionsEndpoint,
        queryParameters: queryParams,
      );

      print('Transaction API response status: ${response.statusCode}');
      print('Transaction API response data keys: ${response.data?.keys}');

      if (response.statusCode == 200 && response.data != null) {
        final transactionResponse = TransactionListResponse.fromJson(
          response.data,
        );
        print(
          'Successfully parsed ${transactionResponse.data.length} transactions',
        );
        return transactionResponse;
      } else {
        throw Exception('Failed to load transactions: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('=== TRANSACTION API ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');
      print('Response data: ${e.response?.data}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else if (e.response?.statusCode == 403) {
        throw Exception('Forbidden: Insufficient permissions');
      } else if (e.response?.statusCode == 404) {
        throw Exception('Transactions endpoint not found');
      } else if (e.type == DioExceptionType.connectionTimeout) {
        throw Exception(
          'Connection timeout: Please check your internet connection',
        );
      } else if (e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Server timeout: Please try again later');
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      print('=== TRANSACTION API UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to load transactions: $e');
    }
  }

  /// Get a single transaction by ID or reference
  Future<TransactionRecord> getTransaction(String idOrReference) async {
    try {
      print('=== GET TRANSACTION DEBUG ===');
      print('Fetching transaction: $idOrReference');

      final response = await _dioClient.get(
        '${ApiConfig.transactionsEndpoint}/$idOrReference',
      );

      print('Get transaction response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        final transaction = TransactionRecord.fromJson(response.data);
        print('Successfully fetched transaction: ${transaction.id}');
        return transaction;
      } else {
        throw Exception('Failed to load transaction: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('=== GET TRANSACTION ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');

      if (e.response?.statusCode == 404) {
        throw Exception('Transaction not found');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else {
        throw Exception('Failed to load transaction: ${e.message}');
      }
    } catch (e) {
      print('=== GET TRANSACTION UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to load transaction: $e');
    }
  }

  /// List transactions verified by a specific merchant user
  Future<TransactionListResponse> listVerifiedByUser({
    required String merchantUserId,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      print('=== VERIFIED BY USER DEBUG ===');
      print('Fetching transactions verified by user: $merchantUserId');
      print('Page: $page, PageSize: $pageSize');

      final queryParams = <String, dynamic>{'page': page, 'pageSize': pageSize};

      final response = await _dioClient.get(
        '${ApiConfig.transactionsEndpoint}/verified-by/$merchantUserId',
        queryParameters: queryParams,
      );

      print('Verified by user response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        final transactionResponse = TransactionListResponse.fromJson(
          response.data,
        );
        print(
          'Successfully parsed ${transactionResponse.data.length} verified transactions',
        );
        return transactionResponse;
      } else {
        throw Exception(
          'Failed to load verified transactions: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      print('=== VERIFIED BY USER ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');

      if (e.response?.statusCode == 404) {
        throw Exception('Merchant user not found');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else {
        throw Exception('Failed to load verified transactions: ${e.message}');
      }
    } catch (e) {
      print('=== VERIFIED BY USER UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to load verified transactions: $e');
    }
  }

  /// Verify a transaction from QR code
  Future<Map<String, dynamic>> verifyFromQr({
    required String qrUrl,
    TransactionProvider? provider,
    String? reference,
    String? accountSuffix,
  }) async {
    try {
      print('=== VERIFY FROM QR DEBUG ===');
      print('Verifying QR: $qrUrl');
      print('Provider: $provider');
      print('Reference: $reference');

      final requestBody = <String, dynamic>{'qrUrl': qrUrl};

      if (provider != null) {
        requestBody['provider'] = provider.name;
      }

      if (reference != null) {
        requestBody['reference'] = reference;
      }

      if (accountSuffix != null) {
        requestBody['accountSuffix'] = accountSuffix;
      }

      final response = await _dioClient.post(
        '${ApiConfig.transactionsEndpoint}/verify-from-qr',
        data: requestBody,
      );

      print('Verify QR response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        print('Successfully verified QR transaction');
        return response.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to verify transaction: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('=== VERIFY QR ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');
      print('Response data: ${e.response?.data}');

      if (e.response?.statusCode == 400) {
        final errorData = e.response?.data;
        if (errorData is Map<String, dynamic> && errorData['message'] != null) {
          throw Exception(errorData['message']);
        } else {
          throw Exception('Invalid QR code or verification failed');
        }
      } else if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else {
        throw Exception('Failed to verify transaction: ${e.message}');
      }
    } catch (e) {
      print('=== VERIFY QR UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to verify transaction: $e');
    }
  }

  /// Test connection to the transactions API
  Future<bool> testConnection() async {
    try {
      print('=== TRANSACTION API CONNECTION TEST ===');

      // Try to fetch the first page with minimal data
      final response = await _dioClient.get(
        ApiConfig.transactionsEndpoint,
        queryParameters: {'page': 1, 'pageSize': 1},
      );

      final isConnected = response.statusCode == 200;
      print('Transaction API connection test result: $isConnected');
      return isConnected;
    } catch (e) {
      print('Transaction API connection test failed: $e');
      return false;
    }
  }

  /// Get active receiver accounts
  Future<ReceiverAccountsResponse> getActiveReceiverAccounts({
    TransactionProvider? provider,
  }) async {
    try {
      print('=== GET ACTIVE RECEIVER ACCOUNTS DEBUG ===');
      print('Provider filter: $provider');

      final queryParams = <String, dynamic>{};
      if (provider != null) {
        queryParams['provider'] = provider.name;
      }

      final response = await _dioClient.get(
        '${ApiConfig.paymentsEndpoint}/receiver-accounts/active',
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      print('Receiver accounts response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        final accountsResponse = ReceiverAccountsResponse.fromJson(
          response.data,
        );
        print(
          'Successfully fetched ${accountsResponse.data.length} receiver accounts',
        );
        return accountsResponse;
      } else {
        throw Exception(
          'Failed to load receiver accounts: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      print('=== GET RECEIVER ACCOUNTS ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else {
        throw Exception('Failed to load receiver accounts: ${e.message}');
      }
    } catch (e) {
      print('=== GET RECEIVER ACCOUNTS UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to load receiver accounts: $e');
    }
  }

  /// Create a new order (payment intent)
  Future<CreateOrderResponse> createOrder(CreateOrderInput input) async {
    try {
      print('=== CREATE ORDER DEBUG ===');
      print('Creating order with amount: ${input.expectedAmount}');
      print('Provider: ${input.provider}');
      print('Payer name: ${input.payerName}');

      final response = await _dioClient.post(
        '${ApiConfig.paymentsEndpoint}/orders',
        data: input.toJson(),
      );

      print('Create order response status: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.data != null) {
          final orderResponse = CreateOrderResponse.fromJson(response.data);
          print('Successfully created order: ${orderResponse.order.id}');
          return orderResponse;
        } else {
          throw Exception('Empty response from create order');
        }
      } else {
        throw Exception('Failed to create order: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('=== CREATE ORDER ERROR ===');
      print('DioException: ${e.type}');
      print('Status code: ${e.response?.statusCode}');
      print('Error message: ${e.message}');
      print('Response data: ${e.response?.data}');

      if (e.response?.statusCode == 400) {
        final errorData = e.response?.data;
        if (errorData is Map<String, dynamic> && errorData['message'] != null) {
          throw Exception(errorData['message']);
        } else {
          throw Exception('Invalid order data');
        }
      } else if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized: Please login again');
      } else {
        throw Exception('Failed to create order: ${e.message}');
      }
    } catch (e) {
      print('=== CREATE ORDER UNEXPECTED ERROR ===');
      print('Error: $e');
      throw Exception('Failed to create order: $e');
    }
  }
}
