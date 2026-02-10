import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/payment_provider_repository.dart';
import '../../data/models/payment_provider_models.dart';

class GetPaymentProvidersUseCase
    implements UseCase<PaymentProvidersResponse, NoParams> {
  final PaymentProviderRepository repository;

  GetPaymentProvidersUseCase(this.repository);

  @override
  Future<Either<Failure, PaymentProvidersResponse>> call(
    NoParams params,
  ) async {
    return await repository.getPaymentProviders();
  }
}
