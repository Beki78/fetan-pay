import 'package:equatable/equatable.dart';

/// Base class for all failures in the application
abstract class Failure extends Equatable {
  final String message;
  final String? code;
  final dynamic originalError;

  const Failure({
    required this.message,
    this.code,
    this.originalError,
  });

  @override
  List<Object?> get props => [message, code, originalError];
}

/// Network-related failures
class NetworkFailure extends Failure {
  const NetworkFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Authentication-related failures
class AuthFailure extends Failure {
  const AuthFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Server-related failures
class ServerFailure extends Failure {
  const ServerFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Cache-related failures
class CacheFailure extends Failure {
  const CacheFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Validation-related failures
class ValidationFailure extends Failure {
  const ValidationFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// QR code related failures
class QRFailure extends Failure {
  const QRFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Scan-related failures
class ScanFailure extends Failure {
  const ScanFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Payment-related failures
class PaymentFailure extends Failure {
  const PaymentFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Session-related failures
class SessionFailure extends Failure {
  const SessionFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}

/// Unknown/Unexpected failures
class UnknownFailure extends Failure {
  const UnknownFailure({
    required super.message,
    super.code,
    super.originalError,
  });
}