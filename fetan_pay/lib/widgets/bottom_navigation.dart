import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';

class BottomNavigation extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.colorScheme.primary;

    // Enhanced glassmorphism design matching admin UI
    return SizedBox(
      height: 130, // Increased height to capture FAB touches
      child: Stack(
        alignment: Alignment.bottomCenter,
        clipBehavior: Clip.none,
        children: [
          // Enhanced Navigation Bar with glassmorphism
          Positioned(
            bottom: 20, // Floating margin from bottom screen
            left: 20,
            right: 20,
            child: Container(
              height: 80,
              decoration: BoxDecoration(
                // Glassmorphism background
                color:
                    (theme.bottomNavigationBarTheme.backgroundColor ??
                            Colors.white)
                        .withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(40),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.6),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
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
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 10,
                    ),
                    child: GNav(
                      gap: 8,
                      activeColor: Colors.white,
                      iconSize: 24,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 15,
                        vertical: 12,
                      ),
                      duration: const Duration(milliseconds: 400),
                      tabBackgroundColor: primaryColor,
                      color: Colors.grey[600],
                      tabs: _merchantNavItems.map((item) {
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

          // Enhanced Floating Action Button for Quick Scan
          Positioned(
            bottom: 85, // Lifted up to overlap the nav bar correctly
            child: GestureDetector(
              onTap: () => onTap(4), // Trigger quick scan
              behavior: HitTestBehavior.opaque,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [primaryColor, primaryColor.withValues(alpha: 0.8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withValues(alpha: 0.4),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.qr_code_scanner_rounded,
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

class _MerchantNavItem {
  final String label;
  final IconData icon;

  const _MerchantNavItem({required this.label, required this.icon});
}

const List<_MerchantNavItem> _merchantNavItems = [
  _MerchantNavItem(label: 'Scan', icon: Icons.qr_code_scanner_rounded),
  _MerchantNavItem(label: 'Tips', icon: Icons.attach_money_rounded),
  _MerchantNavItem(label: 'History', icon: Icons.history_rounded),
  _MerchantNavItem(label: 'Profile', icon: Icons.person_rounded),
];
