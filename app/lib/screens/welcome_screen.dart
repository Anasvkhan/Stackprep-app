import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/theme.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';
import 'auth_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  static const _chips = [
    ('System Design', Icons.account_tree_rounded),
    ('Docker', Icons.sailing_rounded),
    ('Node.js', Icons.dns_rounded),
    ('TypeScript', Icons.data_object_rounded),
    ('React', Icons.web_rounded),
    ('Redis', Icons.bolt_rounded),
    ('Kafka', Icons.sync_alt_rounded),
    ('Flutter', Icons.flutter_dash_rounded),
    ('SQL', Icons.storage_rounded),
    ('Kubernetes', Icons.hub_rounded),
    ('JWT & OAuth', Icons.shield_rounded),
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
            // Fills the screen on tall devices and scrolls on short ones. No intrinsic
            // sizing or Spacer, so it can never overflow.
            child: LayoutBuilder(
              builder: (context, viewport) => SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: viewport.maxHeight),
                  child: MaxWidth(
                    maxWidth: 560,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(minHeight: viewport.maxHeight),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 16),
                                const Center(child: BrandTitle(size: 36)).animate().fadeIn(duration: 400.ms),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  child: Wrap(
                                    spacing: 8,
                                    runSpacing: 10,
                                    alignment: WrapAlignment.center,
                                    children: [
                                      for (var i = 0; i < _chips.length; i++)
                                        _TechChip(label: _chips[i].$1, icon: _chips[i].$2, highlighted: i == 4)
                                            .animate(delay: (60 * i).ms)
                                            .fadeIn(duration: 400.ms)
                                            .scale(
                                              begin: const Offset(0.7, 0.7),
                                              curve: Curves.easeOutBack,
                                              duration: 450.ms,
                                            )
                                            .then()
                                            .animate(onPlay: (c) => c.repeat(reverse: true))
                                            .moveY(
                                              begin: 0,
                                              end: i.isEven ? -3 : 3,
                                              duration: (1600 + i * 90).ms,
                                              curve: Curves.easeInOut,
                                            ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),
                                const _PreviewCard()
                                    .animate()
                                    .fadeIn(delay: 250.ms, duration: 500.ms)
                                    .slideY(begin: 0.1, end: 0),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 28),
                                Text(
                                  'Crack your next tech interview',
                                  style: t.textTheme.headlineMedium?.copyWith(
                                    fontWeight: FontWeight.w800,
                                    height: 1.15,
                                    letterSpacing: -0.5,
                                  ),
                                ).animate().fadeIn(delay: 300.ms, duration: 500.ms).slideY(begin: 0.2, end: 0),
                                const SizedBox(height: 12),
                                Text(
                                  'Questions for your stack and your level: system design, languages, frameworks and DevOps. Answers stay hidden until you want them.',
                                  style: t.textTheme.bodyLarge?.copyWith(color: AppColors.muted(context), height: 1.5),
                                ).animate().fadeIn(delay: 450.ms, duration: 500.ms),
                                const SizedBox(height: 28),
                                GradientButton(
                                  label: 'Get started',
                                  icon: Icons.arrow_forward_rounded,
                                  onPressed: () =>
                                      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AuthScreen())),
                                ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.3, end: 0),
                                const SizedBox(height: 8),
                                Center(
                                  child: TextButton(
                                    onPressed: () => Navigator.of(
                                      context,
                                    ).push(MaterialPageRoute(builder: (_) => const AuthScreen(startWithLogin: true))),
                                    child: const Text('I already have an account'),
                                  ),
                                ),
                                const SizedBox(height: 12),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
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
  const _TechChip({required this.label, required this.icon, this.highlighted = false});
  final String label;
  final IconData icon;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final fg = highlighted ? Colors.white : AppColors.primaryText(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: highlighted ? AppColors.primary : t.cardColor,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: highlighted ? AppColors.primary : t.dividerColor),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: highlighted ? Colors.white : t.colorScheme.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTheme.mono(context, size: 12, weight: FontWeight.w600, color: fg, height: 1.3),
          ),
        ],
      ),
    );
  }
}

/// Decorative "terminal" card showing that answers stay hidden until revealed.
class _PreviewCard extends StatelessWidget {
  const _PreviewCard();

  @override
  Widget build(BuildContext context) {
    final muted = AppColors.muted(context);
    Widget dot(Color c) => Container(
      width: 9,
      height: 9,
      margin: const EdgeInsets.only(right: 5),
      decoration: BoxDecoration(color: c, shape: BoxShape.circle),
    );
    return AppCard(
      radius: 20,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              dot(AppColors.danger),
              dot(AppColors.warning),
              dot(AppColors.accent),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'interview_sim.sh',
                  overflow: TextOverflow.ellipsis,
                  style: AppTheme.mono(context, size: 12, color: muted),
                ),
              ),
              const CountPill('Ready'),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppColors.surface2(context), borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        'Design a rate limiter for a public API',
                        style: AppTheme.mono(context, size: 13, weight: FontWeight.w600),
                      ),
                    ),
                    Icon(Icons.lock_rounded, size: 18, color: Theme.of(context).colorScheme.primary),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Icon(Icons.visibility_off_outlined, size: 15, color: muted),
                    const SizedBox(width: 6),
                    Text('Tap to reveal answer', style: TextStyle(color: muted, fontSize: 12.5)),
                  ],
                ),
              ],
            ),
          ),
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
      gradient: RadialGradient(colors: [color.withValues(alpha: 0.18), color.withValues(alpha: 0)]),
    ),
  );
}
