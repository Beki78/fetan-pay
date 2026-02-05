import 'package:equatable/equatable.dart';
import '../../data/models/scan_models.dart';
import 'scan_types.dart';

abstract class ScanEvent extends Equatable {
  const ScanEvent();

  @override
  List<Object?> get props => [];
}

class InitializeScan extends ScanEvent {}

class SelectBank extends ScanEvent {
  final String? bankId;

  SelectBank(this.bankId);
}

class SelectVerificationMethod extends ScanEvent {
  final VerificationMethod method;

  SelectVerificationMethod(this.method);
}

class UpdateTransactionReference extends ScanEvent {
  final String reference;

  UpdateTransactionReference(this.reference);
}

class UpdateTipAmount extends ScanEvent {
  final String tipAmount;

  UpdateTipAmount(this.tipAmount);
}

class ToggleTip extends ScanEvent {}

class ScanQRCode extends ScanEvent {
  final String qrData;

  ScanQRCode(this.qrData);
}

class VerifyPayment extends ScanEvent {}

class ResetScan extends ScanEvent {}
