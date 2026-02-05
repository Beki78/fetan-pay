import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/di/injection_container.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'core/bloc/navigation/navigation_bloc.dart';
import 'core/bloc/theme/theme_bloc.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/data/models/user_model.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/shared/presentation/screens/main_navigation_screen.dart';
import 'features/shared/presentation/screens/admin_main_screen.dart';
import 'features/scan/presentation/bloc/scan_bloc.dart';
import 'features/scan/presentation/bloc/scan_event.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize dependency injection
  await configureDependencies();

  // Initialize Google Fonts
  GoogleFonts.config.allowRuntimeFetching = false;

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<AuthBloc>()..add(CheckAuthStatus())),
        BlocProvider(create: (_) => getIt<ScanBloc>()..add(InitializeScan())),
        BlocProvider(create: (_) => NavigationBloc()),
        BlocProvider(create: (_) => ThemeBloc()),
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          return MaterialApp(
            title: 'Fetan Pay - Merchant',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeState.themeMode,
            home: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                if (state is AuthLoading || state is AuthInitial) {
                  return Scaffold(
                    body: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Theme.of(context).colorScheme.surface,
                            Theme.of(
                              context,
                            ).colorScheme.surfaceContainerHighest,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: const Center(child: CircularProgressIndicator()),
                    ),
                  );
                }

                if (state is AuthAuthenticated) {
                  return state.user.role == UserRole.admin
                      ? const AdminMainScreen()
                      : const MainNavigationScreen();
                }

                return const LoginScreen();
              },
            ),
          );
        },
      ),
    );
  }
}
