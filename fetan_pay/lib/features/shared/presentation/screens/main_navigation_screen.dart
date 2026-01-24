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
    return BlocBuilder<NavigationBloc, NavigationState>(
      builder: (context, state) {
        return Scaffold(
          body: IndexedStack(
            index: state.currentIndex,
            children: const [
              ScanScreen(),
              TipScreen(),
              HistoryScreen(),
              ProfileScreen(),
            ],
          ),
          bottomNavigationBar: BottomNavigation(
            currentIndex: state.currentIndex,
            onTap: (index) {
              context.read<NavigationBloc>().add(
                switch (index) {
                  0 => NavigateToScan(),
                  1 => NavigateToTips(),
                  2 => NavigateToHistory(),
                  3 => NavigateToProfile(),
                  _ => NavigateToScan(),
                },
              );
            },
          ),
        );
      },
    );
  }
}
