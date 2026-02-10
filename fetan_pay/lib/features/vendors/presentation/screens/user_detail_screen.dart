import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../core/di/injection_container.dart';
import '../../../../widgets/app_button.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../../../auth/data/services/session_manager.dart';
import '../../data/models/merchant_user_models.dart';
import '../bloc/merchant_users_bloc.dart';
import '../bloc/merchant_users_event.dart';
import '../bloc/merchant_users_state.dart';
import '../widgets/user_modal.dart';

class UserDetailScreen extends StatefulWidget {
  final MerchantUser user;

  const UserDetailScreen({super.key, required this.user});

  @override
  State<UserDetailScreen> createState() => _UserDetailScreenState();
}

class _UserDetailScreenState extends State<UserDetailScreen> {
  String? _merchantId;

  @override
  void initState() {
    super.initState();
    _loadMerchantId();
  }

  Future<void> _loadMerchantId() async {
    final user = await getIt<SessionManager>().getUser();
    final merchantId = user?.merchantId;
    if (merchantId != null && mounted) {
      setState(() {
        _merchantId = merchantId;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isActive = widget.user.status == 'ACTIVE';

    return Scaffold(
      body: BlocListener<MerchantUsersBloc, MerchantUsersState>(
        listener: (context, state) {
          if (state is MerchantUsersOperationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.green,
              ),
            );
            // Refresh the screen or pop back
            Navigator.pop(context);
          } else if (state is MerchantUsersError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is MerchantUsersQRCodeLoaded) {
            _showQRCodeDialog(context, state.qrCode);
          }
        },
        child: Container(
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
                // Header with back button
                Column(
                  children: [
                    Padding(
                      padding: ResponsiveUtils.getResponsivePadding(context),
                      child: Row(
                        children: [
                          IconButton(
                            onPressed: () => Navigator.pop(context),
                            icon: Icon(
                              Icons.arrow_back,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'User Details',
                                  style: GoogleFonts.poppins(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                                Text(
                                  'Detailed information about ${widget.user.name ?? 'User'}',
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
                                  isDarkMode
                                      ? Icons.dark_mode
                                      : Icons.light_mode,
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
                    Divider(
                      height: 1,
                      thickness: 1,
                      color: theme.colorScheme.outline.withValues(alpha: 0.8),
                    ),
                  ],
                ),

                // Main content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        // User Profile Card
                        AppCard(
                          padding: const EdgeInsets.all(24),
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(
                                      widget.user.status,
                                    ).withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.person,
                                    color: _getStatusColor(widget.user.status),
                                    size: 40,
                                  ),
                                ),
                                const SizedBox(width: 20),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        widget.user.name ?? 'Unknown User',
                                        style: theme.textTheme.headlineSmall
                                            ?.copyWith(
                                              fontWeight: FontWeight.w700,
                                            ),
                                      ),
                                      const SizedBox(height: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _getStatusColor(
                                            widget.user.status,
                                          ).withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Text(
                                          widget.user.status.toUpperCase(),
                                          style: theme.textTheme.labelSmall
                                              ?.copyWith(
                                                color: _getStatusColor(
                                                  widget.user.status,
                                                ),
                                                fontWeight: FontWeight.w700,
                                                fontSize: 12,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Contact Information
                        Text(
                          'Contact Information',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppCard(
                          padding: const EdgeInsets.all(20),
                          children: [
                            _buildInfoRow(
                              Icons.email,
                              'Email Address',
                              widget.user.email ?? 'No email',
                              theme,
                            ),
                            const SizedBox(height: 10),
                            _buildInfoRow(
                              Icons.phone,
                              'Phone Number',
                              widget.user.phone ?? 'No phone',
                              theme,
                            ),
                            const SizedBox(height: 10),
                            _buildInfoRow(
                              Icons.badge,
                              'Role',
                              widget.user.role,
                              theme,
                            ),
                            const SizedBox(height: 10),
                            _buildInfoRow(
                              Icons.calendar_today,
                              'Member Since',
                              widget.user.createdAt != null
                                  ? DateFormat(
                                      'MMMM d, yyyy',
                                    ).format(widget.user.createdAt!)
                                  : 'N/A',
                              theme,
                            ),
                          ],
                        ),

                        const SizedBox(height: 32),

                        // Action Buttons
                        Column(
                          children: [
                            // Edit User Button
                            SizedBox(
                              width: double.infinity,
                              child: AppButton(
                                text: 'Edit User',
                                onPressed: () async {
                                  await UserModal.show(
                                    context,
                                    user: widget.user,
                                    merchantId: _merchantId,
                                  );
                                },
                                icon: Icons.edit,
                                variant: AppButtonVariant.outline,
                              ),
                            ),
                            const SizedBox(height: 12),
                            // Activate/Deactivate Button
                            SizedBox(
                              width: double.infinity,
                              child: AppButton(
                                text: isActive
                                    ? 'Deactivate User'
                                    : 'Activate User',
                                onPressed: () {
                                  if (_merchantId != null) {
                                    if (isActive) {
                                      context.read<MerchantUsersBloc>().add(
                                        DeactivateMerchantUserEvent(
                                          merchantId: _merchantId!,
                                          userId: widget.user.id,
                                          actionBy: 'admin',
                                        ),
                                      );
                                    } else {
                                      context.read<MerchantUsersBloc>().add(
                                        ActivateMerchantUserEvent(
                                          merchantId: _merchantId!,
                                          userId: widget.user.id,
                                          actionBy: 'admin',
                                        ),
                                      );
                                    }
                                  }
                                },
                                icon: isActive
                                    ? Icons.block
                                    : Icons.check_circle,
                                variant: isActive
                                    ? AppButtonVariant.destructive
                                    : AppButtonVariant.primary,
                              ),
                            ),
                            const SizedBox(height: 12),
                            // Get QR Code Button
                            SizedBox(
                              width: double.infinity,
                              child: AppButton(
                                text: 'Get QR Code',
                                onPressed: () {
                                  if (_merchantId != null) {
                                    context.read<MerchantUsersBloc>().add(
                                      GetUserQRCodeEvent(
                                        merchantId: _merchantId!,
                                        userId: widget.user.id,
                                      ),
                                    );
                                  }
                                },
                                icon: Icons.qr_code,
                                variant: AppButtonVariant.outline,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showQRCodeDialog(BuildContext context, QRCodeResponse qrCode) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('QR Code for ${qrCode.email}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.network(
                qrCode.qrCodeImage,
                width: 250,
                height: 250,
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(Icons.error, size: 64);
                },
              ),
              const SizedBox(height: 16),
              Text(
                'Generated: ${DateFormat('MMM d, yyyy HH:mm').format(qrCode.generatedAt)}',
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildInfoRow(
    IconData icon,
    String label,
    String value,
    ThemeData theme, {
    Color? valueColor,
  }) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: theme.colorScheme.primary, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: valueColor ?? theme.colorScheme.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return Colors.green;
      case 'INACTIVE':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
