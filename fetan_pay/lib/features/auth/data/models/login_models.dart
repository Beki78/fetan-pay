import 'package:equatable/equatable.dart';

class LoginRequest extends Equatable {
  final String email;
  final String password;

  const LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }

  @override
  List<Object> get props => [email, password];
}

class LoginResponse extends Equatable {
  final String message;
  final bool success;

  const LoginResponse({
    required this.message,
    required this.success,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      message: json['message'] as String? ?? '',
      success: json['success'] as bool? ?? false,
    );
  }

  @override
  List<Object> get props => [message, success];
}

class QRLoginRequest extends Equatable {
  final String qrData;
  final String origin;

  const QRLoginRequest({
    required this.qrData,
    required this.origin,
  });

  Map<String, dynamic> toJson() {
    return {
      'qrData': qrData,
      'origin': origin,
    };
  }

  @override
  List<Object> get props => [qrData, origin];
}

class QRLoginResponse extends Equatable {
  final String email;
  final String password;
  final String userId;
  final String merchantId;

  const QRLoginResponse({
    required this.email,
    required this.password,
    required this.userId,
    required this.merchantId,
  });

  factory QRLoginResponse.fromJson(Map<String, dynamic> json) {
    return QRLoginResponse(
      email: json['email'] as String,
      password: json['password'] as String,
      userId: json['userId'] as String,
      merchantId: json['merchantId'] as String,
    );
  }

  @override
  List<Object> get props => [email, password, userId, merchantId];
}

class AuthError implements Exception {
  final String message;
  final String? code;

  const AuthError({
    required this.message,
    this.code,
  });

  factory AuthError.fromJson(Map<String, dynamic> json) {
    return AuthError(
      message: json['message'] as String? ?? 'Unknown error',
      code: json['code'] as String?,
    );
  }

  @override
  String toString() {
    return 'AuthError: $message${code != null ? ' (code: $code)' : ''}';
  }
}
