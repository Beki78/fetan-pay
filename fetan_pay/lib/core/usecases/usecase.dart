import 'package:dartz/dartz.dart';

abstract class UseCase<Type, Params> {
  Future<Either<Exception, Type>> call(Params params);
}

abstract class NoParamsUseCase<Type> {
  Future<Either<Exception, Type>> call();
}

class NoParams {
  const NoParams();
}
