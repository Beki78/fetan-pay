import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';

class AdminBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const AdminBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.colorScheme.primary;

    // Total height calculation: 
    // Nav Bar Height (80) + Margin Bottom (20) + Button Protrusion (~30)
    return SizedBox(
      height: 130, // 1. CRITICAL FIX: Increased height to capture touches on the top of the FAB
      child: Stack(
        alignment: Alignment.bottomCenter,
        clipBehavior: Clip.none,
        children: [
          // 2. The Navigation Bar (Aligned to bottom)
          Positioned(
            bottom: 20, // Floating margin from bottom screen
            left: 20,
            right: 20,
            child: Container(
              height: 80, 
              decoration: BoxDecoration(
                // Glassmorphism background
                color: (theme.bottomNavigationBarTheme.backgroundColor ?? Colors.white)
                    .withOpacity(0.85),
                borderRadius: BorderRadius.circular(40),
                border: Border.all(
                  color: Colors.white.withOpacity(0.6),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(40),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    child: GNav(
                      gap: 8,
                      activeColor: Colors.white,
                      iconSize: 24,
                      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                      duration: const Duration(milliseconds: 400),
                      tabBackgroundColor: primaryColor,
                      color: Colors.grey[600],
                      tabs: _adminNavItems.map((item) {
                        return GButton(
                          icon: item.icon,
                          text: item.label,
                          textStyle: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        );
                      }).toList(),
                      selectedIndex: currentIndex,
                      onTabChange: onTap,
                      haptic: true,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // 3. The Floating Action Button
          // Positioned relative to the bottom of the tall SizedBox
          Positioned(
            bottom: 85, // Lifted up to overlap the nav bar correctly
            child: GestureDetector(
              onTap: () => onTap(4),
              behavior: HitTestBehavior.opaque, // Ensures tap is detected
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [primaryColor, primaryColor.withOpacity(0.8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.4),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.add_rounded,
                  color: Colors.white,
                  size: 30,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AdminNavItem {
  final String label;
  final IconData icon;

  const _AdminNavItem({required this.label, required this.icon});
}

const List<_AdminNavItem> _adminNavItems = [
  _AdminNavItem(label: 'Home', icon: Icons.grid_view_rounded),
  _AdminNavItem(label: 'Transactions', icon: Icons.account_balance_wallet_rounded),
  _AdminNavItem(label: 'Users', icon: Icons.group_rounded),
  _AdminNavItem(label: 'Settings', icon: Icons.settings_rounded),
];