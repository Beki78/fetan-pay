import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../bloc/tip_bloc.dart';
import '../bloc/tip_event.dart';
import '../bloc/tip_state.dart';
import '../../data/models/tip_models.dart';

class TipScreen extends StatelessWidget {
  const TipScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => getIt<TipBloc>()..add(const RefreshTips()),
      child: const TipScreenContent(),
    );
  }
}

class TipScreenContent extends StatefulWidget {
  const TipScreenContent({super.key});

  @override
  State<TipScreenContent> createState() => _TipScreenContentState();
}

class _TipScreenContentState extends State<TipScreenContent> {
  final ScrollController _scrollController = ScrollController();

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
      context.read<TipBloc>().add(const LoadMoreTips());
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'verified':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
      case 'unverified':
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
                        color: theme.colorScheme.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.asset(
                          'assets/images/logo/fetan-logo.png',
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) {
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
                        final isDarkMode =
                            themeState.themeMode == ThemeMode.dark;
                        return IconButton(
                          onPressed: () {
                            context.read<ThemeBloc>().add(ToggleTheme());
                          },
                          icon: Icon(
                            isDarkMode ? Icons.dark_mode : Icons.light_mode,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          tooltip: isDarkMode
                              ? 'Switch to Light Mode'
                              : 'Switch to Dark Mode',
                        );
                      },
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: BlocBuilder<TipBloc, TipState>(
                  builder: (context, state) {
                    if (state is TipLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (state is TipError) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 64,
                              color: theme.colorScheme.error,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Error loading tips',
                              style: theme.textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              state.message,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                context.read<TipBloc>().add(
                                  const RefreshTips(),
                                );
                              },
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      );
                    }

                    if (state is TipLoaded) {
                      return RefreshIndicator(
                        onRefresh: () async {
                          context.read<TipBloc>().add(const RefreshTips());
                        },
                        child: SingleChildScrollView(
                          controller: _scrollController,
                          physics: const AlwaysScrollableScrollPhysics(),
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 672),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Summary Cards
                                    GridView.count(
                                      crossAxisCount:
                                          ResponsiveUtils.getGridCrossAxisCount(
                                            context,
                                          ),
                                      crossAxisSpacing: 12,
                                      mainAxisSpacing: 12,
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      children: [
                                        _buildStatCard(
                                          'Today',
                                          state.statistics.today,
                                          Icons.today,
                                          theme.colorScheme.primary,
                                        ),
                                        _buildStatCard(
                                          'This Week',
                                          state.statistics.thisWeek,
                                          Icons.calendar_view_week,
                                          theme.colorScheme.secondary,
                                        ),
                                        _buildStatCard(
                                          'This Month',
                                          state.statistics.thisMonth,
                                          Icons.calendar_month,
                                          Colors.green,
                                        ),
                                        _buildStatCard(
                                          'Total',
                                          state.statistics.total,
                                          Icons.account_balance_wallet,
                                          theme.colorScheme.onSurfaceVariant,
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
                                              style: theme.textTheme.titleLarge
                                                  ?.copyWith(
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 16),

                                        if (state.tips.isEmpty)
                                          Center(
                                            child: Column(
                                              children: [
                                                Icon(
                                                  Icons.receipt_long,
                                                  size: 48,
                                                  color: theme
                                                      .colorScheme
                                                      .onSurfaceVariant
                                                      .withValues(alpha: 0.5),
                                                ),
                                                const SizedBox(height: 16),
                                                Text(
                                                  'No tips recorded yet',
                                                  style: theme
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.copyWith(
                                                        color: theme
                                                            .colorScheme
                                                            .onSurfaceVariant,
                                                      ),
                                                ),
                                                const SizedBox(height: 8),
                                                Text(
                                                  'Tips will appear here after payment verifications',
                                                  style: theme
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        color: theme
                                                            .colorScheme
                                                            .onSurfaceVariant,
                                                      ),
                                                  textAlign: TextAlign.center,
                                                ),
                                              ],
                                            ),
                                          )
                                        else
                                          Column(
                                            children: [
                                              ListView.separated(
                                                shrinkWrap: true,
                                                physics:
                                                    const NeverScrollableScrollPhysics(),
                                                itemCount: state.tips.length,
                                                separatorBuilder:
                                                    (context, index) => Divider(
                                                      color: theme
                                                          .colorScheme
                                                          .outline
                                                          .withValues(
                                                            alpha: 0.3,
                                                          ),
                                                      height: 16,
                                                    ),
                                                itemBuilder: (context, index) {
                                                  final tip = state.tips[index];
                                                  return _buildTipItem(
                                                    tip,
                                                    theme,
                                                  );
                                                },
                                              ),
                                              if (state.isLoadingMore)
                                                const Padding(
                                                  padding: EdgeInsets.all(16.0),
                                                  child:
                                                      CircularProgressIndicator(),
                                                ),
                                            ],
                                          ),
                                      ],
                                    ),

                                    const SizedBox(height: 20),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }

                    return const SizedBox.shrink();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String title,
    double amount,
    IconData icon,
    Color color,
  ) {
    return AppCard(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 16),
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
        Text(
          CurrencyFormatter.formatWhole(amount),
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildTipItem(TipItem tip, ThemeData theme) {
    final date = DateTime.parse(tip.createdAt);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: theme.colorScheme.secondary.withValues(alpha: 0.1),
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
                      CurrencyFormatter.formatWhole(tip.tipAmount),
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
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(tip.status).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      tip.status,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: _getStatusColor(tip.status),
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
                      'Payment: ${CurrencyFormatter.formatWhole(tip.claimedAmount)}',
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
                      tip.reference,
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
                        if (tip.verifiedBy != null)
                          Text(
                            'By: ${tip.verifiedBy!.name ?? tip.verifiedBy!.email ?? 'Unknown'}',
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
