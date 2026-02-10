import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/models/transaction_models.dart';
import '../bloc/transaction_bloc.dart';
import '../bloc/transaction_event.dart';
import '../bloc/transaction_state.dart';
import '../../../../core/di/injection_container.dart';

class TransactionModal extends StatefulWidget {
  const TransactionModal({super.key});

  static Future<CreateOrderResponse?> show(BuildContext context) {
    return showModalBottomSheet<CreateOrderResponse>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => BlocProvider(
        create: (context) =>
            getIt<TransactionBloc>()..add(const GetReceiverAccounts()),
        child: const TransactionModal(),
      ),
    );
  }

  @override
  State<TransactionModal> createState() => _TransactionModalState();
}

class _TransactionModalState extends State<TransactionModal> {
  final formKey = GlobalKey<FormState>();
  final amountController = TextEditingController();
  final payerNameController = TextEditingController();
  final notesController = TextEditingController();
  TransactionProvider? selectedProvider;
  List<ReceiverAccount> enabledProviders = [];
  bool isSaving = false;

  @override
  void dispose() {
    amountController.dispose();
    payerNameController.dispose();
    notesController.dispose();
    super.dispose();
  }

  String _getProviderDisplayName(TransactionProvider provider) {
    switch (provider) {
      case TransactionProvider.CBE:
        return 'Commercial Bank of Ethiopia';
      case TransactionProvider.TELEBIRR:
        return 'Telebirr';
      case TransactionProvider.AWASH:
        return 'Awash Bank';
      case TransactionProvider.BOA:
        return 'Bank of Abyssinia';
      case TransactionProvider.DASHEN:
        return 'Dashen Bank';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocListener<TransactionBloc, TransactionState>(
      listener: (context, state) {
        if (state is ReceiverAccountsLoaded) {
          setState(() {
            enabledProviders = state.accounts
                .where((acc) => acc.status == 'ACTIVE')
                .toList();
          });
        } else if (state is PaymentIntentCreated) {
          // Success - close modal and return result
          Navigator.pop(context, state.orderResponse);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Payment intent created successfully'),
              backgroundColor: Colors.green,
            ),
          );
        } else if (state is PaymentIntentCreationError) {
          // Error - show message
          setState(() {
            isSaving = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        } else if (state is PaymentIntentCreating) {
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
                      color: Colors.blue.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.receipt_long,
                      color: Colors.blue,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Create Payment Intent',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Create a new payment request for your customer',
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
                      // Payer Name Field
                      Text(
                        'Payer Name',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: payerNameController,
                        decoration: InputDecoration(
                          hintText: "Customer's full name",
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
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Payer name is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Payment Provider
                      Text(
                        'Payment Provider',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      BlocBuilder<TransactionBloc, TransactionState>(
                        builder: (context, state) {
                          if (state is ReceiverAccountsLoading) {
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

                          if (enabledProviders.isEmpty) {
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
                                'No payment providers enabled. Please enable at least one provider in Settings.',
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
                            child: DropdownButtonFormField<TransactionProvider>(
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
                              items: enabledProviders.map((account) {
                                return DropdownMenuItem<TransactionProvider>(
                                  value: account.provider,
                                  child: Text(
                                    '${_getProviderDisplayName(account.provider)} (${account.receiverAccount})',
                                  ),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  selectedProvider = value;
                                });
                              },
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 20),

                      // Amount Field
                      Text(
                        'Amount (ETB)',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: amountController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Enter amount',
                          prefixText: 'ETB ',
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
                          // Allow only numbers and one decimal point
                          if (value.isNotEmpty &&
                              !RegExp(r'^\d*\.?\d*$').hasMatch(value)) {
                            amountController.text = value.substring(
                              0,
                              value.length - 1,
                            );
                            amountController.selection =
                                TextSelection.fromPosition(
                                  TextPosition(
                                    offset: amountController.text.length,
                                  ),
                                );
                          }
                        },
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Amount is required';
                          }
                          final amount = double.tryParse(value);
                          if (amount == null || amount <= 0) {
                            return 'Amount must be greater than 0';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Notes Field (Optional)
                      Text(
                        'Notes (Optional)',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: notesController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'Any additional notes...',
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
                      onPressed: (isSaving || enabledProviders.isEmpty)
                          ? null
                          : () {
                              if (formKey.currentState!.validate()) {
                                final amount = double.parse(
                                  amountController.text,
                                );
                                context.read<TransactionBloc>().add(
                                  CreatePaymentIntent(
                                    amount: amount,
                                    provider: selectedProvider!,
                                    payerName: payerNameController.text.trim(),
                                    notes: notesController.text.trim().isEmpty
                                        ? null
                                        : notesController.text.trim(),
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
                          : const Text('Create'),
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
