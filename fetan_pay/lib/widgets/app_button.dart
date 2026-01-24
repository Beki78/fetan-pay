import 'package:flutter/material.dart';

enum AppButtonVariant {
  primary,
  secondary,
  outline,
  ghost,
  destructive,
}

enum AppButtonSize {
  small,
  medium,
  large,
  icon,
}

class AppButton extends StatelessWidget {
  final String? text;
  final Widget? child;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final bool disabled;
  final IconData? icon;
  final bool iconLeft;

  const AppButton({
    super.key,
    this.text,
    this.child,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.disabled = false,
    this.icon,
    this.iconLeft = true,
  }) : assert(text != null || child != null, 'Either text or child must be provided');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Button colors based on variant
    Color backgroundColor;
    Color foregroundColor;
    Color borderColor;
    double elevation;

    switch (variant) {
      case AppButtonVariant.primary:
        backgroundColor = theme.colorScheme.primary;
        foregroundColor = theme.colorScheme.onPrimary;
        borderColor = Colors.transparent;
        elevation = 2;
        break;
      case AppButtonVariant.secondary:
        backgroundColor = theme.colorScheme.secondary;
        foregroundColor = theme.colorScheme.onSecondary;
        borderColor = Colors.transparent;
        elevation = 2;
        break;
      case AppButtonVariant.outline:
        backgroundColor = Colors.transparent;
        foregroundColor = theme.colorScheme.primary;
        borderColor = theme.colorScheme.outline;
        elevation = 0;
        break;
      case AppButtonVariant.ghost:
        backgroundColor = Colors.transparent;
        foregroundColor = theme.colorScheme.primary;
        borderColor = Colors.transparent;
        elevation = 0;
        break;
      case AppButtonVariant.destructive:
        backgroundColor = theme.colorScheme.error;
        foregroundColor = theme.colorScheme.onError;
        borderColor = Colors.transparent;
        elevation = 2;
        break;
    }

    // Size configurations
    double height;
    double horizontalPadding;
    double fontSize;
    double iconSize;

    switch (size) {
      case AppButtonSize.small:
        height = 36;
        horizontalPadding = 12;
        fontSize = 12;
        iconSize = 16;
        break;
      case AppButtonSize.medium:
        height = 44;
        horizontalPadding = 16;
        fontSize = 14;
        iconSize = 18;
        break;
      case AppButtonSize.large:
        height = 52;
        horizontalPadding = 20;
        fontSize = 16;
        iconSize = 20;
        break;
      case AppButtonSize.icon:
        height = 44;
        horizontalPadding = 12;
        fontSize = 14;
        iconSize = 20;
        break;
    }

    final isDisabled = disabled || isLoading || onPressed == null;

    return SizedBox(
      height: height,
      child: ElevatedButton(
        onPressed: isDisabled ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isDisabled ? theme.colorScheme.surfaceContainerHighest : backgroundColor,
          foregroundColor: isDisabled ? theme.colorScheme.onSurfaceVariant : foregroundColor,
          elevation: isDisabled ? 0 : elevation,
          shadowColor: backgroundColor.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: borderColor != Colors.transparent
                ? BorderSide(color: borderColor, width: 1.5)
                : BorderSide.none,
          ),
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          textStyle: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w500,
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: iconSize,
                height: iconSize,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null && iconLeft) ...[
                    Icon(icon, size: iconSize),
                    const SizedBox(width: 8),
                  ],
                  Flexible(
                    child: child ??
                        Text(
                          text!,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: fontSize,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                  ),
                  if (icon != null && !iconLeft) ...[
                    const SizedBox(width: 8),
                    Icon(icon, size: iconSize),
                  ],
                ],
              ),
      ),
    );
  }
}
