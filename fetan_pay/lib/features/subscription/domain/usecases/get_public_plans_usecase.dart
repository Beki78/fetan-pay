import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/subscription_models.dart';
import '../repositories/subscription_repository.dart';

class GetPublicPlansUseCase {
  final SubscriptionRepository repository;

  GetPublicPlansUseCase(this.repository);

  Future<Either<Failure, List<Plan>>> call({
    String? status,
    String? billingCycle,
    int? limit,
    String? sortBy,
    String? sortOrder,
  }) async {
    return await repository.getPublicPlans(
      status: status,
      billingCycle: billingCycle,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    );
  }
}
