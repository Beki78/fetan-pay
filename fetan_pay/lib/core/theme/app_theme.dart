import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,

        // Color Scheme
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: AppColors.primaryForeground,
          secondary: AppColors.secondary,
          onSecondary: AppColors.secondaryForeground,
          error: AppColors.destructive,
          onError: AppColors.destructiveForeground,
          surface: AppColors.card,
          onSurface: AppColors.cardForeground,
          surfaceContainerHighest: AppColors.muted,
          onSurfaceVariant: AppColors.mutedForeground,
          outline: AppColors.border,
        ),

        // Text Theme
        textTheme: TextTheme(
          displayLarge: AppTextStyles.displayLarge.copyWith(color: AppColors.foreground),
          displayMedium: AppTextStyles.displayMedium.copyWith(color: AppColors.foreground),
          displaySmall: AppTextStyles.displaySmall.copyWith(color: AppColors.foreground),
          headlineLarge: AppTextStyles.headlineLarge.copyWith(color: AppColors.foreground),
          headlineMedium: AppTextStyles.headlineMedium.copyWith(color: AppColors.foreground),
          headlineSmall: AppTextStyles.headlineSmall.copyWith(color: AppColors.foreground),
          titleLarge: AppTextStyles.titleLarge.copyWith(color: AppColors.foreground),
          titleMedium: AppTextStyles.titleMedium.copyWith(color: AppColors.foreground),
          titleSmall: AppTextStyles.titleSmall.copyWith(color: AppColors.foreground),
          bodyLarge: AppTextStyles.bodyLarge.copyWith(color: AppColors.foreground),
          bodyMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.foreground),
          bodySmall: AppTextStyles.bodySmall.copyWith(color: AppColors.foreground),
          labelLarge: AppTextStyles.labelLarge.copyWith(color: AppColors.foreground),
          labelMedium: AppTextStyles.labelMedium.copyWith(color: AppColors.foreground),
          labelSmall: AppTextStyles.labelSmall.copyWith(color: AppColors.foreground),
        ),

        // Component Themes
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.background,
          foregroundColor: AppColors.foreground,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          titleTextStyle: AppTextStyles.headlineSmall.copyWith(color: AppColors.foreground),
        ),

        cardTheme: CardThemeData(
          color: AppColors.card,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),

        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.primaryForeground,
            elevation: 2,
            shadowColor: AppColors.primary.withOpacity(0.3),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            textStyle: AppTextStyles.labelLarge,
          ),
        ),

        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.border, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            textStyle: AppTextStyles.labelLarge,
          ),
        ),

        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.input,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.destructive, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          labelStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.mutedForeground),
          hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.mutedForeground),
        ),

        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: AppColors.card,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.mutedForeground,
          selectedLabelStyle: AppTextStyles.labelSmall,
          unselectedLabelStyle: AppTextStyles.labelSmall,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),

        // Custom properties for gradients
        extensions: const [
          AppThemeExtension(
            gradientBackground: LinearGradient(
              colors: [AppColors.background, AppColors.muted],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ],
      );

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,

        // Color Scheme
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          onPrimary: AppColors.primaryForeground,
          secondary: AppColors.secondary,
          onSecondary: AppColors.secondaryForeground,
          error: AppColors.destructive,
          onError: AppColors.destructiveForeground,
          surface: AppColors.darkCard,
          onSurface: AppColors.darkCardForeground,
          surfaceContainerHighest: AppColors.darkMuted,
          onSurfaceVariant: AppColors.darkMutedForeground,
          outline: AppColors.darkBorder,
        ),

        // Text Theme
        textTheme: TextTheme(
          displayLarge: AppTextStyles.displayLarge.copyWith(color: AppColors.darkForeground),
          displayMedium: AppTextStyles.displayMedium.copyWith(color: AppColors.darkForeground),
          displaySmall: AppTextStyles.displaySmall.copyWith(color: AppColors.darkForeground),
          headlineLarge: AppTextStyles.headlineLarge.copyWith(color: AppColors.darkForeground),
          headlineMedium: AppTextStyles.headlineMedium.copyWith(color: AppColors.darkForeground),
          headlineSmall: AppTextStyles.headlineSmall.copyWith(color: AppColors.darkForeground),
          titleLarge: AppTextStyles.titleLarge.copyWith(color: AppColors.darkForeground),
          titleMedium: AppTextStyles.titleMedium.copyWith(color: AppColors.darkForeground),
          titleSmall: AppTextStyles.titleSmall.copyWith(color: AppColors.darkForeground),
          bodyLarge: AppTextStyles.bodyLarge.copyWith(color: AppColors.darkForeground),
          bodyMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.darkForeground),
          bodySmall: AppTextStyles.bodySmall.copyWith(color: AppColors.darkForeground),
          labelLarge: AppTextStyles.labelLarge.copyWith(color: AppColors.darkForeground),
          labelMedium: AppTextStyles.labelMedium.copyWith(color: AppColors.darkForeground),
          labelSmall: AppTextStyles.labelSmall.copyWith(color: AppColors.darkForeground),
        ),

        // Component Themes
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.darkBackground,
          foregroundColor: AppColors.darkForeground,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          titleTextStyle: AppTextStyles.headlineSmall.copyWith(color: AppColors.darkForeground),
        ),

        cardTheme: CardThemeData(
          color: AppColors.darkCard,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),

        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.primaryForeground,
            elevation: 2,
            shadowColor: AppColors.primary.withOpacity(0.3),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            textStyle: AppTextStyles.labelLarge,
          ),
        ),

        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.darkBorder, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            textStyle: AppTextStyles.labelLarge,
          ),
        ),

        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.darkInput,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.darkBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.darkBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.destructive, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          labelStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.darkMutedForeground),
          hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.darkMutedForeground),
        ),

        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: AppColors.darkCard,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.darkMutedForeground,
          selectedLabelStyle: AppTextStyles.labelSmall,
          unselectedLabelStyle: AppTextStyles.labelSmall,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),

        // Custom properties for gradients
        extensions: const [
          AppThemeExtension(
            gradientBackground: LinearGradient(
              colors: [AppColors.darkBackground, AppColors.darkMuted],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ],
      );
}

class AppThemeExtension extends ThemeExtension<AppThemeExtension> {
  const AppThemeExtension({
    required this.gradientBackground,
  });

  final Gradient gradientBackground;

  @override
  ThemeExtension<AppThemeExtension> copyWith({
    Gradient? gradientBackground,
  }) {
    return AppThemeExtension(
      gradientBackground: gradientBackground ?? this.gradientBackground,
    );
  }

  @override
  ThemeExtension<AppThemeExtension> lerp(
    ThemeExtension<AppThemeExtension>? other,
    double t,
  ) {
    if (other is! AppThemeExtension) {
      return this;
    }
    return AppThemeExtension(
      gradientBackground: Gradient.lerp(gradientBackground, other.gradientBackground, t)!,
    );
  }
}
