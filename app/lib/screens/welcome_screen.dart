import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/theme.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';
import 'auth_screen.dart';
import 'role_select_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  static const _chips = [
    ('System Design', Icons.account_tree_rounded),
    ('Node.js', Icons.dns_rounded),
    ('React', Icons.web_rounded),
    ('Kafka', Icons.sync_alt_rounded),
    ('Docker', Icons.sailing_rounded),
    ('Redis', Icons.bolt_rounded),
    ('Flutter', Icons.flutter_dash_rounded),
    ('SQL', Icons.storage_rounded),
    ('Kubernetes', Icons.hub_rounded),
    ('JWT & OAuth', Icons.shield_rounded),
    ('TypeScript', Icons.data_object_rounded),
    ('AWS', Icons.cloud_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Scaffold(
      body: Stack(
        children: [
          // Soft gradient blobs in the background
          Positioned(top: -120, right: -80, child: _Blob(color: AppColors.primary, size: 320)),
          Positioned(bottom: -140, left: -100, child: _Blob(color: AppColors.accent, size: 300)),
          SafeArea(
            child: MaxWidth(
              maxWidth: 560,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const BrandMark(size: 36),
                        const SizedBox(width: 10),
                        Text('StackPrep', style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                      ],
                    ).animate().fadeIn(duration: 400.ms),
                    const Spacer(),
                    Wrap(
                      spacing: 8,
                      runSpacing: 10,
                      alignment: WrapAlignment.center,
                      children: [
                        for (var i = 0; i < _chips.length; i++)
                          _TechChip(label: _chips[i].$1, icon: _chips[i].$2)
                              .animate(delay: (60 * i).ms)
                              .fadeIn(duration: 400.ms)
                              .scale(begin: const Offset(0.7, 0.7), curve: Curves.easeOutBack, duration: 450.ms)
                              .then()
                              .animate(onPlay: (c) => c.repeat(reverse: true))
                              .moveY(begin: 0, end: i.isEven ? -4 : 4, duration: (1600 + i * 90).ms, curve: Curves.easeInOut),
                      ],
                    ),
                    const SizedBox(height: 40),
                    Text(
                      'Crack your next\ntech interview',
                      textAlign: TextAlign.center,
                      style: t.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800, height: 1.15),
                    ).animate().fadeIn(delay: 300.ms, duration: 500.ms).slideY(begin: 0.2, end: 0),
                    const SizedBox(height: 14),
                    Text(
                      'Questions for your stack and your level: system design, languages, frameworks and DevOps. Answers stay hidden until you want them.',
                      textAlign: TextAlign.center,
                      style: t.textTheme.bodyLarge?.copyWith(color: t.hintColor, height: 1.5),
                    ).animate().fadeIn(delay: 450.ms, duration: 500.ms),
                    const Spacer(),
                    GradientButton(
                      label: 'Get started',
                      icon: Icons.arrow_forward_rounded,
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const RoleSelectScreen(standalone: true)),
                      ),
                    ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.3, end: 0),
                    const SizedBox(height: 10),
                    TextButton(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const AuthScreen(startWithLogin: true)),
                      ),
                      child: const Text('I already have an account'),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TechChip extends StatelessWidget {
  const _TechChip({required this.label, required this.icon});
  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: t.cardColor,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: t.dividerColor),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: t.colorScheme.primary),
          const SizedBox(width: 6),
          Text(label, style: t.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  const _Blob({required this.color, required this.size});
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(colors: [color.withValues(alpha: 0.22), color.withValues(alpha: 0)]),
        ),
      );
}
