import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:animate_do/animate_do.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../../../../core/di/injection_container.dart';
import '../../data/models/transaction_models.dart';
import '../bloc/transaction_bloc.dart';
import '../bloc/transaction_event.dart';
import '../bloc/transaction_state.dart';

class EnhancedTransactionsScreen extends StatelessWidget {
  const EnhancedTransactionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) =>
          getIt<TransactionBloc>()..add(const LoadTransactions()),
      child: const TransactionsScreenContent(),
    );
  }
}

class TransactionsScreenContent extends StatefulWidget {
  const TransactionsScreenContent({super.key});

  @override
  State<TransactionsScreenContent> createState() =>
      _TransactionsScreenContentState();
}

class _TransactionsScreenContentState extends State<TransactionsScreenContent> {
  final ScrollController _scrollController = ScrollController();
  TransactionProvider? _selectedProviderFilter;
  TransactionStatus? _selectedStatusFilter;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      context.read<TransactionBloc>().add(const LoadMoreTransactions());
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    // Theme-aware background colors
    final bgAccentColor = isDark
        ? theme.colorScheme.primary.withValues(alpha: 0.1)
        : theme.colorScheme.primary.withValues(alpha: 0.08);

    final bgSecondaryColor = isDark
        ? theme.colorScheme.secondary.withValues(alpha: 0.08)
        : theme.colorScheme.secondary.withValues(alpha: 0.06);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background Decorative Circles
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
                // Enhanced Header
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
                                colorScheme.primary.withValues(alpha: 0.2),
                                colorScheme.primary.withValues(alpha: 0.1),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: colorScheme.primary.withValues(
                                  alpha: 0.2,
                                ),
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
                                'Transaction Management',
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
                            final isDarkMode =
                                themeState.themeMode == ThemeMode.dark;
                            return Container(
                              decoration: BoxDecoration(
                                color: colorScheme.surfaceContainerHighest
                                    .withValues(alpha: 0.8),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: IconButton(
                                onPressed: () {
                                  context.read<ThemeBloc>().add(ToggleTheme());
                                },
                                icon: Icon(
                                  isDarkMode
                                      ? Icons.dark_mode_rounded
                                      : Icons.light_mode_rounded,
                                  color: colorScheme.onSurfaceVariant,
                                ),
                                tooltip: isDarkMode
                                    ? 'Switch to Light Mode'
                                    : 'Switch to Dark Mode',
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // BLoC Consumer for Transaction Data
                Expanded(
                  child: BlocConsumer<TransactionBloc, TransactionState>(
                    listener: (context, state) {
                      if (state is TransactionError) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(state.message),
                            backgroundColor: Colors.red,
                            action: SnackBarAction(
                              label: 'Retry',
                              onPressed: () {
                                context.read<TransactionBloc>().add(
                                  const LoadTransactions(),
                                );
                              },
                            ),
                          ),
                        );
                      } else if (state is TransactionVerified) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Transaction verified successfully!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      } else if (state is TransactionVerificationError) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(state.message),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    },
                    builder: (context, state) {
                      if (state is TransactionLoading) {
                        return _buildLoadingState();
                      } else if (state is TransactionLoaded) {
                        return _buildLoadedState(state, colorScheme);
                      } else if (state is TransactionLoadingMore) {
                        return _buildLoadingMoreState(state, colorScheme);
                      } else if (state is TransactionError) {
                        return _buildErrorState(state, colorScheme);
                      } else {
                        return _buildInitialState(colorScheme);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return FadeIn(
      delay: const Duration(milliseconds: 600),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(strokeWidth: 3),
            ),
            SizedBox(height: 16),
            Text('Loading transactions...'),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadedState(TransactionLoaded state, ColorScheme colorScheme) {
    return Column(
      children: [
        // Summary Statistics Card
        FadeInUp(
          delay: const Duration(milliseconds: 200),
          child: _buildSummaryCard(state.summary, colorScheme),
        ),

        // Filter Chips
        FadeInUp(
          delay: const Duration(milliseconds: 400),
          child: _buildFilterBar(colorScheme),
        ),

        // Transaction List
        Expanded(
          child: FadeInUp(
            delay: const Duration(milliseconds: 600),
            child: RefreshIndicator(
              onRefresh: () async {
                context.read<TransactionBloc>().add(
                  const RefreshTransactions(),
                );
              },
              child: state.transactions.isEmpty
                  ? _buildEmptyState(colorScheme)
                  : ListView.separated(
                      controller: _scrollController,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                      itemCount:
                          state.transactions.length +
                          (state.hasReachedMax ? 0 : 1),
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        if (index >= state.transactions.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }

                        final transaction = state.transactions[index];
                        return FadeInUp(
                          delay: Duration(milliseconds: 600 + (index * 50)),
                          child: _buildTransactionTile(
                            transaction,
                            colorScheme,
                          ),
                        );
                      },
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingMoreState(
    TransactionLoadingMore state,
    ColorScheme colorScheme,
  ) {
    return Column(
      children: [
        // Summary Statistics Card
        FadeInUp(
          delay: const Duration(milliseconds: 200),
          child: _buildSummaryCard(state.summary, colorScheme),
        ),

        // Filter Chips
        FadeInUp(
          delay: const Duration(milliseconds: 400),
          child: _buildFilterBar(colorScheme),
        ),

        // Transaction List with Loading More Indicator
        Expanded(
          child: ListView.separated(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
            itemCount: state.currentTransactions.length + 1,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              if (index >= state.currentTransactions.length) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(),
                  ),
                );
              }

              final transaction = state.currentTransactions[index];
              return _buildTransactionTile(transaction, colorScheme);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState(TransactionError state, ColorScheme colorScheme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: colorScheme.error),
            const SizedBox(height: 16),
            Text(
              'Failed to load transactions',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              state.message,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                context.read<TransactionBloc>().add(const LoadTransactions());
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInitialState(ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'Welcome to Transactions',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tap to load your transaction history',
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              context.read<TransactionBloc>().add(const LoadTransactions());
            },
            icon: const Icon(Icons.download),
            label: const Text('Load Transactions'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(ColorScheme colorScheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No transactions found',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Transactions will appear here once they are processed',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(
    TransactionSummary summary,
    ColorScheme colorScheme,
  ) {
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
              colors: [
                colorScheme.primary,
                colorScheme.primary.withValues(alpha: 0.8),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: colorScheme.primary.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
              BoxShadow(
                color: colorScheme.primary.withValues(alpha: 0.1),
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
                    color: Colors.white.withValues(alpha: 0.9),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Total Volume (Verified)',
                    style: GoogleFonts.poppins(
                      color: Colors.white.withValues(alpha: 0.9),
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
                  'ETB ${NumberFormat('#,##0.00').format(summary.totalVolume)}',
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
                  _buildMiniStat(
                    '${summary.totalTransactions}',
                    'Transactions',
                    statFontSize,
                    labelFontSize,
                  ),
                  Container(
                    width: 1,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                  _buildMiniStat(
                    '${summary.successRate.toStringAsFixed(1)}%',
                    'Success Rate',
                    statFontSize,
                    labelFontSize,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMiniStat(
    String value,
    String label,
    double statFontSize,
    double labelFontSize,
  ) {
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
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: labelFontSize,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildFilterBar(ColorScheme colorScheme) {
    final providers = [null, ...TransactionProvider.values];
    final statuses = [null, ...TransactionStatus.values];

    return Column(
      children: [
        // Provider Filter
        SizedBox(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: providers.length,
            itemBuilder: (context, index) {
              final provider = providers[index];
              final isSelected = _selectedProviderFilter == provider;
              final label = provider?.name ?? 'All Providers';

              return Padding(
                padding: const EdgeInsets.only(right: 10),
                child: FilterChip(
                  label: Text(
                    label,
                    style: GoogleFonts.poppins(
                      color: isSelected
                          ? Colors.white
                          : colorScheme.onSurfaceVariant,
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.w500,
                      fontSize: 13,
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (val) {
                    setState(() {
                      _selectedProviderFilter = provider;
                    });
                    context.read<TransactionBloc>().add(
                      FilterTransactions(
                        provider: provider,
                        status: _selectedStatusFilter,
                      ),
                    );
                  },
                  selectedColor: colorScheme.primary,
                  checkmarkColor: Colors.white,
                  backgroundColor: colorScheme.surfaceContainerHighest
                      .withValues(alpha: 0.3),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected
                          ? colorScheme.primary
                          : Colors.transparent,
                      width: 1,
                    ),
                  ),
                  elevation: isSelected ? 4 : 0,
                  shadowColor: colorScheme.primary.withValues(alpha: 0.3),
                ),
              );
            },
          ),
        ),

        // Status Filter
        SizedBox(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: statuses.length,
            itemBuilder: (context, index) {
              final status = statuses[index];
              final isSelected = _selectedStatusFilter == status;
              final label = status?.name ?? 'All Status';

              return Padding(
                padding: const EdgeInsets.only(right: 10),
                child: FilterChip(
                  label: Text(
                    label,
                    style: GoogleFonts.poppins(
                      color: isSelected
                          ? Colors.white
                          : colorScheme.onSurfaceVariant,
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.w500,
                      fontSize: 13,
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (val) {
                    setState(() {
                      _selectedStatusFilter = status;
                    });
                    context.read<TransactionBloc>().add(
                      FilterTransactions(
                        provider: _selectedProviderFilter,
                        status: status,
                      ),
                    );
                  },
                  selectedColor: colorScheme.secondary,
                  checkmarkColor: Colors.white,
                  backgroundColor: colorScheme.surfaceContainerHighest
                      .withValues(alpha: 0.3),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected
                          ? colorScheme.secondary
                          : Colors.transparent,
                      width: 1,
                    ),
                  ),
                  elevation: isSelected ? 4 : 0,
                  shadowColor: colorScheme.secondary.withValues(alpha: 0.3),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionTile(
    TransactionRecord transaction,
    ColorScheme colorScheme,
  ) {
    final statusColor = _getStatusColor(transaction.status, colorScheme);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: colorScheme.outlineVariant.withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: colorScheme.shadow.withValues(alpha: 0.05),
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
              color: colorScheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              _getProviderIcon(transaction.provider),
              color: colorScheme.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  transaction.verifiedBy?.name ??
                      transaction.verifiedBy?.user?.name ??
                      'Transaction ${transaction.reference}',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 12,
                      color: colorScheme.onSurfaceVariant.withValues(
                        alpha: 0.6,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      DateFormat('HH:mm • MMM d').format(transaction.createdAt),
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: colorScheme.onSurfaceVariant.withValues(
                          alpha: 0.8,
                        ),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  transaction.providerDisplayName,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: colorScheme.onSurfaceVariant,
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
                '${NumberFormat('#,##0.00').format(transaction.amount)} ${transaction.currency}',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  color: colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: statusColor.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: Text(
                  transaction.statusDisplayName,
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

  // Helper Methods
  IconData _getProviderIcon(TransactionProvider provider) {
    switch (provider) {
      case TransactionProvider.TELEBIRR:
        return Icons.smartphone;
      case TransactionProvider.CBE:
        return Icons.account_balance;
      case TransactionProvider.AWASH:
        return Icons.account_balance_wallet;
      case TransactionProvider.BOA:
        return Icons.credit_card;
      case TransactionProvider.DASHEN:
        return Icons.payment;
    }
  }

  Color _getStatusColor(TransactionStatus status, ColorScheme colorScheme) {
    switch (status) {
      case TransactionStatus.VERIFIED:
        return Colors.green;
      case TransactionStatus.PENDING:
        return Colors.orange;
      case TransactionStatus.FAILED:
        return Colors.red;
      case TransactionStatus.EXPIRED:
        return Colors.grey;
    }
  }
}
