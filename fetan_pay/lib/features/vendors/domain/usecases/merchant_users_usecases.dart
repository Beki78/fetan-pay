import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/merchant_user_models.dart';
import '../repositories/merchant_users_repository.dart';

/// Get single merchant user
class GetMerchantUser {
  final MerchantUsersRepository repository;

  GetMerchantUser(this.repository);

  Future<Either<Failure, MerchantUser>> call(
    String merchantId,
    String id,
  ) async {
    return await repository.getMerchantUser(merchantId, id);
  }
}

/// Create merchant user
class CreateMerchantUser {
  final MerchantUsersRepository repository;

  CreateMerchantUser(this.repository);

  Future<Either<Failure, MerchantUser>> call(
    CreateMerchantUserInput input,
  ) async {
    return await repository.createMerchantUser(input);
  }
}

/// Update merchant user
class UpdateMerchantUser {
  final MerchantUsersRepository repository;

  UpdateMerchantUser(this.repository);

  Future<Either<Failure, MerchantUser>> call(
    UpdateMerchantUserInput input,
  ) async {
    return await repository.updateMerchantUser(input);
  }
}

/// Deactivate merchant user
class DeactivateMerchantUser {
  final MerchantUsersRepository repository;

  DeactivateMerchantUser(this.repository);

  Future<Either<Failure, MerchantUser>> call(
    String merchantId,
    String id,
    String actionBy,
  ) async {
    return await repository.deactivateMerchantUser(merchantId, id, actionBy);
  }
}

/// Activate merchant user
class ActivateMerchantUser {
  final MerchantUsersRepository repository;

  ActivateMerchantUser(this.repository);

  Future<Either<Failure, MerchantUser>> call(
    String merchantId,
    String id,
    String actionBy,
  ) async {
    return await repository.activateMerchantUser(merchantId, id, actionBy);
  }
}

/// Get QR code for user
class GetUserQRCode {
  final MerchantUsersRepository repository;

  GetUserQRCode(this.repository);

  Future<Either<Failure, QRCodeResponse>> call(
    String merchantId,
    String userId,
  ) async {
    return await repository.getQRCode(merchantId, userId);
  }
}
