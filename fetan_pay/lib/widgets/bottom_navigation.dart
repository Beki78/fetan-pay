import 'package:flutter/material.dart';

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

    return Container(
      decoration: BoxDecoration(
        color: theme.bottomNavigationBarTheme.backgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 100,
          child: Stack(
            clipBehavior: Clip.none, // Allow FAB to extend beyond Stack bounds
            children: [
              // Bottom Navigation Bar
              Row(
                children: List.generate(_navItems.length, (index) {
                  final item = _navItems[index];
                  final isSelected = index == currentIndex;

                  return Expanded(
                    child: GestureDetector(
                      onTap: () => onTap(index),
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 56, // Fixed width to prevent layout shifts
                              height: 56, // Fixed height to prevent layout shifts
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? theme.colorScheme.primary.withOpacity(0.1)
                                    : Colors.transparent,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                item.icon,
                                color: isSelected
                                    ? theme.colorScheme.primary
                                    : theme.bottomNavigationBarTheme.unselectedItemColor,
                                size: isSelected ? 36 : 32,
                              ),
                            ),
                            
                            Text(
                              item.label,
                              style: (isSelected
                                      ? theme.bottomNavigationBarTheme.selectedLabelStyle
                                      : theme.bottomNavigationBarTheme.unselectedLabelStyle)
                                  ?.copyWith(
                                color: isSelected
                                    ? theme.colorScheme.primary
                                    : theme.bottomNavigationBarTheme.unselectedItemColor,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                fontSize: isSelected ? 14 : 12,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),

              // Floating Action Button for Quick Scan
              Positioned(
                top: -32, // Position half above navigation bar
                left: 0,
                right: 0,
                child: Center(
                  child: GestureDetector(
                    onTap: () => onTap(0), // Navigate to scan (index 0)
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: theme.colorScheme.primary.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.qr_code_scanner,
                        color: theme.colorScheme.onPrimary,
                        size: 28,
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
}

class _NavItem {
  final String label;
  final IconData icon;

  const _NavItem({
    required this.label,
    required this.icon,
  });
}

const List<_NavItem> _navItems = [
  _NavItem(label: 'Scan', icon: Icons.qr_code_scanner),
  _NavItem(label: 'Tips', icon: Icons.attach_money),
  _NavItem(label: 'History', icon: Icons.history),
  _NavItem(label: 'Profile', icon: Icons.person),
];
