import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/payment_provider_repository.dart';

class EnableReceiverAccountUseCase
    implements UseCase<Map<String, dynamic>, EnableReceiverAccountParams> {
  final PaymentProviderRepository repository;

  EnableReceiverAccountUseCase(this.repository);

  @override
  Future<Either<Failure, Map<String, dynamic>>> call(
    EnableReceiverAccountParams params,
  ) async {
    return await repository.enableLastReceiverAccount(params.provider);
  }
}

class EnableReceiverAccountParams extends Equatable {
  final String provider;

  const EnableReceiverAccountParams({required this.provider});

  @override
  List<Object> get props => [provider];
}
