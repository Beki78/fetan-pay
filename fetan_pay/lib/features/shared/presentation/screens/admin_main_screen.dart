import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/bloc/admin_navigation/admin_navigation_bloc.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../widgets/admin_bottom_navigation.dart';
import '../../../bank_accounts/presentation/widgets/add_bank_account_modal.dart';
import '../../../dashboard/presentation/screens/admin_dashboard_screen.dart';
import '../../../transactions/presentation/widgets/transaction_modal.dart';
import '../../../vendors/presentation/widgets/user_modal.dart';
import '../../../vendors/presentation/bloc/merchant_users_bloc.dart';
import '../../../settings/presentation/screens/settings_screen.dart';
import '../../../transactions/presentation/screens/enhanced_transactions_screen.dart';
import '../../../vendors/presentation/screens/users_screen.dart';

class AdminMainScreen extends StatelessWidget {
  const AdminMainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AdminNavigationBloc(),
      child: BlocBuilder<AdminNavigationBloc, AdminNavigationState>(
        builder: (context, state) {
          return Scaffold(
            body: Stack(
              children: [
                // Main body content
                IndexedStack(
                  index: state.currentIndex,
                  children: [
                    AdminDashboardScreen(),
                    EnhancedTransactionsScreen(),
                    BlocProvider(
                      create: (_) => getIt<MerchantUsersBloc>(),
                      child: const UsersScreen(),
                    ),
                    SettingsScreen(),
                  ],
                ),
                // Floating navigation positioned at bottom
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: AdminBottomNavigation(
                    currentIndex: state.currentIndex,
                    onTap: (index) {
                      // Handle tab navigation
                      switch (index) {
                        case 0:
                          context.read<AdminNavigationBloc>().add(
                            NavigateToDashboard(),
                          );
                          break;
                        case 1:
                          context.read<AdminNavigationBloc>().add(
                            NavigateToTransactions(),
                          );
                          break;
                        case 2:
                          context.read<AdminNavigationBloc>().add(
                            NavigateToUsers(),
                          );
                          break;
                        case 3:
                          context.read<AdminNavigationBloc>().add(
                            NavigateToSettings(),
                          );
                          break;
                        case 4: // FAB pressed
                          _showQuickActions(context).then((navigationAction) {
                            if (navigationAction != null) {
                              context.read<AdminNavigationBloc>().add(
                                navigationAction,
                              );
                              _showNavigationMessage(context, navigationAction);
                            }
                          });
                          break;
                      }
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<AdminNavigationEvent?> _showQuickActions(BuildContext context) {
    return showModalBottomSheet<AdminNavigationEvent>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Quick Actions',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),
              // First row - 3 buttons
              Row(
                children: [
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildQuickActionButton(
                      context,
                      'Add User',
                      Icons.person_add,
                      Colors.teal,
                      () async {
                        Navigator.pop(
                          context,
                          null,
                        ); // Close quick actions modal

                        // Show user modal
                        await UserModal.show(context);

                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('User added successfully!'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildQuickActionButton(
                      context,
                      'New Transaction',
                      Icons.receipt_long,
                      Colors.blue,
                      () {
                        Navigator.pop(
                          context,
                          null,
                        ); // Close quick actions modal
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          TransactionModal.show(context).then((orderResponse) {
                            if (orderResponse != null) {
                              // Payment intent created successfully
                              final amount =
                                  double.tryParse(
                                    orderResponse.order.expectedAmount ?? '0',
                                  ) ??
                                  0.0;
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Payment intent created successfully!\nETB ${amount.toStringAsFixed(2)} - Order ID: ${orderResponse.order.id}',
                                    ),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              });
                            }
                          });
                        });
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Second row - 3 buttons
              Row(
                children: [
                  Expanded(
                    child: _buildQuickActionButton(
                      context,
                      'Add Bank Account',
                      Icons.account_balance,
                      Colors.indigo,
                      () {
                        Navigator.pop(
                          context,
                          null,
                        ); // Close quick actions modal
                        WidgetsBinding.instance.addPostFrameCallback((_) {
                          AddBankAccountModal.show(context);
                        });
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  void _showNavigationMessage(
    BuildContext context,
    AdminNavigationEvent navigationEvent,
  ) {
    String message;
    switch (navigationEvent.runtimeType) {
      case NavigateToUsers _:
        message = 'Switched to Vendors - Add vendor feature coming soon!';
        break;
      case NavigateToTransactions _:
        message =
            'Switched to Transactions - Add transaction feature coming soon!';
        break;
      case NavigateToDashboard _:
        message = 'Switched to Dashboard - Export feature available!';
        break;
      default:
        message = 'Navigation completed!';
    }

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Widget _buildQuickActionButton(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withValues(alpha: 0.1),
        foregroundColor: color,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      ),
      child: Column(
        children: [
          Icon(icon, size: 24),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
