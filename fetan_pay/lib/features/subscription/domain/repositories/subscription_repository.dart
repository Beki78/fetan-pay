import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/subscription_models.dart';

abstract class SubscriptionRepository {
  Future<Either<Failure, List<Plan>>> getPublicPlans({
    String? status,
    String? billingCycle,
    int? limit,
    String? sortBy,
    String? sortOrder,
  });

  Future<Either<Failure, Subscription?>> getMerchantSubscription(
    String merchantId,
  );

  Future<Either<Failure, List<BillingTransaction>>>
  getMerchantBillingTransactions(String merchantId, {int? limit});

  Future<Either<Failure, Map<String, dynamic>>> upgradeMerchantPlan({
    required String merchantId,
    required String planId,
    String? paymentReference,
    String? paymentMethod,
  });

  void clearCache();
}
