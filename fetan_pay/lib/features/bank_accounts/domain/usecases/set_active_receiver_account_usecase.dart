import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/payment_provider_repository.dart';
import '../../data/models/payment_provider_models.dart';

class SetActiveReceiverAccountUseCase
    implements
        UseCase<
          SetActiveReceiverAccountResponse,
          SetActiveReceiverAccountInput
        > {
  final PaymentProviderRepository repository;

  SetActiveReceiverAccountUseCase(this.repository);

  @override
  Future<Either<Failure, SetActiveReceiverAccountResponse>> call(
    SetActiveReceiverAccountInput params,
  ) async {
    return await repository.setActiveReceiverAccount(params);
  }
}
