import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/scan_models.dart';

abstract class ScanRepository {
  Future<Either<Failure, List<ActiveAccount>>> getActiveAccounts();
  Future<Either<Failure, VerificationResult>> verifyPayment(
    String provider,
    String reference,
    double? tipAmount,
  );
}
