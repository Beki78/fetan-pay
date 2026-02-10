import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/subscription_repository.dart';

class UpgradeMerchantPlanUseCase {
  final SubscriptionRepository repository;

  UpgradeMerchantPlanUseCase(this.repository);

  Future<Either<Failure, Map<String, dynamic>>> call({
    required String merchantId,
    required String planId,
    String? paymentReference,
    String? paymentMethod,
  }) async {
    return await repository.upgradeMerchantPlan(
      merchantId: merchantId,
      planId: planId,
      paymentReference: paymentReference,
      paymentMethod: paymentMethod,
    );
  }
}
