import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../../../core/bloc/theme/theme_bloc.dart';
import '../../../../widgets/app_button.dart';
import '../../../../core/utils/responsive_utils.dart';
import '../widgets/user_modal.dart';
import 'user_detail_screen.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  bool _isLoading = true;

  final List<Map<String, dynamic>> _users = [
    {
      'id': '1',
      'name': 'User John',
      'email': 'john@example.com',
      'phone': '+251911123456',
      'status': 'active',
      'team': 'Sales Team A',
      'transactions': 45,
      'totalAmount': 22500.75,
      'successRate': 0.98,
      'lastActive': DateTime.now().subtract(const Duration(hours: 2)),
      'branch': 'Addis Ababa Main',
      'joinDate': DateTime.now().subtract(const Duration(days: 120)),
    },
    {
      'id': '2',
      'name': 'User Sarah',
      'email': 'sarah@example.com',
      'phone': '+251922654321',
      'status': 'active',
      'team': 'Sales Team B',
      'transactions': 38,
      'totalAmount': 19200.50,
      'successRate': 0.95,
      'lastActive': DateTime.now().subtract(const Duration(minutes: 30)),
      'branch': 'Dire Dawa Branch',
      'joinDate': DateTime.now().subtract(const Duration(days: 95)),
    },
    {
      'id': '3',
      'name': 'User Mike',
      'email': 'mike@example.com',
      'phone': '+251933789123',
      'status': 'inactive',
      'team': 'Support Team',
      'transactions': 12,
      'totalAmount': 6100.25,
      'successRate': 0.87,
      'lastActive': DateTime.now().subtract(const Duration(days: 3)),
      'branch': 'Hawassa Branch',
      'joinDate': DateTime.now().subtract(const Duration(days: 45)),
    },
    {
      'id': '4',
      'name': 'User Emma',
      'email': 'emma@example.com',
      'phone': '+251944567890',
      'status': 'active',
      'team': 'Sales Team C',
      'transactions': 29,
      'totalAmount': 14500.00,
      'successRate': 0.96,
      'lastActive': DateTime.now().subtract(const Duration(hours: 4)),
      'branch': 'Mekelle Branch',
      'joinDate': DateTime.now().subtract(const Duration(days: 75)),
    },
    {
      'id': '5',
      'name': 'User David',
      'email': 'david@example.com',
      'phone': '+251955678901',
      'status': 'active',
      'team': 'Sales Team A',
      'transactions': 52,
      'totalAmount': 26800.25,
      'successRate': 0.94,
      'lastActive': DateTime.now().subtract(const Duration(hours: 1)),
      'branch': 'Addis Ababa Main',
      'joinDate': DateTime.now().subtract(const Duration(days: 150)),
    },
    {
      'id': '6',
      'name': 'User Lisa',
      'email': 'lisa@example.com',
      'phone': '+251966789012',
      'status': 'active',
      'team': 'Sales Team B',
      'transactions': 31,
      'totalAmount': 15600.75,
      'successRate': 0.97,
      'lastActive': DateTime.now().subtract(const Duration(hours: 6)),
      'branch': 'Dire Dawa Branch',
      'joinDate': DateTime.now().subtract(const Duration(days: 60)),
    },
  ];

  @override
  void initState() {
    super.initState();
    // Simulate loading
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    });
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

  void _updateUser(String userId, User updatedUser) {
    setState(() {
      final index = _users.indexWhere((v) => v['id'] == userId);
      if (index != -1) {
        _users[index] = {
          ..._users[index],
          'name': updatedUser.name,
          'email': updatedUser.email,
          'phone': updatedUser.phone,
          'branch': updatedUser.branch,
          'team': updatedUser.team,
          'status': updatedUser.status.toLowerCase(),
        };
      }
    });
  }

  void _showUserActions(BuildContext context, Map<String, dynamic> user) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Actions for ${user['name']}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 20),
              _buildActionButton(
                context,
                'View Details',
                Icons.visibility,
                Colors.blue,
                () {
                  Navigator.pop(context);
                  // TODO: Navigate to user detail screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('View details for ${user['name']}')),
                  );
                },
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                context,
                'Edit User',
                Icons.edit,
                Colors.orange,
                () async {
                  Navigator.pop(context); // Close actions modal

                  // Convert user data to User object
                  final userObj = _mapToUser(user);

                  // Open edit modal
                  final updatedUser = await UserModal.show(
                    context,
                    user: userObj,
                  );

                  // Handle the result
                  if (updatedUser != null && mounted) {
                    _updateUser(user['id'], updatedUser);
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('User "${updatedUser.name}" updated successfully!'),
                        backgroundColor: Colors.green,
                      ),
                  );
                  }
                },
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                context,
                user['status'] == 'active' ? 'Deactivate' : 'Activate',
                user['status'] == 'active' ? Icons.block : Icons.check_circle,
                user['status'] == 'active' ? Colors.red : Colors.green,
                () {
                  Navigator.pop(context);
                  // TODO: Toggle user status
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${user['status'] == 'active' ? 'Deactivate' : 'Activate'} ${user['name']}')),
                  );
                },
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                context,
                'Reset Password',
                Icons.lock_reset,
                Colors.purple,
                () {
                  Navigator.pop(context);
                  // TODO: Reset user password
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Reset password for ${user['name']}')),
                  );
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildActionButton(BuildContext context, String label, IconData icon, Color color, VoidCallback onTap) {
    return AppButton(
      text: label,
      onPressed: onTap,
      icon: icon,
      variant: AppButtonVariant.outline,
      size: AppButtonSize.small,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final activeUsers = _users.where((v) => v['status'] == 'active').length;

    // Theme-aware background colors (similar to dashboard)
    final bgAccentColor = isDark
        ? theme.colorScheme.primary.withOpacity(0.1)
        : theme.colorScheme.primary.withOpacity(0.08);

    final bgSecondaryColor = isDark
        ? theme.colorScheme.secondary.withOpacity(0.08)
        : theme.colorScheme.secondary.withOpacity(0.06);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background Decorative Circles (like dashboard)
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
            top: 200,
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
            child: Column(
              children: [
                // Enhanced Header
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
                                theme.colorScheme.primary.withOpacity(0.2),
                                theme.colorScheme.primary.withOpacity(0.1),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: theme.colorScheme.primary.withOpacity(0.2),
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
                                  Icons.people_rounded,
                                  color: theme.colorScheme.primary,
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
                                'User Management',
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
                            final isDarkMode = themeState.themeMode == ThemeMode.dark;
                            return Container(
                              decoration: BoxDecoration(
                                color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.8),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: IconButton(
                                onPressed: () {
                                  context.read<ThemeBloc>().add(ToggleTheme());
                                },
                                icon: Icon(
                                  isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                                tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Enhanced Summary Cards
                FadeInUp(
                  delay: const Duration(milliseconds: 200),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildEnhancedSummaryCard(
                            'Total Users',
                            _users.length.toString(),
                            Icons.people_rounded,
                            theme.colorScheme.primary,
                            '${_users.length} registered',
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildEnhancedSummaryCard(
                            'Active Users',
                            activeUsers.toString(),
                            Icons.check_circle_rounded,
                            Colors.green,
                            '${((activeUsers / _users.length) * 100).toInt()}% active',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Content Section with Title
                FadeInUp(
                  delay: const Duration(milliseconds: 400),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Team Members',
                          style: GoogleFonts.poppins(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primaryContainer.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: theme.colorScheme.primary.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            '${_users.length} users',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Enhanced Content List
                Expanded(
                  child: _isLoading
                      ? FadeIn(
                          child: const Center(
                            child: SizedBox(
                              width: 40,
                              height: 40,
                              child: CircularProgressIndicator(strokeWidth: 3),
                            ),
                          ),
                        )
                      : FadeInUp(
                          delay: const Duration(milliseconds: 600),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: ListView.separated(
                              physics: const BouncingScrollPhysics(),
                              itemCount: _users.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 16),
                              itemBuilder: (context, index) {
                                final user = _users[index];
                                return FadeInUp(
                                  delay: Duration(milliseconds: 600 + (index * 100)),
                                  child: InkWell(
                                    onTap: () async {
                                      final result = await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => UserDetailScreen(user: user),
                                        ),
                                      );

                                      // Handle the result if user was updated
                                      if (result != null && result is User) {
                                        setState(() {
                                          _updateUser(user['id'], result);
                                        });
                                      }
                                    },
                                    borderRadius: BorderRadius.circular(20),
                                    child: _buildEnhancedUserCard(user, theme, index),
                                  ),
                                );
                              },
                            ),
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

  Widget _buildEnhancedSummaryCard(String title, String value, IconData icon, Color color, String subtitle) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isSmall = constraints.maxWidth < 150;

        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: color.withOpacity(0.2),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.1),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      icon,
                      color: color,
                      size: isSmall ? 20 : 24,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.trending_up_rounded,
                      color: color,
                      size: 16,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  value,
                  style: GoogleFonts.poppins(
                    fontSize: isSmall ? 24 : 28,
                    fontWeight: FontWeight.w900,
                    color: color,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontSize: isSmall ? 11 : 13,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                style: GoogleFonts.poppins(
                  fontSize: isSmall ? 9 : 11,
                  color: color.withOpacity(0.8),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEnhancedUserCard(Map<String, dynamic> user, ThemeData theme, int index) {
    final statusColor = _getStatusColor(user['status']);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
          BoxShadow(
            color: statusColor.withOpacity(0.05),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          // Clean Avatar
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  statusColor.withOpacity(0.15),
                  statusColor.withOpacity(0.08),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              border: Border.all(
                color: statusColor.withOpacity(0.2),
                width: 1.5,
              ),
            ),
            child: Icon(
              Icons.person_rounded,
              color: statusColor,
              size: 24,
            ),
          ),

          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name and status row
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        user['name'],
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: statusColor.withOpacity(0.2),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        user['status'].toUpperCase(),
                        style: GoogleFonts.poppins(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                          fontSize: 10,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 4),

                // Team and key metric
                Row(
                  children: [
                    Icon(
                      Icons.group_rounded,
                      size: 12,
                      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.7),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        user['team'],
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: theme.colorScheme.onSurfaceVariant,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '${user['transactions']} transactions',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Action button
          IconButton(
            onPressed: () => _showUserActions(context, user),
            icon: Icon(
              Icons.more_vert_rounded,
              color: theme.colorScheme.onSurfaceVariant,
              size: 20,
            ),
            style: IconButton.styleFrom(
              backgroundColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
              padding: const EdgeInsets.all(8),
            ),
          ),
        ],
      ),
    );
  }
}
