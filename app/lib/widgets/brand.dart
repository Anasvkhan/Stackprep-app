import 'package:flutter/material.dart';

import '../core/theme.dart';

/// StackPrep logo: three stacked bars inside a rounded square.
class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.size = 40, this.inverted = false});
  final double size;
  final bool inverted;

  @override
  Widget build(BuildContext context) {
    final bar = inverted ? AppColors.primary : Colors.white;
    Widget line(double w, double opacity) => Container(
          width: size * w,
          height: size * 0.12,
          decoration: BoxDecoration(
            color: bar.withValues(alpha: opacity),
            borderRadius: BorderRadius.circular(size),
          ),
        );
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: inverted ? Colors.white : null,
        gradient: inverted ? null : AppColors.gradient,
        borderRadius: BorderRadius.circular(size * 0.28),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: size * 0.3, offset: Offset(0, size * 0.1)),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          line(0.36, 0.55),
          SizedBox(height: size * 0.07),
          line(0.5, 0.8),
          SizedBox(height: size * 0.07),
          line(0.62, 1),
        ],
      ),
    );
  }
}
