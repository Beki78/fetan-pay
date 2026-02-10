import 'package:equatable/equatable.dart';

abstract class PaymentProviderEvent extends Equatable {
  const PaymentProviderEvent();

  @override
  List<Object?> get props => [];
}

class LoadPaymentProvidersAndAccounts extends PaymentProviderEvent {
  const LoadPaymentProvidersAndAccounts();
}

class ConfigureProvider extends PaymentProviderEvent {
  final String provider;
  final String accountNumber;
  final String accountHolderName;
  final bool isEnabled;

  const ConfigureProvider({
    required this.provider,
    required this.accountNumber,
    required this.accountHolderName,
    required this.isEnabled,
  });

  @override
  List<Object> get props => [
    provider,
    accountNumber,
    accountHolderName,
    isEnabled,
  ];
}

class EnableProvider extends PaymentProviderEvent {
  final String provider;

  const EnableProvider({required this.provider});

  @override
  List<Object> get props => [provider];
}

class DisableProvider extends PaymentProviderEvent {
  final String provider;

  const DisableProvider({required this.provider});

  @override
  List<Object> get props => [provider];
}

class ResetPaymentProviderState extends PaymentProviderEvent {
  const ResetPaymentProviderState();
}
