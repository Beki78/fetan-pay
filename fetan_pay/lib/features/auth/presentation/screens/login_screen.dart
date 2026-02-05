import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:animate_do/animate_do.dart';
import '../bloc/auth_bloc.dart';
import '../../data/models/user_model.dart';
import '../../../shared/presentation/screens/main_navigation_screen.dart';
import '../../../shared/presentation/screens/admin_main_screen.dart';
import '../../../../widgets/app_button.dart';
import '../../../../widgets/app_text_field.dart';
import '../../../../widgets/breathing_logo_loader.dart';
import '../../../../core/utils/secure_logger.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Determines the target screen based on user role
  Widget _getTargetScreenForRole(UserRole role) {
    switch (role) {
      case UserRole.merchantOwner:
        // MERCHANT_OWNER goes to admin interface
        return const AdminMainScreen();
      case UserRole.sales:
      case UserRole.waiter:
      case UserRole.employee:
        // SALES, WAITER, EMPLOYEE go to merchant interface
        return const MainNavigationScreen();
      case UserRole.admin:
        // ADMIN goes to admin interface
        return const AdminMainScreen();
    }
  }

  void _handleQRLogin(String qrData) {
    // Validate QR data format before sending to backend
    if (!_isValidQRFormat(qrData)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Invalid QR code format. Please scan a login QR code from the merchant system.',
          ),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Send QR data directly to the BLoC for processing
    context.read<AuthBloc>().add(QRLoginRequested(qrData));

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('QR code scanned successfully! Logging in...'),
        backgroundColor: Colors.green,
      ),
    );
  }

  bool _isValidQRFormat(String qrData) {
    // Enhanced validation for merchant QR codes
    if (qrData.length < 10) return false; // Too short
    if (qrData.length > 2000) return false; // Too long

    // Check if it looks like encrypted data (base64-like with specific patterns)
    final validChars = RegExp(r'^[A-Za-z0-9+/=\-_]+$');
    if (!validChars.hasMatch(qrData)) return false;

    // Allow various QR formats:
    // 1. OpenSSL encrypted (starts with U2FsdGVkX1+)
    // 2. JWT tokens (contain dots)
    // 3. Other base64 encoded data
    // 4. Development test codes

    return true;
  }

  // Development helper - remove in production
  void _showQRTestInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('QR Login Setup'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('To test QR login:'),
            SizedBox(height: 8),
            Text('1. Start merchant-admin app (localhost:3001)'),
            Text('2. Login as admin/merchant'),
            Text('3. Go to Users section'),
            Text('4. Select a user → Generate QR Code'),
            Text('5. Scan the displayed QR code with this app'),
            SizedBox(height: 8),
            Text('QR codes are encrypted and expire after 30 days.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    final isDark = theme.brightness == Brightness.dark;

    // Theme-aware background colors (similar to other screens)
    final bgAccentColor = isDark
        ? theme.colorScheme.primary.withOpacity(0.1)
        : theme.colorScheme.primary.withOpacity(0.08);

    final bgSecondaryColor = isDark
        ? theme.colorScheme.secondary.withOpacity(0.08)
        : theme.colorScheme.secondary.withOpacity(0.06);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            // Role-based routing based on API response
            final targetScreen = _getTargetScreenForRole(state.user.role);

            // Use a slight delay to ensure the UI is ready
            Future.delayed(const Duration(milliseconds: 100), () {
              if (mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (context) => targetScreen),
                );
              }
            });
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: theme.colorScheme.error,
                duration: const Duration(seconds: 4),
              ),
            );
          }
        },
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state is AuthLoading) {
              return Stack(
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

                  // Loading Content
                  FadeIn(
                    child: const Center(
                      child: BreathingLogoLoader(
                        size: 120,
                        logoPath: 'assets/images/logo/fetan-logo.png',
                      ),
                    ),
                  ),
                ],
              );
            }

            return Stack(
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
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(height: size.height * 0.05),

                          // Enhanced Logo and Title Section
                          FadeInDown(
                            duration: const Duration(milliseconds: 600),
                            child: Center(
                              child: Column(
                                children: [
                                  Container(
                                    width: 100,
                                    height: 100,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          theme.colorScheme.primary.withOpacity(
                                            0.2,
                                          ),
                                          theme.colorScheme.primary.withOpacity(
                                            0.1,
                                          ),
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: [
                                        BoxShadow(
                                          color: theme.colorScheme.primary
                                              .withOpacity(0.2),
                                          blurRadius: 20,
                                          offset: const Offset(0, 10),
                                        ),
                                      ],
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(16),
                                      child: Image.asset(
                                        'assets/images/logo/fetan-logo.png',
                                        fit: BoxFit.contain,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return Icon(
                                                Icons.account_balance_rounded,
                                                size: 50,
                                                color:
                                                    theme.colorScheme.primary,
                                              );
                                            },
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  Text(
                                    'Fetan Pay',
                                    style: GoogleFonts.poppins(
                                      fontSize: 36,
                                      fontWeight: FontWeight.w800,
                                      color: theme.colorScheme.primary,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          SizedBox(height: size.height * 0.03),

                          // Enhanced Login Form
                          FadeInUp(
                            delay: const Duration(milliseconds: 200),
                            child: Container(
                              padding: const EdgeInsets.all(32),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    theme.colorScheme.surfaceContainerLow,
                                    theme.colorScheme.surfaceContainerLowest,
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(
                                  color: theme.colorScheme.outlineVariant
                                      .withOpacity(0.3),
                                  width: 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: theme.shadowColor.withOpacity(0.08),
                                    blurRadius: 20,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  // Welcome Header
                                  FadeInUp(
                                    delay: const Duration(milliseconds: 300),
                                    child: Column(
                                      children: [
                                        Text(
                                          'Welcome back',
                                          style: GoogleFonts.poppins(
                                            fontSize: 24,
                                            fontWeight: FontWeight.w700,
                                            color: theme.colorScheme.onSurface,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Sign in to access your account',
                                          style: GoogleFonts.poppins(
                                            fontSize: 14,
                                            color: theme
                                                .colorScheme
                                                .onSurfaceVariant,
                                            fontWeight: FontWeight.w500,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                    ),
                                  ),

                                  const SizedBox(height: 32),

                                  // Email Field
                                  FadeInUp(
                                    delay: const Duration(milliseconds: 400),
                                    child: AppTextField(
                                      controller: _emailController,
                                      label: 'Email',
                                      hint: 'Enter your email',
                                      prefixIcon: Icons.mail_rounded,
                                      keyboardType: TextInputType.emailAddress,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Please enter your email';
                                        }
                                        if (!RegExp(
                                          r'^[^@]+@[^@]+\.[^@]+',
                                        ).hasMatch(value)) {
                                          return 'Please enter a valid email';
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: 20),

                                  // Password Field
                                  FadeInUp(
                                    delay: const Duration(milliseconds: 500),
                                    child: AppTextField(
                                      controller: _passwordController,
                                      label: 'Password',
                                      hint: 'Enter your password',
                                      prefixIcon: Icons.lock_rounded,
                                      obscureText: true,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Please enter your password';
                                        }
                                        if (value.length < 6) {
                                          return 'Password must be at least 6 characters';
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: 32),

                                  // Enhanced Login Button
                                  FadeInUp(
                                    delay: const Duration(milliseconds: 600),
                                    child: AppButton(
                                      text: 'Sign In',
                                      onPressed: () {
                                        if (_formKey.currentState?.validate() ??
                                            false) {
                                          context.read<AuthBloc>().add(
                                            LoginRequested(
                                              _emailController.text.trim(),
                                              _passwordController.text.trim(),
                                            ),
                                          );
                                        }
                                      },
                                      size: AppButtonSize.large,
                                      icon: Icons.login_rounded,
                                    ),
                                  ),
                                  const SizedBox(height: 24),

                                  // Enhanced Divider
                                  FadeInUp(
                                    delay: const Duration(milliseconds: 700),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Container(
                                            height: 1,
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                colors: [
                                                  Colors.transparent,
                                                  theme.colorScheme.outline
                                                      .withOpacity(0.3),
                                                ],
                                                begin: Alignment.centerLeft,
                                                end: Alignment.centerRight,
                                              ),
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 16,
                                            vertical: 8,
                                          ),
                                          margin: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                          ),
                                          decoration: BoxDecoration(
                                            color: theme
                                                .colorScheme
                                                .surfaceContainerHighest
                                                .withOpacity(0.5),
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          child: Text(
                                            'Or',
                                            style: GoogleFonts.poppins(
                                              color: theme
                                                  .colorScheme
                                                  .onSurfaceVariant,
                                              fontWeight: FontWeight.w500,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          child: Container(
                                            height: 1,
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                colors: [
                                                  theme.colorScheme.outline
                                                      .withOpacity(0.3),
                                                  Colors.transparent,
                                                ],
                                                begin: Alignment.centerLeft,
                                                end: Alignment.centerRight,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 24),

                                  // Enhanced QR Code Login Button
                                  FadeInUp(
                                    delay: const Duration(milliseconds: 800),
                                    child: Column(
                                      children: [
                                        Container(
                                          decoration: BoxDecoration(
                                            gradient: LinearGradient(
                                              colors: [
                                                theme.colorScheme.secondary
                                                    .withOpacity(0.1),
                                                theme.colorScheme.secondary
                                                    .withOpacity(0.05),
                                              ],
                                              begin: Alignment.topLeft,
                                              end: Alignment.bottomRight,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                            border: Border.all(
                                              color: theme.colorScheme.secondary
                                                  .withOpacity(0.3),
                                              width: 1,
                                            ),
                                          ),
                                          child: AppButton(
                                            text: 'Scan QR Code to Login',
                                            onPressed: () async {
                                              final result =
                                                  await Navigator.of(
                                                    context,
                                                  ).push<String>(
                                                    MaterialPageRoute(
                                                      builder: (context) =>
                                                          const LoginQRScannerScreen(),
                                                    ),
                                                  );

                                              if (result != null &&
                                                  result.isNotEmpty &&
                                                  mounted) {
                                                _handleQRLogin(result);
                                              }
                                            },
                                            variant: AppButtonVariant.outline,
                                            icon: Icons.qr_code_scanner_rounded,
                                            size: AppButtonSize.large,
                                          ),
                                        ),
                                        const SizedBox(height: 12),
                                        Text(
                                          'Note: QR codes must be generated from the merchant admin panel (localhost:3001)\nGo to Users → Select user → Generate QR Code',
                                          style: GoogleFonts.poppins(
                                            color: theme
                                                .colorScheme
                                                .onSurfaceVariant,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400,
                                            height: 1.4,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                        // Development test button - remove in production
                                        if (const bool.fromEnvironment(
                                              'dart.vm.product',
                                            ) ==
                                            false) ...[
                                          const SizedBox(height: 8),
                                          TextButton(
                                            onPressed: () =>
                                                _showQRTestInfo(context),
                                            child: Text(
                                              'QR Testing Info',
                                              style: GoogleFonts.poppins(
                                                color:
                                                    theme.colorScheme.primary,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          SizedBox(height: size.height * 0.05),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class LoginQRScannerScreen extends StatefulWidget {
  const LoginQRScannerScreen({super.key});

  @override
  State<LoginQRScannerScreen> createState() => _LoginQRScannerScreenState();
}

class _LoginQRScannerScreenState extends State<LoginQRScannerScreen> {
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
        title: const Text('Scan Login QR Code'),
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
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _scannedValue ??
                                'Scan login QR from merchant admin',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Generate QR in Users section',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 11,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          if (_scannedValue != null) ...[
                            const SizedBox(height: 6),
                            const Text(
                              'Processing...',
                              style: TextStyle(
                                color: Colors.green,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ],
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
    );
  }
}
