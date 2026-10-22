import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/theme.dart';
import '../widgets/brand.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key, this.error, this.onRetry});
  final String? error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradient),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BrandMark(size: 84, inverted: true)
                    .animate(onPlay: (c) => error == null ? c.repeat(reverse: true) : null)
                    .scale(begin: const Offset(0.94, 0.94), end: const Offset(1.04, 1.04), duration: 900.ms),
                const SizedBox(height: 20),
                Text('StackPrep',
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                const SizedBox(height: 24),
                if (error == null)
                  const SizedBox(
                    width: 26,
                    height: 26,
                    child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                  )
                else ...[
                  Text(error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 16),
                  FilledButton.tonal(onPressed: onRetry, child: const Text('Retry')),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
