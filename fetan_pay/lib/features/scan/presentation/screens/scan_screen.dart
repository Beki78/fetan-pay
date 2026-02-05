import 'package:fetan_pay/features/scan/presentation/bloc/scan_event.dart';
import 'package:fetan_pay/features/scan/presentation/bloc/scan_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../widgets/app_button.dart';
import '../../../../widgets/app_card.dart';
import '../../../../widgets/app_text_field.dart';
import '../../../../widgets/bank_selection.dart';
import '../../../../widgets/verification_result_card.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../../../../core/utils/secure_logger.dart';
import '../bloc/scan_bloc.dart';
import '../bloc/scan_types.dart';
import '../../data/models/scan_models.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final _transactionController = TextEditingController();
  final _tipController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _transactionController.dispose();
    _tipController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    // Initialize BLoC if not already done
    if (context.read<ScanBloc>().state is ScanInitial) {
      context.read<ScanBloc>().add(InitializeScan());
    }
  }

  void _handleBankSelect(BankId bank) {
    context.read<ScanBloc>().add(SelectBank(bank.name.toLowerCase()));
    _transactionController.clear();
  }

  void _handleVerificationMethodSelect(VerificationMethod method) {
    context.read<ScanBloc>().add(SelectVerificationMethod(method));
    _transactionController.clear();
  }

  Future<void> _handleScanQR() async {
    final result = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (context) => const QRScannerScreen()),
    );

    if (result != null && result.isNotEmpty) {
      context.read<ScanBloc>().add(ScanQRCode(result));
      _transactionController.text = result;
    }
  }

  void _handleVerify() {
    context.read<ScanBloc>().add(VerifyPayment());
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ScanBloc, ScanState>(
      listener: (context, state) {
        if (state is ScanError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        } else if (state is ScanLoaded && state.verificationResult != null) {
          final result = state.verificationResult!;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                result.success
                    ? 'Payment verified successfully!'
                    : 'Payment verification failed',
              ),
              backgroundColor: result.success ? Colors.green : Colors.red,
              duration: const Duration(seconds: 3),
            ),
          );

          // Scroll to results
          if (result.success || result.message != null) {
            Future.delayed(const Duration(milliseconds: 100), () {
              _scrollController.animateTo(
                _scrollController.position.maxScrollExtent,
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeOut,
              );
            });
          }
        }
      },
      builder: (context, state) {
        final theme = Theme.of(context);
        final scanState = state is ScanLoaded ? state : null;

        if (state is ScanLoading || scanState == null) {
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
              child: const Center(child: CircularProgressIndicator()),
            ),
          );
        }

        if (state is ScanError) {
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
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: theme.colorScheme.error,
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Failed to Load Bank Accounts',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          state.message,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        AppButton(
                          text: 'Retry',
                          onPressed: () =>
                              context.read<ScanBloc>().add(InitializeScan()),
                          icon: Icons.refresh,
                          size: AppButtonSize.large,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Make sure you are logged in and have active bank accounts configured.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }

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
                                'Scan & verify payments',
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

                  // Main Content
                  Expanded(
                    child: SingleChildScrollView(
                      controller: _scrollController,
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(
                            maxWidth: 672,
                          ), // Similar to max-w-2xl (672px)
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                AppCard(
                                  padding: const EdgeInsets.all(20),
                                  children: [
                                    // Bank Selection
                                    if (scanState.selectedBankId == null) ...[
                                      _buildActiveAccountsSelection(
                                        scanState.activeAccounts,
                                      ),
                                    ] else ...[
                                      // Selected Bank Display
                                      _buildSelectedBankDisplay(scanState),
                                      const SizedBox(height: 24),
                                    ],

                                    // Verification Method Selection
                                    if (scanState.selectedBankId != null &&
                                        scanState.verificationMethod ==
                                            VerificationMethod.none) ...[
                                      Text(
                                        'Verification Method',
                                        style: theme.textTheme.titleMedium
                                            ?.copyWith(
                                              fontWeight: FontWeight.w600,
                                            ),
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: GestureDetector(
                                              onTap: () =>
                                                  _handleVerificationMethodSelect(
                                                    VerificationMethod
                                                        .transaction,
                                                  ),
                                              child: Container(
                                                padding: const EdgeInsets.all(
                                                  16,
                                                ),
                                                decoration: BoxDecoration(
                                                  border: Border.all(
                                                    color: theme
                                                        .colorScheme
                                                        .outline
                                                        .withOpacity(0.3),
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                ),
                                                child: Column(
                                                  children: [
                                                    Icon(
                                                      Icons.edit_document,
                                                      size: 24,
                                                      color: theme
                                                          .colorScheme
                                                          .primary,
                                                    ),
                                                    const SizedBox(height: 8),
                                                    Text(
                                                      'Transaction Reference',
                                                      style: theme
                                                          .textTheme
                                                          .bodySmall
                                                          ?.copyWith(
                                                            fontWeight:
                                                                FontWeight.w600,
                                                          ),
                                                      textAlign:
                                                          TextAlign.center,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: GestureDetector(
                                              onTap: () {
                                                _handleVerificationMethodSelect(
                                                  VerificationMethod.camera,
                                                );
                                                _handleScanQR();
                                              },
                                              child: Container(
                                                padding: const EdgeInsets.all(
                                                  16,
                                                ),
                                                decoration: BoxDecoration(
                                                  border: Border.all(
                                                    color: theme
                                                        .colorScheme
                                                        .outline
                                                        .withOpacity(0.3),
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                ),
                                                child: Column(
                                                  children: [
                                                    Icon(
                                                      Icons.qr_code_scanner,
                                                      size: 24,
                                                      color: theme
                                                          .colorScheme
                                                          .primary,
                                                    ),
                                                    const SizedBox(height: 8),
                                                    Text(
                                                      'Scan QR Code',
                                                      style: theme
                                                          .textTheme
                                                          .bodySmall
                                                          ?.copyWith(
                                                            fontWeight:
                                                                FontWeight.w600,
                                                          ),
                                                      textAlign:
                                                          TextAlign.center,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],

                                    // Transaction Input
                                    if (scanState.verificationMethod ==
                                        VerificationMethod.transaction) ...[
                                      const SizedBox(height: 24),
                                      AppTextField(
                                        controller: _transactionController,
                                        label: 'Transaction Reference / URL',
                                        hint:
                                            'Enter transaction reference or URL',
                                        prefixIcon: Icons.receipt,
                                        onChanged: (value) =>
                                            context.read<ScanBloc>().add(
                                              UpdateTransactionReference(value),
                                            ),
                                      ),
                                    ],

                                    // QR Scan Result
                                    if (scanState.verificationMethod ==
                                        VerificationMethod.camera) ...[
                                      const SizedBox(height: 24),
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: theme
                                              .colorScheme
                                              .surfaceContainerHighest,
                                          border: Border.all(
                                            color: theme.colorScheme.outline
                                                .withOpacity(0.3),
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(
                                              Icons.check_circle,
                                              color:
                                                  theme.colorScheme.secondary,
                                              size: 20,
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Text(
                                                'QR code captured. Transaction details extracted.',
                                                style:
                                                    theme.textTheme.bodySmall,
                                              ),
                                            ),
                                            TextButton(
                                              onPressed: _handleScanQR,
                                              child: Text(
                                                'Rescan',
                                                style: TextStyle(
                                                  color:
                                                      theme.colorScheme.primary,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],

                                    // Tip Input
                                    if (scanState.selectedBankId != null) ...[
                                      const SizedBox(height: 24),
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: theme
                                              .colorScheme
                                              .surfaceContainerHighest
                                              .withOpacity(0.5),
                                          border: Border.all(
                                            color: theme.colorScheme.outline
                                                .withOpacity(0.3),
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        'Include Tip',
                                                        style: theme
                                                            .textTheme
                                                            .bodyMedium
                                                            ?.copyWith(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                            ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        'Add tip amount for this transaction',
                                                        style: theme
                                                            .textTheme
                                                            .bodySmall
                                                            ?.copyWith(
                                                              color: theme
                                                                  .colorScheme
                                                                  .onSurfaceVariant,
                                                            ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Switch(
                                                  value: scanState.showTip,
                                                  onChanged: (value) => context
                                                      .read<ScanBloc>()
                                                      .add(ToggleTip()),
                                                ),
                                              ],
                                            ),
                                            if (scanState.showTip) ...[
                                              const SizedBox(height: 16),
                                              AppTextField(
                                                controller: _tipController,
                                                label: 'Tip Amount (ETB)',
                                                hint: 'Enter tip amount',
                                                keyboardType:
                                                    TextInputType.number,
                                                inputFormatters: [
                                                  FilteringTextInputFormatter.allow(
                                                    RegExp(r'^\d+\.?\d{0,2}'),
                                                  ),
                                                ],
                                                onChanged: (value) => context
                                                    .read<ScanBloc>()
                                                    .add(
                                                      UpdateTipAmount(value),
                                                    ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    ],

                                    // Verify Button
                                    if (scanState.selectedBankId != null) ...[
                                      const SizedBox(height: 24),
                                      AppButton(
                                        text: scanState.isVerifying
                                            ? 'Verifying...'
                                            : 'Verify Payment',
                                        onPressed: scanState.isVerifying
                                            ? null
                                            : _handleVerify,
                                        icon: scanState.isVerifying
                                            ? null
                                            : Icons.check_circle,
                                        size: AppButtonSize.large,
                                        isLoading: scanState.isVerifying,
                                      ),
                                    ],
                                  ],
                                ),

                                // Verification Results
                                if (scanState.verificationResult != null) ...[
                                  const SizedBox(height: 24),
                                  VerificationResultCard(
                                    result: scanState.verificationResult!,
                                    scrollController: _scrollController,
                                  ),
                                ],

                                const SizedBox(height: 20),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildActiveAccountsSelection(List<ActiveAccount> activeAccounts) {
    final theme = Theme.of(context);

    if (activeAccounts.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Bank Account',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No active bank accounts configured. Please add receiver accounts in merchant admin.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
              border: Border.all(
                color: theme.colorScheme.outline.withOpacity(0.3),
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.account_balance_wallet,
                  size: 48,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(height: 16),
                Text(
                  'No Active Accounts',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please configure receiver accounts in the merchant admin panel to start accepting payments.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                AppButton(
                  text: 'Retry',
                  onPressed: () =>
                      context.read<ScanBloc>().add(InitializeScan()),
                  variant: AppButtonVariant.outline,
                  size: AppButtonSize.medium,
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Bank Account',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Choose the bank account where you want to receive payments',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
          ),
          itemCount: activeAccounts.length,
          itemBuilder: (context, index) {
            final account = activeAccounts[index];
            return GestureDetector(
              onTap: () => _handleBankSelect(
                BankId.values.firstWhere(
                  (bank) => bank.name.toLowerCase() == account.bankId,
                  orElse: () => BankId.cbe, // fallback
                ),
              ),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.cardTheme.color,
                  border: Border.all(
                    color: _getBankColor(account.bankId),
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: _getBankColor(account.bankId).withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: _getBankColor(account.bankId).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          _getBankImagePath(account.bankId),
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              Icons.account_balance,
                              color: _getBankColor(account.bankId),
                              size: 24,
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      account.bankName,
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '****${account.accountNumber.length > 4 ? account.accountNumber.substring(account.accountNumber.length - 4) : account.accountNumber}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildSelectedBankDisplay(ScanLoaded scanState) {
    final theme = Theme.of(context);
    final selectedAccount = scanState.activeAccounts.firstWhere(
      (account) => account.bankId == scanState.selectedBankId,
      orElse: () => scanState.activeAccounts.first,
    );

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _getBankColor(selectedAccount.bankId).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: ClipOval(
              child: Image.asset(
                _getBankImagePath(selectedAccount.bankId),
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Icon(
                    Icons.account_balance,
                    color: _getBankColor(selectedAccount.bankId),
                    size: 20,
                  );
                },
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  selectedAccount.bankName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${selectedAccount.name} - ****${selectedAccount.accountNumber.substring(selectedAccount.accountNumber.length - 4)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.read<ScanBloc>().add(SelectBank(null)),
            child: Text(
              'Change',
              style: TextStyle(color: theme.colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }

  Color _getBankColor(String bankId) {
    switch (bankId.toLowerCase()) {
      case 'cbe':
        return const Color(0xFF1E40AF);
      case 'boa':
        return const Color(0xFF15803D);
      case 'awash':
        return const Color(0xFFEA580C);
      case 'telebirr':
        return const Color(0xFF7C3AED);
      default:
        return const Color(0xFF6B7280);
    }
  }

  String _getBankImagePath(String bankId) {
    switch (bankId.toLowerCase()) {
      case 'cbe':
        return 'assets/images/banks/CBE.png';
      case 'boa':
        return 'assets/images/banks/BOA.png';
      case 'awash':
        return 'assets/images/banks/Awash.png';
      case 'telebirr':
        return 'assets/images/banks/TeleBirr.png';
      default:
        return 'assets/images/banks/default.png';
    }
  }
}

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  MobileScannerController? _controller;
  bool _isScanning = true;
  String? _scannedValue;

  @override
  void initState() {
    super.initState();
    try {
      _controller = MobileScannerController();
      SecureLogger.debug('MobileScanner controller initialized');
    } catch (e) {
      SecureLogger.error(
        'Error initializing MobileScanner controller',
        error: e,
      );
    }
  }

  @override
  void dispose() {
    try {
      _controller?.dispose();
      SecureLogger.debug('MobileScanner controller disposed');
    } catch (e) {
      SecureLogger.error('Error disposing MobileScanner controller', error: e);
    }
    super.dispose();
  }

  void _handleBarcode(BarcodeCapture capture) {
    if (!_isScanning || !mounted) return;

    try {
      final List<Barcode> barcodes = capture.barcodes;
      if (barcodes.isEmpty) return;

      final barcode = barcodes.first;
      if (barcode.rawValue == null || barcode.rawValue!.isEmpty) return;

      SecureLogger.qrEvent('QR Code scanned successfully');

      setState(() {
        _isScanning = false;
        _scannedValue = barcode.rawValue;
      });

      HapticFeedback.vibrate();

      // Return the scanned value after showing it briefly
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) {
          Navigator.of(context).pop(barcode.rawValue);
        }
      });
    } catch (e) {
      SecureLogger.error('Error handling barcode', error: e);
      // Continue scanning if there's an error
      setState(() {
        _isScanning = true;
        _scannedValue = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          _controller == null
              ? const Center(child: CircularProgressIndicator())
              : MobileScanner(
                  controller: _controller!,
                  onDetect: _handleBarcode,
                ),
          // QR Code scanning overlay with rectangular frame
          Container(
            color: Colors.black.withOpacity(0.5),
            child: Stack(
              children: [
                // Top overlay
                Align(
                  alignment: Alignment.topCenter,
                  child: Container(
                    height: MediaQuery.of(context).size.height * 0.25,
                    width: double.infinity,
                    color: Colors.black.withOpacity(0.7),
                  ),
                ),
                // Bottom overlay
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Container(
                    height: MediaQuery.of(context).size.height * 0.25,
                    width: double.infinity,
                    color: Colors.black.withOpacity(0.7),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _scannedValue ?? 'Position QR code within the frame',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        if (_scannedValue != null) ...[
                          const SizedBox(height: 8),
                          const Text(
                            'Processing...',
                            style: TextStyle(color: Colors.green, fontSize: 14),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                // Left overlay
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.15,
                    height: MediaQuery.of(context).size.height * 0.5,
                    color: Colors.black.withOpacity(0.7),
                  ),
                ),
                // Right overlay
                Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.15,
                    height: MediaQuery.of(context).size.height * 0.5,
                    color: Colors.black.withOpacity(0.7),
                  ),
                ),
                // Rectangular scanning frame
                Center(
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.7,
                    height: MediaQuery.of(context).size.width * 0.7,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.white.withOpacity(0.8),
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Stack(
                      children: [
                        // Corner markers
                        // Top-left corner
                        Positioned(
                          top: 0,
                          left: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(color: Colors.white, width: 4),
                                left: BorderSide(color: Colors.white, width: 4),
                              ),
                            ),
                          ),
                        ),
                        // Top-right corner
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(color: Colors.white, width: 4),
                                right: BorderSide(
                                  color: Colors.white,
                                  width: 4,
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Bottom-left corner
                        Positioned(
                          bottom: 0,
                          left: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                  color: Colors.white,
                                  width: 4,
                                ),
                                left: BorderSide(color: Colors.white, width: 4),
                              ),
                            ),
                          ),
                        ),
                        // Bottom-right corner
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                  color: Colors.white,
                                  width: 4,
                                ),
                                right: BorderSide(
                                  color: Colors.white,
                                  width: 4,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
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
}
