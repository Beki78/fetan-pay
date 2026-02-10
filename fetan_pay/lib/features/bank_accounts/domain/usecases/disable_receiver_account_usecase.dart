import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/payment_provider_repository.dart';

class DisableReceiverAccountUseCase
    implements UseCase<Map<String, dynamic>, DisableReceiverAccountParams> {
  final PaymentProviderRepository repository;

  DisableReceiverAccountUseCase(this.repository);

  @override
  Future<Either<Failure, Map<String, dynamic>>> call(
    DisableReceiverAccountParams params,
  ) async {
    return await repository.disableActiveReceiverAccount(params.provider);
  }
}

class DisableReceiverAccountParams extends Equatable {
  final String provider;

  const DisableReceiverAccountParams({required this.provider});

  @override
  List<Object> get props => [provider];
}
