import 'package:equatable/equatable.dart';

enum TransactionProvider { CBE, TELEBIRR, AWASH, BOA, DASHEN }

enum TransactionStatus { PENDING, VERIFIED, FAILED, EXPIRED }

class TransactionRecord extends Equatable {
  final String id;
  final TransactionProvider provider;
  final String reference;
  final String qrUrl;
  final TransactionStatus status;
  final DateTime? verifiedAt;
  final DateTime createdAt;
  final String? errorMessage;
  final Map<String, dynamic>? verificationPayload;
  final TransactionMerchant? merchant;
  final TransactionVerifiedBy? verifiedBy;
  final List<TransactionPayment>? payments;

  const TransactionRecord({
    required this.id,
    required this.provider,
    required this.reference,
    required this.qrUrl,
    required this.status,
    this.verifiedAt,
    required this.createdAt,
    this.errorMessage,
    this.verificationPayload,
    this.merchant,
    this.verifiedBy,
    this.payments,
  });

  factory TransactionRecord.fromJson(Map<String, dynamic> json) {
    return TransactionRecord(
      id: json['id'] as String,
      provider: _parseProvider(json['provider'] as String),
      reference: json['reference'] as String,
      qrUrl: json['qrUrl'] as String,
      status: _parseStatus(json['status'] as String),
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.parse(json['verifiedAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      errorMessage: json['errorMessage'] as String?,
      verificationPayload: json['verificationPayload'] as Map<String, dynamic>?,
      merchant: json['merchant'] != null
          ? TransactionMerchant.fromJson(
              json['merchant'] as Map<String, dynamic>,
            )
          : null,
      verifiedBy: json['verifiedBy'] != null
          ? TransactionVerifiedBy.fromJson(
              json['verifiedBy'] as Map<String, dynamic>,
            )
          : null,
      payments: json['payments'] != null
          ? (json['payments'] as List)
                .map(
                  (p) => TransactionPayment.fromJson(p as Map<String, dynamic>),
                )
                .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'provider': provider.name,
      'reference': reference,
      'qrUrl': qrUrl,
      'status': status.name,
      'verifiedAt': verifiedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'errorMessage': errorMessage,
      'verificationPayload': verificationPayload,
      'merchant': merchant?.toJson(),
      'verifiedBy': verifiedBy?.toJson(),
      'payments': payments?.map((p) => p.toJson()).toList(),
    };
  }

  static TransactionProvider _parseProvider(String provider) {
    switch (provider.toUpperCase()) {
      case 'CBE':
        return TransactionProvider.CBE;
      case 'TELEBIRR':
        return TransactionProvider.TELEBIRR;
      case 'AWASH':
        return TransactionProvider.AWASH;
      case 'BOA':
        return TransactionProvider.BOA;
      case 'DASHEN':
        return TransactionProvider.DASHEN;
      default:
        return TransactionProvider.CBE; // Default fallback
    }
  }

  static TransactionStatus _parseStatus(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return TransactionStatus.PENDING;
      case 'VERIFIED':
        return TransactionStatus.VERIFIED;
      case 'FAILED':
        return TransactionStatus.FAILED;
      case 'EXPIRED':
        return TransactionStatus.EXPIRED;
      default:
        return TransactionStatus.PENDING; // Default fallback
    }
  }

  // Helper methods
  String get providerDisplayName {
    switch (provider) {
      case TransactionProvider.CBE:
        return 'CBE Mobile';
      case TransactionProvider.TELEBIRR:
        return 'TeleBirr';
      case TransactionProvider.AWASH:
        return 'Awash Bank';
      case TransactionProvider.BOA:
        return 'Bank of Abyssinia';
      case TransactionProvider.DASHEN:
        return 'Dashen Bank';
    }
  }

  String get statusDisplayName {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'PENDING';
      case TransactionStatus.VERIFIED:
        return 'VERIFIED';
      case TransactionStatus.FAILED:
        return 'FAILED';
      case TransactionStatus.EXPIRED:
        return 'EXPIRED';
    }
  }

  double get amount {
    if (payments != null && payments!.isNotEmpty) {
      final payment = payments!.first;
      if (payment.order.expectedAmount != null) {
        return double.tryParse(payment.order.expectedAmount!) ?? 0.0;
      }
    }
    return 0.0;
  }

  String get currency {
    if (payments != null && payments!.isNotEmpty) {
      return payments!.first.order.currency ?? 'ETB';
    }
    return 'ETB';
  }

  @override
  List<Object?> get props => [
    id,
    provider,
    reference,
    qrUrl,
    status,
    verifiedAt,
    createdAt,
    errorMessage,
    verificationPayload,
    merchant,
    verifiedBy,
    payments,
  ];
}

class TransactionMerchant extends Equatable {
  final String id;
  final String name;

  const TransactionMerchant({required this.id, required this.name});

  factory TransactionMerchant.fromJson(Map<String, dynamic> json) {
    return TransactionMerchant(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name};
  }

  @override
  List<Object> get props => [id, name];
}

class TransactionVerifiedBy extends Equatable {
  final String id;
  final String? name;
  final String? email;
  final String? role;
  final TransactionUser? user;

  const TransactionVerifiedBy({
    required this.id,
    this.name,
    this.email,
    this.role,
    this.user,
  });

  factory TransactionVerifiedBy.fromJson(Map<String, dynamic> json) {
    return TransactionVerifiedBy(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String?,
      user: json['user'] != null
          ? TransactionUser.fromJson(json['user'] as Map<String, dynamic>)
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

class TransactionUser extends Equatable {
  final String id;
  final String email;
  final String name;

  const TransactionUser({
    required this.id,
    required this.email,
    required this.name,
  });

  factory TransactionUser.fromJson(Map<String, dynamic> json) {
    return TransactionUser(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'email': email, 'name': name};
  }

  @override
  List<Object> get props => [id, email, name];
}

class TransactionPayment extends Equatable {
  final String id;
  final TransactionOrder order;
  final TransactionReceiverAccount? receiverAccount;

  const TransactionPayment({
    required this.id,
    required this.order,
    this.receiverAccount,
  });

  factory TransactionPayment.fromJson(Map<String, dynamic> json) {
    return TransactionPayment(
      id: json['id'] as String,
      order: TransactionOrder.fromJson(json['order'] as Map<String, dynamic>),
      receiverAccount: json['receiverAccount'] != null
          ? TransactionReceiverAccount.fromJson(
              json['receiverAccount'] as Map<String, dynamic>,
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order': order.toJson(),
      'receiverAccount': receiverAccount?.toJson(),
    };
  }

  @override
  List<Object?> get props => [id, order, receiverAccount];
}

class TransactionOrder extends Equatable {
  final String id;
  final String? expectedAmount;
  final String? currency;
  final String? status;
  final DateTime createdAt;

  const TransactionOrder({
    required this.id,
    this.expectedAmount,
    this.currency,
    this.status,
    required this.createdAt,
  });

  factory TransactionOrder.fromJson(Map<String, dynamic> json) {
    return TransactionOrder(
      id: json['id'] as String,
      expectedAmount: json['expectedAmount'] as String?,
      currency: json['currency'] as String?,
      status: json['status'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'expectedAmount': expectedAmount,
      'currency': currency,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, expectedAmount, currency, status, createdAt];
}

class TransactionReceiverAccount extends Equatable {
  final String? receiverName;
  final String receiverAccount;

  const TransactionReceiverAccount({
    this.receiverName,
    required this.receiverAccount,
  });

  factory TransactionReceiverAccount.fromJson(Map<String, dynamic> json) {
    return TransactionReceiverAccount(
      receiverName: json['receiverName'] as String?,
      receiverAccount: json['receiverAccount'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'receiverName': receiverName, 'receiverAccount': receiverAccount};
  }

  @override
  List<Object?> get props => [receiverName, receiverAccount];
}

class TransactionListResponse extends Equatable {
  final List<TransactionRecord> data;
  final int total;
  final int page;
  final int pageSize;

  const TransactionListResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  factory TransactionListResponse.fromJson(Map<String, dynamic> json) {
    return TransactionListResponse(
      data: (json['data'] as List)
          .map(
            (item) => TransactionRecord.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
      total: json['total'] as int,
      page: json['page'] as int,
      pageSize: json['pageSize'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data': data.map((item) => item.toJson()).toList(),
      'total': total,
      'page': page,
      'pageSize': pageSize,
    };
  }

  @override
  List<Object> get props => [data, total, page, pageSize];
}

class TransactionSummary extends Equatable {
  final double totalVolume;
  final int totalTransactions;
  final double successRate;
  final int verifiedCount;
  final int pendingCount;
  final int failedCount;

  const TransactionSummary({
    required this.totalVolume,
    required this.totalTransactions,
    required this.successRate,
    required this.verifiedCount,
    required this.pendingCount,
    required this.failedCount,
  });

  factory TransactionSummary.fromTransactions(
    List<TransactionRecord> transactions,
  ) {
    final totalTransactions = transactions.length;
    final verifiedCount = transactions
        .where((t) => t.status == TransactionStatus.VERIFIED)
        .length;
    final pendingCount = transactions
        .where((t) => t.status == TransactionStatus.PENDING)
        .length;
    final failedCount = transactions
        .where((t) => t.status == TransactionStatus.FAILED)
        .length;

    final totalVolume = transactions
        .where((t) => t.status == TransactionStatus.VERIFIED)
        .fold(0.0, (sum, t) => sum + t.amount);

    final successRate = totalTransactions > 0
        ? (verifiedCount / totalTransactions) * 100
        : 0.0;

    return TransactionSummary(
      totalVolume: totalVolume,
      totalTransactions: totalTransactions,
      successRate: successRate,
      verifiedCount: verifiedCount,
      pendingCount: pendingCount,
      failedCount: failedCount,
    );
  }

  @override
  List<Object> get props => [
    totalVolume,
    totalTransactions,
    successRate,
    verifiedCount,
    pendingCount,
    failedCount,
  ];
}

// Receiver Account Models
class ReceiverAccount extends Equatable {
  final String id;
  final String merchantId;
  final TransactionProvider provider;
  final String status;
  final String? receiverLabel;
  final String receiverAccount;
  final String? receiverName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ReceiverAccount({
    required this.id,
    required this.merchantId,
    required this.provider,
    required this.status,
    this.receiverLabel,
    required this.receiverAccount,
    this.receiverName,
    this.createdAt,
    this.updatedAt,
  });

  factory ReceiverAccount.fromJson(Map<String, dynamic> json) {
    return ReceiverAccount(
      id: json['id'] as String,
      merchantId: json['merchantId'] as String,
      provider: TransactionRecord._parseProvider(json['provider'] as String),
      status: json['status'] as String,
      receiverLabel: json['receiverLabel'] as String?,
      receiverAccount: json['receiverAccount'] as String,
      receiverName: json['receiverName'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'merchantId': merchantId,
      'provider': provider.name,
      'status': status,
      'receiverLabel': receiverLabel,
      'receiverAccount': receiverAccount,
      'receiverName': receiverName,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
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
    createdAt,
    updatedAt,
  ];
}

class ReceiverAccountsResponse extends Equatable {
  final List<ReceiverAccount> data;

  const ReceiverAccountsResponse({required this.data});

  factory ReceiverAccountsResponse.fromJson(Map<String, dynamic> json) {
    return ReceiverAccountsResponse(
      data: (json['data'] as List)
          .map((item) => ReceiverAccount.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'data': data.map((item) => item.toJson()).toList()};
  }

  @override
  List<Object> get props => [data];
}

// Create Order Models
class CreateOrderInput extends Equatable {
  final double expectedAmount;
  final String? currency;
  final TransactionProvider? provider;
  final String? payerName;

  const CreateOrderInput({
    required this.expectedAmount,
    this.currency,
    this.provider,
    this.payerName,
  });

  Map<String, dynamic> toJson() {
    return {
      'expectedAmount': expectedAmount,
      if (currency != null) 'currency': currency,
      if (provider != null) 'provider': provider!.name,
      if (payerName != null) 'payerName': payerName,
    };
  }

  @override
  List<Object?> get props => [expectedAmount, currency, provider, payerName];
}

class CreateOrderResponse extends Equatable {
  final TransactionOrder order;
  final TransactionRecord transaction;
  final TransactionReceiverAccount? receiverAccount;

  const CreateOrderResponse({
    required this.order,
    required this.transaction,
    this.receiverAccount,
  });

  factory CreateOrderResponse.fromJson(Map<String, dynamic> json) {
    return CreateOrderResponse(
      order: TransactionOrder.fromJson(json['order'] as Map<String, dynamic>),
      transaction: TransactionRecord.fromJson(
        json['transaction'] as Map<String, dynamic>,
      ),
      receiverAccount: json['receiverAccount'] != null
          ? TransactionReceiverAccount.fromJson(
              json['receiverAccount'] as Map<String, dynamic>,
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order': order.toJson(),
      'transaction': transaction.toJson(),
      'receiverAccount': receiverAccount?.toJson(),
    };
  }

  @override
  List<Object?> get props => [order, transaction, receiverAccount];
}
