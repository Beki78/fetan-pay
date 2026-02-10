import 'package:equatable/equatable.dart';
import '../../data/models/merchant_user_models.dart';

abstract class MerchantUsersEvent extends Equatable {
  const MerchantUsersEvent();

  @override
  List<Object?> get props => [];
}

/// Load merchant users
class LoadMerchantUsers extends MerchantUsersEvent {
  final String merchantId;
  final bool forceRefresh;

  const LoadMerchantUsers({
    required this.merchantId,
    this.forceRefresh = false,
  });

  @override
  List<Object?> get props => [merchantId, forceRefresh];
}

/// Create merchant user
class CreateMerchantUserEvent extends MerchantUsersEvent {
  final CreateMerchantUserInput input;

  const CreateMerchantUserEvent(this.input);

  @override
  List<Object?> get props => [input];
}

/// Update merchant user
class UpdateMerchantUserEvent extends MerchantUsersEvent {
  final UpdateMerchantUserInput input;

  const UpdateMerchantUserEvent(this.input);

  @override
  List<Object?> get props => [input];
}

/// Deactivate merchant user
class DeactivateMerchantUserEvent extends MerchantUsersEvent {
  final String merchantId;
  final String userId;
  final String actionBy;

  const DeactivateMerchantUserEvent({
    required this.merchantId,
    required this.userId,
    required this.actionBy,
  });

  @override
  List<Object?> get props => [merchantId, userId, actionBy];
}

/// Activate merchant user
class ActivateMerchantUserEvent extends MerchantUsersEvent {
  final String merchantId;
  final String userId;
  final String actionBy;

  const ActivateMerchantUserEvent({
    required this.merchantId,
    required this.userId,
    required this.actionBy,
  });

  @override
  List<Object?> get props => [merchantId, userId, actionBy];
}

/// Get QR code for user
class GetUserQRCodeEvent extends MerchantUsersEvent {
  final String merchantId;
  final String userId;

  const GetUserQRCodeEvent({required this.merchantId, required this.userId});

  @override
  List<Object?> get props => [merchantId, userId];
}

/// Clear error
class ClearMerchantUsersError extends MerchantUsersEvent {
  const ClearMerchantUsersError();
}
