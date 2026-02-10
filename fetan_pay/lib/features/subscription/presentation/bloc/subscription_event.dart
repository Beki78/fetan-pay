import 'package:equatable/equatable.dart';

abstract class SubscriptionEvent extends Equatable {
  const SubscriptionEvent();

  @override
  List<Object?> get props => [];
}

class LoadPublicPlansEvent extends SubscriptionEvent {
  final bool forceRefresh;

  const LoadPublicPlansEvent({this.forceRefresh = false});

  @override
  List<Object?> get props => [forceRefresh];
}

class LoadMerchantSubscriptionEvent extends SubscriptionEvent {
  final String merchantId;
  final bool forceRefresh;

  const LoadMerchantSubscriptionEvent({
    required this.merchantId,
    this.forceRefresh = false,
  });

  @override
  List<Object?> get props => [merchantId, forceRefresh];
}

class LoadBillingTransactionsEvent extends SubscriptionEvent {
  final String merchantId;
  final int? limit;

  const LoadBillingTransactionsEvent({required this.merchantId, this.limit});

  @override
  List<Object?> get props => [merchantId, limit];
}

class UpgradeMerchantPlanEvent extends SubscriptionEvent {
  final String merchantId;
  final String planId;
  final String? paymentReference;
  final String? paymentMethod;

  const UpgradeMerchantPlanEvent({
    required this.merchantId,
    required this.planId,
    this.paymentReference,
    this.paymentMethod,
  });

  @override
  List<Object?> get props => [
    merchantId,
    planId,
    paymentReference,
    paymentMethod,
  ];
}
