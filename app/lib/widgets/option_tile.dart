import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/theme.dart';
import 'common.dart';

enum OptionState { idle, correct, wrong, dimmed }

/// One MCQ option. Animates into green (correct) or red with a shake (wrong).
class OptionTile extends StatelessWidget {
  const OptionTile({super.key, required this.index, required this.text, required this.state, this.onTap});
  final int index;
  final String text;
  final OptionState state;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final letter = String.fromCharCode(65 + index);
    final (border, bg, badgeBg, badgeFg, icon, caption) = switch (state) {
      OptionState.correct => (
          AppColors.success,
          AppColors.success.withValues(alpha: 0.10),
          AppColors.success,
          Colors.white,
          Icons.check_rounded,
          'Correct answer',
        ),
      OptionState.wrong => (
          AppColors.danger,
          AppColors.danger.withValues(alpha: 0.10),
          AppColors.danger,
          Colors.white,
          Icons.close_rounded,
          'Your pick',
        ),
      _ => (
          t.dividerColor,
          t.cardColor,
          AppColors.surface2(context),
          AppColors.primaryText(context),
          null,
          null,
        ),
    };

    Widget tile = Pressable(
      onTap: onTap,
      borderRadius: 16,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 250),
        opacity: state == OptionState.dimmed ? 0.55 : 1,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: border, width: state == OptionState.idle || state == OptionState.dimmed ? 1 : 1.8),
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: 30,
                height: 30,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: badgeBg, shape: BoxShape.circle),
                child: icon != null
                    ? Icon(icon, color: badgeFg, size: 17).animate().scale(curve: Curves.easeOutBack, duration: 300.ms)
                    : Text(letter, style: AppTheme.mono(context, size: 13, weight: FontWeight.w700, color: badgeFg)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (caption != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(caption.toUpperCase(),
                            style: AppTheme.mono(context, size: 10.5, weight: FontWeight.w700, color: border, letterSpacing: 0.5)),
                      ),
                    Text(text, style: t.textTheme.bodyLarge?.copyWith(height: 1.4, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );

    // Stable id for UI tests (Maestro: id: option_0).
    tile = Semantics(identifier: 'option_$index', container: true, child: tile);

    if (state == OptionState.wrong) {
      tile = tile.animate().shakeX(hz: 5, amount: 5, duration: 400.ms);
    } else if (state == OptionState.correct) {
      tile = tile.animate().scaleXY(begin: 1, end: 1.02, duration: 150.ms).then().scaleXY(end: 1 / 1.02, duration: 150.ms);
    }
    return tile;
  }
}
