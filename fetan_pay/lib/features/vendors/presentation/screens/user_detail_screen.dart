import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../widgets/app_button.dart';
import '../../../../widgets/app_card.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../widgets/user_modal.dart';

class UserDetailScreen extends StatelessWidget {
  final Map<String, dynamic> user;

  const UserDetailScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final lastActive = user['lastActive'] as DateTime;
    final joinDate = user['joinDate'] as DateTime;
    final successRate = user['successRate'] as double;

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
                                'Detailed information about ${user['name']}',
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
                  Divider(
                    height: 1,
                    thickness: 1,
                    color: theme.colorScheme.outline.withOpacity(0.8),
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
                                  color: _getStatusColor(user['status']).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.person,
                                  color: _getStatusColor(user['status']),
                                  size: 40,
                                ),
                              ),
                              const SizedBox(width: 20),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user['name'],
                                      style: theme.textTheme.headlineSmall?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(user['status']).withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        user['status'].toUpperCase(),
                                        style: theme.textTheme.labelSmall?.copyWith(
                                          color: _getStatusColor(user['status']),
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
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatCard(
                                  'Transactions',
                                  user['transactions'].toString(),
                                  Icons.receipt_long,
                                  theme.colorScheme.primary,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildStatCard(
                                  'Total Amount',
                                  _formatCurrency(user['totalAmount']),
                                  Icons.attach_money,
                                  Colors.green,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatCard(
                                  'Success Rate',
                                  '${(successRate * 100).toInt()}%',
                                  Icons.trending_up,
                                  successRate >= 0.95 ? Colors.green : Colors.orange,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildStatCard(
                                  'Member Since',
                                  DateFormat('MMM yyyy').format(joinDate),
                                  Icons.calendar_today,
                                  theme.colorScheme.secondary,
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
                            user['email'],
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.phone,
                            'Phone Number',
                            user['phone'],
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.location_on,
                            'Branch',
                            user['branch'],
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.group,
                            'Team',
                            user['team'],
                            theme,
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Activity Information
                      Text(
                        'Activity Information',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      AppCard(
                        padding: const EdgeInsets.all(20),
                        children: [
                          _buildInfoRow(
                            Icons.access_time,
                            'Last Active',
                            _formatLastActive(lastActive),
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.calendar_today,
                            'Join Date',
                            DateFormat('EEEE, MMMM d, yyyy').format(joinDate),
                            theme,
                          ),
                          const SizedBox(height: 10),
                          _buildInfoRow(
                            Icons.trending_up,
                            'Performance',
                            successRate >= 0.95 ? 'Excellent' :
                            successRate >= 0.90 ? 'Good' :
                            successRate >= 0.80 ? 'Average' : 'Needs Improvement',
                            theme,
                            valueColor: successRate >= 0.95 ? Colors.green :
                                       successRate >= 0.90 ? Colors.blue :
                                       successRate >= 0.80 ? Colors.orange : Colors.red,
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              text: 'Edit User',
                              onPressed: () async {
                                final userObj = _mapToUser(user);
                                final updatedUser = await UserModal.show(
                                  context,
                                  user: userObj,
                                );

                                if (updatedUser != null && context.mounted) {
                                  // Here you would update the user data and refresh the screen
                                  // For now, just show success message and pop back to list
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('User "${updatedUser.name}" updated successfully!'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                  Navigator.pop(context, updatedUser);
                                }
                              },
                              icon: Icons.edit,
                              variant: AppButtonVariant.outline,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: AppButton(
                              text: user['status'] == 'active' ? 'Deactivate' : 'Activate',
                              onPressed: () {
                                // Here you would toggle user status
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      '${user['status'] == 'active' ? 'Deactivated' : 'Activated'} ${user['name']}',
                                    ),
                                    backgroundColor: user['status'] == 'active' ? Colors.red : Colors.green,
                                  ),
                                );
                              },
                              icon: user['status'] == 'active' ? Icons.block : Icons.check_circle,
                              variant: user['status'] == 'active' ? AppButtonVariant.destructive : AppButtonVariant.primary,
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
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 24,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              color: color.withOpacity(0.8),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, ThemeData theme, {Color? valueColor}) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: theme.colorScheme.primary,
            size: 20,
          ),
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

  User _mapToUser(Map<String, dynamic> userData) {
    return User(
      id: userData['id'],
      name: userData['name'],
      email: userData['email'],
      phone: userData['phone'],
      branch: userData['branch'] ?? 'Addis Ababa Main',
      team: userData['team'] ?? 'Sales Team A',
      status: userData['status'] == 'active' ? 'Active' : 'Inactive',
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return Colors.green;
      case 'inactive':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_ET',
      symbol: 'ETB ',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  String _formatLastActive(DateTime lastActive) {
    final now = DateTime.now();
    final difference = now.difference(lastActive);

    if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minutes ago';
    } else {
      return 'Just now';
    }
  }
}
