import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
import '../widgets/common.dart';
import 'questions_screen.dart';
import 'quiz_screen.dart';

class TrackScreen extends StatelessWidget {
  const TrackScreen({super.key, required this.slug, this.initial});
  final String slug;
  final TrackSummary? initial;

  @override
  Widget build(BuildContext context) {
    final version = context.select<AppState, int>((s) => s.dataVersion);
    return Scaffold(
      body: AsyncView<TrackDetail>(
        reloadKey: version,
        load: () => Api.track(slug),
        loading: _TrackLoading(initial: initial),
        builder: (context, track, refresh) => _TrackBody(track: track, refresh: refresh),
      ),
    );
  }
}

class _TrackLoading extends StatelessWidget {
  const _TrackLoading({this.initial});
  final TrackSummary? initial;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    slivers: [
      SliverAppBar(pinned: true, title: Text(initial?.title ?? '')),
      const SliverFillRemaining(child: SkeletonList(count: 6)),
    ],
  );
}

class _TrackBody extends StatelessWidget {
  const _TrackBody({required this.track, required this.refresh});
  final TrackDetail track;
  final Future<void> Function() refresh;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final s = track.summary;
    final color = AppColors.fromHex(s.color);
    final theoryCount = s.questionCount - s.mcqCount;

    return RefreshIndicator(
      onRefresh: refresh,
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 250,
            backgroundColor: color,
            foregroundColor: Colors.white,
            title: Text(
              s.title,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
            ),
            flexibleSpace: LayoutBuilder(
              builder: (context, c) {
                // 1 when fully expanded, 0 when collapsed to the toolbar.
                final minH = kToolbarHeight + MediaQuery.paddingOf(context).top;
                final expanded = ((c.maxHeight - minH) / (250 - kToolbarHeight)).clamp(0.0, 1.0);
                return Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [color, Color.lerp(color, Colors.black, 0.25)!],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  clipBehavior: Clip.hardEdge,
                  child: Stack(
                    children: [
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Opacity(
                          opacity: const Interval(0.55, 1, curve: Curves.easeIn).transform(expanded),
                          child: MaxWidth(
                            child: Padding(
                              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  Hero(
                                    tag: 'track-icon-${s.slug}',
                                    child: Container(
                                      width: 52,
                                      height: 52,
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Icon(iconFor(s.icon), color: Colors.white, size: 28),
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  if (s.description != null)
                                    Text(
                                      s.description!,
                                      maxLines: 3,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(color: Colors.white.withValues(alpha: 0.9), height: 1.4),
                                    ),
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 6,
                                    children: [
                                      _pill('${s.questionCount} questions'),
                                      _pill('${s.mcqCount} MCQs'),
                                      _pill('${track.topics.length} topics'),
                                    ],
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
              },
            ),
          ),
          SliverToBoxAdapter(
            child: MaxWidth(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppCard(
                      child: Row(
                        children: [
                          _ring(context, s.progress, color),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Your progress',
                                  style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${s.attempted} of ${s.questionCount} practiced · '
                                  '${s.attempted == 0 ? 0 : (s.correct * 100 / s.attempted).round()}% correct',
                                  style: t.textTheme.bodySmall?.copyWith(color: t.hintColor),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).entrance(0),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: GradientButton(
                            label: 'Practice MCQs',
                            icon: Icons.quiz_rounded,
                            onPressed: s.mcqCount == 0 ? null : () => startQuiz(context, track: s.slug, title: s.title),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.menu_book_rounded),
                            label: Text('Study ($theoryCount)'),
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => QuestionsScreen(track: s.slug, title: s.title, initialType: 'theory'),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ).entrance(1),
                    const SizedBox(height: 24),
                    SectionHeader(
                      'Topics',
                      action: 'All questions',
                      onAction: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => QuestionsScreen(track: s.slug, title: s.title),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Wrap(
                        spacing: 14,
                        children: [
                          for (final l in LevelOption.all)
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(color: AppColors.levelColors[l.id], shape: BoxShape.circle),
                                ),
                                const SizedBox(width: 5),
                                Text(l.title, style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
            sliver: SliverList.separated(
              itemCount: track.topics.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) => MaxWidth(
                child: _TopicTile(index: i, topic: track.topics[i], track: s, color: color).entrance(i + 2),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _pill(String text) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20)),
    child: Text(
      text,
      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12),
    ),
  );

  Widget _ring(BuildContext context, double value, Color color) => SizedBox(
    width: 56,
    height: 56,
    child: TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: value),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeOutCubic,
      builder: (_, v, _) => Stack(
        fit: StackFit.expand,
        children: [
          CircularProgressIndicator(
            value: v,
            strokeWidth: 6,
            color: color,
            backgroundColor: color.withValues(alpha: 0.12),
            strokeCap: StrokeCap.round,
          ),
          Center(
            child: Text('${(v * 100).round()}%', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
          ),
        ],
      ),
    ),
  );
}

class _TopicTile extends StatelessWidget {
  const _TopicTile({required this.index, required this.topic, required this.track, required this.color});
  final int index;
  final Topic topic;
  final TrackSummary track;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final done = topic.questionCount > 0 && topic.attempted >= topic.questionCount;
    return AppCard(
      padding: const EdgeInsets.fromLTRB(14, 14, 6, 14),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => QuestionsScreen(track: track.slug, topic: topic.slug, title: topic.title),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: done ? AppColors.success.withValues(alpha: 0.14) : color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: done
                ? const Icon(
                    Icons.check_rounded,
                    color: AppColors.success,
                    size: 20,
                  ).animate().scale(curve: Curves.easeOutBack)
                : Text(
                    '${index + 1}',
                    style: TextStyle(color: color, fontWeight: FontWeight.w800),
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(topic.title, style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 10,
                  runSpacing: 4,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      '${topic.questionCount} questions',
                      style: t.textTheme.bodySmall?.copyWith(color: t.hintColor),
                    ),
                    for (final l in [1, 2, 3])
                      if ((topic.levels[l] ?? 0) > 0)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 7,
                              height: 7,
                              decoration: BoxDecoration(color: AppColors.levelColors[l], shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 4),
                            Text('${topic.levels[l]}', style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
                          ],
                        ),
                  ],
                ),
                const SizedBox(height: 8),
                ProgressBar(value: topic.progress, color: color, height: 4),
              ],
            ),
          ),
          if (topic.mcqCount > 0)
            IconButton(
              tooltip: 'Quiz on this topic',
              icon: Icon(Icons.play_circle_fill_rounded, color: color, size: 30),
              onPressed: () => startQuiz(context, track: track.slug, topic: topic.slug, title: topic.title),
            )
          else
            const SizedBox(width: 8),
        ],
      ),
    );
  }
}
