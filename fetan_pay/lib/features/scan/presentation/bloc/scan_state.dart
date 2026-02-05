import 'package:equatable/equatable.dart';
import '../../data/models/scan_models.dart';
import 'scan_types.dart';

abstract class ScanState extends Equatable {
  const ScanState();

  @override
  List<Object?> get props => [];
}

class ScanInitial extends ScanState {}

class ScanLoading extends ScanState {}

class ScanLoaded extends ScanState {
  final List<ActiveAccount> activeAccounts;
  final String? selectedBankId;
  final VerificationMethod verificationMethod;
  final String transactionReference;
  final String tipAmount;
  final bool showTip;
  final VerificationResult? verificationResult;
  final bool isVerifying;

  const ScanLoaded({
    required this.activeAccounts,
    this.selectedBankId,
    this.verificationMethod = VerificationMethod.none,
    this.transactionReference = '',
    this.tipAmount = '',
    this.showTip = false,
    this.verificationResult,
    this.isVerifying = false,
  });

  ScanLoaded copyWith({
    List<ActiveAccount>? activeAccounts,
    String? selectedBankId,
    VerificationMethod? verificationMethod,
    String? transactionReference,
    String? tipAmount,
    bool? showTip,
    VerificationResult? verificationResult,
    bool? isVerifying,
  }) {
    return ScanLoaded(
      activeAccounts: activeAccounts ?? this.activeAccounts,
      selectedBankId: selectedBankId ?? this.selectedBankId,
      verificationMethod: verificationMethod ?? this.verificationMethod,
      transactionReference: transactionReference ?? this.transactionReference,
      tipAmount: tipAmount ?? this.tipAmount,
      showTip: showTip ?? this.showTip,
      verificationResult: verificationResult ?? this.verificationResult,
      isVerifying: isVerifying ?? this.isVerifying,
    );
  }

  @override
  List<Object?> get props => [
        activeAccounts,
        selectedBankId,
        verificationMethod,
        transactionReference,
        tipAmount,
        showTip,
        verificationResult,
        isVerifying,
      ];
}

class ScanError extends ScanState {
  final String message;

  const ScanError(this.message);

  @override
  List<Object?> get props => [message];
}
