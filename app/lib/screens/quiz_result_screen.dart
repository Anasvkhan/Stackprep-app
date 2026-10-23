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
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          MaxWidth(
            maxWidth: 820,
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    for (var i = 0; i < 10; i++) _Sparkle(index: i, show: pct >= 0.7),
                    SizedBox(
                      width: 170,
                      height: 170,
                      child: TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0, end: pct),
                        duration: const Duration(milliseconds: 1200),
                        curve: Curves.easeOutCubic,
                        builder: (_, v, _) => Stack(
                          fit: StackFit.expand,
                          children: [
                            CircularProgressIndicator(
                              value: v,
                              strokeWidth: 12,
                              strokeCap: StrokeCap.round,
                              color: color,
                              backgroundColor: color.withValues(alpha: 0.12),
                            ),
                            Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text('${(v * 100).round()}%',
                                      style: t.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
                                  Text('$correct / $total correct',
                                      style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                IconBox(icon: icon, color: color, size: 64).animate().scale(
                      delay: 600.ms,
                      duration: 500.ms,
                      curve: Curves.elasticOut,
                    ),
                const SizedBox(height: 6),
                Text(headline, style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800))
                    .animate()
                    .fadeIn(delay: 700.ms),
                const SizedBox(height: 4),
                Text(sub, textAlign: TextAlign.center, style: t.textTheme.bodyMedium?.copyWith(color: t.hintColor))
                    .animate()
                    .fadeIn(delay: 800.ms),
                const SizedBox(height: 24),
                Row(
                  children: [
                    _stat(context, '$correct', 'Correct', AppColors.success, Icons.check_circle_rounded),
                    const SizedBox(width: 12),
                    _stat(context, '${total - correct}', 'Wrong', AppColors.danger, Icons.cancel_rounded),
                    const SizedBox(width: 12),
                    _stat(context, '${mins}m ${secs}s', 'Time', AppColors.primary, Icons.timer_rounded),
                  ],
                ).animate().fadeIn(delay: 900.ms).slideY(begin: 0.2, end: 0),
                const SizedBox(height: 20),
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
                const Align(alignment: Alignment.centerLeft, child: SectionHeader('Review answers')),
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
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
          child: Column(
            children: [
              Icon(icon, color: color),
              const SizedBox(height: 6),
              Text(value, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
              Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).hintColor)),
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
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Theme(
        data: t.copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
          leading: Icon(ok ? Icons.check_circle_rounded : Icons.cancel_rounded,
              color: ok ? AppColors.success : AppColors.danger),
          title: Text(question.question,
              maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
          expandedCrossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (selected != null && !ok)
              _line(context, 'Your answer', question.options[selected!], AppColors.danger),
            if (question.correctIndex != null)
              _line(context, 'Correct answer', question.options[question.correctIndex!], AppColors.success),
            const SizedBox(height: 10),
            MarkdownView(question.answer, fontSize: 14),
          ],
        ),
      ),
    );
  }

  Widget _line(BuildContext context, String label, String text, Color color) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
          child: Text.rich(TextSpan(children: [
            TextSpan(text: '$label: ', style: TextStyle(color: color, fontWeight: FontWeight.w800)),
            TextSpan(text: text),
          ])),
        ),
      );
}
