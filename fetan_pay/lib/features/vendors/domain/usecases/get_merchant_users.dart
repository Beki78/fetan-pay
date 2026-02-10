import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/merchant_user_models.dart';
import '../repositories/merchant_users_repository.dart';

class GetMerchantUsers {
  final MerchantUsersRepository repository;

  GetMerchantUsers(this.repository);

  Future<Either<Failure, List<MerchantUser>>> call(
    String merchantId, {
    bool forceRefresh = false,
  }) async {
    return await repository.getMerchantUsers(
      merchantId,
      forceRefresh: forceRefresh,
    );
  }
}
