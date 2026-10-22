import 'dart:async';

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
import 'quiz_result_screen.dart';

class QuizConfig {
  QuizConfig({this.track, this.topic, this.level, this.count = 10, this.mode = 'mixed', required this.title});
  final String? track;
  final String? topic;
  final int? level;
  final int count;
  final String mode;
  final String title;
}

/// Opens the quiz setup sheet (or starts directly with [skipSetup]).
Future<void> startQuiz(
  BuildContext context, {
  String? track,
  String? topic,
  int? level,
  String mode = 'mixed',
  required String title,
  bool skipSetup = false,
}) async {
  final userLevel = context.read<AppState>().user?.level ?? 1;
  QuizConfig? config = QuizConfig(
    track: track,
    topic: topic,
    level: skipSetup ? level : (level ?? userLevel),
    mode: mode,
    title: title,
  );
  if (!skipSetup) {
    config = await showModalBottomSheet<QuizConfig>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _QuizSetupSheet(initial: config!),
    );
  }
  if (config == null || !context.mounted) return;
  await Navigator.of(context).push(MaterialPageRoute(builder: (_) => QuizScreen(config: config!)));
}

class _QuizSetupSheet extends StatefulWidget {
  const _QuizSetupSheet({required this.initial});
  final QuizConfig initial;

  @override
  State<_QuizSetupSheet> createState() => _QuizSetupSheetState();
}

class _QuizSetupSheetState extends State<_QuizSetupSheet> {
  late int? _level = widget.initial.level;
  int _count = 10;
  late String _mode = widget.initial.mode;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    Widget label(String s) => Padding(
          padding: const EdgeInsets.only(top: 18, bottom: 10),
          child: Text(s, style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
        );
    Widget chip(String text, bool selected, VoidCallback onTap) =>
        ChoiceChip(label: Text(text), selected: selected, onSelected: (_) => setState(onTap));

    return SafeArea(
      child: MaxWidth(
        maxWidth: 560,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.initial.title, style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              Text('Set up your practice session', style: t.textTheme.bodyMedium?.copyWith(color: t.hintColor)),
              label('Difficulty level'),
              Wrap(spacing: 8, runSpacing: 8, children: [
                chip('All levels', _level == null, () => _level = null),
                for (final l in LevelOption.all) chip(l.title, _level == l.id, () => _level = l.id),
              ]),
              label('Number of questions'),
              Wrap(spacing: 8, children: [
                for (final n in [5, 10, 15, 20]) chip('$n', _count == n, () => _count = n),
              ]),
              label('Questions'),
              Wrap(spacing: 8, runSpacing: 8, children: [
                chip('Mixed', _mode == 'mixed', () => _mode = 'mixed'),
                chip('Unseen only', _mode == 'new', () => _mode = 'new'),
                chip('My mistakes', _mode == 'mistakes', () => _mode = 'mistakes'),
              ]),
              const SizedBox(height: 24),
              GradientButton(
                label: 'Start quiz',
                icon: Icons.play_arrow_rounded,
                onPressed: () => Navigator.of(context).pop(QuizConfig(
                  track: widget.initial.track,
                  topic: widget.initial.topic,
                  level: _level,
                  count: _count,
                  mode: _mode,
                  title: widget.initial.title,
                )),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key, required this.config});
  final QuizConfig config;

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  List<Question>? _questions;
  String? _error;
  int _index = 0;
  final Map<int, int> _answers = {};
  final _stopwatch = Stopwatch();
  Timer? _ticker;
  bool _showExplanation = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _error = null;
      _questions = null;
    });
    final c = widget.config;
    try {
      final qs = await Api.quiz(track: c.track, topic: c.topic, level: c.level, count: c.count, mode: c.mode);
      if (!mounted) return;
      setState(() => _questions = qs);
      _stopwatch.start();
      _ticker = Timer.periodic(const Duration(seconds: 1), (_) => setState(() {}));
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  void _select(int option) {
    if (_answers.containsKey(_index)) return;
    final q = _questions![_index];
    setState(() => _answers[_index] = option);
    Api.attemptMcq(q.id, option).catchError((_) => <String, dynamic>{});
  }

  Future<void> _next() async {
    if (_index < _questions!.length - 1) {
      setState(() {
        _index++;
        _showExplanation = false;
      });
      return;
    }
    await _finish();
  }

  Future<void> _finish() async {
    _stopwatch.stop();
    _ticker?.cancel();
    final qs = _questions!;
    final correct = _answers.entries.where((e) => qs[e.key].correctIndex == e.value).length;
    final c = widget.config;
    final state = context.read<AppState>();
    try {
      await Api.saveSession(
        track: c.track,
        topic: c.topic,
        level: c.level,
        total: qs.length,
        correct: correct,
        durationSec: _stopwatch.elapsed.inSeconds,
      );
    } catch (_) {}
    state.bumpData();
    state.refreshUser();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(
      builder: (_) => QuizResultScreen(
        config: c,
        questions: qs,
        answers: Map.of(_answers),
        duration: _stopwatch.elapsed,
      ),
    ));
  }

  Future<bool> _confirmExit() async {
    if (_questions == null || _answers.isEmpty) return true;
    final leave = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Leave quiz?'),
        content: const Text('Your answers so far are saved, but this session will not be scored.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Stay')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Leave')),
        ],
      ),
    );
    return leave ?? false;
  }

  String get _elapsed {
    final s = _stopwatch.elapsed.inSeconds;
    return '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final nav = Navigator.of(context);
        if (await _confirmExit()) nav.pop();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.config.title),
          actions: [
            if (_questions != null)
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 18),
                    const SizedBox(width: 4),
                    Text(_elapsed, style: const TextStyle(fontWeight: FontWeight.w700, fontFeatures: [])),
                  ],
                ),
              ),
          ],
        ),
        body: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_error != null) {
      return EmptyState(
        icon: Icons.inbox_rounded,
        title: _error!,
        message: 'Try a different level or mode.',
        action: 'Go back',
        onAction: () => Navigator.of(context).pop(),
      );
    }
    final qs = _questions;
    if (qs == null) return const Center(child: CircularProgressIndicator());

    final q = qs[_index];
    final answered = _answers.containsKey(_index);
    final selected = _answers[_index];
    final t = Theme.of(context);

    OptionState stateFor(int i) {
      if (!answered) return OptionState.idle;
      if (i == q.correctIndex) return OptionState.correct;
      if (i == selected) return OptionState.wrong;
      return OptionState.dimmed;
    }

    return Column(
      children: [
        MaxWidth(
          maxWidth: 820,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
            child: Row(
              children: [
                Text('${_index + 1}/${qs.length}', style: const TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(width: 12),
                Expanded(child: ProgressBar(value: (_index + (answered ? 1 : 0)) / qs.length, height: 8)),
              ],
            ),
          ),
        ),
        Expanded(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 350),
            layoutBuilder: (current, previous) => Stack(
              alignment: Alignment.topCenter,
              children: [...previous, ?current],
            ),
            transitionBuilder: (c, a) => FadeTransition(
              opacity: a,
              child: SlideTransition(
                position: Tween(begin: const Offset(0.06, 0), end: Offset.zero).animate(a),
                child: c,
              ),
            ),
            child: SingleChildScrollView(
              key: ValueKey(_index),
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
              child: MaxWidth(
                maxWidth: 820,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LevelBadge(q.level),
                    const SizedBox(height: 12),
                    Text(q.question, style: t.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700, height: 1.4)),
                    if (q.code != null && q.code!.isNotEmpty) ...[const SizedBox(height: 14), CodeBlock(q.code!)],
                    const SizedBox(height: 22),
                    for (var i = 0; i < q.options.length; i++)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: OptionTile(
                          index: i,
                          text: q.options[i],
                          state: stateFor(i),
                          onTap: answered ? null : () => _select(i),
                        ).entrance(i),
                      ),
                    if (answered) ...[
                      const SizedBox(height: 6),
                      _Feedback(
                        correct: selected == q.correctIndex,
                        expanded: _showExplanation,
                        onToggle: () => setState(() => _showExplanation = !_showExplanation),
                      ),
                      AnimatedSize(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOutCubic,
                        child: _showExplanation
                            ? Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: AppCard(child: MarkdownView(q.answer)),
                              )
                            : const SizedBox(width: double.infinity),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
        SafeArea(
          top: false,
          child: MaxWidth(
            maxWidth: 820,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 200),
                opacity: answered ? 1 : 0.4,
                child: GradientButton(
                  label: _index == qs.length - 1 ? 'See results' : 'Next question',
                  icon: _index == qs.length - 1 ? Icons.emoji_events_rounded : Icons.arrow_forward_rounded,
                  onPressed: answered ? _next : null,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Feedback extends StatelessWidget {
  const _Feedback({required this.correct, required this.expanded, required this.onToggle});
  final bool correct;
  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final c = correct ? AppColors.success : AppColors.danger;
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 6, 6, 6),
      decoration: BoxDecoration(color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Text(correct ? '🎉' : '😅', style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(correct ? 'Correct!' : 'Wrong answer',
                style: TextStyle(color: c, fontWeight: FontWeight.w800)),
          ),
          TextButton.icon(
            onPressed: onToggle,
            icon: Icon(expanded ? Icons.expand_less_rounded : Icons.expand_more_rounded),
            label: Text(expanded ? 'Hide' : 'Explanation'),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 250.ms).slideY(begin: 0.3, end: 0);
  }
}
