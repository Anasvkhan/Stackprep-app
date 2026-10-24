import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../screens/shell.dart';
import '../state/app_state.dart';
import 'common.dart';

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
        gradient: inverted ? null : AppColors.buttonGradient,
        borderRadius: BorderRadius.circular(size * 0.28),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withValues(alpha: 0.18), blurRadius: size * 0.3, offset: Offset(0, size * 0.1)),
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

/// Logo + "StackPrep" wordmark.
class BrandTitle extends StatelessWidget {
  const BrandTitle({super.key, this.subtitle, this.size = 34});
  final String? subtitle;
  final double size;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        BrandMark(size: size),
        const SizedBox(width: 10),
        Flexible(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('StackPrep',
                  style: t.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: t.colorScheme.primary,
                    height: 1.15,
                  )),
              if (subtitle != null)
                Text(subtitle!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: t.textTheme.bodySmall?.copyWith(color: AppColors.muted(context), height: 1.2)),
            ],
          ),
        ),
      ],
    );
  }
}

/// Top bar for the four main tabs: brand on the left, avatar (opens Profile) on the right.
class BrandAppBar extends StatelessWidget implements PreferredSizeWidget {
  const BrandAppBar({super.key, required this.subtitle, this.actions = const []});
  final String subtitle;
  final List<Widget> actions;

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final name = context.select<AppState, String>((s) => s.user?.name ?? '');
    return AppBar(
      toolbarHeight: 64,
      automaticallyImplyLeading: false,
      titleSpacing: 16,
      title: BrandTitle(subtitle: subtitle),
      actions: [
        ...actions,
        Padding(
          padding: const EdgeInsets.only(right: 16, left: 4),
          child: Tooltip(
            message: 'Profile',
            child: InkResponse(
              onTap: () => Shell.goToTab(context, 3),
              radius: 22,
              child: InitialsAvatar(name: name, size: 36),
            ),
          ),
        ),
      ],
    );
  }
}
