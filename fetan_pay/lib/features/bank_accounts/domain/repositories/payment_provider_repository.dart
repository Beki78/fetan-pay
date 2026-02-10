import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/payment_provider_models.dart';
import '../../../transactions/data/models/transaction_models.dart';

abstract class PaymentProviderRepository {
  /// Get all payment providers
  Future<Either<Failure, PaymentProvidersResponse>> getPaymentProviders();

  /// Get active receiver accounts
  Future<Either<Failure, ReceiverAccountsResponse>> getActiveReceiverAccounts({
    String? provider,
  });

  /// Set active receiver account
  Future<Either<Failure, SetActiveReceiverAccountResponse>>
  setActiveReceiverAccount(SetActiveReceiverAccountInput input);

  /// Disable active receiver account
  Future<Either<Failure, Map<String, dynamic>>> disableActiveReceiverAccount(
    String provider,
  );

  /// Enable last receiver account
  Future<Either<Failure, Map<String, dynamic>>> enableLastReceiverAccount(
    String provider,
  );
}
