import 'package:flutter/material.dart';

class ResponsiveUtils {
  static EdgeInsets getResponsivePadding(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    // Mobile: < 600px
    if (screenWidth < 600) {
      return const EdgeInsets.all(16);
    }
    // Tablet: 600-1200px
    else if (screenWidth < 1200) {
      return const EdgeInsets.all(24);
    }
    // Desktop: > 1200px
    else {
      return const EdgeInsets.all(32);
    }
  }

  static EdgeInsets getResponsiveHorizontalPadding(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    if (screenWidth < 600) {
      return const EdgeInsets.symmetric(horizontal: 16);
    } else if (screenWidth < 1200) {
      return const EdgeInsets.symmetric(horizontal: 24);
    } else {
      return const EdgeInsets.symmetric(horizontal: 32);
    }
  }

  static double getResponsiveFontSize(BuildContext context, double baseSize) {
    final screenWidth = MediaQuery.of(context).size.width;

    if (screenWidth < 360) {
      return baseSize * 0.85; // Very small screens
    } else if (screenWidth < 600) {
      return baseSize; // Mobile
    } else if (screenWidth < 1200) {
      return baseSize * 1.1; // Tablet
    } else {
      return baseSize * 1.2; // Desktop
    }
  }

  static int getGridCrossAxisCount(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    if (screenWidth < 600) {
      return 2; // Mobile: 2 columns
    } else if (screenWidth < 900) {
      return 3; // Tablet: 3 columns
    } else {
      return 4; // Desktop: 4 columns
    }
  }

  static double getMaxContentWidth(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    if (screenWidth < 600) {
      return screenWidth * 0.95; // Mobile: 95% of screen width
    } else if (screenWidth < 1200) {
      return 672; // Tablet: max-w-2xl equivalent
    } else {
      return 896; // Desktop: max-w-4xl equivalent
    }
  }
}
