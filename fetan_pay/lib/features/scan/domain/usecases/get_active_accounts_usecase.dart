import 'package:dartz/dartz.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/scan_models.dart';
import '../repositories/scan_repository.dart';

class GetActiveAccountsUseCase implements UseCase<List<ActiveAccount>, NoParams> {
  final ScanRepository repository;

  GetActiveAccountsUseCase(this.repository);

  @override
  Future<Either<Failure, List<ActiveAccount>>> call(NoParams params) async {
    return await repository.getActiveAccounts();
  }
}
