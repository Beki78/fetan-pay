import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';

class TipScreen extends StatefulWidget {
  const TipScreen({super.key});

  @override
  State<TipScreen> createState() => _TipScreenState();
}

class _TipScreenState extends State<TipScreen> {
  bool _isLoading = true;
  final Map<String, double> _tipStats = {
    'today': 250.50,
    'thisWeek': 1250.75,
    'thisMonth': 4850.25,
    'total': 15680.90,
  };

  final List<Map<String, dynamic>> _recentTips = [
    {
      'id': '1',
      'amount': 50.00,
      'paymentAmount': 500.00,
      'reference': 'TXN-123456789',
      'status': 'VERIFIED',
      'verifiedBy': 'John Doe',
      'date': DateTime.now().subtract(const Duration(hours: 2)),
    },
    {
      'id': '2',
      'amount': 25.50,
      'paymentAmount': 250.00,
      'reference': 'TXN-987654321',
      'status': 'VERIFIED',
      'verifiedBy': 'Jane Smith',
      'date': DateTime.now().subtract(const Duration(hours: 5)),
    },
    {
      'id': '3',
      'amount': 75.25,
      'paymentAmount': 750.00,
      'reference': 'TXN-456789123',
      'status': 'VERIFIED',
      'verifiedBy': 'Mike Johnson',
      'date': DateTime.now().subtract(const Duration(hours: 8)),
    },
    {
      'id': '4',
      'amount': 100.00,
      'paymentAmount': 1000.00,
      'reference': 'TXN-789123456',
      'status': 'VERIFIED',
      'verifiedBy': 'Sarah Wilson',
      'date': DateTime.now().subtract(const Duration(days: 1)),
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
                            'Your tips & earnings',
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Summary Cards
                      GridView.count(
                        crossAxisCount: ResponsiveUtils.getGridCrossAxisCount(context),
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _buildStatCard(
                            'Today',
                            _tipStats['today']!,
                            Icons.today,
                            theme.colorScheme.primary,
                            _isLoading,
                          ),
                          _buildStatCard(
                            'This Week',
                            _tipStats['thisWeek']!,
                            Icons.calendar_view_week,
                            theme.colorScheme.secondary,
                            _isLoading,
                          ),
                          _buildStatCard(
                            'This Month',
                            _tipStats['thisMonth']!,
                            Icons.calendar_month,
                            Colors.green,
                            _isLoading,
                          ),
                          _buildStatCard(
                            'Total',
                            _tipStats['total']!,
                            Icons.account_balance_wallet,
                            theme.colorScheme.onSurfaceVariant,
                            _isLoading,
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Recent Tips
                      AppCard(
                        padding: const EdgeInsets.all(20),
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.receipt_long,
                                color: theme.colorScheme.primary,
                                size: 24,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Recent Tips',
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
                          else if (_recentTips.isEmpty)
                            Center(
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.receipt_long,
                                    size: 48,
                                    color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No tips recorded yet',
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Tips will appear here after payment verifications',
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
                              itemCount: _recentTips.length,
                              separatorBuilder: (context, index) => Divider(
                                color: theme.colorScheme.outline.withOpacity(0.3),
                                height: 16,
                              ),
                              itemBuilder: (context, index) {
                                final tip = _recentTips[index];
                                return _buildTipItem(tip, theme);
                              },
                            ),
                        ],
                      ),

                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
          )
          )
          )
          ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, double amount, IconData icon, Color color, bool isLoading) {
    return AppCard(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: color,
                size: 16,
              ),
            ),
            const Spacer(),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          title,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        if (isLoading)
          const SizedBox(
            height: 24,
            child: LinearProgressIndicator(),
          )
        else
          Text(
            _formatCurrency(amount),
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
      ],
    );
  }

  Widget _buildTipItem(Map<String, dynamic> tip, ThemeData theme) {
    final date = tip['date'] as DateTime;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: theme.colorScheme.secondary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.attach_money,
            color: theme.colorScheme.secondary,
            size: 24,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      _formatCurrency(tip['amount']),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.secondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getStatusColor(tip['status']).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      tip['status'],
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: _getStatusColor(tip['status']),
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Text(
                      'Payment: ${_formatCurrency(tip['paymentAmount'])}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 3,
                    child: Text(
                      tip['reference'],
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontFamily: 'RobotoMono',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
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
                        if (tip['verifiedBy'] != null)
                          Text(
                            'By: ${tip['verifiedBy']}',
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
            ],
          ),
        ),
      ],
    );
  }
}
