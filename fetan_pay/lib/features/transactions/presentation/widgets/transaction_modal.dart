import 'package:flutter/material.dart';
import '../../../scan/presentation/screens/scan_screen.dart';

class Transaction {
  final String? id;
  final double amount;
  final String vendor;
  final String paymentMethod;
  final String? reference;
  final String status;
  final DateTime timestamp;

  Transaction({
    this.id,
    required this.amount,
    required this.vendor,
    required this.paymentMethod,
    this.reference,
    this.status = 'CONFIRMED',
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  Transaction copyWith({
    String? id,
    double? amount,
    String? vendor,
    String? paymentMethod,
    String? reference,
    String? status,
    DateTime? timestamp,
  }) {
    return Transaction(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      vendor: vendor ?? this.vendor,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      reference: reference ?? this.reference,
      status: status ?? this.status,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}

const List<String> paymentMethods = [
  'CBE Mobile',
  'TeleBirr',
  'Awash International',
  'BOA',
  'Commercial Bank of Ethiopia',
];

const List<String> transactionStatuses = ['CONFIRMED', 'PENDING', 'UNCONFIRMED'];

class TransactionModal extends StatefulWidget {
  const TransactionModal({super.key});

  static Future<Transaction?> show(BuildContext context) {
    return showModalBottomSheet<Transaction>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const TransactionModal(),
    );
  }

  @override
  State<TransactionModal> createState() => _TransactionModalState();
}

class _TransactionModalState extends State<TransactionModal> {
  final formKey = GlobalKey<FormState>();
  final amountController = TextEditingController();
  final referenceController = TextEditingController();
  String selectedVendor = 'Waiter John'; // Default vendor
  String selectedPaymentMethod = paymentMethods[0];
  String selectedStatus = 'CONFIRMED';
  bool isSaving = false;

  // Mock vendor list - in real app, this would come from a service
  final List<String> vendors = [
    'Waiter John',
    'Waiter Sarah',
    'Waiter Mike',
    'Waiter Emma',
    'Waiter David',
    'Waiter Lisa',
    'Waiter Mark',
    'Waiter Anna',
  ];

  @override
  void dispose() {
    amountController.dispose();
    referenceController.dispose();
    super.dispose();
  }

  Future<void> _scanQRCode() async {
    try {
      // Navigate to the scan screen
      final result = await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => const QRScannerScreen(),
        ),
      );

      if (result != null && result is String && result.isNotEmpty) {
        setState(() {
          referenceController.text = result;
        });
      }
    } catch (e) {
      // If scan fails, show error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('QR scanner is not available. Please enter reference manually.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
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
                    color: Colors.blue.withOpacity(0.1),
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
                        'Create New Transaction',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        'Add a new transaction to the system',
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
                    // Amount Field
                    Text(
                      'Transaction Amount',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: amountController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        hintText: '0.00',
                        prefixText: 'ETB ',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: theme.colorScheme.outline.withOpacity(0.3),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: theme.colorScheme.outline.withOpacity(0.3),
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: theme.colorScheme.primary,
                            width: 2,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Amount is required';
                        }
                        final amount = double.tryParse(value);
                        if (amount == null || amount <= 0) {
                          return 'Please enter a valid amount';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // Vendor Selection
                    // Text(
                    //   'Select Vendor',
                    //   style: theme.textTheme.titleMedium?.copyWith(
                    //     fontWeight: FontWeight.w600,
                    //   ),
                    // ),
                    // const SizedBox(height: 8),
                    // Container(
                    //   decoration: BoxDecoration(
                    //     border: Border.all(
                    //       color: theme.colorScheme.outline.withOpacity(0.3),
                    //     ),
                    //     borderRadius: BorderRadius.circular(12),
                    //   ),
                    //   child: DropdownButtonFormField<String>(
                    //     value: selectedVendor,
                    //     decoration: InputDecoration(
                    //       contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    //       border: InputBorder.none,
                    //       hintText: 'Choose a vendor',
                    //     ),
                    //     validator: (value) {
                    //       if (value == null || value.isEmpty) {
                    //         return 'Please select a vendor';
                    //       }
                    //       return null;
                    //     },
                    //     items: vendors.map((vendor) {
                    //       return DropdownMenuItem<String>(
                    //         value: vendor,
                    //         child: Text(vendor),
                    //       );
                    //     }).toList(),
                    //     onChanged: (value) {
                    //       if (value != null) {
                    //         setState(() {
                    //           selectedVendor = value;
                    //         });
                    //       }
                    //     },
                    //   ),
                    // ),
                    // const SizedBox(height: 20),

                    // Payment Method
                    Text(
                      'Payment Method',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: theme.colorScheme.outline.withOpacity(0.3),
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonFormField<String>(
                        value: selectedPaymentMethod,
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          border: InputBorder.none,
                          hintText: 'Select payment method',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please select a payment method';
                          }
                          return null;
                        },
                        items: paymentMethods.map((method) {
                          return DropdownMenuItem<String>(
                            value: method,
                            child: Text(method),
                          );
                        }).toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              selectedPaymentMethod = value;
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Reference Number
                    Text(
                      'Reference Number',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: referenceController,
                            decoration: InputDecoration(
                              hintText: 'Enter reference number',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: theme.colorScheme.outline.withOpacity(0.3),
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: theme.colorScheme.outline.withOpacity(0.3),
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: theme.colorScheme.primary,
                                  width: 2,
                                ),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Reference number is required';
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.colorScheme.primary.withOpacity(0.3),
                            ),
                          ),
                          child: IconButton(
                            onPressed: _scanQRCode,
                            icon: Icon(
                              Icons.qr_code_scanner,
                              color: theme.colorScheme.primary,
                              size: 24,
                            ),
                            tooltip: 'Scan QR Code',
                          ),
                        ),
                      ],
                    ),
                    // const SizedBox(height: 20),

                    // // Transaction Status
                    // Text(
                    //   'Transaction Status',
                    //   style: theme.textTheme.titleMedium?.copyWith(
                    //     fontWeight: FontWeight.w600,
                    //   ),
                    // ),
                    // const SizedBox(height: 8),
                    // Container(
                    //   decoration: BoxDecoration(
                    //     border: Border.all(
                    //       color: theme.colorScheme.outline.withOpacity(0.3),
                    //     ),
                    //     borderRadius: BorderRadius.circular(12),
                    //   ),
                    //   child: DropdownButtonFormField<String>(
                    //     value: selectedStatus,
                    //     decoration: InputDecoration(
                    //       contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    //       border: InputBorder.none,
                    //       hintText: 'Select status',
                    //     ),
                    //     items: transactionStatuses.map((status) {
                    //       return DropdownMenuItem<String>(
                    //         value: status,
                    //         child: Text(status),
                    //       );
                    //     }).toList(),
                    //     onChanged: (value) {
                    //       if (value != null) {
                    //         setState(() {
                    //           selectedStatus = value;
                    //         });
                    //       }
                    //     },
                    //   ),
                    // ),
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
                    onPressed: isSaving ? null : () async {
                      if (formKey.currentState!.validate()) {
                        setState(() {
                          isSaving = true;
                        });

                        // Simulate API call
                        await Future.delayed(const Duration(seconds: 1));

                        final amount = double.parse(amountController.text);
                        final transaction = Transaction(
                          amount: amount,
                          vendor: selectedVendor,
                          paymentMethod: selectedPaymentMethod,
                          reference: referenceController.text.trim(),
                          status: selectedStatus,
                        );

                        setState(() {
                          isSaving = false;
                        });

                        if (mounted) {
                          Navigator.pop(context, transaction);
                        }
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
                        : const Text('Create Transaction'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
