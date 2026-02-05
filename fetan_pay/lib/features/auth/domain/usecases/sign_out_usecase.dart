import 'package:dartz/dartz.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

class SignOutUseCase implements NoParamsUseCase<void> {
  final AuthRepository repository;

  SignOutUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call() async {
    return await repository.signOut();
  }
}
