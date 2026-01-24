import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class VerificationResult {
  final bool success;
  final String status;
  final String reference;
  final String provider;
  final String? senderName;
  final String? receiverAccount;
  final String? receiverName;
  final double? amount;
  final Map<String, dynamic>? details;
  final String? message;

  const VerificationResult({
    required this.success,
    required this.status,
    required this.reference,
    required this.provider,
    this.senderName,
    this.receiverAccount,
    this.receiverName,
    this.amount,
    this.details,
    this.message,
  });
}

class VerificationResultCard extends StatelessWidget {
  final VerificationResult result;
  final ScrollController? scrollController;

  const VerificationResultCard({
    super.key,
    required this.result,
    this.scrollController,
  });

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_ET',
      symbol: 'ETB ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  Color _getBankColor(String provider) {
    switch (provider.toLowerCase()) {
      case 'cbe':
        return const Color(0xFF1E40AF); // Blue
      case 'boa':
        return const Color(0xFF15803D); // Green
      case 'awash':
        return const Color(0xFFEA580C); // Orange
      case 'telebirr':
        return const Color(0xFFDC2626); // Red
      default:
        return const Color(0xFF6B7280); // Gray
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

    // Auto-scroll to results after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (scrollController != null && scrollController!.hasClients) {
        scrollController!.animateTo(
          scrollController!.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });

    return AnimatedOpacity(
      opacity: 1.0,
      duration: const Duration(milliseconds: 300),
      child: Column(
        children: [
          // Status Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: result.success
                  ? const Color(0xFF15803D) // Green
                  : const Color(0xFFDC2626), // Red
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  result.success ? Icons.check_circle : Icons.error,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    result.success ? 'Verified' : 'Failed',
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (result.amount != null)
                  Text(
                    _formatCurrency(result.amount!),
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
              ],
            ),
          ),

          // Main Content
          Container(
            decoration: BoxDecoration(
              color: theme.cardTheme.color,
              border: Border.all(color: theme.colorScheme.outline.withOpacity(0.2)),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Bank Logo Section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    border: Border(
                      right: BorderSide(
                        color: theme.colorScheme.outline.withOpacity(0.2),
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: _getBankColor(result.provider).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Image.asset(
                          _getBankImagePath(result.provider),
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) {
                            // Fallback to icon if image fails to load
                            return Icon(
                              Icons.account_balance,
                              color: _getBankColor(result.provider),
                              size: 24,
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),

                // Transaction Details Section
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Reference
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 40,
                              child: Text(
                                'Ref',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Text(
                                result.reference,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  fontFamily: 'RobotoMono',
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),
                        Divider(color: theme.colorScheme.outline.withOpacity(0.2)),

                        // Sender
                        if (result.senderName != null) ...[
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(
                                width: 40,
                                child: Text(
                                  'From',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  result.senderName!,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    fontWeight: FontWeight.w500,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                        ],

                        // Receiver
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 40,
                              child: Text(
                                'To',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    result.receiverName ?? 'Merchant',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      fontWeight: FontWeight.w500,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (result.receiverAccount != null)
                                    Text(
                                      result.receiverAccount!,
                                      style: theme.textTheme.labelSmall?.copyWith(
                                        color: theme.colorScheme.onSurfaceVariant,
                                        fontFamily: 'RobotoMono',
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
                ),
              ],
            ),
          ),

          // Error Message (only for failed transactions)
          if (!result.success && result.message != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.error.withOpacity(0.1),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
              ),
              child: Text(
                result.message!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.error,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }
}
