import 'package:equatable/equatable.dart';
import '../../data/models/merchant_user_models.dart';

abstract class MerchantUsersState extends Equatable {
  const MerchantUsersState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class MerchantUsersInitial extends MerchantUsersState {
  const MerchantUsersInitial();
}

/// Loading state
class MerchantUsersLoading extends MerchantUsersState {
  const MerchantUsersLoading();
}

/// Loaded state
class MerchantUsersLoaded extends MerchantUsersState {
  final List<MerchantUser> users;
  final QRCodeResponse? qrCode;

  const MerchantUsersLoaded({required this.users, this.qrCode});

  @override
  List<Object?> get props => [users, qrCode];

  MerchantUsersLoaded copyWith({
    List<MerchantUser>? users,
    QRCodeResponse? qrCode,
  }) {
    return MerchantUsersLoaded(
      users: users ?? this.users,
      qrCode: qrCode ?? this.qrCode,
    );
  }
}

/// Operation in progress (create, update, activate, deactivate)
class MerchantUsersOperationInProgress extends MerchantUsersState {
  final List<MerchantUser> users;
  final String operationType; // 'create', 'update', 'activate', 'deactivate'

  const MerchantUsersOperationInProgress({
    required this.users,
    required this.operationType,
  });

  @override
  List<Object?> get props => [users, operationType];
}

/// Operation success
class MerchantUsersOperationSuccess extends MerchantUsersState {
  final List<MerchantUser> users;
  final String message;

  const MerchantUsersOperationSuccess({
    required this.users,
    required this.message,
  });

  @override
  List<Object?> get props => [users, message];
}

/// QR code loaded
class MerchantUsersQRCodeLoaded extends MerchantUsersState {
  final List<MerchantUser> users;
  final QRCodeResponse qrCode;

  const MerchantUsersQRCodeLoaded({required this.users, required this.qrCode});

  @override
  List<Object?> get props => [users, qrCode];
}

/// Error state
class MerchantUsersError extends MerchantUsersState {
  final String message;
  final List<MerchantUser>? users; // Keep users if available

  const MerchantUsersError({required this.message, this.users});

  @override
  List<Object?> get props => [message, users];
}
