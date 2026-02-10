import 'package:equatable/equatable.dart';

/// Plan Status
enum PlanStatus { active, inactive, archived }

/// Billing Cycle
enum BillingCycle { monthly, yearly, weekly, daily }

/// Subscription Status
enum SubscriptionStatus { active, cancelled, expired, suspended, pending }

/// Plan Model
class Plan extends Equatable {
  final String id;
  final String name;
  final String description;
  final double price;
  final BillingCycle billingCycle;
  final Map<String, dynamic>? limits;
  final int? verificationLimit;
  final int? apiLimit;
  final List<String> features;
  final PlanStatus status;
  final bool isPopular;
  final int displayOrder;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Plan({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.billingCycle,
    this.limits,
    this.verificationLimit,
    this.apiLimit,
    required this.features,
    required this.status,
    required this.isPopular,
    required this.displayOrder,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Plan.fromJson(Map<String, dynamic> json) {
    try {
      // Safe parsing with null checks and type handling
      final priceValue = json['price'];
      final double price;
      if (priceValue is num) {
        price = priceValue.toDouble();
      } else if (priceValue is String) {
        price = double.tryParse(priceValue) ?? 0.0;
      } else {
        price = 0.0;
      }

      final verificationLimitValue = json['verificationLimit'];
      final int? verificationLimit;
      if (verificationLimitValue == null) {
        verificationLimit = null;
      } else if (verificationLimitValue is int) {
        verificationLimit = verificationLimitValue;
      } else if (verificationLimitValue is num) {
        verificationLimit = verificationLimitValue.toInt();
      } else if (verificationLimitValue is String) {
        verificationLimit = int.tryParse(verificationLimitValue);
      } else {
        verificationLimit = null;
      }

      final apiLimitValue = json['apiLimit'];
      final int? apiLimit;
      if (apiLimitValue == null) {
        apiLimit = null;
      } else if (apiLimitValue is int) {
        apiLimit = apiLimitValue;
      } else if (apiLimitValue is num) {
        apiLimit = apiLimitValue.toInt();
      } else if (apiLimitValue is String) {
        apiLimit = int.tryParse(apiLimitValue);
      } else {
        apiLimit = null;
      }

      final displayOrderValue = json['displayOrder'];
      final int displayOrder;
      if (displayOrderValue is int) {
        displayOrder = displayOrderValue;
      } else if (displayOrderValue is num) {
        displayOrder = displayOrderValue.toInt();
      } else if (displayOrderValue is String) {
        displayOrder = int.tryParse(displayOrderValue) ?? 0;
      } else {
        displayOrder = 0;
      }

      return Plan(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String? ?? '',
        price: price,
        billingCycle: _parseBillingCycle(json['billingCycle'] as String),
        limits: json['limits'] as Map<String, dynamic>?,
        verificationLimit: verificationLimit,
        apiLimit: apiLimit,
        features:
            (json['features'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [],
        status: _parsePlanStatus(json['status'] as String),
        isPopular: json['isPopular'] as bool? ?? false,
        displayOrder: displayOrder,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
      );
    } catch (e, stackTrace) {
      print('Error parsing Plan from JSON: $e');
      print('JSON data: $json');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  static PlanStatus _parsePlanStatus(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return PlanStatus.active;
      case 'INACTIVE':
        return PlanStatus.inactive;
      case 'ARCHIVED':
        return PlanStatus.archived;
      default:
        return PlanStatus.active;
    }
  }

  static BillingCycle _parseBillingCycle(String cycle) {
    switch (cycle.toUpperCase()) {
      case 'MONTHLY':
        return BillingCycle.monthly;
      case 'YEARLY':
        return BillingCycle.yearly;
      case 'WEEKLY':
        return BillingCycle.weekly;
      case 'DAILY':
        return BillingCycle.daily;
      default:
        return BillingCycle.monthly;
    }
  }

  @override
  List<Object?> get props => [
    id,
    name,
    description,
    price,
    billingCycle,
    limits,
    verificationLimit,
    apiLimit,
    features,
    status,
    isPopular,
    displayOrder,
    createdAt,
    updatedAt,
  ];
}

/// Subscription Model
class Subscription extends Equatable {
  final String id;
  final String merchantId;
  final String planId;
  final SubscriptionStatus status;
  final DateTime startDate;
  final DateTime? endDate;
  final DateTime? nextBillingDate;
  final double monthlyPrice;
  final BillingCycle billingCycle;
  final Map<String, dynamic>? currentUsage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? cancelledAt;
  final String? cancelledBy;
  final String? cancellationReason;
  final Plan plan;

  const Subscription({
    required this.id,
    required this.merchantId,
    required this.planId,
    required this.status,
    required this.startDate,
    this.endDate,
    this.nextBillingDate,
    required this.monthlyPrice,
    required this.billingCycle,
    this.currentUsage,
    required this.createdAt,
    required this.updatedAt,
    this.cancelledAt,
    this.cancelledBy,
    this.cancellationReason,
    required this.plan,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    try {
      // Safe parsing for monthlyPrice
      final monthlyPriceValue = json['monthlyPrice'];
      final double monthlyPrice;
      if (monthlyPriceValue is num) {
        monthlyPrice = monthlyPriceValue.toDouble();
      } else if (monthlyPriceValue is String) {
        monthlyPrice = double.tryParse(monthlyPriceValue) ?? 0.0;
      } else {
        monthlyPrice = 0.0;
      }

      return Subscription(
        id: json['id'] as String,
        merchantId: json['merchantId'] as String,
        planId: json['planId'] as String,
        status: _parseSubscriptionStatus(json['status'] as String),
        startDate: DateTime.parse(json['startDate'] as String),
        endDate: json['endDate'] != null
            ? DateTime.parse(json['endDate'] as String)
            : null,
        nextBillingDate: json['nextBillingDate'] != null
            ? DateTime.parse(json['nextBillingDate'] as String)
            : null,
        monthlyPrice: monthlyPrice,
        billingCycle: Plan._parseBillingCycle(json['billingCycle'] as String),
        currentUsage: json['currentUsage'] as Map<String, dynamic>?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        cancelledAt: json['cancelledAt'] != null
            ? DateTime.parse(json['cancelledAt'] as String)
            : null,
        cancelledBy: json['cancelledBy'] as String?,
        cancellationReason: json['cancellationReason'] as String?,
        plan: Plan.fromJson(json['plan'] as Map<String, dynamic>),
      );
    } catch (e, stackTrace) {
      print('Error parsing Subscription from JSON: $e');
      print('JSON data: $json');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  static SubscriptionStatus _parseSubscriptionStatus(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return SubscriptionStatus.active;
      case 'CANCELLED':
        return SubscriptionStatus.cancelled;
      case 'EXPIRED':
        return SubscriptionStatus.expired;
      case 'SUSPENDED':
        return SubscriptionStatus.suspended;
      case 'PENDING':
        return SubscriptionStatus.pending;
      default:
        return SubscriptionStatus.active;
    }
  }

  /// Check if subscription is in trial (Free plan with end date)
  bool get isInTrial {
    return plan.name == 'Free' &&
        endDate != null &&
        status == SubscriptionStatus.active;
  }

  /// Check if subscription is expired
  bool get isExpired {
    if (status == SubscriptionStatus.expired) return true;
    if (endDate != null && endDate!.isBefore(DateTime.now())) return true;
    return false;
  }

  /// Get days remaining
  int? get daysRemaining {
    if (endDate == null) return null;
    final diff = endDate!.difference(DateTime.now());
    return diff.inDays > 0 ? diff.inDays : 0;
  }

  /// Get usage value safely
  int getUsageValue(String key) {
    if (currentUsage == null) return 0;
    final value = currentUsage![key];
    if (value is int) return value;
    if (value is Map && value['increment'] != null) {
      return value['increment'] as int;
    }
    return 0;
  }

  @override
  List<Object?> get props => [
    id,
    merchantId,
    planId,
    status,
    startDate,
    endDate,
    nextBillingDate,
    monthlyPrice,
    billingCycle,
    currentUsage,
    createdAt,
    updatedAt,
    cancelledAt,
    cancelledBy,
    cancellationReason,
    plan,
  ];
}

/// Billing Transaction Model
class BillingTransaction extends Equatable {
  final String id;
  final String transactionId;
  final String merchantId;
  final String planId;
  final String? subscriptionId;
  final double amount;
  final String currency;
  final String? paymentReference;
  final String? paymentMethod;
  final String status;
  final DateTime? processedAt;
  final String? processedBy;
  final DateTime billingPeriodStart;
  final DateTime billingPeriodEnd;
  final String? notes;
  final String? receiptUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Plan plan;

  const BillingTransaction({
    required this.id,
    required this.transactionId,
    required this.merchantId,
    required this.planId,
    this.subscriptionId,
    required this.amount,
    required this.currency,
    this.paymentReference,
    this.paymentMethod,
    required this.status,
    this.processedAt,
    this.processedBy,
    required this.billingPeriodStart,
    required this.billingPeriodEnd,
    this.notes,
    this.receiptUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.plan,
  });

  factory BillingTransaction.fromJson(Map<String, dynamic> json) {
    try {
      // Safe parsing for amount
      final amountValue = json['amount'];
      final double amount;
      if (amountValue is num) {
        amount = amountValue.toDouble();
      } else if (amountValue is String) {
        amount = double.tryParse(amountValue) ?? 0.0;
      } else {
        amount = 0.0;
      }

      return BillingTransaction(
        id: json['id'] as String,
        transactionId: json['transactionId'] as String,
        merchantId: json['merchantId'] as String,
        planId: json['planId'] as String,
        subscriptionId: json['subscriptionId'] as String?,
        amount: amount,
        currency: json['currency'] as String? ?? 'ETB',
        paymentReference: json['paymentReference'] as String?,
        paymentMethod: json['paymentMethod'] as String?,
        status: json['status'] as String,
        processedAt: json['processedAt'] != null
            ? DateTime.parse(json['processedAt'] as String)
            : null,
        processedBy: json['processedBy'] as String?,
        billingPeriodStart: DateTime.parse(
          json['billingPeriodStart'] as String,
        ),
        billingPeriodEnd: DateTime.parse(json['billingPeriodEnd'] as String),
        notes: json['notes'] as String?,
        receiptUrl: json['receiptUrl'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        plan: Plan.fromJson(json['plan'] as Map<String, dynamic>),
      );
    } catch (e, stackTrace) {
      print('Error parsing BillingTransaction from JSON: $e');
      print('JSON data: $json');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }

  @override
  List<Object?> get props => [
    id,
    transactionId,
    merchantId,
    planId,
    subscriptionId,
    amount,
    currency,
    paymentReference,
    paymentMethod,
    status,
    processedAt,
    processedBy,
    billingPeriodStart,
    billingPeriodEnd,
    notes,
    receiptUrl,
    createdAt,
    updatedAt,
    plan,
  ];
}
