import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/bloc/navigation/navigation_bloc.dart';
import '../../../../widgets/bottom_navigation.dart';
import '../../../scan/presentation/screens/scan_screen.dart';
import '../../../tip/presentation/screens/tip_screen.dart';
import '../../../history/presentation/screens/history_screen.dart';
import '../../../profile/presentation/screens/profile_screen.dart';

class MainNavigationScreen extends StatelessWidget {
  const MainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => NavigationBloc(),
      child: BlocBuilder<NavigationBloc, NavigationState>(
        builder: (context, state) {
          return Scaffold(
            body: Stack(
              children: [
                // Main body content
                IndexedStack(
                  index: state.currentIndex,
                  children: const [
                    ScanScreen(),
                    TipScreen(),
                    HistoryScreen(),
                    ProfileScreen(),
                  ],
                ),
                // Enhanced floating navigation positioned at bottom
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: BottomNavigation(
                    currentIndex: state.currentIndex,
                    onTap: (index) {
                      // Handle tab navigation
                      switch (index) {
                        case 0:
                          context.read<NavigationBloc>().add(NavigateToScan());
                          break;
                        case 1:
                          context.read<NavigationBloc>().add(NavigateToTips());
                          break;
                        case 2:
                          context.read<NavigationBloc>().add(
                            NavigateToHistory(),
                          );
                          break;
                        case 3:
                          context.read<NavigationBloc>().add(
                            NavigateToProfile(),
                          );
                          break;
                        case 4: // FAB pressed - Quick Scan
                          context.read<NavigationBloc>().add(NavigateToScan());
                          _showQuickScanMessage(context);
                          break;
                      }
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showQuickScanMessage(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Quick Scan activated! Ready to scan QR codes.'),
        duration: Duration(seconds: 2),
      ),
    );
  }
}
