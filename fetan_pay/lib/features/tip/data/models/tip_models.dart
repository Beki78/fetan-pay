import 'package:equatable/equatable.dart';

/// Tips summary response model
class TipsSummary extends Equatable {
  final int count;
  final double? totalTipAmount;

  const TipsSummary({required this.count, this.totalTipAmount});

  factory TipsSummary.fromJson(Map<String, dynamic> json) {
    return TipsSummary(
      count: json['count'] as int? ?? 0,
      totalTipAmount: json['totalTipAmount'] != null
          ? _parseAmount(json['totalTipAmount'])
          : null,
    );
  }

  /// Helper method to parse amount from either string or number
  static double _parseAmount(dynamic value) {
    if (value is String) {
      return double.tryParse(value) ?? 0.0;
    } else if (value is num) {
      return value.toDouble();
    }
    return 0.0;
  }

  Map<String, dynamic> toJson() {
    return {'count': count, 'totalTipAmount': totalTipAmount};
  }

  @override
  List<Object?> get props => [count, totalTipAmount];
}

/// Tips summary query parameters
class TipsSummaryQuery extends Equatable {
  final String? from;
  final String? to;

  const TipsSummaryQuery({this.from, this.to});

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> json = {};
    if (from != null) json['from'] = from;
    if (to != null) json['to'] = to;
    return json;
  }

  @override
  List<Object?> get props => [from, to];
}

/// Verified by user information
class VerifiedBy extends Equatable {
  final String id;
  final String? name;
  final String? email;
  final String role;

  const VerifiedBy({
    required this.id,
    this.name,
    this.email,
    required this.role,
  });

  factory VerifiedBy.fromJson(Map<String, dynamic> json) {
    return VerifiedBy(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'email': email, 'role': role};
  }

  @override
  List<Object?> get props => [id, name, email, role];
}

/// Individual tip item
class TipItem extends Equatable {
  final String id;
  final double tipAmount;
  final double claimedAmount;
  final String reference;
  final String provider;
  final String status;
  final String createdAt;
  final String? verifiedAt;
  final VerifiedBy? verifiedBy;

  const TipItem({
    required this.id,
    required this.tipAmount,
    required this.claimedAmount,
    required this.reference,
    required this.provider,
    required this.status,
    required this.createdAt,
    this.verifiedAt,
    this.verifiedBy,
  });

  factory TipItem.fromJson(Map<String, dynamic> json) {
    return TipItem(
      id: json['id'] as String,
      tipAmount: _parseAmount(json['tipAmount']),
      claimedAmount: _parseAmount(json['claimedAmount']),
      reference: json['reference'] as String,
      provider: json['provider'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      verifiedAt: json['verifiedAt'] as String?,
      verifiedBy: json['verifiedBy'] != null
          ? VerifiedBy.fromJson(json['verifiedBy'] as Map<String, dynamic>)
          : null,
    );
  }

  /// Helper method to parse amount from either string or number
  static double _parseAmount(dynamic value) {
    if (value is String) {
      return double.tryParse(value) ?? 0.0;
    } else if (value is num) {
      return value.toDouble();
    }
    return 0.0;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tipAmount': tipAmount,
      'claimedAmount': claimedAmount,
      'reference': reference,
      'provider': provider,
      'status': status,
      'createdAt': createdAt,
      'verifiedAt': verifiedAt,
      'verifiedBy': verifiedBy?.toJson(),
    };
  }

  @override
  List<Object?> get props => [
    id,
    tipAmount,
    claimedAmount,
    reference,
    provider,
    status,
    createdAt,
    verifiedAt,
    verifiedBy,
  ];
}

/// List tips response model
class ListTipsResponse extends Equatable {
  final int page;
  final int pageSize;
  final int total;
  final int totalPages;
  final List<TipItem> data;

  const ListTipsResponse({
    required this.page,
    required this.pageSize,
    required this.total,
    required this.totalPages,
    required this.data,
  });

  factory ListTipsResponse.fromJson(Map<String, dynamic> json) {
    return ListTipsResponse(
      page: json['page'] as int,
      pageSize: json['pageSize'] as int,
      total: json['total'] as int,
      totalPages: json['totalPages'] as int,
      data: (json['data'] as List<dynamic>)
          .map((item) => TipItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'pageSize': pageSize,
      'total': total,
      'totalPages': totalPages,
      'data': data.map((item) => item.toJson()).toList(),
    };
  }

  @override
  List<Object?> get props => [page, pageSize, total, totalPages, data];
}

/// List tips query parameters
class ListTipsQuery extends Equatable {
  final String? from;
  final String? to;
  final int? page;
  final int? pageSize;

  const ListTipsQuery({this.from, this.to, this.page, this.pageSize});

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> json = {};
    if (from != null) json['from'] = from;
    if (to != null) json['to'] = to;
    if (page != null) json['page'] = page;
    if (pageSize != null) json['pageSize'] = pageSize;
    return json;
  }

  @override
  List<Object?> get props => [from, to, page, pageSize];
}

/// Tip statistics model for UI display
class TipStatistics extends Equatable {
  final double today;
  final double thisWeek;
  final double thisMonth;
  final double total;

  const TipStatistics({
    required this.today,
    required this.thisWeek,
    required this.thisMonth,
    required this.total,
  });

  factory TipStatistics.empty() {
    return const TipStatistics(
      today: 0.0,
      thisWeek: 0.0,
      thisMonth: 0.0,
      total: 0.0,
    );
  }

  @override
  List<Object?> get props => [today, thisWeek, thisMonth, total];
}
