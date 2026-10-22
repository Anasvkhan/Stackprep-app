import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/theme.dart';

/// Maps icon names coming from the API to Material icons.
IconData iconFor(String? name) => switch (name) {
      'account_tree' => Icons.account_tree_rounded,
      'hub' => Icons.hub_rounded,
      'architecture' => Icons.architecture_rounded,
      'api' => Icons.api_rounded,
      'web' => Icons.web_rounded,
      'dns' => Icons.dns_rounded,
      'layers' => Icons.layers_rounded,
      'code' => Icons.code_rounded,
      'smartphone' => Icons.smartphone_rounded,
      'cloud' => Icons.cloud_rounded,
      'javascript' => Icons.javascript_rounded,
      'terminal' => Icons.terminal_rounded,
      'storage' => Icons.storage_rounded,
      'database' => Icons.storage_rounded,
      'bolt' => Icons.bolt_rounded,
      'security' => Icons.security_rounded,
      'shield' => Icons.shield_rounded,
      'speed' => Icons.speed_rounded,
      'memory' => Icons.memory_rounded,
      'lan' => Icons.lan_rounded,
      'widgets' => Icons.widgets_rounded,
      'view_quilt' => Icons.view_quilt_rounded,
      'data_object' => Icons.data_object_rounded,
      'coffee' => Icons.coffee_rounded,
      'pets' => Icons.pets_rounded,
      'bug' => Icons.bug_report_rounded,
      'merge' => Icons.merge_type_rounded,
      'inventory' => Icons.inventory_2_rounded,
      'sailing' => Icons.sailing_rounded,
      'loop' => Icons.all_inclusive_rounded,
      'settings' => Icons.settings_suggest_rounded,
      'schema' => Icons.schema_rounded,
      'html' => Icons.html_rounded,
      'css' => Icons.css_rounded,
      'psychology' => Icons.psychology_rounded,
      'insights' => Icons.insights_rounded,
      'rocket' => Icons.rocket_launch_rounded,
      'flutter' => Icons.flutter_dash_rounded,
      'android' => Icons.android_rounded,
      'apple' => Icons.apple_rounded,
      'public' => Icons.public_rounded,
      'grid' => Icons.grid_view_rounded,
      'functions' => Icons.functions_rounded,
      'extension' => Icons.extension_rounded,
      'sync' => Icons.sync_alt_rounded,
      'school' => Icons.school_rounded,
      _ => Icons.code_rounded,
    };

/// Centers content and limits its width on large screens.
class MaxWidth extends StatelessWidget {
  const MaxWidth({super.key, required this.child, this.maxWidth = 1100});
  final Widget child;
  final double maxWidth;

  @override
  Widget build(BuildContext context) => Center(
        heightFactor: 1,
        child: ConstrainedBox(constraints: BoxConstraints(maxWidth: maxWidth), child: child),
      );
}

/// Scales down slightly while pressed. Gives every tappable card a tactile feel.
class Pressable extends StatefulWidget {
  const Pressable({super.key, required this.child, this.onTap, this.borderRadius = 18});
  final Widget child;
  final VoidCallback? onTap;
  final double borderRadius;

  @override
  State<Pressable> createState() => _PressableState();
}

class _PressableState extends State<Pressable> {
  bool _down = false;

  void _set(bool v) {
    if (widget.onTap != null && _down != v) setState(() => _down = v);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _set(true),
      onTapUp: (_) => _set(false),
      onTapCancel: () => _set(false),
      onTap: widget.onTap,
      child: MouseRegion(
        cursor: widget.onTap != null ? SystemMouseCursors.click : MouseCursor.defer,
        child: AnimatedScale(
          scale: _down ? 0.97 : 1,
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          child: widget.child,
        ),
      ),
    );
  }
}

class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.onTap, this.color});
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final card = Card(
      color: color,
      clipBehavior: Clip.antiAlias,
      child: Padding(padding: padding, child: child),
    );
    return onTap == null ? card : Pressable(onTap: onTap, child: card);
  }
}

class GradientButton extends StatelessWidget {
  const GradientButton({super.key, required this.label, this.icon, this.onPressed, this.loading = false});
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !loading;
    return Pressable(
      onTap: enabled ? onPressed : null,
      borderRadius: 14,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: enabled || loading ? 1 : 0.5,
        child: Container(
          height: 52,
          decoration: BoxDecoration(
            gradient: AppColors.gradient,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(color: AppColors.primary.withValues(alpha: 0.35), blurRadius: 18, offset: const Offset(0, 8)),
            ],
          ),
          alignment: Alignment.center,
          child: loading
              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (icon != null) ...[Icon(icon, color: Colors.white, size: 20), const SizedBox(width: 8)],
                    Text(label,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.w700)),
                  ],
                ),
        ),
      ),
    );
  }
}

class LevelBadge extends StatelessWidget {
  const LevelBadge(this.level, {super.key});
  final int level;

  @override
  Widget build(BuildContext context) {
    final c = AppColors.levelColors[level] ?? AppColors.primary;
    final label = switch (level) { 1 => 'Junior', 2 => 'Mid', 3 => 'Senior', _ => '' };
    return Tag(label: label, color: c);
  }
}

class Tag extends StatelessWidget {
  const Tag({super.key, required this.label, required this.color, this.icon});
  final String label;
  final Color color;
  final IconData? icon;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[Icon(icon, size: 12, color: color), const SizedBox(width: 4)],
            Text(label, style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.w700)),
          ],
        ),
      );
}

class TypeBadge extends StatelessWidget {
  const TypeBadge(this.type, {super.key});
  final String type;

  @override
  Widget build(BuildContext context) => switch (type) {
        'mcq' => const Tag(label: 'MCQ', color: Color(0xFF3B82F6), icon: Icons.checklist_rounded),
        'scenario' => const Tag(label: 'Scenario', color: Color(0xFFA855F7), icon: Icons.lightbulb_rounded),
        _ => const Tag(label: 'Q&A', color: Color(0xFF0EA5E9), icon: Icons.forum_rounded),
      };
}

/// Rounded square icon with a tinted background.
class IconBox extends StatelessWidget {
  const IconBox({super.key, required this.icon, required this.color, this.size = 44});
  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(size * 0.3),
        ),
        child: Icon(icon, color: color, size: size * 0.52),
      );
}

class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.action, this.onAction});
  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            Expanded(
              child: Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
            ),
            if (action != null) TextButton(onPressed: onAction, child: Text(action!)),
          ],
        ),
      );
}

class ProgressBar extends StatelessWidget {
  const ProgressBar({super.key, required this.value, this.color, this.height = 6});
  final double value;
  final Color? color;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = color ?? Theme.of(context).colorScheme.primary;
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: value.clamp(0, 1)),
        duration: const Duration(milliseconds: 700),
        curve: Curves.easeOutCubic,
        builder: (_, v, _) => LinearProgressIndicator(
          value: v,
          minHeight: height,
          color: c,
          backgroundColor: c.withValues(alpha: 0.12),
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, this.message, this.action, this.onAction});
  final IconData icon;
  final String title;
  final String? message;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconBox(icon: icon, color: t.colorScheme.primary, size: 72)
                .animate()
                .scale(duration: 400.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 20),
            Text(title, textAlign: TextAlign.center, style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(message!, textAlign: TextAlign.center, style: t.textTheme.bodyMedium?.copyWith(color: t.hintColor)),
            ],
            if (action != null) ...[
              const SizedBox(height: 20),
              FilledButton(onPressed: onAction, child: Text(action!)),
            ],
          ],
        ),
      ),
    );
  }
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.message, this.onRetry});
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) => EmptyState(
        icon: Icons.wifi_off_rounded,
        title: 'Oops, something went wrong',
        message: message,
        action: onRetry == null ? null : 'Try again',
        onAction: onRetry,
      );
}

/// Pulsing placeholder blocks while content loads.
class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, this.count = 6, this.height = 76});
  final int count;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = Theme.of(context).dividerColor;
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: count,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, i) => Container(
        height: height,
        decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(18)),
      )
          .animate(onPlay: (ctl) => ctl.repeat(reverse: true))
          .fade(begin: 0.45, end: 1, duration: 800.ms, delay: (i * 80).ms),
    );
  }
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(message),
      backgroundColor: error ? AppColors.danger : null,
    ));
}

/// Fade + slide-up entrance for list items, staggered by index.
extension EntranceAnimation on Widget {
  Widget entrance(int index) => animate()
      .fadeIn(duration: 350.ms, delay: (40 * index.clamp(0, 12)).ms)
      .slideY(begin: 0.08, end: 0, duration: 350.ms, delay: (40 * index.clamp(0, 12)).ms, curve: Curves.easeOutCubic);
}
