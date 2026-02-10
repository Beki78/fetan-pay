import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../data/models/transaction_models.dart';

abstract class TransactionRepository {
  /// List transactions with optional filters
  Future<Either<Failure, TransactionListResponse>> listTransactions({
    TransactionProvider? provider,
    TransactionStatus? status,
    int page = 1,
    int pageSize = 20,
  });

  /// Get a single transaction by ID or reference
  Future<Either<Failure, TransactionRecord>> getTransaction(
    String idOrReference,
  );

  /// List transactions verified by a specific merchant user
  Future<Either<Failure, TransactionListResponse>> listVerifiedByUser({
    required String merchantUserId,
    int page = 1,
    int pageSize = 20,
  });

  /// Verify a transaction from QR code
  Future<Either<Failure, Map<String, dynamic>>> verifyFromQr({
    required String qrUrl,
    TransactionProvider? provider,
    String? reference,
    String? accountSuffix,
  });

  /// Test connection to the transactions API
  Future<bool> testConnection();

  /// Get cached transactions
  Future<List<TransactionRecord>?> getCachedTransactions();

  /// Cache transactions
  Future<void> cacheTransactions(List<TransactionRecord> transactions);

  /// Clear transaction cache
  Future<void> clearCache();

  /// Get active receiver accounts
  Future<Either<Failure, ReceiverAccountsResponse>> getActiveReceiverAccounts({
    TransactionProvider? provider,
  });

  /// Create a new order (payment intent)
  Future<Either<Failure, CreateOrderResponse>> createOrder(
    CreateOrderInput input,
  );
}
