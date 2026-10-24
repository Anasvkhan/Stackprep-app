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
    final t = Theme.of(context);
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6C7AE8), Color(0xFF6C5CE7), Color(0xFF4834D4)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(34),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 1.5),
                        color: Colors.white.withValues(alpha: 0.06),
                      ),
                      child: const BrandMark(size: 84, inverted: true),
                    )
                        .animate(onPlay: (c) => error == null ? c.repeat(reverse: true) : null)
                        .scale(begin: const Offset(0.95, 0.95), end: const Offset(1.03, 1.03), duration: 900.ms),
                    const SizedBox(height: 22),
                    Text('StackPrep',
                        style: t.textTheme.headlineMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 28),
                    if (error == null) ...[
                      const SizedBox(
                        width: 30,
                        height: 30,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          color: AppColors.accent,
                          backgroundColor: Color(0x33FFFFFF),
                          strokeCap: StrokeCap.round,
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Only appears if startup is slow (sleeping server on first launch).
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: const Text(
                          'Waking up the server...\nThe first launch can take up to a minute.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white, height: 1.5),
                        ),
                      ).animate().fadeIn(delay: 5.seconds, duration: 600.ms),
                    ] else
                      _ErrorCard(message: error!, onRetry: onRetry).animate().fadeIn().slideY(begin: 0.15, end: 0),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, this.onRetry});
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: t.cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 24, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          Container(height: 4, color: AppColors.danger),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.12), shape: BoxShape.circle),
                      child: const Icon(Icons.cloud_off_rounded, color: AppColors.danger, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(message, style: t.textTheme.bodyLarge?.copyWith(height: 1.45)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: onRetry,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primaryDark,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(120, 46),
                  ),
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Retry'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
