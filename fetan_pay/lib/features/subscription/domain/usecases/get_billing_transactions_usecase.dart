import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/subscription_models.dart';
import '../repositories/subscription_repository.dart';

class GetBillingTransactionsUseCase {
  final SubscriptionRepository repository;

  GetBillingTransactionsUseCase(this.repository);

  Future<Either<Failure, List<BillingTransaction>>> call(
    String merchantId, {
    int? limit,
  }) async {
    return await repository.getMerchantBillingTransactions(
      merchantId,
      limit: limit,
    );
  }
}
