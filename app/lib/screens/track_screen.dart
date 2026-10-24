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
    final color = AppColors.forTheme(context, s.color);
    final theoryCount = s.questionCount - s.mcqCount;

    return RefreshIndicator(
      onRefresh: refresh,
      child: CustomScrollView(
        slivers: [
          SliverAppBar(pinned: true, title: Text(s.title)),
          SliverToBoxAdapter(
            child: MaxWidth(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _HeroCard(track: track, color: AppColors.fromHex(s.color)).entrance(0),
                    const SizedBox(height: 16),
                    AppCard(
                      child: Row(
                        children: [
                          ProgressRing(value: s.progress, color: color, size: 64, stroke: 6),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Your progress',
                                  style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${s.attempted} of ${s.questionCount} practiced · '
                                  '${s.attempted == 0 ? 0 : (s.correct * 100 / s.attempted).round()}% correct',
                                  style: AppTheme.mono(context, size: 12, color: AppColors.muted(context)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).entrance(1),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: GradientButton(
                            label: 'Practice MCQs',
                            icon: Icons.bolt_rounded,
                            onPressed: s.mcqCount == 0 ? null : () => startQuiz(context, track: s.slug, title: s.title),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.menu_book_rounded),
                            label: Text('Study ($theoryCount)', maxLines: 1, overflow: TextOverflow.ellipsis),
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => QuestionsScreen(track: s.slug, title: s.title, initialType: 'theory'),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ).entrance(2),
                    const SizedBox(height: 26),
                    SectionHeader(
                      'Topics',
                      action: 'All questions ›',
                      onAction: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => QuestionsScreen(track: s.slug, title: s.title),
                        ),
                      ),
                    ),
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.surface2(context),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Wrap(
                        spacing: 14,
                        runSpacing: 6,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          const MonoCaption('Difficulty'),
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
                                Text(l.title, style: t.textTheme.bodySmall?.copyWith(color: AppColors.muted(context))),
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
                child: _TopicTile(index: i, topic: track.topics[i], track: s, color: color).entrance(i + 3),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Track header card in the track's own color.
class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.track, required this.color});
  final TrackDetail track;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final s = track.summary;
    final category = CategoryOption.all.where((c) => c.id == s.category).map((c) => c.title).firstOrNull;

    Widget pill(IconData icon, String text) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.16),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha: 0.22)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 13, color: Colors.white),
              const SizedBox(width: 5),
              Text(text, style: AppTheme.mono(context, size: 11.5, weight: FontWeight.w600, color: Colors.white, height: 1.3)),
            ],
          ),
        );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, Color.lerp(color, Colors.black, 0.25)!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.30), blurRadius: 22, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
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
              const Spacer(),
              if (category != null)
                Flexible(
                  flex: 4,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
                    ),
                    child: Text(category.toUpperCase(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.mono(context, size: 10.5, weight: FontWeight.w700, color: Colors.white, letterSpacing: 0.5)),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          Text(s.title,
              style: t.textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
          if (s.description != null) ...[
            const SizedBox(height: 6),
            Text(
              s.description!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.88), height: 1.45),
            ),
          ],
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              pill(Icons.help_outline_rounded, '${s.questionCount} questions'),
              pill(Icons.checklist_rounded, '${s.mcqCount} MCQs'),
              pill(Icons.layers_outlined, '${track.topics.length} topics'),
            ],
          ),
        ],
      ),
    );
  }
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
      padding: const EdgeInsets.fromLTRB(14, 14, 10, 14),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => QuestionsScreen(track: track.slug, topic: topic.slug, title: topic.title),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
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
                    style: AppTheme.mono(context, size: 14, weight: FontWeight.w700, color: color),
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(topic.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700, fontSize: 15)),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 10,
                  runSpacing: 4,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      '${topic.questionCount} questions',
                      style: t.textTheme.bodySmall?.copyWith(color: AppColors.muted(context)),
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
                            Text('${topic.levels[l]}',
                                style: AppTheme.mono(context, size: 11.5, color: AppColors.muted(context))),
                          ],
                        ),
                  ],
                ),
                const SizedBox(height: 10),
                ProgressBar(value: topic.progress, color: done ? AppColors.success : color, height: 5),
              ],
            ),
          ),
          const SizedBox(width: 8),
          if (topic.mcqCount > 0)
            Tooltip(
              message: 'Quiz on this topic',
              child: Material(
                color: color.withValues(alpha: 0.12),
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: () => startQuiz(context, track: track.slug, topic: topic.slug, title: topic.title),
                  child: SizedBox(width: 42, height: 42, child: Icon(Icons.play_arrow_rounded, color: color)),
                ),
              ),
            )
          else
            const SizedBox(width: 4),
        ],
      ),
    );
  }
}
