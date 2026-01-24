import 'package:dartz/dartz.dart';
import '../../../../core/usecases/usecase.dart';
import '../repositories/auth_repository.dart';
import '../../data/models/login_models.dart';

class ValidateQRUseCase implements UseCase<QRLoginResponse, ValidateQRParams> {
  final AuthRepository repository;

  ValidateQRUseCase(this.repository);

  @override
  Future<Either<Exception, QRLoginResponse>> call(ValidateQRParams params) async {
    return await repository.validateQRCode(params.qrData, params.origin);
  }
}

class ValidateQRParams {
  final String qrData;
  final String origin;

  ValidateQRParams({required this.qrData, required this.origin});
}
