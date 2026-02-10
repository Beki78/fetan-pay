import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/transaction_repository.dart';
import '../../data/models/transaction_models.dart';

class CreateOrderUseCase
    implements UseCase<CreateOrderResponse, CreateOrderInput> {
  final TransactionRepository repository;

  CreateOrderUseCase(this.repository);

  @override
  Future<Either<Failure, CreateOrderResponse>> call(
    CreateOrderInput params,
  ) async {
    return await repository.createOrder(params);
  }
}
