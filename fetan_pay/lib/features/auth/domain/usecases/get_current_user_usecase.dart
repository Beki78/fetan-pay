import 'package:dartz/dartz.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';
import '../../data/models/user_model.dart';

class GetCurrentUserUseCase implements NoParamsUseCase<User?> {
  final AuthRepository repository;

  GetCurrentUserUseCase(this.repository);

  @override
  Future<Either<Failure, User?>> call() async {
    return repository.getCurrentUser();
  }
}
