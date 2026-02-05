import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../domain/repositories/scan_repository.dart';
import '../services/scan_api_service.dart';
import '../models/scan_models.dart';

class ScanRepositoryImpl implements ScanRepository {
  final ScanApiService _scanApiService;

  ScanRepositoryImpl(this._scanApiService);

  @override
  Future<Either<Failure, List<ActiveAccount>>> getActiveAccounts() async {
    try {
      final result = await _scanApiService.getActiveAccounts();
      return result.fold(
        (error) {
          final failure = ErrorHandler.handleError(error, context: 'getActiveAccounts');
          return Left(failure);
        },
        (accounts) => Right(accounts),
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'getActiveAccounts');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, VerificationResult>> verifyPayment(
    String provider,
    String reference,
    double? tipAmount,
  ) async {
    try {
      final request = VerificationRequest(
        provider: provider,
        reference: reference,
        tipAmount: tipAmount,
      );

      final result = await _scanApiService.verifyPayment(request);

      return result.fold(
        (error) {
          final failure = ErrorHandler.handleError(error, context: 'verifyPayment');
          // Convert to payment-specific failure if it's a generic failure
          if (failure is! PaymentFailure) {
            return Left(PaymentFailure(
              message: failure.message,
              code: failure.code,
              originalError: failure.originalError,
            ));
          }
          return Left(failure);
        },
        (response) => Right(VerificationResult.fromResponse(response, provider)),
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'verifyPayment');
      return Left(failure);
    }
  }
}
