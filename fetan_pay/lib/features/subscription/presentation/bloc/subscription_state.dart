import 'package:equatable/equatable.dart';
import '../../data/models/subscription_models.dart';

abstract class SubscriptionState extends Equatable {
  const SubscriptionState();

  @override
  List<Object?> get props => [];
}

class SubscriptionInitial extends SubscriptionState {}

class SubscriptionLoading extends SubscriptionState {}

class SubscriptionLoaded extends SubscriptionState {
  final List<Plan> plans;
  final Subscription? subscription;
  final List<BillingTransaction> transactions;

  const SubscriptionLoaded({
    required this.plans,
    this.subscription,
    required this.transactions,
  });

  @override
  List<Object?> get props => [plans, subscription, transactions];

  SubscriptionLoaded copyWith({
    List<Plan>? plans,
    Subscription? Function()? subscription,
    List<BillingTransaction>? transactions,
  }) {
    return SubscriptionLoaded(
      plans: plans ?? this.plans,
      subscription: subscription != null ? subscription() : this.subscription,
      transactions: transactions ?? this.transactions,
    );
  }
}

class SubscriptionError extends SubscriptionState {
  final String message;

  const SubscriptionError(this.message);

  @override
  List<Object?> get props => [message];
}

class SubscriptionUpgrading extends SubscriptionState {}

class SubscriptionUpgradeSuccess extends SubscriptionState {
  final String message;

  const SubscriptionUpgradeSuccess(this.message);

  @override
  List<Object?> get props => [message];
}

class SubscriptionUpgradeError extends SubscriptionState {
  final String message;

  const SubscriptionUpgradeError(this.message);

  @override
  List<Object?> get props => [message];
}
