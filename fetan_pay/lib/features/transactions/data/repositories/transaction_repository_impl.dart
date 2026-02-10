import 'package:dartz/dartz.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/repositories/transaction_repository.dart';
import '../models/transaction_models.dart';
import '../services/transaction_api_service.dart';

class TransactionRepositoryImpl implements TransactionRepository {
  final TransactionApiService _apiService;
  final NetworkInfo _networkInfo;
  final SharedPreferences _sharedPreferences;

  static const String _transactionsCacheKey = 'cached_transactions';
  static const String _transactionsCacheTimestampKey =
      'cached_transactions_timestamp';
  static const Duration _cacheValidDuration = Duration(minutes: 5);

  TransactionRepositoryImpl({
    required TransactionApiService apiService,
    required NetworkInfo networkInfo,
    required SharedPreferences sharedPreferences,
  }) : _apiService = apiService,
       _networkInfo = networkInfo,
       _sharedPreferences = sharedPreferences;

  @override
  Future<Either<Failure, TransactionListResponse>> listTransactions({
    TransactionProvider? provider,
    TransactionStatus? status,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      print('=== TRANSACTION REPOSITORY DEBUG ===');
      print(
        'Listing transactions - Provider: $provider, Status: $status, Page: $page',
      );

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        print('No network connection, trying to return cached data');
        final cachedTransactions = await getCachedTransactions();
        if (cachedTransactions != null && cachedTransactions.isNotEmpty) {
          // Filter cached transactions if needed
          var filteredTransactions = cachedTransactions;

          if (provider != null) {
            filteredTransactions = filteredTransactions
                .where((t) => t.provider == provider)
                .toList();
          }

          if (status != null) {
            filteredTransactions = filteredTransactions
                .where((t) => t.status == status)
                .toList();
          }

          // Apply pagination to cached data
          final startIndex = (page - 1) * pageSize;
          final endIndex = startIndex + pageSize;
          final paginatedData = filteredTransactions.length > startIndex
              ? filteredTransactions.sublist(
                  startIndex,
                  endIndex > filteredTransactions.length
                      ? filteredTransactions.length
                      : endIndex,
                )
              : <TransactionRecord>[];

          final cachedResponse = TransactionListResponse(
            data: paginatedData,
            total: filteredTransactions.length,
            page: page,
            pageSize: pageSize,
          );

          print('Returning ${paginatedData.length} cached transactions');
          return Right(cachedResponse);
        } else {
          return const Left(
            NetworkFailure(
              message: 'No internet connection and no cached data available',
              code: 'NO_CONNECTION',
            ),
          );
        }
      }

      // Fetch from API
      final response = await _apiService.listTransactions(
        provider: provider,
        status: status,
        page: page,
        pageSize: pageSize,
      );

      // Cache the first page of all transactions (no filters) for offline use
      if (page == 1 && provider == null && status == null) {
        await cacheTransactions(response.data);
      }

      print(
        'Successfully fetched ${response.data.length} transactions from API',
      );
      return Right(response);
    } catch (e) {
      print('=== TRANSACTION REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(e, context: 'listTransactions');

      // If API fails but we have cached data, return cached data
      if (failure is NetworkFailure || failure is ServerFailure) {
        final cachedTransactions = await getCachedTransactions();
        if (cachedTransactions != null && cachedTransactions.isNotEmpty) {
          print('API failed, returning cached transactions');

          // Apply filters to cached data
          var filteredTransactions = cachedTransactions;

          if (provider != null) {
            filteredTransactions = filteredTransactions
                .where((t) => t.provider == provider)
                .toList();
          }

          if (status != null) {
            filteredTransactions = filteredTransactions
                .where((t) => t.status == status)
                .toList();
          }

          // Apply pagination
          final startIndex = (page - 1) * pageSize;
          final endIndex = startIndex + pageSize;
          final paginatedData = filteredTransactions.length > startIndex
              ? filteredTransactions.sublist(
                  startIndex,
                  endIndex > filteredTransactions.length
                      ? filteredTransactions.length
                      : endIndex,
                )
              : <TransactionRecord>[];

          final cachedResponse = TransactionListResponse(
            data: paginatedData,
            total: filteredTransactions.length,
            page: page,
            pageSize: pageSize,
          );

          return Right(cachedResponse);
        }
      }

      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, TransactionRecord>> getTransaction(
    String idOrReference,
  ) async {
    try {
      print('=== GET TRANSACTION REPOSITORY DEBUG ===');
      print('Getting transaction: $idOrReference');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        print('No network connection, checking cached transactions');
        final cachedTransactions = await getCachedTransactions();
        if (cachedTransactions != null) {
          final cachedTransaction = cachedTransactions.firstWhere(
            (t) => t.id == idOrReference || t.reference == idOrReference,
            orElse: () => throw Exception('Transaction not found in cache'),
          );
          print('Found transaction in cache: ${cachedTransaction.id}');
          return Right(cachedTransaction);
        } else {
          return const Left(
            NetworkFailure(
              message:
                  'No internet connection and transaction not found in cache',
              code: 'NO_CONNECTION',
            ),
          );
        }
      }

      // Fetch from API
      final transaction = await _apiService.getTransaction(idOrReference);
      print('Successfully fetched transaction from API: ${transaction.id}');
      return Right(transaction);
    } catch (e) {
      print('=== GET TRANSACTION REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(e, context: 'getTransaction');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, TransactionListResponse>> listVerifiedByUser({
    required String merchantUserId,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      print('=== LIST VERIFIED BY USER REPOSITORY DEBUG ===');
      print('Listing transactions verified by user: $merchantUserId');

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
      final response = await _apiService.listVerifiedByUser(
        merchantUserId: merchantUserId,
        page: page,
        pageSize: pageSize,
      );

      print(
        'Successfully fetched ${response.data.length} verified transactions',
      );
      return Right(response);
    } catch (e) {
      print('=== LIST VERIFIED BY USER REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(
        e,
        context: 'listVerifiedByUser',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> verifyFromQr({
    required String qrUrl,
    TransactionProvider? provider,
    String? reference,
    String? accountSuffix,
  }) async {
    try {
      print('=== VERIFY FROM QR REPOSITORY DEBUG ===');
      print('Verifying QR: $qrUrl');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message:
                'No internet connection. QR verification requires network access.',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Verify via API
      final result = await _apiService.verifyFromQr(
        qrUrl: qrUrl,
        provider: provider,
        reference: reference,
        accountSuffix: accountSuffix,
      );

      print('Successfully verified QR transaction');

      // Clear cache to force refresh of transaction list
      await clearCache();

      return Right(result);
    } catch (e) {
      print('=== VERIFY FROM QR REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(e, context: 'verifyFromQr');
      return Left(failure);
    }
  }

  @override
  Future<bool> testConnection() async {
    try {
      return await _apiService.testConnection();
    } catch (e) {
      print('Transaction repository connection test error: $e');
      return false;
    }
  }

  @override
  Future<List<TransactionRecord>?> getCachedTransactions() async {
    try {
      // Check if cache is still valid
      final timestampString = _sharedPreferences.getString(
        _transactionsCacheTimestampKey,
      );
      if (timestampString != null) {
        final cacheTimestamp = DateTime.parse(timestampString);
        final now = DateTime.now();
        if (now.difference(cacheTimestamp) > _cacheValidDuration) {
          print('Transaction cache expired, clearing cache');
          await clearCache();
          return null;
        }
      }

      final cachedDataString = _sharedPreferences.getString(
        _transactionsCacheKey,
      );
      if (cachedDataString != null) {
        final cachedDataList = json.decode(cachedDataString) as List;
        final transactions = cachedDataList
            .map(
              (item) =>
                  TransactionRecord.fromJson(item as Map<String, dynamic>),
            )
            .toList();
        print('Retrieved ${transactions.length} transactions from cache');
        return transactions;
      }
      return null;
    } catch (e) {
      print('Error retrieving cached transactions: $e');
      return null;
    }
  }

  @override
  Future<void> cacheTransactions(List<TransactionRecord> transactions) async {
    try {
      final transactionsJson = transactions.map((t) => t.toJson()).toList();
      final jsonString = json.encode(transactionsJson);

      await _sharedPreferences.setString(_transactionsCacheKey, jsonString);
      await _sharedPreferences.setString(
        _transactionsCacheTimestampKey,
        DateTime.now().toIso8601String(),
      );

      print('Cached ${transactions.length} transactions');
    } catch (e) {
      print('Error caching transactions: $e');
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      await _sharedPreferences.remove(_transactionsCacheKey);
      await _sharedPreferences.remove(_transactionsCacheTimestampKey);
      print('Transaction cache cleared');
    } catch (e) {
      print('Error clearing transaction cache: $e');
    }
  }

  @override
  Future<Either<Failure, ReceiverAccountsResponse>> getActiveReceiverAccounts({
    TransactionProvider? provider,
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

      // Fetch from API
      final response = await _apiService.getActiveReceiverAccounts(
        provider: provider,
      );

      print('Successfully fetched ${response.data.length} receiver accounts');
      return Right(response);
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
  Future<Either<Failure, CreateOrderResponse>> createOrder(
    CreateOrderInput input,
  ) async {
    try {
      print('=== CREATE ORDER REPOSITORY DEBUG ===');
      print('Creating order with amount: ${input.expectedAmount}');

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message:
                'No internet connection. Order creation requires network access.',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Create order via API
      final response = await _apiService.createOrder(input);

      print('Successfully created order: ${response.order.id}');

      // Clear cache to force refresh of transaction list
      await clearCache();

      return Right(response);
    } catch (e) {
      print('=== CREATE ORDER REPOSITORY ERROR ===');
      print('Error: $e');

      final failure = ErrorHandler.handleError(e, context: 'createOrder');
      return Left(failure);
    }
  }
}
