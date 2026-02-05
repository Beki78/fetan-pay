import 'package:equatable/equatable.dart';

class ActiveAccount extends Equatable {
  final String id;
  final String name;
  final String accountNumber;
  final String bankId;
  final String bankName;
  final bool isActive;
  final String? merchantId;

  const ActiveAccount({
    required this.id,
    required this.name,
    required this.accountNumber,
    required this.bankId,
    required this.bankName,
    required this.isActive,
    this.merchantId,
  });

  factory ActiveAccount.fromJson(Map<String, dynamic> json) {
    final provider = json['provider'] as String? ?? '';
    return ActiveAccount(
      id: json['id'] as String? ?? '',
      name: json['receiverName'] as String? ?? '',
      accountNumber: json['receiverAccount'] as String? ?? '',
      bankId: provider.toLowerCase(),
      bankName: _getBankNameFromProvider(provider),
      isActive: json['status'] == 'ACTIVE',
      merchantId: json['merchantId'] as String?,
    );
  }

  static String _getBankNameFromProvider(String provider) {
    switch (provider.toUpperCase()) {
      case 'CBE':
        return 'Commercial Bank of Ethiopia';
      case 'BOA':
        return 'Bank of Abyssinia';
      case 'AWASH':
        return 'Awash International Bank';
      case 'TELEBIRR':
        return 'TeleBirr';
      case 'DASHEN':
        return 'Dashen Bank';
      default:
        return provider;
    }
  }

  @override
  List<Object?> get props => [id, name, accountNumber, bankId, bankName, isActive, merchantId];
}

class VerificationRequest extends Equatable {
  final String provider;
  final String reference;
  final double? tipAmount;

  const VerificationRequest({
    required this.provider,
    required this.reference,
    this.tipAmount,
  });

  Map<String, dynamic> toJson() {
    return {
      'provider': provider,
      'reference': reference,
      if (tipAmount != null) 'tipAmount': tipAmount,
    };
  }

  @override
  List<Object?> get props => [provider, reference, tipAmount];
}

class VerificationResponse extends Equatable {
  final String status;
  final String? reference;
  final TransactionDetails? transaction;
  final VerificationChecks? checks;
  final String? mismatchReason;

  const VerificationResponse({
    required this.status,
    this.reference,
    this.transaction,
    this.checks,
    this.mismatchReason,
  });

  factory VerificationResponse.fromJson(Map<String, dynamic> json) {
    return VerificationResponse(
      status: json['status'] as String? ?? 'UNKNOWN',
      reference: json['transaction']?['reference'] as String?,
      transaction: json['transaction'] != null
          ? TransactionDetails.fromJson(json['transaction'])
          : null,
      checks: json['checks'] != null
          ? VerificationChecks.fromJson(json['checks'])
          : null,
      mismatchReason: json['mismatchReason'] as String?,
    );
  }

  bool get isVerified => status == 'VERIFIED';

  @override
  List<Object?> get props => [status, reference, transaction, checks, mismatchReason];
}

class TransactionDetails extends Equatable {
  final String? reference;
  final String? senderName;
  final String? receiverAccount;
  final String? receiverName;
  final double? amount;
  final Map<String, dynamic>? raw;

  const TransactionDetails({
    this.reference,
    this.senderName,
    this.receiverAccount,
    this.receiverName,
    this.amount,
    this.raw,
  });

  factory TransactionDetails.fromJson(Map<String, dynamic> json) {
    return TransactionDetails(
      reference: json['reference'] as String?,
      senderName: json['senderName'] as String?,
      receiverAccount: json['receiverAccount'] as String?,
      receiverName: json['receiverName'] as String?,
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : null,
      raw: json['raw'] as Map<String, dynamic>?,
    );
  }

  @override
  List<Object?> get props => [reference, senderName, receiverAccount, receiverName, amount, raw];
}

class VerificationChecks extends Equatable {
  final bool referenceFound;
  final bool receiverMatches;
  final bool amountMatches;
  final Map<String, dynamic>? details;

  const VerificationChecks({
    required this.referenceFound,
    required this.receiverMatches,
    required this.amountMatches,
    this.details,
  });

  factory VerificationChecks.fromJson(Map<String, dynamic> json) {
    return VerificationChecks(
      referenceFound: json['referenceFound'] as bool? ?? false,
      receiverMatches: json['receiverMatches'] as bool? ?? false,
      amountMatches: json['amountMatches'] as bool? ?? false,
      details: json['details'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'referenceFound': referenceFound,
      'receiverMatches': receiverMatches,
      'amountMatches': amountMatches,
      if (details != null) 'details': details,
    };
  }

  @override
  List<Object?> get props => [referenceFound, receiverMatches, amountMatches, details];
}

class VerificationResult extends Equatable {
  final bool success;
  final String status;
  final String reference;
  final String provider;
  final String? senderName;
  final String? receiverAccount;
  final String? receiverName;
  final double? amount;
  final Map<String, dynamic>? details;
  final String? message;

  const VerificationResult({
    required this.success,
    required this.status,
    required this.reference,
    required this.provider,
    this.senderName,
    this.receiverAccount,
    this.receiverName,
    this.amount,
    this.details,
    this.message,
  });

  factory VerificationResult.fromResponse(VerificationResponse response, String provider) {
    final failureMessage = (() {
      if (response.checks == null) return 'Transaction could not be verified';
      if (!response.checks!.referenceFound) return 'Transaction not found';
      if (!response.checks!.receiverMatches) return 'Receiver account doesn\'t match your configured account';
      return 'Transaction could not be verified';
    })();

    return VerificationResult(
      success: response.isVerified,
      status: response.status,
      reference: response.reference ?? '',
      provider: provider.toUpperCase(),
      senderName: response.transaction?.senderName,
      receiverAccount: response.transaction?.receiverAccount,
      receiverName: response.transaction?.receiverName,
      amount: response.transaction?.amount,
      details: {
        'checks': response.checks?.toJson(),
        'raw': response.transaction?.raw,
      },
      message: response.isVerified ? null : (response.mismatchReason ?? failureMessage),
    );
  }

  @override
  List<Object?> get props => [
        success,
        status,
        reference,
        provider,
        senderName,
        receiverAccount,
        receiverName,
        amount,
        details,
        message,
      ];
}
