import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:animate_do/animate_do.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../core/utils/currency_formatter.dart';
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
      body: Stack(
        children: [
          // Background decorative elements for depth
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: theme.colorScheme.secondary.withValues(alpha: 0.08),
              ),
            ),
          ),
          Positioned(
            top: 100,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: theme.colorScheme.primary.withValues(alpha: 0.06),
              ),
            ),
          ),

          Container(
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
                  // Enhanced Header with animations
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
                                  theme.colorScheme.secondary.withValues(
                                    alpha: 0.2,
                                  ),
                                  theme.colorScheme.secondary.withValues(
                                    alpha: 0.1,
                                  ),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: theme.colorScheme.secondary.withValues(
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
                                    Icons.attach_money_rounded,
                                    color: theme.colorScheme.secondary,
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
                                    color: theme.colorScheme.primary,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                Text(
                                  'Your tips & earnings',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    color: theme.colorScheme.onSurfaceVariant,
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
                                  color: theme
                                      .colorScheme
                                      .surfaceContainerHighest
                                      .withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: IconButton(
                                  onPressed: () {
                                    context.read<ThemeBloc>().add(
                                      ToggleTheme(),
                                    );
                                  },
                                  icon: Icon(
                                    isDarkMode
                                        ? Icons.dark_mode_rounded
                                        : Icons.light_mode_rounded,
                                    color: theme.colorScheme.onSurfaceVariant,
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

                  // Content with animations
                  Expanded(
                    child: FadeInUp(
                      delay: const Duration(milliseconds: 200),
                      child: BlocBuilder<TipBloc, TipState>(
                        builder: (context, state) {
                          if (state is TipLoading) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
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
                                context.read<TipBloc>().add(
                                  const RefreshTips(),
                                );
                              },
                              child: SingleChildScrollView(
                                controller: _scrollController,
                                physics: const AlwaysScrollableScrollPhysics(),
                                child: Center(
                                  child: ConstrainedBox(
                                    constraints: const BoxConstraints(
                                      maxWidth: 672,
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                      ),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Enhanced Summary Cards with animations
                                          SlideInUp(
                                            delay: const Duration(
                                              milliseconds: 400,
                                            ),
                                            child: GridView.count(
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
                                                _buildEnhancedStatCard(
                                                  'Today',
                                                  state.statistics.today,
                                                  Icons.today_rounded,
                                                  theme.colorScheme.primary,
                                                ),
                                                _buildEnhancedStatCard(
                                                  'This Week',
                                                  state.statistics.thisWeek,
                                                  Icons
                                                      .calendar_view_week_rounded,
                                                  theme.colorScheme.secondary,
                                                ),
                                                _buildEnhancedStatCard(
                                                  'This Month',
                                                  state.statistics.thisMonth,
                                                  Icons.calendar_month_rounded,
                                                  Colors.green,
                                                ),
                                                _buildEnhancedStatCard(
                                                  'Total',
                                                  state.statistics.total,
                                                  Icons
                                                      .account_balance_wallet_rounded,
                                                  theme
                                                      .colorScheme
                                                      .onSurfaceVariant,
                                                ),
                                              ],
                                            ),
                                          ),

                                          const SizedBox(height: 24),

                                          // Enhanced Recent Tips Card
                                          SlideInUp(
                                            delay: const Duration(
                                              milliseconds: 600,
                                            ),
                                            child: Container(
                                              padding: const EdgeInsets.all(24),
                                              decoration: BoxDecoration(
                                                color: theme.colorScheme.surface
                                                    .withValues(alpha: 0.9),
                                                borderRadius:
                                                    BorderRadius.circular(24),
                                                border: Border.all(
                                                  color: Colors.white
                                                      .withValues(alpha: 0.2),
                                                  width: 1,
                                                ),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: theme.shadowColor
                                                        .withValues(alpha: 0.1),
                                                    blurRadius: 20,
                                                    offset: const Offset(0, 10),
                                                  ),
                                                ],
                                              ),
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      Container(
                                                        width: 40,
                                                        height: 40,
                                                        decoration: BoxDecoration(
                                                          gradient: LinearGradient(
                                                            colors: [
                                                              theme
                                                                  .colorScheme
                                                                  .secondary
                                                                  .withValues(
                                                                    alpha: 0.2,
                                                                  ),
                                                              theme
                                                                  .colorScheme
                                                                  .secondary
                                                                  .withValues(
                                                                    alpha: 0.1,
                                                                  ),
                                                            ],
                                                            begin: Alignment
                                                                .topLeft,
                                                            end: Alignment
                                                                .bottomRight,
                                                          ),
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                12,
                                                              ),
                                                        ),
                                                        child: Icon(
                                                          Icons
                                                              .receipt_long_rounded,
                                                          color: theme
                                                              .colorScheme
                                                              .secondary,
                                                          size: 20,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 12),
                                                      Text(
                                                        'Recent Tips',
                                                        style:
                                                            GoogleFonts.poppins(
                                                              fontSize: 18,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w700,
                                                              color: theme
                                                                  .colorScheme
                                                                  .onSurface,
                                                            ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 20),

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
                                                                .withValues(
                                                                  alpha: 0.5,
                                                                ),
                                                          ),
                                                          const SizedBox(
                                                            height: 16,
                                                          ),
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
                                                          const SizedBox(
                                                            height: 8,
                                                          ),
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
                                                            textAlign: TextAlign
                                                                .center,
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
                                                          itemCount:
                                                              state.tips.length,
                                                          separatorBuilder:
                                                              (
                                                                context,
                                                                index,
                                                              ) => Divider(
                                                                color: theme
                                                                    .colorScheme
                                                                    .outline
                                                                    .withValues(
                                                                      alpha:
                                                                          0.3,
                                                                    ),
                                                                height: 16,
                                                              ),
                                                          itemBuilder:
                                                              (context, index) {
                                                                final tip = state
                                                                    .tips[index];
                                                                return _buildTipItem(
                                                                  tip,
                                                                  theme,
                                                                );
                                                              },
                                                        ),
                                                        if (state.isLoadingMore)
                                                          const Padding(
                                                            padding:
                                                                const EdgeInsets.all(
                                                                  16.0,
                                                                ),
                                                            child:
                                                                CircularProgressIndicator(),
                                                          ),
                                                      ],
                                                    ),
                                                ],
                                              ),
                                            ),
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
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEnhancedStatCard(
    String title,
    double amount,
    IconData icon,
    Color color,
  ) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white, size: 20),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: GoogleFonts.poppins(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              CurrencyFormatter.formatWhole(amount),
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
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
