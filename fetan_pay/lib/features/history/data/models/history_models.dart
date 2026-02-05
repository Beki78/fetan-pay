import 'package:equatable/equatable.dart';

/// Transaction provider enum
enum TransactionProvider { CBE, TELEBIRR, AWASH, BOA, DASHEN }

/// Payment verification status enum
enum VerificationStatus { PENDING, VERIFIED, UNVERIFIED }

/// Receiver account information
class ReceiverAccount extends Equatable {
  final String id;
  final String merchantId;
  final String provider;
  final String status;
  final String? receiverLabel;
  final String receiverAccount;
  final String receiverName;
  final dynamic meta;
  final String createdAt;
  final String updatedAt;

  const ReceiverAccount({
    required this.id,
    required this.merchantId,
    required this.provider,
    required this.status,
    this.receiverLabel,
    required this.receiverAccount,
    required this.receiverName,
    this.meta,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReceiverAccount.fromJson(Map<String, dynamic> json) {
    return ReceiverAccount(
      id: json['id'] as String,
      merchantId: json['merchantId'] as String,
      provider: json['provider'] as String,
      status: json['status'] as String,
      receiverLabel: json['receiverLabel'] as String?,
      receiverAccount: json['receiverAccount'] as String,
      receiverName: json['receiverName'] as String,
      meta: json['meta'],
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'merchantId': merchantId,
      'provider': provider,
      'status': status,
      'receiverLabel': receiverLabel,
      'receiverAccount': receiverAccount,
      'receiverName': receiverName,
      'meta': meta,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  @override
  List<Object?> get props => [
    id,
    merchantId,
    provider,
    status,
    receiverLabel,
    receiverAccount,
    receiverName,
    meta,
    createdAt,
    updatedAt,
  ];
}

/// Verified by user information
class VerifiedByUser extends Equatable {
  final String id;
  final String? name;
  final String? email;
  final String role;
  final UserInfo? user;

  const VerifiedByUser({
    required this.id,
    this.name,
    this.email,
    required this.role,
    this.user,
  });

  factory VerifiedByUser.fromJson(Map<String, dynamic> json) {
    return VerifiedByUser(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String,
      user: json['user'] != null
          ? UserInfo.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'user': user?.toJson(),
    };
  }

  @override
  List<Object?> get props => [id, name, email, role, user];
}

/// User information
class UserInfo extends Equatable {
  final String id;
  final String email;
  final String name;

  const UserInfo({required this.id, required this.email, required this.name});

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'email': email, 'name': name};
  }

  @override
  List<Object?> get props => [id, email, name];
}

/// Individual verification history item
class VerificationHistoryItem extends Equatable {
  final String id;
  final String merchantId;
  final String orderId;
  final String? transactionId;
  final String provider;
  final String reference;
  final double claimedAmount;
  final double? tipAmount;
  final String receiverAccountId;
  final String status;
  final String? verifiedAt;
  final String? verifiedById;
  final String? mismatchReason;
  final dynamic verificationPayload;
  final bool walletCharged;
  final double? walletChargeAmount;
  final String? walletTransactionId;
  final String createdAt;
  final String updatedAt;
  final ReceiverAccount? receiverAccount;
  final VerifiedByUser? verifiedBy;

  const VerificationHistoryItem({
    required this.id,
    required this.merchantId,
    required this.orderId,
    this.transactionId,
    required this.provider,
    required this.reference,
    required this.claimedAmount,
    this.tipAmount,
    required this.receiverAccountId,
    required this.status,
    this.verifiedAt,
    this.verifiedById,
    this.mismatchReason,
    this.verificationPayload,
    required this.walletCharged,
    this.walletChargeAmount,
    this.walletTransactionId,
    required this.createdAt,
    required this.updatedAt,
    this.receiverAccount,
    this.verifiedBy,
  });

  factory VerificationHistoryItem.fromJson(Map<String, dynamic> json) {
    return VerificationHistoryItem(
      id: json['id'] as String,
      merchantId: json['merchantId'] as String,
      orderId: json['orderId'] as String,
      transactionId: json['transactionId'] as String?,
      provider: json['provider'] as String,
      reference: json['reference'] as String,
      claimedAmount: _parseAmount(json['claimedAmount']),
      tipAmount: json['tipAmount'] != null
          ? _parseAmount(json['tipAmount'])
          : null,
      receiverAccountId: json['receiverAccountId'] as String,
      status: json['status'] as String,
      verifiedAt: json['verifiedAt'] as String?,
      verifiedById: json['verifiedById'] as String?,
      mismatchReason: json['mismatchReason'] as String?,
      verificationPayload: json['verificationPayload'],
      walletCharged: json['walletCharged'] as bool? ?? false,
      walletChargeAmount: json['walletChargeAmount'] != null
          ? _parseAmount(json['walletChargeAmount'])
          : null,
      walletTransactionId: json['walletTransactionId'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      receiverAccount: json['receiverAccount'] != null
          ? ReceiverAccount.fromJson(
              json['receiverAccount'] as Map<String, dynamic>,
            )
          : null,
      verifiedBy: json['verifiedBy'] != null
          ? VerifiedByUser.fromJson(json['verifiedBy'] as Map<String, dynamic>)
          : null,
    );
  }

  /// Helper method to parse amount from either string or number
  static double _parseAmount(dynamic value) {
    if (value is String) {
      return double.tryParse(value) ?? 0.0;
    } else if (value is num) {
      return value.toDouble();
    }
    return 0.0;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'merchantId': merchantId,
      'orderId': orderId,
      'transactionId': transactionId,
      'provider': provider,
      'reference': reference,
      'claimedAmount': claimedAmount,
      'tipAmount': tipAmount,
      'receiverAccountId': receiverAccountId,
      'status': status,
      'verifiedAt': verifiedAt,
      'verifiedById': verifiedById,
      'mismatchReason': mismatchReason,
      'verificationPayload': verificationPayload,
      'walletCharged': walletCharged,
      'walletChargeAmount': walletChargeAmount,
      'walletTransactionId': walletTransactionId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'receiverAccount': receiverAccount?.toJson(),
      'verifiedBy': verifiedBy?.toJson(),
    };
  }

  @override
  List<Object?> get props => [
    id,
    merchantId,
    orderId,
    transactionId,
    provider,
    reference,
    claimedAmount,
    tipAmount,
    receiverAccountId,
    status,
    verifiedAt,
    verifiedById,
    mismatchReason,
    verificationPayload,
    walletCharged,
    walletChargeAmount,
    walletTransactionId,
    createdAt,
    updatedAt,
    receiverAccount,
    verifiedBy,
  ];
}

/// List verification history response model
class ListVerificationHistoryResponse extends Equatable {
  final int page;
  final int pageSize;
  final int total;
  final List<VerificationHistoryItem> data;

  const ListVerificationHistoryResponse({
    required this.page,
    required this.pageSize,
    required this.total,
    required this.data,
  });

  factory ListVerificationHistoryResponse.fromJson(Map<String, dynamic> json) {
    return ListVerificationHistoryResponse(
      page: json['page'] as int,
      pageSize: json['pageSize'] as int,
      total: json['total'] as int,
      data: (json['data'] as List<dynamic>)
          .map(
            (item) =>
                VerificationHistoryItem.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'pageSize': pageSize,
      'total': total,
      'data': data.map((item) => item.toJson()).toList(),
    };
  }

  @override
  List<Object?> get props => [page, pageSize, total, data];
}

/// List verification history query parameters
class ListVerificationHistoryQuery extends Equatable {
  final String? provider;
  final String? status;
  final String? reference;
  final String? from;
  final String? to;
  final int? page;
  final int? pageSize;

  const ListVerificationHistoryQuery({
    this.provider,
    this.status,
    this.reference,
    this.from,
    this.to,
    this.page,
    this.pageSize,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> json = {};
    if (provider != null) json['provider'] = provider;
    if (status != null) json['status'] = status;
    if (reference != null) json['reference'] = reference;
    if (from != null) json['from'] = from;
    if (to != null) json['to'] = to;
    if (page != null) json['page'] = page;
    if (pageSize != null) json['pageSize'] = pageSize;
    return json;
  }

  @override
  List<Object?> get props => [
    provider,
    status,
    reference,
    from,
    to,
    page,
    pageSize,
  ];
}
