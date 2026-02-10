import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/screens/login_screen.dart';
import '../../../scan/presentation/bloc/scan_bloc.dart';
import '../../../scan/presentation/bloc/scan_event.dart';
import '../../../scan/presentation/bloc/scan_state.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => getIt<ScanBloc>()..add(InitializeScan()),
        ),
      ],
      child: const ProfileScreenContent(),
    );
  }
}

class ProfileScreenContent extends StatelessWidget {
  const ProfileScreenContent({super.key});

  String _getBankIcon(String bankId) {
    switch (bankId.toLowerCase()) {
      case 'cbe':
        return 'assets/images/banks/CBE.png';
      case 'boa':
        return 'assets/images/banks/BOA.png';
      case 'awash':
        return 'assets/images/banks/Awash.png';
      case 'telebirr':
        return 'assets/images/banks/Telebirr.png';
      case 'dashen':
        return 'assets/images/banks/Dashen.png';
      default:
        return 'assets/images/banks/default.png';
    }
  }

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text(
          'Are you sure you want to logout? You will need to login again to access your account.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog first

              // Dispatch logout event to AuthBloc
              context.read<AuthBloc>().add(LogoutRequested());

              // Navigate to login screen and remove all previous routes
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => const LoginScreen()),
                (route) => false,
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Logout'),
          ),
        ],
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
                            'Your profile & settings',
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
                child: SingleChildScrollView(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 672),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            // Profile Header
                            BlocBuilder<AuthBloc, AuthState>(
                              builder: (context, authState) {
                                return AppCard(
                                  padding: const EdgeInsets.all(24),
                                  children: [
                                    Center(
                                      child: Column(
                                        children: [
                                          Container(
                                            width: 80,
                                            height: 80,
                                            decoration: BoxDecoration(
                                              color: theme.colorScheme.primary
                                                  .withValues(alpha: 0.1),
                                              shape: BoxShape.circle,
                                            ),
                                            child: Icon(
                                              Icons.person,
                                              size: 40,
                                              color: theme.colorScheme.primary,
                                            ),
                                          ),
                                          const SizedBox(height: 16),
                                          if (authState is AuthAuthenticated)
                                            Column(
                                              children: [
                                                Text(
                                                  '${authState.user.firstName ?? ''} ${authState.user.lastName ?? ''}'
                                                          .trim()
                                                          .isNotEmpty
                                                      ? '${authState.user.firstName ?? ''} ${authState.user.lastName ?? ''}'
                                                            .trim()
                                                      : 'User',
                                                  style: theme
                                                      .textTheme
                                                      .headlineSmall
                                                      ?.copyWith(
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  authState.user.role.name
                                                      .toUpperCase(),
                                                  style: theme
                                                      .textTheme
                                                      .bodySmall
                                                      ?.copyWith(
                                                        color: theme
                                                            .colorScheme
                                                            .onSurfaceVariant,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                ),
                                              ],
                                            )
                                          else
                                            Column(
                                              children: [
                                                Text(
                                                  'Merchant Account',
                                                  style: theme
                                                      .textTheme
                                                      .headlineSmall
                                                      ?.copyWith(
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  'Loading...',
                                                  style: theme
                                                      .textTheme
                                                      .bodyMedium
                                                      ?.copyWith(
                                                        color: theme
                                                            .colorScheme
                                                            .onSurfaceVariant,
                                                      ),
                                                ),
                                              ],
                                            ),
                                        ],
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),

                            const SizedBox(height: 20),

                            // Account Information
                            BlocBuilder<AuthBloc, AuthState>(
                              builder: (context, authState) {
                                return AppCard(
                                  padding: const EdgeInsets.all(20),
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.account_circle,
                                          color: theme.colorScheme.primary,
                                          size: 24,
                                        ),
                                        const SizedBox(width: 12),
                                        Text(
                                          'Account Information',
                                          style: theme.textTheme.titleLarge
                                              ?.copyWith(
                                                fontWeight: FontWeight.w600,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    if (authState is AuthAuthenticated)
                                      Column(
                                        children: [
                                          _buildInfoRow(
                                            context,
                                            icon: Icons.email,
                                            label: 'Email',
                                            value: authState.user.email,
                                          ),
                                          if (authState.user.merchantId !=
                                              null) ...[
                                            const SizedBox(height: 12),
                                            _buildInfoRow(
                                              context,
                                              icon: Icons.business,
                                              label: 'Merchant ID',
                                              value: authState.user.merchantId!,
                                            ),
                                          ],
                                        ],
                                      )
                                    else
                                      const Center(
                                        child: CircularProgressIndicator(),
                                      ),
                                  ],
                                );
                              },
                            ),

                            const SizedBox(height: 20),

                            // Payment Accounts
                            BlocBuilder<ScanBloc, ScanState>(
                              builder: (context, scanState) {
                                return AppCard(
                                  padding: const EdgeInsets.all(20),
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.account_balance,
                                          color: theme.colorScheme.primary,
                                          size: 24,
                                        ),
                                        const SizedBox(width: 12),
                                        Text(
                                          'Payment Accounts',
                                          style: theme.textTheme.titleLarge
                                              ?.copyWith(
                                                fontWeight: FontWeight.w600,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    if (scanState is ScanLoading)
                                      const Center(
                                        child: CircularProgressIndicator(),
                                      )
                                    else if (scanState is ScanError)
                                      Center(
                                        child: Column(
                                          children: [
                                            Icon(
                                              Icons.error_outline,
                                              size: 48,
                                              color: theme.colorScheme.error,
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              'Failed to load accounts',
                                              style: theme.textTheme.bodyMedium
                                                  ?.copyWith(
                                                    color:
                                                        theme.colorScheme.error,
                                                  ),
                                            ),
                                            const SizedBox(height: 8),
                                            TextButton(
                                              onPressed: () {
                                                context.read<ScanBloc>().add(
                                                  InitializeScan(),
                                                );
                                              },
                                              child: const Text('Retry'),
                                            ),
                                          ],
                                        ),
                                      )
                                    else if (scanState is ScanLoaded)
                                      scanState.activeAccounts.isEmpty
                                          ? Center(
                                              child: Column(
                                                children: [
                                                  Icon(
                                                    Icons.account_balance,
                                                    size: 48,
                                                    color: theme
                                                        .colorScheme
                                                        .onSurfaceVariant
                                                        .withValues(alpha: 0.5),
                                                  ),
                                                  const SizedBox(height: 16),
                                                  Text(
                                                    'No payment accounts configured',
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
                                                    'Contact your merchant admin to set up payment accounts',
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
                                          : Column(
                                              children: scanState.activeAccounts.map((
                                                account,
                                              ) {
                                                return Container(
                                                  margin: const EdgeInsets.only(
                                                    bottom: 12,
                                                  ),
                                                  padding: const EdgeInsets.all(
                                                    16,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    border: Border.all(
                                                      color: theme
                                                          .colorScheme
                                                          .outline
                                                          .withValues(
                                                            alpha: 0.3,
                                                          ),
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          12,
                                                        ),
                                                  ),
                                                  child: Row(
                                                    children: [
                                                      Container(
                                                        width: 40,
                                                        height: 40,
                                                        decoration: BoxDecoration(
                                                          color: theme
                                                              .colorScheme
                                                              .surface,
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                8,
                                                              ),
                                                          border: Border.all(
                                                            color: theme
                                                                .colorScheme
                                                                .outline
                                                                .withValues(
                                                                  alpha: 0.3,
                                                                ),
                                                          ),
                                                        ),
                                                        child: ClipRRect(
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                8,
                                                              ),
                                                          child: Image.asset(
                                                            _getBankIcon(
                                                              account.bankId,
                                                            ),
                                                            fit: BoxFit.contain,
                                                            errorBuilder:
                                                                (
                                                                  context,
                                                                  error,
                                                                  stackTrace,
                                                                ) {
                                                                  return Icon(
                                                                    Icons
                                                                        .account_balance,
                                                                    color: theme
                                                                        .colorScheme
                                                                        .primary,
                                                                    size: 20,
                                                                  );
                                                                },
                                                          ),
                                                        ),
                                                      ),
                                                      const SizedBox(width: 12),
                                                      Expanded(
                                                        child: Column(
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Text(
                                                              account.bankName,
                                                              style: theme
                                                                  .textTheme
                                                                  .bodyMedium
                                                                  ?.copyWith(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                  ),
                                                            ),
                                                            if (account
                                                                .name
                                                                .isNotEmpty) ...[
                                                              const SizedBox(
                                                                height: 2,
                                                              ),
                                                              Text(
                                                                account.name,
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
                                                            const SizedBox(
                                                              height: 2,
                                                            ),
                                                            Text(
                                                              account
                                                                  .accountNumber,
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
                                                    ],
                                                  ),
                                                );
                                              }).toList(),
                                            )
                                    else
                                      const Center(
                                        child: CircularProgressIndicator(),
                                      ),
                                  ],
                                );
                              },
                            ),

                            const SizedBox(height: 20),

                            // Settings Menu
                            AppCard(
                              padding: const EdgeInsets.all(0),
                              children: [
                                _buildMenuItem(
                                  context,
                                  icon: Icons.settings,
                                  title: 'Settings',
                                  subtitle: 'App preferences and configuration',
                                  onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Settings coming soon!'),
                                      ),
                                    );
                                  },
                                ),
                                _buildDivider(context),
                                _buildMenuItem(
                                  context,
                                  icon: Icons.help,
                                  title: 'Help & Support',
                                  subtitle: 'Get help and contact support',
                                  onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'Help & Support coming soon!',
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                _buildDivider(context),
                                _buildMenuItem(
                                  context,
                                  icon: Icons.info,
                                  title: 'About',
                                  subtitle: 'App version and information',
                                  onTap: () {
                                    showAboutDialog(
                                      context: context,
                                      applicationName: 'Fetan Pay',
                                      applicationVersion: '1.0.0',
                                      applicationLegalese:
                                          '© 2024 Fetan Pay. All rights reserved.',
                                    );
                                  },
                                ),
                                _buildDivider(context),
                                _buildMenuItem(
                                  context,
                                  icon: Icons.logout,
                                  title: 'Logout',
                                  subtitle: 'Sign out of your account',
                                  onTap: () => _handleLogout(context),
                                  isDestructive: true,
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
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
  }) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Icon(icon, size: 20, color: theme.colorScheme.onSurfaceVariant),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    final theme = Theme.of(context);
    final iconColor = isDestructive
        ? theme.colorScheme.error
        : theme.colorScheme.primary;
    final titleColor = isDestructive ? theme.colorScheme.error : null;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: titleColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: theme.colorScheme.onSurfaceVariant,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider(BuildContext context) {
    final theme = Theme.of(context);

    return Divider(
      color: theme.colorScheme.outline.withValues(alpha: 0.3),
      height: 1,
      indent: 20,
      endIndent: 20,
    );
  }
}
