import 'package:equatable/equatable.dart';

/// Merchant User Model - represents a user/team member in the merchant system
class MerchantUser extends Equatable {
  final String id;
  final String merchantId;
  final String? userId;
  final String role;
  final String status;
  final String? name;
  final String? email;
  final String? phone;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const MerchantUser({
    required this.id,
    required this.merchantId,
    this.userId,
    required this.role,
    required this.status,
    this.name,
    this.email,
    this.phone,
    this.createdAt,
    this.updatedAt,
  });

  factory MerchantUser.fromJson(Map<String, dynamic> json) {
    return MerchantUser(
      id: json['id'] as String,
      merchantId: json['merchantId'] as String,
      userId: json['userId'] as String?,
      role: json['role'] as String,
      status: json['status'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'merchantId': merchantId,
      'userId': userId,
      'role': role,
      'status': status,
      'name': name,
      'email': email,
      'phone': phone,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
    id,
    merchantId,
    userId,
    role,
    status,
    name,
    email,
    phone,
    createdAt,
    updatedAt,
  ];
}

/// Create Merchant User Input
class CreateMerchantUserInput extends Equatable {
  final String merchantId;
  final String name;
  final String email;
  final String? phone;
  final String password;
  final String? role;

  const CreateMerchantUserInput({
    required this.merchantId,
    required this.name,
    required this.email,
    this.phone,
    required this.password,
    this.role,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      if (phone != null) 'phone': phone,
      'password': password,
      if (role != null) 'role': role,
    };
  }

  @override
  List<Object?> get props => [merchantId, name, email, phone, password, role];
}

/// Update Merchant User Input
class UpdateMerchantUserInput extends Equatable {
  final String merchantId;
  final String id;
  final String? name;
  final String? phone;
  final String? role;

  const UpdateMerchantUserInput({
    required this.merchantId,
    required this.id,
    this.name,
    this.phone,
    this.role,
  });

  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (role != null) 'role': role,
    };
  }

  @override
  List<Object?> get props => [merchantId, id, name, phone, role];
}

/// QR Code Response
class QRCodeResponse extends Equatable {
  final String qrCodeImage;
  final String qrCodeData;
  final String email;
  final DateTime generatedAt;

  const QRCodeResponse({
    required this.qrCodeImage,
    required this.qrCodeData,
    required this.email,
    required this.generatedAt,
  });

  factory QRCodeResponse.fromJson(Map<String, dynamic> json) {
    return QRCodeResponse(
      qrCodeImage: json['qrCodeImage'] as String,
      qrCodeData: json['qrCodeData'] as String,
      email: json['email'] as String,
      generatedAt: DateTime.parse(json['generatedAt'] as String),
    );
  }

  @override
  List<Object> get props => [qrCodeImage, qrCodeData, email, generatedAt];
}
