import 'package:equatable/equatable.dart';

enum ProviderStatus { ACTIVE, COMING_SOON, DISABLED }

enum ProviderCode { CBE, TELEBIRR, AWASH, BOA, DASHEN }

class PaymentProviderRecord extends Equatable {
  final String id;
  final ProviderCode code;
  final String name;
  final String? logoUrl;
  final ProviderStatus status;

  const PaymentProviderRecord({
    required this.id,
    required this.code,
    required this.name,
    this.logoUrl,
    required this.status,
  });

  factory PaymentProviderRecord.fromJson(Map<String, dynamic> json) {
    return PaymentProviderRecord(
      id: json['id'] as String,
      code: _parseProviderCode(json['code'] as String),
      name: json['name'] as String,
      logoUrl: json['logoUrl'] as String?,
      status: _parseProviderStatus(json['status'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code.name,
      'name': name,
      'logoUrl': logoUrl,
      'status': status.name,
    };
  }

  static ProviderCode _parseProviderCode(String code) {
    switch (code.toUpperCase()) {
      case 'CBE':
        return ProviderCode.CBE;
      case 'TELEBIRR':
        return ProviderCode.TELEBIRR;
      case 'AWASH':
        return ProviderCode.AWASH;
      case 'BOA':
        return ProviderCode.BOA;
      case 'DASHEN':
        return ProviderCode.DASHEN;
      default:
        return ProviderCode.CBE;
    }
  }

  static ProviderStatus _parseProviderStatus(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return ProviderStatus.ACTIVE;
      case 'COMING_SOON':
        return ProviderStatus.COMING_SOON;
      case 'DISABLED':
        return ProviderStatus.DISABLED;
      default:
        return ProviderStatus.DISABLED;
    }
  }

  @override
  List<Object?> get props => [id, code, name, logoUrl, status];
}

class PaymentProvidersResponse extends Equatable {
  final List<PaymentProviderRecord> providers;

  const PaymentProvidersResponse({required this.providers});

  factory PaymentProvidersResponse.fromJson(Map<String, dynamic> json) {
    return PaymentProvidersResponse(
      providers: (json['providers'] as List)
          .map(
            (item) =>
                PaymentProviderRecord.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'providers': providers.map((item) => item.toJson()).toList()};
  }

  @override
  List<Object> get props => [providers];
}

class SetActiveReceiverAccountInput extends Equatable {
  final String provider;
  final String receiverAccount;
  final String? receiverName;
  final String? receiverLabel;
  final bool? enabled;

  const SetActiveReceiverAccountInput({
    required this.provider,
    required this.receiverAccount,
    this.receiverName,
    this.receiverLabel,
    this.enabled,
  });

  Map<String, dynamic> toJson() {
    return {
      'provider': provider,
      'receiverAccount': receiverAccount,
      if (receiverName != null) 'receiverName': receiverName,
      if (receiverLabel != null) 'receiverLabel': receiverLabel,
      if (enabled != null) 'enabled': enabled,
    };
  }

  @override
  List<Object?> get props => [
    provider,
    receiverAccount,
    receiverName,
    receiverLabel,
    enabled,
  ];
}

class SetActiveReceiverAccountResponse extends Equatable {
  final Map<String, dynamic> active;

  const SetActiveReceiverAccountResponse({required this.active});

  factory SetActiveReceiverAccountResponse.fromJson(Map<String, dynamic> json) {
    return SetActiveReceiverAccountResponse(
      active: json['active'] as Map<String, dynamic>,
    );
  }

  @override
  List<Object> get props => [active];
}
