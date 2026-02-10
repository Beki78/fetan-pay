import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/merchant_user_models.dart';

abstract class MerchantUsersRepository {
  Future<Either<Failure, List<MerchantUser>>> getMerchantUsers(
    String merchantId, {
    bool forceRefresh = false,
  });

  Future<Either<Failure, MerchantUser>> getMerchantUser(
    String merchantId,
    String id,
  );

  Future<Either<Failure, MerchantUser>> createMerchantUser(
    CreateMerchantUserInput input,
  );

  Future<Either<Failure, MerchantUser>> updateMerchantUser(
    UpdateMerchantUserInput input,
  );

  Future<Either<Failure, MerchantUser>> deactivateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  );

  Future<Either<Failure, MerchantUser>> activateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  );

  Future<Either<Failure, QRCodeResponse>> getQRCode(
    String merchantId,
    String userId,
  );

  void clearCache();
}
