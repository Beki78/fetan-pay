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

enum VerificationMethod {
  none,
  transaction,
  camera,
}

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  BankId? _selectedBank;
  VerificationMethod _verificationMethod = VerificationMethod.none;
  final _transactionController = TextEditingController();
  final _tipController = TextEditingController();
  bool _showTip = false;
  bool _isVerifying = false;
  VerificationResult? _verificationResult;
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _transactionController.dispose();
    _tipController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _handleBankSelect(BankId bank) {
    setState(() {
      _selectedBank = bank;
      _verificationMethod = VerificationMethod.none;
      _transactionController.clear();
      _verificationResult = null;
    });
  }

  void _handleVerificationMethodSelect(VerificationMethod method) {
    setState(() {
      _verificationMethod = method;
      _transactionController.clear();
      _verificationResult = null;
    });
  }

  Future<void> _handleScanQR() async {
    final result = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (context) => const QRScannerScreen(),
      ),
    );

    if (result != null && result.isNotEmpty) {
      setState(() {
        _verificationMethod = VerificationMethod.camera;
        _transactionController.text = result;
        _verificationResult = null;
      });

      // Auto-verify if we have a selected bank
      if (_selectedBank != null) {
        _handleVerify();
      }
    }
  }

  Future<void> _handleVerify() async {
    if (_selectedBank == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a bank first')),
      );
      return;
    }

    if (_verificationMethod == VerificationMethod.none) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a verification method')),
      );
      return;
    }

    if (_verificationMethod == VerificationMethod.transaction &&
        _transactionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter transaction reference')),
      );
      return;
    }

    setState(() {
      _isVerifying = true;
      _verificationResult = null;
    });

    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));

    // Mock result - alternate between success and failure for demo
    final isSuccess = DateTime.now().second % 2 == 0;

    setState(() {
      _isVerifying = false;
      _verificationResult = VerificationResult(
        success: isSuccess,
        status: isSuccess ? 'VERIFIED' : 'FAILED',
        reference: _transactionController.text.isNotEmpty
            ? _transactionController.text
            : 'QR-123456789',
        provider: _selectedBank!.name.toUpperCase(),
        senderName: isSuccess ? 'John Doe' : null,
        receiverAccount: isSuccess ? '1000123456789' : null,
        receiverName: 'Merchant Account',
        amount: isSuccess ? 150.0 : null,
        message: isSuccess
            ? null
            : 'Transaction not found or receiver account mismatch',
      );
    });

    // Show toast message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isSuccess ? 'Payment verified successfully!' : 'Payment verification failed'),
        backgroundColor: isSuccess ? Colors.green : Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
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

              // Main Content
              Expanded(
                child: SingleChildScrollView(
                  controller: _scrollController,
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 672), // Similar to max-w-2xl (672px)
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppCard(
                        padding: const EdgeInsets.all(20),
                        children: [
                          // Bank Selection
                          if (_selectedBank == null) ...[
                            BankSelection(
                              selectedBank: _selectedBank,
                              onBankSelected: _handleBankSelect,
                            ),
                          ] else ...[
                            // Selected Bank Display
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.surfaceContainerHighest,
                                border: Border.all(
                                  color: theme.colorScheme.outline.withOpacity(0.3),
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: banks
                                          .firstWhere((bank) => bank.id == _selectedBank)
                                          .color
                                          .withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: ClipOval(
                                      child: Image.asset(
                                        banks
                                            .firstWhere((bank) => bank.id == _selectedBank)
                                            .imagePath,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          // Fallback to icon if image fails to load
                                          return Icon(
                                            Icons.account_balance,
                                            color: banks
                                                .firstWhere((bank) => bank.id == _selectedBank)
                                                .color,
                                            size: 20,
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      banks
                                          .firstWhere((bank) => bank.id == _selectedBank)
                                          .fullName,
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () => setState(() => _selectedBank = null),
                                    child: Text(
                                      'Change',
                                      style: TextStyle(
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Verification Method Selection
                          if (_selectedBank != null && _verificationMethod == VerificationMethod.none) ...[
                            Text(
                              'Verification Method',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => _handleVerificationMethodSelect(VerificationMethod.transaction),
                                    child: Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                          color: theme.colorScheme.outline.withOpacity(0.3),
                                        ),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Column(
                                        children: [
                                          Icon(
                                            Icons.edit_document,
                                            size: 24,
                                            color: theme.colorScheme.primary,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Transaction Reference',
                                            style: theme.textTheme.bodySmall?.copyWith(
                                              fontWeight: FontWeight.w600,
                                            ),
                                            textAlign: TextAlign.center,
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
                                      _handleVerificationMethodSelect(VerificationMethod.camera);
                                      _handleScanQR();
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                          color: theme.colorScheme.outline.withOpacity(0.3),
                                        ),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Column(
                                        children: [
                                          Icon(
                                            Icons.qr_code_scanner,
                                            size: 24,
                                            color: theme.colorScheme.primary,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Scan QR Code',
                                            style: theme.textTheme.bodySmall?.copyWith(
                                              fontWeight: FontWeight.w600,
                                            ),
                                            textAlign: TextAlign.center,
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
                          if (_verificationMethod == VerificationMethod.transaction) ...[
                            const SizedBox(height: 24),
                            AppTextField(
                              controller: _transactionController,
                              label: 'Transaction Reference / URL',
                              hint: 'Enter transaction reference or URL',
                              prefixIcon: Icons.receipt,
                            ),
                          ],

                          // QR Scan Result
                          if (_verificationMethod == VerificationMethod.camera) ...[
                            const SizedBox(height: 24),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.surfaceContainerHighest,
                                border: Border.all(
                                  color: theme.colorScheme.outline.withOpacity(0.3),
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.check_circle,
                                    color: theme.colorScheme.secondary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'QR code captured. Transaction details extracted.',
                                      style: theme.textTheme.bodySmall,
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: _handleScanQR,
                                    child: Text(
                                      'Rescan',
                                      style: TextStyle(
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          // Tip Input
                          if (_selectedBank != null) ...[
                            const SizedBox(height: 24),
                            Container(
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
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Include Tip',
                                              style: theme.textTheme.bodyMedium?.copyWith(
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Add tip amount for this transaction',
                                              style: theme.textTheme.bodySmall?.copyWith(
                                                color: theme.colorScheme.onSurfaceVariant,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Switch(
                                        value: _showTip,
                                        onChanged: (value) => setState(() => _showTip = value),
                                      ),
                                    ],
                                  ),
                                  if (_showTip) ...[
                                    const SizedBox(height: 16),
                                    AppTextField(
                                      controller: _tipController,
                                      label: 'Tip Amount (ETB)',
                                      hint: 'Enter tip amount',
                                      keyboardType: TextInputType.number,
                                      inputFormatters: [
                                        FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],

                          // Verify Button
                          if (_selectedBank != null) ...[
                            const SizedBox(height: 24),
                            AppButton(
                              text: _isVerifying ? 'Verifying...' : 'Verify Payment',
                              onPressed: _isVerifying ? null : _handleVerify,
                              icon: _isVerifying ? null : Icons.check_circle,
                              size: AppButtonSize.large,
                              isLoading: _isVerifying,
                            ),
                          ],
                        ],
                      ),

                      // Verification Results
                      if (_verificationResult != null) ...[
                        const SizedBox(height: 24),
                        VerificationResultCard(
                          result: _verificationResult!,
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
            )],
          ),
        ),
      ),
    );
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
      debugPrint('MobileScanner controller initialized');
    } catch (e) {
      debugPrint('Error initializing MobileScanner controller: $e');
    }
  }

  @override
  void dispose() {
    try {
      _controller?.dispose();
      debugPrint('MobileScanner controller disposed');
    } catch (e) {
      debugPrint('Error disposing MobileScanner controller: $e');
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

      debugPrint('QR Code scanned: ${barcode.rawValue}');

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
      debugPrint('Error handling barcode: $e');
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
                      style: TextStyle(
                        color: Colors.green,
                        fontSize: 14,
                      ),
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
                                right: BorderSide(color: Colors.white, width: 4),
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
                                bottom: BorderSide(color: Colors.white, width: 4),
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
                                bottom: BorderSide(color: Colors.white, width: 4),
                                right: BorderSide(color: Colors.white, width: 4),
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