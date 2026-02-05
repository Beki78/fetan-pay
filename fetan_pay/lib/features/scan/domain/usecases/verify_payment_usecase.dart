import 'package:dartz/dartz.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/scan_models.dart';
import '../repositories/scan_repository.dart';

class VerifyPaymentParams {
  final String provider;
  final String reference;
  final double? tipAmount;

  const VerifyPaymentParams({
    required this.provider,
    required this.reference,
    this.tipAmount,
  });
}

class VerifyPaymentUseCase implements UseCase<VerificationResult, VerifyPaymentParams> {
  final ScanRepository repository;

  VerifyPaymentUseCase(this.repository);

  @override
  Future<Either<Failure, VerificationResult>> call(VerifyPaymentParams params) async {
    return await repository.verifyPayment(
      params.provider,
      params.reference,
      params.tipAmount,
    );
  }
}
