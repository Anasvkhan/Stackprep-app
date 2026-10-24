import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../widgets/common.dart';
import '../widgets/markdown_view.dart';
import 'quiz_screen.dart';

class QuizResultScreen extends StatelessWidget {
  const QuizResultScreen({
    super.key,
    required this.config,
    required this.questions,
    required this.answers,
    required this.duration,
  });

  final QuizConfig config;
  final List<Question> questions;
  final Map<int, int> answers;
  final Duration duration;

  int get correct => answers.entries.where((e) => questions[e.key].correctIndex == e.value).length;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final total = questions.length;
    final pct = total == 0 ? 0.0 : correct / total;
    final (icon, headline, sub) = switch (pct) {
      >= 0.9 => (Icons.emoji_events_rounded, 'Outstanding!', 'You are interview ready on this one.'),
      >= 0.7 => (Icons.celebration_rounded, 'Great job!', 'Solid work. Review the misses and you are set.'),
      >= 0.5 => (Icons.trending_up_rounded, 'Good effort!', 'Keep practicing, you are getting there.'),
      _ => (Icons.menu_book_rounded, 'Keep learning!', 'Review the explanations and try again.'),
    };
    final color = pct >= 0.7 ? AppColors.success : (pct >= 0.5 ? AppColors.warning : AppColors.danger);
    final mins = duration.inMinutes;
    final secs = duration.inSeconds % 60;

    return Scaffold(
      appBar: AppBar(title: const Text('Results'), automaticallyImplyLeading: false),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
        children: [
          MaxWidth(
            maxWidth: 820,
            child: Column(
              children: [
                AppCard(
                  radius: 24,
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(headline,
                                style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                          ),
                          const SizedBox(width: 8),
                          Icon(icon, color: color, size: 26)
                              .animate()
                              .scale(delay: 600.ms, duration: 500.ms, curve: Curves.elasticOut),
                        ],
                      ).animate().fadeIn(delay: 300.ms),
                      const SizedBox(height: 4),
                      Text(sub,
                              textAlign: TextAlign.center,
                              style: t.textTheme.bodyMedium?.copyWith(color: AppColors.muted(context)))
                          .animate()
                          .fadeIn(delay: 400.ms),
                      const SizedBox(height: 24),
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          for (var i = 0; i < 10; i++) _Sparkle(index: i, show: pct >= 0.7),
                          ProgressRing(
                            value: pct,
                            color: color,
                            size: 170,
                            stroke: 12,
                            duration: const Duration(milliseconds: 1200),
                            label: (v) => Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('${(v * 100).round()}%',
                                    style: t.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
                                Text('$correct / $total correct',
                                    style: AppTheme.mono(context, size: 11.5, color: AppColors.muted(context))),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _stat(context, '$correct', 'Correct', AppColors.success, Icons.check_rounded),
                    const SizedBox(width: 10),
                    _stat(context, '${total - correct}', 'Wrong', AppColors.danger, Icons.close_rounded),
                    const SizedBox(width: 10),
                    _stat(context, '${mins}m ${secs}s', 'Time', AppColors.primary, Icons.timer_outlined),
                  ],
                ).animate().fadeIn(delay: 700.ms).slideY(begin: 0.2, end: 0),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.home_rounded),
                        label: const Text('Done'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GradientButton(
                        label: 'Practice again',
                        icon: Icons.refresh_rounded,
                        onPressed: () => Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => QuizScreen(config: config)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                SectionHeader('Review answers', trailing: CountPill('$total questions')),
                for (var i = 0; i < questions.length; i++)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _ReviewTile(index: i, question: questions[i], selected: answers[i]).entrance(i),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(BuildContext context, String value, String label, Color color, IconData icon) => Expanded(
        child: AppCard(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          child: Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(height: 8),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(value,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
              ),
              MonoCaption(label),
            ],
          ),
        ),
      );
}

class _Sparkle extends StatelessWidget {
  const _Sparkle({required this.index, required this.show});
  final int index;
  final bool show;

  @override
  Widget build(BuildContext context) {
    if (!show) return const SizedBox.shrink();
    final angle = index * (2 * pi / 10);
    const icons = [Icons.auto_awesome_rounded, Icons.star_rounded, Icons.circle, Icons.star_border_rounded];
    final colors = [AppColors.warning, AppColors.primary, AppColors.accent, AppColors.success];
    return Icon(icons[index % icons.length], size: index.isEven ? 22 : 14, color: colors[index % colors.length])
        .animate(delay: 900.ms)
        .fadeIn(duration: 200.ms)
        .move(end: Offset(cos(angle) * 120, sin(angle) * 120), duration: 900.ms, curve: Curves.easeOutCubic)
        .then()
        .fadeOut(duration: 500.ms);
  }
}

class _ReviewTile extends StatelessWidget {
  const _ReviewTile({required this.index, required this.question, required this.selected});
  final int index;
  final Question question;
  final int? selected;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final ok = selected == question.correctIndex;
    final c = ok ? AppColors.success : AppColors.danger;
    return AppCard(
      padding: EdgeInsets.zero,
      child: Theme(
        data: t.copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
          leading: Icon(ok ? Icons.check_circle_outline_rounded : Icons.cancel_outlined, color: c),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MonoCaption('Q${index + 1} · ${ok ? 'Correct' : 'Incorrect'}', color: c),
              const SizedBox(height: 2),
              Text(question.question,
                  maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
            ],
          ),
          expandedCrossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (selected != null)
              _box(context, 'Your answer', question.options[selected!], c, strike: !ok, icon: ok ? Icons.check_rounded : Icons.close_rounded),
            if (!ok && question.correctIndex != null)
              _box(context, 'Correct answer', question.options[question.correctIndex!], AppColors.success, icon: Icons.check_rounded),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.lightbulb_outline_rounded, size: 14, color: AppColors.primaryText(context)),
                      const SizedBox(width: 6),
                      MonoCaption('Explanation', color: AppColors.primaryText(context)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  MarkdownView(question.answer, fontSize: 14),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _box(BuildContext context, String label, String text, Color color, {bool strike = false, IconData? icon}) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(12)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (icon != null) ...[Icon(icon, size: 14, color: color), const SizedBox(width: 6)],
                  MonoCaption(label, color: color),
                ],
              ),
              const SizedBox(height: 4),
              Text(text,
                  style: TextStyle(
                    height: 1.4,
                    decoration: strike ? TextDecoration.lineThrough : null,
                    decorationColor: color,
                  )),
            ],
          ),
        ),
      );
}
