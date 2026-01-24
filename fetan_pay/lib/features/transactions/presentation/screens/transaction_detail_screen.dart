import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../widgets/app_button.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';

class TransactionDetailScreen extends StatelessWidget {
  final Map<String, dynamic> transaction;

  const TransactionDetailScreen({super.key, required this.transaction});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final timestamp = transaction['timestamp'] as DateTime;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              theme.colorScheme.surface,
              theme.colorScheme.surfaceContainerHighest,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header with back button
              Column(
                children: [
                  Padding(
                    padding: ResponsiveUtils.getResponsivePadding(context),
                    child: Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: Icon(
                            Icons.arrow_back,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Transaction Details',
                                style: GoogleFonts.poppins(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                              Text(
                                'Detailed information about transaction ',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                        BlocBuilder<ThemeBloc, ThemeState>(
                          builder: (context, themeState) {
                            final isDarkMode = themeState.themeMode == ThemeMode.dark;
                            return IconButton(
                              onPressed: () {
                                context.read<ThemeBloc>().add(ToggleTheme());
                              },
                              icon: Icon(
                                isDarkMode ? Icons.dark_mode : Icons.light_mode,
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                              tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                  Divider(
                    height: 1,
                    thickness: 1,
                    color: theme.colorScheme.outline.withOpacity(1),
                  ),
                ],
              ),

              // Main content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Transaction Overview Card
                      AppCard(
                        padding: const EdgeInsets.all(24),
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  color: _getStatusColor(transaction['status']).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _getStatusIcon(transaction['status']),
                                  color: _getStatusColor(transaction['status']),
                                  size: 40,
                                ),
                              ),
                              const SizedBox(width: 20),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _formatCurrency(transaction['amount']),
                                      style: theme.textTheme.headlineMedium?.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(transaction['status']).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        _getStatusText(transaction['status']),
                                        style: theme.textTheme.labelMedium?.copyWith(
                                          color: _getStatusColor(transaction['status']),
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          
                          
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Transaction Details
                      Text(
                        'Transaction Details',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      AppCard(
                        padding: const EdgeInsets.all(20),
                        children: [
                          _buildInfoRow(
                            Icons.payment,
                            'Payment Method',
                            transaction['method'],
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.tag,
                            'Reference Number',
                            transaction['reference'],
                            theme,
                            showCopyButton: true,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.person,
                            'Processed By',
                            transaction['vendor'],
                            theme,
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Timing Information
                      Text(
                        'Timing Information',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      AppCard(
                        padding: const EdgeInsets.all(20),
                        children: [
                          _buildInfoRow(
                            Icons.calendar_today,
                            'Transaction Date',
                            DateFormat('EEEE, MMMM d, yyyy').format(timestamp),
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.access_time,
                            'Transaction Time',
                            DateFormat('h:mm:ss a').format(timestamp),
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.schedule,
                            'Time Since Transaction',
                            _formatTimeSince(timestamp),
                            theme,
                            valueColor: _getTimeSinceColor(timestamp),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              text: 'Share Receipt',
                              onPressed: () {
                                // Here you would implement share functionality
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Receipt sharing coming soon!'),
                                    backgroundColor: Colors.blue,
                                  ),
                                );
                              },
                              icon: Icons.share,
                              variant: AppButtonVariant.outline,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: AppButton(
                              text: 'Download Receipt',
                              onPressed: () {
                                // Here you would implement download functionality
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Receipt download coming soon!'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              },
                              icon: Icons.download,
                              variant: AppButtonVariant.primary,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildInfoRow(IconData icon, String label, String value, ThemeData theme, {bool showCopyButton = false, Color? valueColor}) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: theme.colorScheme.primary,
            size: 20,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      value,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: valueColor ?? theme.colorScheme.onSurface,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if (showCopyButton)
                    IconButton(
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: value));
                        // Show snackbar feedback
                      },
                      icon: Icon(
                        Icons.copy,
                        size: 16,
                        color: theme.colorScheme.primary,
                      ),
                      tooltip: 'Copy to clipboard',
                    ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.green;
      case 'UNCONFIRMED':
        return Colors.orange;
      case 'PENDING':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'UNCONFIRMED':
        return Icons.warning;
      case 'PENDING':
        return Icons.hourglass_empty;
      default:
        return Icons.payment;
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'UNCONFIRMED':
        return 'Unconfirmed';
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_ET',
      symbol: 'ETB ',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  String _formatTimeSince(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minutes ago';
    } else {
      return 'Just now';
    }
  }

  Color _getTimeSinceColor(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inHours < 1) {
      return Colors.green;
    } else if (difference.inHours < 24) {
      return Colors.blue;
    } else {
      return Colors.grey;
    }
  }
}
