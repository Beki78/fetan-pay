import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/transaction_repository.dart';
import '../../data/models/transaction_models.dart';

class VerifyQrUseCase implements UseCase<Map<String, dynamic>, VerifyQrParams> {
  final TransactionRepository repository;

  VerifyQrUseCase(this.repository);

  @override
  Future<Either<Failure, Map<String, dynamic>>> call(
    VerifyQrParams params,
  ) async {
    return await repository.verifyFromQr(
      qrUrl: params.qrUrl,
      provider: params.provider,
      reference: params.reference,
      accountSuffix: params.accountSuffix,
    );
  }
}

class VerifyQrParams extends Equatable {
  final String qrUrl;
  final TransactionProvider? provider;
  final String? reference;
  final String? accountSuffix;

  const VerifyQrParams({
    required this.qrUrl,
    this.provider,
    this.reference,
    this.accountSuffix,
  });

  @override
  List<Object?> get props => [qrUrl, provider, reference, accountSuffix];
}
