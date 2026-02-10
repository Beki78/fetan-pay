import 'package:equatable/equatable.dart';
import '../../data/models/payment_provider_models.dart';
import '../../../transactions/data/models/transaction_models.dart';

abstract class PaymentProviderState extends Equatable {
  const PaymentProviderState();

  @override
  List<Object?> get props => [];
}

class PaymentProviderInitial extends PaymentProviderState {}

class PaymentProviderLoading extends PaymentProviderState {}

class PaymentProviderLoaded extends PaymentProviderState {
  final List<PaymentProviderRecord> providers;
  final List<ReceiverAccount> receiverAccounts;

  const PaymentProviderLoaded({
    required this.providers,
    required this.receiverAccounts,
  });

  @override
  List<Object> get props => [providers, receiverAccounts];
}

class PaymentProviderError extends PaymentProviderState {
  final String message;

  const PaymentProviderError({required this.message});

  @override
  List<Object> get props => [message];
}

class ProviderConfiguring extends PaymentProviderState {}

class ProviderConfigured extends PaymentProviderState {
  final String provider;

  const ProviderConfigured({required this.provider});

  @override
  List<Object> get props => [provider];
}

class ProviderConfigurationError extends PaymentProviderState {
  final String message;

  const ProviderConfigurationError({required this.message});

  @override
  List<Object> get props => [message];
}

class ProviderEnabling extends PaymentProviderState {}

class ProviderEnabled extends PaymentProviderState {
  final String provider;

  const ProviderEnabled({required this.provider});

  @override
  List<Object> get props => [provider];
}

class ProviderEnableError extends PaymentProviderState {
  final String message;

  const ProviderEnableError({required this.message});

  @override
  List<Object> get props => [message];
}

class ProviderDisabling extends PaymentProviderState {}

class ProviderDisabled extends PaymentProviderState {
  final String provider;

  const ProviderDisabled({required this.provider});

  @override
  List<Object> get props => [provider];
}

class ProviderDisableError extends PaymentProviderState {
  final String message;

  const ProviderDisableError({required this.message});

  @override
  List<Object> get props => [message];
}
