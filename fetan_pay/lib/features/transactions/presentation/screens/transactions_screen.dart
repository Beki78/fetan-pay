import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:animate_do/animate_do.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/utils/responsive_utils.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  bool _isLoading = true;
  String _selectedStatusFilter = 'All';

  // Mock Data
  final List<Map<String, dynamic>> _allTransactions = [
    {'id': 'TXN-001', 'amount': 500.00, 'status': 'CONFIRMED', 'vendor': 'Waiter John', 'timestamp': DateTime.now().subtract(const Duration(minutes: 15)), 'method': 'CBE Mobile'},
    {'id': 'TXN-002', 'amount': 750.25, 'status': 'CONFIRMED', 'vendor': 'Waiter Sarah', 'timestamp': DateTime.now().subtract(const Duration(minutes: 32)), 'method': 'TeleBirr'},
    {'id': 'TXN-003', 'amount': 1200.00, 'status': 'UNCONFIRMED', 'vendor': 'Waiter Mike', 'timestamp': DateTime.now().subtract(const Duration(hours: 1)), 'method': 'Awash Bank'},
    {'id': 'TXN-005', 'amount': 890.75, 'status': 'PENDING', 'vendor': 'Waiter David', 'timestamp': DateTime.now().subtract(const Duration(hours: 3)), 'method': 'CBE Mobile'},
  ];

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 600), () => setState(() => _isLoading = false));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    // Theme-aware background colors (similar to dashboard)
    final bgAccentColor = isDark
        ? theme.colorScheme.primary.withOpacity(0.1)
        : theme.colorScheme.primary.withOpacity(0.08);

    final bgSecondaryColor = isDark
        ? theme.colorScheme.secondary.withOpacity(0.08)
        : theme.colorScheme.secondary.withOpacity(0.06);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background Decorative Circles (like dashboard)
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: bgAccentColor,
              ),
            ),
          ),
          Positioned(
            top: 150,
            left: -80,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: bgSecondaryColor,
              ),
            ),
          ),

          // Main Content
          SafeArea(
            child: Column(
              children: [
                // Enhanced Header (like users screen)
                FadeInDown(
                  duration: const Duration(milliseconds: 600),
                  child: Padding(
                    padding: ResponsiveUtils.getResponsivePadding(context),
                    child: Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                colorScheme.primary.withOpacity(0.2),
                                colorScheme.primary.withOpacity(0.1),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: colorScheme.primary.withOpacity(0.2),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              'assets/images/logo/fetan-logo.png',
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(
                                  Icons.receipt_long_rounded,
                                  color: colorScheme.primary,
                                  size: 28,
                                );
                              },
                            ),
                          ),
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Fetan Pay',
                                style: GoogleFonts.poppins(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: colorScheme.primary,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              Text(
                                'Transaction History',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  color: colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        BlocBuilder<ThemeBloc, ThemeState>(
                          builder: (context, themeState) {
                            final isDarkMode = themeState.themeMode == ThemeMode.dark;
                            return Container(
                              decoration: BoxDecoration(
                                color: colorScheme.surfaceContainerHighest.withOpacity(0.8),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: IconButton(
                                onPressed: () {
                                  context.read<ThemeBloc>().add(ToggleTheme());
                                },
                                icon: Icon(
                                  isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                                  color: colorScheme.onSurfaceVariant,
                                ),
                                tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Summary Statistics Card
                FadeInUp(
                  delay: const Duration(milliseconds: 200),
                  child: _buildSummaryCard(colorScheme),
                ),

                // Filter Chips
                FadeInUp(
                  delay: const Duration(milliseconds: 400),
                  child: _buildFilterBar(colorScheme),
                ),

                // Transaction List
                Expanded(
                  child: _isLoading
                      ? FadeIn(
                          delay: const Duration(milliseconds: 600),
                          child: const Center(
                            child: SizedBox(
                              width: 40,
                              height: 40,
                              child: CircularProgressIndicator(strokeWidth: 3),
                            ),
                          ),
                        )
                      : FadeInUp(
                          delay: const Duration(milliseconds: 600),
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                            child: ListView.separated(
                              physics: const BouncingScrollPhysics(),
                              itemCount: _getFilteredTransactions().length,
                              separatorBuilder: (context, index) => const SizedBox(height: 16),
                              itemBuilder: (context, index) {
                                final tx = _getFilteredTransactions()[index];
                                return FadeInUp(
                                  delay: Duration(milliseconds: 600 + (index * 100)),
                                  child: _buildTransactionTile(tx, theme),
                                );
                              },
                            ),
                          ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(ColorScheme color) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isSmall = constraints.maxWidth < 350;
        final titleFontSize = isSmall ? 12.0 : 14.0;
        final amountFontSize = isSmall ? 24.0 : 30.0;
        final statFontSize = isSmall ? 14.0 : 16.0;
        final labelFontSize = isSmall ? 10.0 : 12.0;

        return Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.primary, color.primary.withOpacity(0.8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: color.primary.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
              BoxShadow(
                color: color.primary.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.trending_up_rounded,
                    color: Colors.white.withOpacity(0.9),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Total Volume (Today)',
                    style: GoogleFonts.poppins(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: titleFontSize,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  'ETB 3,341.00',
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: amountFontSize,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildMiniStat('12', 'Transactions', statFontSize, labelFontSize),
                  Container(
                    width: 1,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                  _buildMiniStat('98%', 'Success Rate', statFontSize, labelFontSize),
                ],
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildMiniStat(String value, String label, double statFontSize, double labelFontSize) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: statFontSize,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.poppins(
            color: Colors.white.withOpacity(0.8),
            fontSize: labelFontSize,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildFilterBar(ColorScheme color) {
    List<String> statuses = ['All', 'CONFIRMED', 'PENDING', 'UNCONFIRMED'];
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: statuses.length,
        itemBuilder: (context, index) {
          bool isSelected = _selectedStatusFilter == statuses[index];
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: FilterChip(
              label: Text(
                statuses[index],
                style: GoogleFonts.poppins(
                  color: isSelected ? Colors.white : color.onSurfaceVariant,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  fontSize: 13,
                ),
              ),
              selected: isSelected,
              onSelected: (val) => setState(() => _selectedStatusFilter = statuses[index]),
              selectedColor: color.primary,
              checkmarkColor: Colors.white,
              backgroundColor: color.surfaceContainerHighest.withOpacity(0.3),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? color.primary : Colors.transparent,
                  width: 1,
                ),
              ),
              elevation: isSelected ? 4 : 0,
              shadowColor: color.primary.withOpacity(0.3),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTransactionTile(Map<String, dynamic> tx, ThemeData theme) {
    Color statusColor = _getStatusColor(tx['status']);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.outlineVariant.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              _getIcon(tx['method']),
              color: theme.colorScheme.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx['vendor'],
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 12,
                      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      DateFormat('HH:mm • MMM d').format(tx['timestamp']),
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: theme.colorScheme.onSurfaceVariant.withOpacity(0.8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  tx['method'],
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${tx['amount']} ETB',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: statusColor.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: Text(
                  tx['status'],
                  style: GoogleFonts.poppins(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Helper Logic
  IconData _getIcon(String method) {
    if (method.contains('TeleBirr')) return Icons.smartphone;
    if (method.contains('CBE')) return Icons.account_balance;
    return Icons.payment;
  }

  Color _getStatusColor(String status) {
    if (status == 'CONFIRMED') return Colors.green;
    if (status == 'PENDING') return Colors.orange;
    return Colors.red;
  }

  List<Map<String, dynamic>> _getFilteredTransactions() {
    if (_selectedStatusFilter == 'All') return _allTransactions;
    return _allTransactions.where((t) => t['status'] == _selectedStatusFilter).toList();
  }
}