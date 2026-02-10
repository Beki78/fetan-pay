import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/models/payment_provider_models.dart';
import '../../../transactions/data/models/transaction_models.dart';
import '../bloc/payment_provider_bloc.dart';
import '../bloc/payment_provider_event.dart';
import '../bloc/payment_provider_state.dart';
import '../../../../core/di/injection_container.dart';

class AddBankAccountModal extends StatefulWidget {
  const AddBankAccountModal({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => BlocProvider(
        create: (context) =>
            getIt<PaymentProviderBloc>()
              ..add(const LoadPaymentProvidersAndAccounts()),
        child: const AddBankAccountModal(),
      ),
    );
  }

  @override
  State<AddBankAccountModal> createState() => _AddBankAccountModalState();
}

class _AddBankAccountModalState extends State<AddBankAccountModal> {
  PaymentProviderRecord? selectedProvider;
  ReceiverAccount? existingAccount;
  final accountNumberController = TextEditingController();
  final accountHolderNameController = TextEditingController();
  final formKey = GlobalKey<FormState>();
  bool isEnabled = false;
  bool isSaving = false;
  List<PaymentProviderRecord> availableProviders = [];
  List<ReceiverAccount> receiverAccounts = [];

  @override
  void dispose() {
    accountNumberController.dispose();
    accountHolderNameController.dispose();
    super.dispose();
  }

  String _getProviderDisplayName(ProviderCode code) {
    switch (code) {
      case ProviderCode.CBE:
        return 'Commercial Bank of Ethiopia';
      case ProviderCode.TELEBIRR:
        return 'Telebirr';
      case ProviderCode.AWASH:
        return 'Awash Bank';
      case ProviderCode.BOA:
        return 'Bank of Abyssinia';
      case ProviderCode.DASHEN:
        return 'Dashen Bank';
    }
  }

  void _onProviderSelected(PaymentProviderRecord? provider) {
    if (provider == null) return;

    setState(() {
      selectedProvider = provider;

      // Check if this provider already has a receiver account
      existingAccount = receiverAccounts.firstWhere(
        (acc) => acc.provider.name == provider.code.name,
        orElse: () => ReceiverAccount(
          id: '',
          merchantId: '',
          provider: TransactionProvider.values.firstWhere(
            (p) => p.name == provider.code.name,
          ),
          receiverAccount: '',
          receiverName: '',
          status: 'INACTIVE',
        ),
      );

      // Pre-fill form if account exists
      if (existingAccount!.id.isNotEmpty) {
        accountNumberController.text = existingAccount!.receiverAccount;
        accountHolderNameController.text = existingAccount!.receiverName ?? '';
        isEnabled = existingAccount!.status == 'ACTIVE';
      } else {
        accountNumberController.clear();
        accountHolderNameController.clear();
        isEnabled = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<PaymentProviderBloc, PaymentProviderState>(
      listener: (context, state) {
        if (state is PaymentProviderLoaded) {
          setState(() {
            availableProviders = state.providers;
            receiverAccounts = state.receiverAccounts;
          });
        } else if (state is ProviderConfigured) {
          // Success - close modal
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Payment provider configured successfully: ${state.provider}',
              ),
              backgroundColor: Colors.green,
            ),
          );
        } else if (state is ProviderConfigurationError) {
          // Error - show message
          setState(() {
            isSaving = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        } else if (state is ProviderConfiguring) {
          setState(() {
            isSaving = true;
          });
        }
      },
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.indigo.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.account_balance,
                      color: Colors.indigo,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Configure Payment Provider',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Set up your payment provider account',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Form Fields
              Flexible(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Payment Provider Selection
                      Text(
                        'Payment Provider',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      BlocBuilder<PaymentProviderBloc, PaymentProviderState>(
                        builder: (context, state) {
                          if (state is PaymentProviderLoading) {
                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: theme.colorScheme.outline.withValues(
                                    alpha: 0.3,
                                  ),
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }

                          if (availableProviders.isEmpty) {
                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Colors.orange.withValues(alpha: 0.3),
                                ),
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.orange.withValues(alpha: 0.1),
                              ),
                              child: Text(
                                'No payment providers available.',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.orange[800],
                                ),
                              ),
                            );
                          }

                          return Container(
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: theme.colorScheme.outline.withValues(
                                  alpha: 0.3,
                                ),
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child:
                                DropdownButtonFormField<PaymentProviderRecord>(
                                  value: selectedProvider,
                                  decoration: const InputDecoration(
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 16,
                                    ),
                                    border: InputBorder.none,
                                    hintText: 'Select a provider',
                                  ),
                                  validator: (value) {
                                    if (value == null) {
                                      return 'Please select a payment provider';
                                    }
                                    return null;
                                  },
                                  items: availableProviders.map((provider) {
                                    return DropdownMenuItem<
                                      PaymentProviderRecord
                                    >(
                                      value: provider,
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            width: 28,
                                            height: 28,
                                            decoration: BoxDecoration(
                                              color: Colors.indigo.withValues(
                                                alpha: 0.1,
                                              ),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(
                                              Icons.account_balance,
                                              color: Colors.indigo,
                                              size: 14,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Flexible(
                                            child: Text(
                                              _getProviderDisplayName(
                                                provider.code,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: _onProviderSelected,
                                ),
                          );
                        },
                      ),
                      const SizedBox(height: 20),

                      // Account Number Field
                      Text(
                        'Account Number',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: accountNumberController,
                        decoration: InputDecoration(
                          hintText: 'Enter account number',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.outline.withValues(
                                alpha: 0.3,
                              ),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.outline.withValues(
                                alpha: 0.3,
                              ),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.primary,
                              width: 2,
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                        ),
                        keyboardType: TextInputType.number,
                        onChanged: (value) {
                          // Only allow digits
                          if (value.isNotEmpty &&
                              !RegExp(r'^\d+$').hasMatch(value)) {
                            accountNumberController.text = value.substring(
                              0,
                              value.length - 1,
                            );
                            accountNumberController.selection =
                                TextSelection.fromPosition(
                                  TextPosition(
                                    offset: accountNumberController.text.length,
                                  ),
                                );
                          }
                        },
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Account number is required';
                          }
                          if (!RegExp(r'^\d+$').hasMatch(value)) {
                            return 'Account number must contain only digits';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Account Holder Name Field
                      Text(
                        'Account Holder Name',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: accountHolderNameController,
                        decoration: InputDecoration(
                          hintText: 'Name as shown on account',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.outline.withValues(
                                alpha: 0.3,
                              ),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.outline.withValues(
                                alpha: 0.3,
                              ),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: theme.colorScheme.primary,
                              width: 2,
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                        ),
                        onChanged: (value) {
                          // Only allow letters and spaces
                          if (value.isNotEmpty &&
                              !RegExp(r'^[a-zA-Z\s]+$').hasMatch(value)) {
                            accountHolderNameController.text = value.substring(
                              0,
                              value.length - 1,
                            );
                            accountHolderNameController
                                .selection = TextSelection.fromPosition(
                              TextPosition(
                                offset: accountHolderNameController.text.length,
                              ),
                            );
                          }
                        },
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Account holder name is required';
                          }
                          if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value)) {
                            return 'Name must contain only letters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Enable Provider Checkbox
                      Row(
                        children: [
                          Checkbox(
                            value: isEnabled,
                            onChanged: (value) {
                              setState(() {
                                isEnabled = value ?? false;
                              });
                            },
                          ),
                          Expanded(
                            child: Text(
                              'Enable this provider for payments',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: (isSaving || availableProviders.isEmpty)
                          ? null
                          : () {
                              if (formKey.currentState!.validate()) {
                                context.read<PaymentProviderBloc>().add(
                                  ConfigureProvider(
                                    provider: selectedProvider!.code.name,
                                    accountNumber: accountNumberController.text
                                        .trim(),
                                    accountHolderName:
                                        accountHolderNameController.text.trim(),
                                    isEnabled: isEnabled,
                                  ),
                                );
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isSaving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Save Configuration'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
