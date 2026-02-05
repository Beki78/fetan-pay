import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/utils/secure_logger.dart';
import '../../domain/usecases/get_active_accounts_usecase.dart';
import '../../domain/usecases/verify_payment_usecase.dart';
import '../../data/models/scan_models.dart';
import '../../../../core/usecases/usecase.dart';
import 'scan_types.dart';
import 'scan_event.dart';
import 'scan_state.dart';

class ScanBloc extends Bloc<ScanEvent, ScanState> {
  final GetActiveAccountsUseCase _getActiveAccountsUseCase;
  final VerifyPaymentUseCase _verifyPaymentUseCase;

  ScanBloc({
    required GetActiveAccountsUseCase getActiveAccountsUseCase,
    required VerifyPaymentUseCase verifyPaymentUseCase,
  }) : _getActiveAccountsUseCase = getActiveAccountsUseCase,
       _verifyPaymentUseCase = verifyPaymentUseCase,
       super(ScanInitial()) {
    on<InitializeScan>(_onInitializeScan);
    on<SelectBank>(_onSelectBank);
    on<SelectVerificationMethod>(_onSelectVerificationMethod);
    on<UpdateTransactionReference>(_onUpdateTransactionReference);
    on<UpdateTipAmount>(_onUpdateTipAmount);
    on<ToggleTip>(_onToggleTip);
    on<ScanQRCode>(_onScanQRCode);
    on<VerifyPayment>(_onVerifyPayment);
    on<ResetScan>(_onResetScan);
  }

  Future<void> _onInitializeScan(
    InitializeScan event,
    Emitter<ScanState> emit,
  ) async {
    emit(ScanLoading());

    try {
      final result = await _getActiveAccountsUseCase(NoParams());

      result.fold(
        (failure) {
          SecureLogger.error('Failed to initialize scan', error: failure);
          emit(ScanError(ErrorHandler.getErrorMessage(failure)));
        },
        (activeAccounts) {
          SecureLogger.info('Scan initialized successfully');
          emit(ScanLoaded(activeAccounts: activeAccounts));
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'InitializeScan');
      emit(ScanError(failure.message));
    }
  }

  void _onSelectBank(SelectBank event, Emitter<ScanState> emit) {
    if (state is ScanLoaded) {
      final currentState = state as ScanLoaded;
      emit(
        currentState.copyWith(
          selectedBankId: event.bankId,
          verificationMethod: VerificationMethod.none,
          transactionReference: '',
          verificationResult: null,
        ),
      );
    }
  }

  void _onSelectVerificationMethod(
    SelectVerificationMethod event,
    Emitter<ScanState> emit,
  ) {
    if (state is ScanLoaded) {
      final currentState = state as ScanLoaded;
      emit(
        currentState.copyWith(
          verificationMethod: event.method,
          transactionReference: '',
          verificationResult: null,
        ),
      );
    }
  }

  void _onUpdateTransactionReference(
    UpdateTransactionReference event,
    Emitter<ScanState> emit,
  ) {
    if (state is ScanLoaded) {
      final currentState = state as ScanLoaded;
      emit(currentState.copyWith(transactionReference: event.reference));
    }
  }

  void _onUpdateTipAmount(UpdateTipAmount event, Emitter<ScanState> emit) {
    if (state is ScanLoaded) {
      final currentState = state as ScanLoaded;
      emit(currentState.copyWith(tipAmount: event.tipAmount));
    }
  }

  void _onToggleTip(ToggleTip event, Emitter<ScanState> emit) {
    if (state is ScanLoaded) {
      final currentState = state as ScanLoaded;
      final newShowTip = !currentState.showTip;
      emit(
        currentState.copyWith(
          showTip: newShowTip,
          tipAmount: newShowTip ? currentState.tipAmount : '',
        ),
      );
    }
  }

  Future<void> _onScanQRCode(ScanQRCode event, Emitter<ScanState> emit) async {
    if (state is! ScanLoaded) return;

    final currentState = state as ScanLoaded;
    emit(currentState.copyWith(isVerifying: true));

    try {
      // Detect bank from URL and extract transaction reference
      final detectedBank = _detectBankFromUrl(event.qrData);
      final extractedReference = _extractTransactionId(
        detectedBank ?? currentState.selectedBankId,
        event.qrData,
      );

      final finalReference =
          extractedReference != null && extractedReference != event.qrData
          ? extractedReference
          : event.qrData;

      final finalBankId = detectedBank ?? currentState.selectedBankId;

      SecureLogger.qrEvent('QR code processed successfully');

      emit(
        currentState.copyWith(
          selectedBankId: finalBankId,
          verificationMethod: VerificationMethod.camera,
          transactionReference: finalReference,
          isVerifying: false,
        ),
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'ScanQRCode');
      SecureLogger.error('Failed to process QR code', error: failure);

      emit(
        currentState.copyWith(
          isVerifying: false,
          verificationResult: VerificationResult(
            success: false,
            status: 'ERROR',
            reference: event.qrData,
            provider: currentState.selectedBankId ?? '',
            message: 'Failed to process QR code: ${failure.message}',
          ),
        ),
      );
    }
  }

  Future<void> _onVerifyPayment(
    VerifyPayment event,
    Emitter<ScanState> emit,
  ) async {
    if (state is! ScanLoaded) return;

    final currentState = state as ScanLoaded;

    // Validation
    if (currentState.selectedBankId == null) {
      emit(ScanError('Please select a bank first'));
      return;
    }

    if (currentState.verificationMethod == VerificationMethod.none) {
      emit(ScanError('Please select a verification method'));
      return;
    }

    if (currentState.verificationMethod == VerificationMethod.transaction &&
        currentState.transactionReference.isEmpty) {
      emit(ScanError('Please enter transaction reference'));
      return;
    }

    if (currentState.verificationMethod == VerificationMethod.camera &&
        currentState.transactionReference.isEmpty) {
      emit(ScanError('Please scan a QR code'));
      return;
    }

    emit(currentState.copyWith(isVerifying: true, verificationResult: null));

    try {
      final provider = _getProviderFromBankId(currentState.selectedBankId!);
      final tipAmount =
          currentState.showTip && currentState.tipAmount.isNotEmpty
          ? double.tryParse(currentState.tipAmount.replaceAll(',', ''))
          : null;

      SecureLogger.info('Starting payment verification');

      final result = await _verifyPaymentUseCase(
        VerifyPaymentParams(
          provider: provider,
          reference: currentState.transactionReference,
          tipAmount: tipAmount,
        ),
      );

      result.fold(
        (failure) {
          SecureLogger.error('Payment verification failed', error: failure);
          emit(
            currentState.copyWith(
              isVerifying: false,
              verificationResult: VerificationResult(
                success: false,
                status: 'ERROR',
                reference: currentState.transactionReference,
                provider: provider,
                message: ErrorHandler.getErrorMessage(failure),
              ),
            ),
          );
        },
        (verificationResult) {
          SecureLogger.info('Payment verification completed');
          emit(
            currentState.copyWith(
              isVerifying: false,
              verificationResult: verificationResult,
            ),
          );
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'VerifyPayment');
      SecureLogger.error(
        'Unexpected error during payment verification',
        error: failure,
      );

      emit(
        currentState.copyWith(
          isVerifying: false,
          verificationResult: VerificationResult(
            success: false,
            status: 'ERROR',
            reference: currentState.transactionReference,
            provider: _getProviderFromBankId(currentState.selectedBankId!),
            message: failure.message,
          ),
        ),
      );
    }
  }

  void _onResetScan(ResetScan event, Emitter<ScanState> emit) {
    if (state is ScanLoaded) {
      final currentState = state as ScanLoaded;
      emit(
        currentState.copyWith(
          selectedBankId: null,
          verificationMethod: VerificationMethod.none,
          transactionReference: '',
          tipAmount: '',
          showTip: false,
          verificationResult: null,
          isVerifying: false,
        ),
      );
    }
  }

  String? _detectBankFromUrl(String url) {
    final lowerUrl = url.toLowerCase();

    if (lowerUrl.contains('cbe')) return 'cbe';
    if (lowerUrl.contains('boa') || lowerUrl.contains('abyssinia'))
      return 'boa';
    if (lowerUrl.contains('awash')) return 'awash';
    if (lowerUrl.contains('telebirr') || lowerUrl.contains('tele'))
      return 'telebirr';

    return null;
  }

  String? _extractTransactionId(String? bankId, String url) {
    // Extract transaction ID from various bank URLs
    final patterns = {
      'cbe': RegExp(r'[?&]r=([A-Z0-9]+)'),
      'boa': RegExp(r'[?&]ref=([A-Z0-9]+)'),
      'awash': RegExp(r'[?&]txn=([A-Z0-9]+)'),
      'telebirr': RegExp(r'[?&]id=([A-Z0-9]+)'),
    };

    final pattern = patterns[bankId];
    if (pattern != null) {
      final match = pattern.firstMatch(url);
      if (match != null && match.groupCount >= 1) {
        return match.group(1);
      }
    }

    return null;
  }

  String _getProviderFromBankId(String bankId) {
    switch (bankId.toLowerCase()) {
      case 'cbe':
        return 'CBE';
      case 'boa':
        return 'BOA';
      case 'awash':
        return 'AWASH';
      case 'telebirr':
        return 'TELEBIRR';
      default:
        return bankId.toUpperCase();
    }
  }
}
