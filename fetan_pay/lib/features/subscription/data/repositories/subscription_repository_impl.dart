import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/repositories/subscription_repository.dart';
import '../models/subscription_models.dart';
import '../services/subscription_api_service.dart';

class SubscriptionRepositoryImpl implements SubscriptionRepository {
  final SubscriptionApiService _apiService;
  final NetworkInfo _networkInfo;

  // Cache for plans and subscription
  List<Plan>? _cachedPlans;
  DateTime? _plansCacheTime;
  Subscription? _cachedSubscription;
  DateTime? _subscriptionCacheTime;
  static const _cacheDuration = Duration(minutes: 5);

  SubscriptionRepositoryImpl({
    required SubscriptionApiService apiService,
    required NetworkInfo networkInfo,
  }) : _apiService = apiService,
       _networkInfo = networkInfo;

  @override
  Future<Either<Failure, List<Plan>>> getPublicPlans({
    String? status,
    String? billingCycle,
    int? limit,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      // Check cache first
      if (_cachedPlans != null && _plansCacheTime != null) {
        final cacheAge = DateTime.now().difference(_plansCacheTime!);
        if (cacheAge < _cacheDuration) {
          return Right(_cachedPlans!);
        }
      }

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        // Return cached data if available, otherwise return error
        if (_cachedPlans != null) {
          return Right(_cachedPlans!);
        }
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Fetch from API
      final plans = await _apiService.getPublicPlans(
        status: status,
        billingCycle: billingCycle,
        limit: limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
      );

      // Update cache
      _cachedPlans = plans;
      _plansCacheTime = DateTime.now();

      return Right(plans);
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'getPublicPlans');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, Subscription?>> getMerchantSubscription(
    String merchantId,
  ) async {
    try {
      // Check cache first
      if (_cachedSubscription != null && _subscriptionCacheTime != null) {
        final cacheAge = DateTime.now().difference(_subscriptionCacheTime!);
        if (cacheAge < _cacheDuration) {
          return Right(_cachedSubscription);
        }
      }

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        // Return cached data if available, otherwise return error
        if (_cachedSubscription != null) {
          return Right(_cachedSubscription);
        }
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Fetch from API
      final subscription = await _apiService.getMerchantSubscription(
        merchantId,
      );

      // Update cache
      _cachedSubscription = subscription;
      _subscriptionCacheTime = DateTime.now();

      return Right(subscription);
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'getMerchantSubscription',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, List<BillingTransaction>>>
  getMerchantBillingTransactions(String merchantId, {int? limit}) async {
    try {
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
      final transactions = await _apiService.getMerchantBillingTransactions(
        merchantId,
        limit: limit,
      );

      return Right(transactions);
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'getMerchantBillingTransactions',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> upgradeMerchantPlan({
    required String merchantId,
    required String planId,
    String? paymentReference,
    String? paymentMethod,
  }) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Call API
      final result = await _apiService.upgradeMerchantPlan(
        merchantId: merchantId,
        planId: planId,
        paymentReference: paymentReference,
        paymentMethod: paymentMethod,
      );

      // Clear cache to force refresh
      clearCache();

      return Right(result);
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'upgradeMerchantPlan',
      );
      return Left(failure);
    }
  }

  @override
  void clearCache() {
    _cachedPlans = null;
    _plansCacheTime = null;
    _cachedSubscription = null;
    _subscriptionCacheTime = null;
  }
}
