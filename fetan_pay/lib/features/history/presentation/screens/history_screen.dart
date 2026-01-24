import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  bool _isLoading = true;
  final List<Map<String, dynamic>> _verificationHistory = [
    {
      'id': '1',
      'reference': 'TXN-123456789',
      'provider': 'CBE',
      'amount': 500.00,
      'status': 'VERIFIED',
      'senderName': 'John Doe',
      'receiverName': 'Merchant Account',
      'date': DateTime.now().subtract(const Duration(hours: 2)),
      'verifiedBy': 'Jane Smith',
    },
    {
      'id': '2',
      'reference': 'TXN-987654321',
      'provider': 'BOA',
      'amount': 250.00,
      'status': 'VERIFIED',
      'senderName': 'Mike Johnson',
      'receiverName': 'Merchant Account',
      'date': DateTime.now().subtract(const Duration(hours: 5)),
      'verifiedBy': 'John Doe',
    },
    {
      'id': '3',
      'reference': 'TXN-456789123',
      'provider': 'AWASH',
      'amount': 750.00,
      'status': 'FAILED',
      'senderName': null,
      'receiverName': 'Merchant Account',
      'date': DateTime.now().subtract(const Duration(hours: 8)),
      'verifiedBy': null,
      'failureReason': 'Transaction not found',
    },
    {
      'id': '4',
      'reference': 'TXN-789123456',
      'provider': 'CBE',
      'amount': 1000.00,
      'status': 'VERIFIED',
      'senderName': 'Sarah Wilson',
      'receiverName': 'Merchant Account',
      'date': DateTime.now().subtract(const Duration(days: 1)),
      'verifiedBy': 'Jane Smith',
    },
    {
      'id': '5',
      'reference': 'TXN-321654987',
      'provider': 'TELEBIRR',
      'amount': 300.00,
      'status': 'VERIFIED',
      'senderName': 'David Brown',
      'receiverName': 'Merchant Account',
      'date': DateTime.now().subtract(const Duration(days: 2)),
      'verifiedBy': 'Mike Johnson',
    },
  ];

  @override
  void initState() {
    super.initState();
    // Simulate loading
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    });
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_ET',
      symbol: 'ETB ',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'verified':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Color _getBankColor(String provider) {
    switch (provider.toLowerCase()) {
      case 'cbe':
        return const Color(0xFF1E40AF);
      case 'boa':
        return const Color(0xFF15803D);
      case 'awash':
        return const Color(0xFFEA580C);
      case 'telebirr':
        return const Color(0xFFDC2626);
      default:
        return Colors.grey;
    }
  }

  String _getBankImagePath(String provider) {
    switch (provider.toLowerCase()) {
      case 'cbe':
        return 'assets/images/banks/CBE.png';
      case 'boa':
        return 'assets/images/banks/BOA.png';
      case 'awash':
        return 'assets/images/banks/Awash.png';
      case 'telebirr':
        return 'assets/images/banks/Telebirr.png';
      case 'dashen':
        return 'assets/images/banks/CBE.png'; // Fallback to CBE
      default:
        return 'assets/images/banks/CBE.png'; // fallback
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
            // Header
            Padding(
              padding: ResponsiveUtils.getResponsivePadding(context),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.asset(
                        'assets/images/logo/fetan-logo.png',
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          // Fallback to icon if image fails to load
                          return Icon(
                            Icons.account_balance,
                            color: theme.colorScheme.primary,
                            size: 24,
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Fetan Pay',
                          style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        Text(
                          'Verification history',
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

            // Content
            Expanded(
              child: SingleChildScrollView(
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 672),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: AppCard(
                        padding: const EdgeInsets.all(20),
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.history,
                                color: theme.colorScheme.primary,
                                size: 24,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Verification History',
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (_isLoading)
                            const Center(
                              child: CircularProgressIndicator(),
                            )
                          else if (_verificationHistory.isEmpty)
                            Center(
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.history,
                                    size: 48,
                                    color: theme.colorScheme.onSurfaceVariant
                                        .withOpacity(0.5),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No verification history',
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Verified payments will appear here',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            )
                          else
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _verificationHistory.length,
                              separatorBuilder: (context, index) => Divider(
                                color:
                                    theme.colorScheme.outline.withOpacity(0.3),
                                height: 16,
                              ),
                              itemBuilder: (context, index) {
                                final item = _verificationHistory[index];
                                return _buildHistoryItem(item, theme);
                              },
                            ),
                        ],
                      ),
                    ),
                    
                  ),
                  
                ),
                
              ),
              
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    ));
  }

  Widget _buildHistoryItem(Map<String, dynamic> item, ThemeData theme) {
    final date = item['date'] as DateTime;
    final isSuccess = item['status'] == 'VERIFIED';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.3),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with status and amount
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor(item['status']).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  item['status'],
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: _getStatusColor(item['status']),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                _formatCurrency(item['amount']),
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isSuccess
                      ? theme.colorScheme.primary
                      : theme.colorScheme.error,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Transaction details
          Row(
            children: [
              // Bank icon
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: _getBankColor(item['provider']).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: ClipOval(
                  child: Image.asset(
                    _getBankImagePath(item['provider']),
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      // Fallback to icon if image fails to load
                      return Icon(
                        Icons.account_balance,
                        color: _getBankColor(item['provider']),
                        size: 16,
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Ref: ',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(
                            item['reference'],
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontFamily: 'RobotoMono',
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '•',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          flex: 1,
                          child: Text(
                            item['provider'].toUpperCase(),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    if (item['senderName'] != null) ...[
                      Row(
                        children: [
                          Text(
                            'From: ',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              item['senderName'],
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                    ],
                    Row(
                      children: [
                        Text(
                          'To: ',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            item['receiverName'],
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Date and verifier
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.access_time,
                size: 12,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${DateFormat('MMM d, yyyy').format(date)} at ${DateFormat('h:mm a').format(date)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (item['verifiedBy'] != null)
                      Text(
                        'Verified by: ${item['verifiedBy']}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
            ],
          ),

          // Failure reason
          if (!isSuccess && item['failureReason'] != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: theme.colorScheme.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                item['failureReason'],
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.error,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
