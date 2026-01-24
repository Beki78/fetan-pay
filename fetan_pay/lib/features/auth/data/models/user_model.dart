import 'package:equatable/equatable.dart';

enum UserRole { waiter, admin }

class User extends Equatable {
  final String id;
  final String email;
  final UserRole role;
  final String? firstName;
  final String? lastName;
  final String? merchantId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    required this.email,
    required this.role,
    this.firstName,
    this.lastName,
    this.merchantId,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle name field from auth response (split into firstName/lastName)
    String? firstName = json['firstName'] as String?;
    String? lastName = json['lastName'] as String?;

    if (firstName == null && json['name'] != null) {
      final nameParts = (json['name'] as String).split(' ');
      firstName = nameParts.isNotEmpty ? nameParts.first : null;
      lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : null;
    }

    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      role: _parseUserRole(json['role'] as String?),
      firstName: firstName,
      lastName: lastName,
      merchantId: json['merchantId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  factory User.fromMembershipJson(Map<String, dynamic> json) {
    // Parse membership response format from /merchant-users/me
    String? firstName;
    String? lastName;

    if (json['name'] != null) {
      final nameParts = (json['name'] as String).split(' ');
      firstName = nameParts.isNotEmpty ? nameParts.first : null;
      lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : null;
    }

    // Extract merchant ID from nested merchant object
    String? merchantId;
    if (json['merchant'] is Map<String, dynamic>) {
      merchantId = json['merchant']['id'] as String?;
    }

    return User(
      id: json['id'] as String? ?? '', // Membership ID as user ID fallback
      email: json['email'] as String? ?? '',
      role: _parseUserRole('employee'), // Default to employee for merchants
      firstName: firstName,
      lastName: lastName,
      merchantId: merchantId,
      createdAt: null, // Membership doesn't include timestamps
      updatedAt: null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'role': role.name,
      'firstName': firstName,
      'lastName': lastName,
      'merchantId': merchantId,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  static UserRole _parseUserRole(String? roleString) {
    switch (roleString?.toLowerCase()) {
      case 'admin':
        return UserRole.admin;
      case 'waiter':
      case 'employee':  // Map EMPLOYEE role to waiter (merchant)
        return UserRole.waiter;
      default:
        return UserRole.waiter;
    }
  }

  @override
  List<Object?> get props => [id, email, role, firstName, lastName, merchantId, createdAt, updatedAt];
}

class AuthSession extends Equatable {
  final String sessionId;
  final String userId;
  final DateTime expiresAt;
  final DateTime createdAt;

  const AuthSession({
    required this.sessionId,
    required this.userId,
    required this.expiresAt,
    required this.createdAt,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      sessionId: json['id'] as String,
      userId: json['userId'] as String,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': sessionId,
      'userId': userId,
      'expiresAt': expiresAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  @override
  List<Object> get props => [sessionId, userId, expiresAt, createdAt];
}
