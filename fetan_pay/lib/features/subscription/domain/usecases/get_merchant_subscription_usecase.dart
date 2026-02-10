import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/subscription_models.dart';
import '../repositories/subscription_repository.dart';

class GetMerchantSubscriptionUseCase {
  final SubscriptionRepository repository;

  GetMerchantSubscriptionUseCase(this.repository);

  Future<Either<Failure, Subscription?>> call(String merchantId) async {
    return await repository.getMerchantSubscription(merchantId);
  }
}
