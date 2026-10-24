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
    child: ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxWidth),
      child: child,
    ),
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
    return Semantics(
      button: widget.onTap != null,
      child: GestureDetector(
        onTapDown: (_) => _set(true),
        onTapUp: (_) => _set(false),
        onTapCancel: () => _set(false),
        onTap: widget.onTap,
        child: MouseRegion(
          cursor: widget.onTap != null ? SystemMouseCursors.click : MouseCursor.defer,
          child: AnimatedScale(
            scale: _down ? 0.98 : 1,
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeOut,
            child: widget.child,
          ),
        ),
      ),
    );
  }
}

/// Surface level 1: white card, hairline border and a faint violet ambient shadow.
class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.color,
    this.borderColor,
    this.radius = 16,
  });
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? color;
  final Color? borderColor;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final card = Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: color ?? t.cardColor,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor ?? t.dividerColor),
        boxShadow: AppColors.isDark(context)
            ? null
            : [
                BoxShadow(color: AppColors.primary.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
                BoxShadow(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.05),
                  blurRadius: 3,
                  offset: const Offset(0, 1),
                ),
              ],
      ),
      child: Material(
        type: MaterialType.transparency,
        child: Padding(padding: padding, child: child),
      ),
    );
    return onTap == null ? card : Pressable(onTap: onTap, borderRadius: radius, child: card);
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
      borderRadius: 16,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: enabled || loading ? 1 : 0.5,
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            gradient: AppColors.buttonGradient,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(color: AppColors.primary.withValues(alpha: 0.28), blurRadius: 16, offset: const Offset(0, 6)),
            ],
          ),
          alignment: Alignment.center,
          child: loading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (icon != null) ...[Icon(icon, color: Colors.white, size: 20), const SizedBox(width: 8)],
                    Flexible(
                      child: Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall
                            ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

/// Text color for a level badge (amber needs a darker shade on light surfaces).
Color levelTextColor(BuildContext context, int level) {
  if (level == 2 && !AppColors.isDark(context)) return const Color(0xFFD97706);
  return AppColors.levelColors[level] ?? AppColors.primary;
}

class LevelBadge extends StatelessWidget {
  const LevelBadge(this.level, {super.key});
  final int level;

  @override
  Widget build(BuildContext context) {
    final label = switch (level) {
      1 => 'Junior',
      2 => 'Mid Level',
      3 => 'Senior',
      _ => '',
    };
    return Tag(label: label, color: levelTextColor(context, level), dot: true);
  }
}

/// Micro-badge: monospace pill with a tinted background and border.
class Tag extends StatelessWidget {
  const Tag({super.key, required this.label, required this.color, this.icon, this.dot = false, this.uppercase = false});
  final String label;
  final Color color;
  final IconData? icon;
  final bool dot;
  final bool uppercase;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.10),
      borderRadius: BorderRadius.circular(30),
      border: Border.all(color: color.withValues(alpha: 0.25)),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (dot) ...[
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
        ],
        if (icon != null) ...[Icon(icon, size: 12, color: color), const SizedBox(width: 4)],
        Text(
          uppercase ? label.toUpperCase() : label,
          style: AppTheme.mono(context, size: 11, weight: FontWeight.w600, color: color, height: 1.3),
        ),
      ],
    ),
  );
}

class TypeBadge extends StatelessWidget {
  const TypeBadge(this.type, {super.key});
  final String type;

  @override
  Widget build(BuildContext context) => switch (type) {
    'mcq' => const Tag(label: 'MCQ', color: Color(0xFF3B82F6)),
    'scenario' => const Tag(label: 'Scenario', color: Color(0xFFA855F7)),
    _ => const Tag(label: 'Q&A', color: Color(0xFF0D9488)),
  };
}

/// Small monospace count pill, e.g. "3 tracks" or "6 SAVED".
class CountPill extends StatelessWidget {
  const CountPill(this.label, {super.key, this.color, this.icon});
  final String label;
  final Color? color;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.primaryText(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: (color ?? AppColors.primary).withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 13, color: c), const SizedBox(width: 4)],
          Text(
            label,
            style: AppTheme.mono(context, size: 11, weight: FontWeight.w600, color: c, height: 1.3),
          ),
        ],
      ),
    );
  }
}

/// Uppercase monospace caption used for small section labels.
class MonoCaption extends StatelessWidget {
  const MonoCaption(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) => Text(
    text.toUpperCase(),
    style: AppTheme.mono(
      context,
      size: 11,
      weight: FontWeight.w600,
      letterSpacing: 0.6,
      color: color ?? AppColors.muted(context),
    ),
  );
}

/// Rounded square icon with a tinted background.
class IconBox extends StatelessWidget {
  const IconBox({super.key, required this.icon, required this.color, this.size = 44, this.filled = false});
  final IconData icon;
  final Color color;
  final double size;
  final bool filled;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: filled ? color : color.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(size * 0.3),
    ),
    child: Icon(icon, color: filled ? Colors.white : color, size: size * 0.5),
  );
}

class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.action, this.onAction, this.trailing});
  final String title;
  final String? action;
  final VoidCallback? onAction;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(
      children: [
        Flexible(
          child: Text(
            title,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700, fontSize: 18),
          ),
        ),
        if (trailing != null) ...[const SizedBox(width: 10), trailing!],
        const Spacer(),
        if (action != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
            child: Text(action!, style: AppTheme.mono(context, size: 12, weight: FontWeight.w600)),
          ),
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
    // Decorative: the percentage is always shown as text nearby, and the bar's own
    // "progressbar" role would otherwise hide the "button" role of tappable cards.
    return ExcludeSemantics(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(height),
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: value.clamp(0, 1)),
          duration: const Duration(milliseconds: 700),
          curve: Curves.easeOutCubic,
          builder: (_, v, _) =>
              LinearProgressIndicator(value: v, minHeight: height, color: c, backgroundColor: c.withValues(alpha: 0.12)),
        ),
      ),
    );
  }
}

/// Circular progress ring with the percentage in the middle.
class ProgressRing extends StatelessWidget {
  const ProgressRing({
    super.key,
    required this.value,
    required this.color,
    this.size = 64,
    this.stroke = 6,
    this.label,
    this.duration = const Duration(milliseconds: 900),
  });
  final double value;
  final Color color;
  final double size;
  final double stroke;
  final Widget Function(double v)? label;
  final Duration duration;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: size,
    height: size,
    child: TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: value.clamp(0, 1)),
      duration: duration,
      curve: Curves.easeOutCubic,
      builder: (_, v, _) => Stack(
        fit: StackFit.expand,
        children: [
          CircularProgressIndicator(
            value: v,
            strokeWidth: stroke,
            color: color,
            backgroundColor: color.withValues(alpha: 0.12),
            strokeCap: StrokeCap.round,
          ),
          Center(
            child:
                label?.call(v) ??
                Text(
                  '${(v * 100).round()}%',
                  style: AppTheme.mono(context, size: size * 0.2, weight: FontWeight.w700, height: 1.2),
                ),
          ),
        ],
      ),
    ),
  );
}

/// Pill-style segmented control on a tonal track (My stack / All tracks, levels, theme).
class PillSegmented<T> extends StatelessWidget {
  const PillSegmented({super.key, required this.segments, required this.selected, required this.onChanged});
  final List<PillSegment<T>> segments;
  final T selected;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final primary = t.colorScheme.primary;
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: AppColors.surface2(context), borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          for (final s in segments)
            Expanded(
              child: Semantics(
                button: true,
                selected: s.value == selected,
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onChanged(s.value),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOut,
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                    decoration: BoxDecoration(
                      color: s.value == selected ? t.cardColor : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: s.value == selected && !AppColors.isDark(context)
                          ? [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.06),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (s.icon != null) ...[
                              Icon(s.icon, size: 17, color: s.value == selected ? primary : AppColors.muted(context)),
                              if (s.label.isNotEmpty) const SizedBox(width: 6),
                            ],
                            if (s.label.isNotEmpty)
                              Flexible(
                                child: Text(
                                  s.label,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: t.textTheme.labelLarge?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: s.value == selected ? primary : AppColors.muted(context),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        if (s.subtitle != null)
                          Text(
                            s.subtitle!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTheme.mono(context, size: 10, color: AppColors.muted(context), height: 1.4),
                          ),
                      ],
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

class PillSegment<T> {
  const PillSegment(this.value, this.label, {this.icon, this.subtitle});
  final T value;
  final String label;
  final IconData? icon;
  final String? subtitle;
}

/// Circle with the user's initials.
class InitialsAvatar extends StatelessWidget {
  const InitialsAvatar({super.key, required this.name, this.size = 36, this.inverted = false});
  final String name;
  final double size;
  final bool inverted;

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().split(RegExp(r'\s+')).take(2).map((p) => p.isEmpty ? '' : p[0].toUpperCase()).join();
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: inverted ? Colors.white : null,
        gradient: inverted ? null : AppColors.gradient,
      ),
      child: Text(
        initials.isEmpty ? '?' : initials,
        style: TextStyle(
          color: inverted ? AppColors.primary : Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: size * 0.38,
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
    this.onAction,
    this.actionIcon,
  });
  final IconData icon;
  final String title;
  final String? message;
  final String? action;
  final VoidCallback? onAction;
  final IconData? actionIcon;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(color: t.colorScheme.primary.withValues(alpha: 0.10), shape: BoxShape.circle),
                child: Icon(icon, color: t.colorScheme.primary, size: 32),
              ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
              const SizedBox(height: 18),
              Text(
                title,
                textAlign: TextAlign.center,
                style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              if (message != null) ...[
                const SizedBox(height: 6),
                Text(
                  message!,
                  textAlign: TextAlign.center,
                  style: t.textTheme.bodyMedium?.copyWith(color: AppColors.muted(context), height: 1.5),
                ),
              ],
              if (action != null) ...[
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: onAction,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(0, 46),
                    padding: const EdgeInsets.symmetric(horizontal: 22),
                  ),
                  icon: Icon(actionIcon ?? Icons.arrow_forward_rounded, size: 18),
                  label: Text(action!),
                ),
              ],
            ],
          ),
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
    icon: Icons.cloud_off_rounded,
    title: 'Oops, something went wrong',
    message: message,
    action: onRetry == null ? null : 'Try again',
    actionIcon: Icons.refresh_rounded,
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
    final c = AppColors.surface2(context);
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: count,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (_, i) =>
          Container(
                height: height,
                decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(16)),
              )
              .animate(onPlay: (ctl) => ctl.repeat(reverse: true))
              .fade(begin: 0.45, end: 1, duration: 800.ms, delay: (i * 80).ms),
    );
  }
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message), backgroundColor: error ? AppColors.danger : null));
}

/// Fade + slide-up entrance for list items, staggered by index.
extension EntranceAnimation on Widget {
  Widget entrance(int index) => animate()
      .fadeIn(duration: 350.ms, delay: (40 * index.clamp(0, 12)).ms)
      .slideY(begin: 0.08, end: 0, duration: 350.ms, delay: (40 * index.clamp(0, 12)).ms, curve: Curves.easeOutCubic);
}
