import 'package:flutter/material.dart';

class BreathingLogoLoader extends StatefulWidget {
  final double size;
  final String? logoPath;

  const BreathingLogoLoader({
    super.key,
    this.size = 120,
    this.logoPath,
  });

  @override
  State<BreathingLogoLoader> createState() => _BreathingLogoLoaderState();
}

class _BreathingLogoLoaderState extends State<BreathingLogoLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _opacityAnimation = Tween<double>(
      begin: 1.0,
      end: 0.8,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _opacityAnimation.value,
              child: SizedBox(
                width: widget.size,
                height: widget.size,
                child: widget.logoPath != null
                    ? Image.asset(
                        widget.logoPath!,
                        fit: BoxFit.contain,
                      )
                    : Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.account_balance,
                          size: widget.size * 0.6,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
              ),
            ),
          );
        },
      ),
    );
  }
}
