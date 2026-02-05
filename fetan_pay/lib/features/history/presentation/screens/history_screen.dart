import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../bloc/history_bloc.dart';
import '../bloc/history_event.dart';
import '../bloc/history_state.dart';
import '../../data/models/history_models.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) =>
          getIt<HistoryBloc>()..add(const RefreshVerificationHistory()),
      child: const HistoryScreenContent(),
    );
  }
}

class HistoryScreenContent extends StatefulWidget {
  const HistoryScreenContent({super.key});

  @override
  State<HistoryScreenContent> createState() => _HistoryScreenContentState();
}

class _HistoryScreenContentState extends State<HistoryScreenContent> {
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
      context.read<HistoryBloc>().add(const LoadMoreVerificationHistory());
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
      case 'unverified':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'verified':
        return Icons.check_circle;
      case 'pending':
        return Icons.access_time;
      case 'unverified':
        return Icons.cancel;
      default:
        return Icons.help;
    }
  }

  String _getBankReceiptUrl(String provider, String reference) {
    switch (provider.toUpperCase()) {
      case 'CBE':
        return 'https://apps.cbe.com.et/?id=${Uri.encodeComponent(reference)}';
      case 'TELEBIRR':
        return 'https://transactioninfo.ethiotelecom.et/receipt/${Uri.encodeComponent(reference)}';
      case 'BOA':
        return 'https://cs.bankofabyssinia.com/slip/?trx=${Uri.encodeComponent(reference)}';
      case 'AWASH':
        return 'https://awashpay.awashbank.com:8225/${Uri.encodeComponent(reference)}';
      case 'DASHEN':
        return 'https://receipt.dashensuperapp.com/receipt/${Uri.encodeComponent(reference)}';
      default:
        return '';
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
                child: BlocBuilder<HistoryBloc, HistoryState>(
                  builder: (context, state) {
                    if (state is HistoryLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (state is HistoryError) {
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
                              'Error loading history',
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
                                context.read<HistoryBloc>().add(
                                  const RefreshVerificationHistory(),
                                );
                              },
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      );
                    }

                    if (state is HistoryLoaded) {
                      return RefreshIndicator(
                        onRefresh: () async {
                          context.read<HistoryBloc>().add(
                            const RefreshVerificationHistory(),
                          );
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
                                    // History List
                                    AppCard(
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
                                              style: theme.textTheme.titleLarge
                                                  ?.copyWith(
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 16),

                                        if (state.items.isEmpty)
                                          Center(
                                            child: Column(
                                              children: [
                                                Icon(
                                                  Icons.history,
                                                  size: 48,
                                                  color: theme
                                                      .colorScheme
                                                      .onSurfaceVariant
                                                      .withValues(alpha: 0.5),
                                                ),
                                                const SizedBox(height: 16),
                                                Text(
                                                  'No verification history yet',
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
                                                  'Payment verifications will appear here',
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
                                                itemCount: state.items.length,
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
                                                  final item =
                                                      state.items[index];
                                                  return _buildHistoryItem(
                                                    item,
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

  Widget _buildHistoryItem(VerificationHistoryItem item, ThemeData theme) {
    final date = DateTime.parse(item.createdAt);
    final statusColor = _getStatusColor(item.status);
    final statusIcon = _getStatusIcon(item.status);

    return InkWell(
      onTap: () {
        // Show detailed view or navigate to receipt
        final receiptUrl = _getBankReceiptUrl(item.provider, item.reference);
        if (receiptUrl.isNotEmpty) {
          // TODO: Open URL in browser or show receipt
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Receipt URL: $receiptUrl'),
              action: SnackBarAction(
                label: 'Copy',
                onPressed: () {
                  // TODO: Copy to clipboard
                },
              ),
            ),
          );
        }
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(statusIcon, color: statusColor, size: 24),
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
                          CurrencyFormatter.formatWhole(item.claimedAmount),
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: statusColor,
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
                          color: statusColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          item.status,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: statusColor,
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
                          item.provider,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (item.tipAmount != null && item.tipAmount! > 0)
                        Expanded(
                          flex: 2,
                          child: Text(
                            'Tip: ${CurrencyFormatter.formatWhole(item.tipAmount!)}',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.secondary,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.reference,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      fontFamily: 'RobotoMono',
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
                            if (item.verifiedBy != null)
                              Text(
                                'By: ${item.verifiedBy!.name ?? item.verifiedBy!.email ?? 'Unknown'}',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            if (item.mismatchReason != null)
                              Text(
                                'Reason: ${item.mismatchReason}',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.error,
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
        ),
      ),
    );
  }
}
