import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';
import '../widgets/markdown_view.dart';
import '../widgets/option_tile.dart';

/// Swipeable study mode. Answers stay hidden until the user attempts or reveals them.
class QuestionViewerScreen extends StatefulWidget {
  const QuestionViewerScreen({super.key, required this.questions, this.initialIndex = 0});
  final List<Question> questions;
  final int initialIndex;

  @override
  State<QuestionViewerScreen> createState() => _QuestionViewerScreenState();
}

class _QuestionViewerScreenState extends State<QuestionViewerScreen> {
  late final PageController _pages = PageController(initialPage: widget.initialIndex);
  late int _index = widget.initialIndex;
  bool _changed = false;

  Question get _current => widget.questions[_index];

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  Future<void> _toggleBookmark() async {
    final q = _current;
    setState(() => q.bookmarked = !q.bookmarked);
    try {
      q.bookmarked = await Api.toggleBookmark(q.id);
      _changed = true;
      if (mounted) showSnack(context, q.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } on ApiException catch (e) {
      setState(() => q.bookmarked = !q.bookmarked);
      if (mounted) showSnack(context, e.message, error: true);
    }
  }

  void _go(int delta) {
    final next = _index + delta;
    if (next < 0 || next >= widget.questions.length) return;
    _pages.animateToPage(next, duration: const Duration(milliseconds: 350), curve: Curves.easeOutCubic);
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.questions.length;
    return PopScope(
      onPopInvokedWithResult: (didPop, _) {
        if (didPop && _changed) context.read<AppState>().bumpData();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Question ${_index + 1} of $total'),
          actions: [
            IconButton(
              tooltip: 'Bookmark',
              onPressed: _toggleBookmark,
              icon: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                transitionBuilder: (c, a) => ScaleTransition(scale: a, child: c),
                child: Icon(
                  _current.bookmarked ? Icons.bookmark_rounded : Icons.bookmark_outline_rounded,
                  key: ValueKey(_current.bookmarked),
                  color: _current.bookmarked ? Theme.of(context).colorScheme.primary : null,
                ),
              ),
            ),
            const SizedBox(width: 4),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(4),
            child: ProgressBar(value: (_index + 1) / total, height: 3),
          ),
        ),
        body: PageView.builder(
          controller: _pages,
          itemCount: total,
          onPageChanged: (i) => setState(() => _index = i),
          itemBuilder: (_, i) => QuestionPage(
            key: ValueKey(widget.questions[i].id),
            question: widget.questions[i],
            onAttempted: () => _changed = true,
          ),
        ),
        bottomNavigationBar: SafeArea(
          child: MaxWidth(
            maxWidth: 820,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _index == 0 ? null : () => _go(-1),
                      icon: const Icon(Icons.arrow_back_rounded),
                      label: const Text('Previous'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _index == total - 1 ? () => Navigator.of(context).maybePop() : () => _go(1),
                      icon: Icon(_index == total - 1 ? Icons.done_all_rounded : Icons.arrow_forward_rounded),
                      label: Text(_index == total - 1 ? 'Finish' : 'Next'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A single question with MCQ options or a hidden model answer.
class QuestionPage extends StatefulWidget {
  const QuestionPage({super.key, required this.question, this.onAttempted});
  final Question question;
  final VoidCallback? onAttempted;

  @override
  State<QuestionPage> createState() => _QuestionPageState();
}

class _QuestionPageState extends State<QuestionPage> with AutomaticKeepAliveClientMixin {
  int? _selected;
  bool _revealed = false;
  bool? _knew;

  Question get q => widget.question;

  @override
  bool get wantKeepAlive => true;

  Future<void> _selectOption(int i) async {
    if (_selected != null) return;
    setState(() {
      _selected = i;
      _revealed = true;
      q.status = i == q.correctIndex ? 'correct' : 'wrong';
    });
    widget.onAttempted?.call();
    try {
      await Api.attemptMcq(q.id, i);
    } catch (_) {}
  }

  Future<void> _selfAssess(bool knew) async {
    setState(() {
      _knew = knew;
      q.status = knew ? 'correct' : 'wrong';
    });
    widget.onAttempted?.call();
    try {
      await Api.attemptTheory(q.id, knew);
    } catch (_) {}
  }

  OptionState _optionState(int i) {
    if (!_revealed) return OptionState.idle;
    if (i == q.correctIndex) return OptionState.correct;
    if (i == _selected) return OptionState.wrong;
    return OptionState.dimmed;
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final t = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: MaxWidth(
        maxWidth: 820,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(spacing: 6, children: [TypeBadge(q.type), LevelBadge(q.level)]),
            const SizedBox(height: 14),
            Text(q.question, style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700, height: 1.4))
                .animate()
                .fadeIn(duration: 300.ms),
            if (q.code != null && q.code!.isNotEmpty) ...[
              const SizedBox(height: 14),
              CodeBlock(q.code!),
            ],
            const SizedBox(height: 22),
            if (q.isMcq) ..._buildMcq(t) else ..._buildTheory(t),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildMcq(ThemeData t) => [
        for (var i = 0; i < q.options.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: OptionTile(
              index: i,
              text: q.options[i],
              state: _optionState(i),
              onTap: _revealed ? null : () => _selectOption(i),
            ).entrance(i),
          ),
        if (!_revealed)
          Center(
            child: TextButton.icon(
              onPressed: () => setState(() => _revealed = true),
              icon: const Icon(Icons.visibility_outlined),
              label: const Text('Just show me the answer'),
            ),
          ),
        if (_revealed) ...[
          const SizedBox(height: 8),
          if (_selected != null) _ResultBanner(correct: _selected == q.correctIndex),
          const SizedBox(height: 12),
          _AnswerCard(title: 'Explanation', markdown: q.answer),
        ],
      ];

  List<Widget> _buildTheory(ThemeData t) => [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 350),
          switchInCurve: Curves.easeOutCubic,
          transitionBuilder: (c, a) => FadeTransition(
            opacity: a,
            child: SlideTransition(position: Tween(begin: const Offset(0, 0.04), end: Offset.zero).animate(a), child: c),
          ),
          child: _revealed
              ? Column(
                  key: const ValueKey('answer'),
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _AnswerCard(title: q.type == 'scenario' ? 'Model approach' : 'Answer', markdown: q.answer),
                    const SizedBox(height: 18),
                    _SelfAssessment(knew: _knew, onSelect: _selfAssess),
                  ],
                )
              : Column(
                  key: const ValueKey('hidden'),
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: t.colorScheme.primary.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: t.colorScheme.primary.withValues(alpha: 0.2)),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.psychology_alt_rounded, size: 40, color: t.colorScheme.primary)
                              .animate(onPlay: (c) => c.repeat(reverse: true))
                              .moveY(begin: -2, end: 2, duration: 1200.ms),
                          const SizedBox(height: 10),
                          Text('Think it through first',
                              style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text(
                            'Say your answer out loud like in a real interview, then reveal the answer to compare.',
                            textAlign: TextAlign.center,
                            style: t.textTheme.bodySmall?.copyWith(color: t.hintColor, height: 1.5),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    GradientButton(
                      label: 'Reveal answer',
                      icon: Icons.visibility_rounded,
                      onPressed: () => setState(() => _revealed = true),
                    ),
                  ],
                ),
        ),
      ];
}

class _ResultBanner extends StatelessWidget {
  const _ResultBanner({required this.correct});
  final bool correct;

  @override
  Widget build(BuildContext context) {
    final c = correct ? AppColors.success : AppColors.danger;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Text(correct ? '🎉' : '💡', style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              correct ? 'Correct! Nice work.' : 'Not quite. Check the explanation below.',
              style: TextStyle(color: c, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.2, end: 0);
  }
}

class _AnswerCard extends StatelessWidget {
  const _AnswerCard({required this.title, required this.markdown});
  final String title;
  final String markdown;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return AppCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb_rounded, color: AppColors.warning, size: 20),
              const SizedBox(width: 8),
              Text(title, style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
            ],
          ),
          const Divider(height: 24),
          MarkdownView(markdown),
        ],
      ),
    ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.05, end: 0);
  }
}

class _SelfAssessment extends StatelessWidget {
  const _SelfAssessment({required this.knew, required this.onSelect});
  final bool? knew;
  final ValueChanged<bool> onSelect;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    Widget button(bool value, String label, IconData icon, Color color) {
      final selected = knew == value;
      return Expanded(
        child: Pressable(
          onTap: () => onSelect(value),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: selected ? color : color.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: color.withValues(alpha: selected ? 1 : 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: selected ? Colors.white : color, size: 20),
                const SizedBox(width: 8),
                Text(label, style: TextStyle(color: selected ? Colors.white : color, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('How did you do?', style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 10),
        Row(
          children: [
            button(false, 'Need revision', Icons.replay_rounded, AppColors.warning),
            const SizedBox(width: 12),
            button(true, 'I knew it', Icons.check_rounded, AppColors.success),
          ],
        ),
      ],
    );
  }
}
