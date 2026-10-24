import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';
import '../widgets/track_card.dart';
import 'quiz_screen.dart';
import 'search_screen.dart';
import 'shell.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.user!;
    return Scaffold(
      appBar: const BrandAppBar(subtitle: 'Home'),
      body: SafeArea(
        top: false,
        child: AsyncView<(ProgressData, List<TrackSummary>)>(
          reloadKey: '${state.dataVersion}-${user.role}',
          load: () async {
            final r = await Future.wait([Api.progress(), Api.tracks()]);
            return (r[0] as ProgressData, r[1] as List<TrackSummary>);
          },
          builder: (context, data, refresh) {
            final (progress, tracks) = data;
            return RefreshIndicator(
              onRefresh: refresh,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                children: [
                  MaxWidth(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _Header(user: user, role: state.role?.title ?? '', streak: progress.streak.current),
                        const SizedBox(height: 18),
                        _HeroCard(level: user.level).entrance(0),
                        const SizedBox(height: 24),
                        _LevelSelector(level: user.level).entrance(1),
                        const SizedBox(height: 24),
                        _StatsRow(progress: progress).entrance(2),
                        const SizedBox(height: 28),
                        const SectionHeader('Practice modes'),
                        _ModesRow(level: user.level).entrance(3),
                        const SizedBox(height: 28),
                        SectionHeader(
                          'Your tracks',
                          trailing: tracks.isEmpty ? null : CountPill('${tracks.length} ${tracks.length == 1 ? 'track' : 'tracks'}'),
                          action: 'See all',
                          onAction: () => Shell.goToTab(context, 1),
                        ),
                        if (tracks.isEmpty)
                          const EmptyState(icon: Icons.layers_clear_rounded, title: 'No tracks yet')
                        else
                          ResponsiveGrid(children: [
                            for (var i = 0; i < tracks.length; i++)
                              TrackCard(track: tracks[i], onReturn: refresh).entrance(i + 4),
                          ]),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.user, required this.role, required this.streak});
  final AppUser user;
  final String role;
  final int streak;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final name = user.name.trim().split(RegExp(r'\s+')).first;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hi, $name',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3)),
              const SizedBox(height: 2),
              Row(
                children: [
                  Icon(Icons.work_outline_rounded, size: 16, color: AppColors.muted(context)),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(role,
                        overflow: TextOverflow.ellipsis,
                        style: t.textTheme.bodyMedium?.copyWith(color: AppColors.muted(context))),
                  ),
                ],
              ),
            ],
          ),
        ),
        Tooltip(
          message: 'Search questions',
          child: Material(
            color: AppColors.surface2(context),
            borderRadius: BorderRadius.circular(14),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SearchScreen())),
              child: SizedBox(
                width: 44,
                height: 44,
                child: Icon(Icons.search_rounded, color: t.colorScheme.primary),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Tooltip(
          message: 'Daily streak',
          child: Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_fire_department_rounded, size: 18, color: AppColors.warning)
                    .animate(onPlay: (c) => streak > 0 ? c.repeat(reverse: true) : null)
                    .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 700.ms),
                const SizedBox(width: 4),
                Text('$streak',
                    style: AppTheme.mono(context, size: 15, weight: FontWeight.w700, color: levelTextColor(context, 2))),
              ],
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 350.ms);
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.level});
  final int level;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Pressable(
      onTap: () => startQuiz(context, level: level, title: 'Quick practice', skipSetup: true),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          gradient: AppColors.gradient,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: AppColors.primary.withValues(alpha: 0.30), blurRadius: 24, offset: const Offset(0, 10)),
          ],
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned(
              right: -18,
              top: -18,
              child: Icon(Icons.bolt_rounded, size: 120, color: Colors.white.withValues(alpha: 0.10))
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .rotate(begin: -0.03, end: 0.03, duration: 2.seconds),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star_rounded, color: Colors.white, size: 13),
                      const SizedBox(width: 4),
                      Text('${LevelOption.name(level)} level'.toUpperCase(),
                          style: AppTheme.mono(context, size: 11, weight: FontWeight.w700, color: Colors.white, height: 1.3)),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Text('Quick practice',
                    style: t.textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text('10 random MCQs from your stack.\nTest yourself in under 5 minutes.',
                    style: t.textTheme.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.85), height: 1.45)),
                const SizedBox(height: 18),
                Container(
                  width: double.infinity,
                  height: 48,
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.play_arrow_rounded, color: AppColors.primaryDark),
                      SizedBox(width: 6),
                      Text('Start now', style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LevelSelector extends StatelessWidget {
  const _LevelSelector({required this.level});
  final int level;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Your experience level', style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        PillSegmented<int>(
          segments: [for (final l in LevelOption.all) PillSegment(l.id, l.title, subtitle: l.subtitle)],
          selected: level,
          onChanged: (v) {
            if (v != level) context.read<AppState>().updateProfile(level: v);
          },
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Icon(Icons.info_outline_rounded, size: 14, color: AppColors.muted(context)),
            const SizedBox(width: 6),
            Expanded(
              child: Text('Questions and difficulty adjust to this level.',
                  style: t.textTheme.bodySmall?.copyWith(color: AppColors.muted(context))),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.progress});
  final ProgressData progress;

  @override
  Widget build(BuildContext context) {
    Widget stat(String label, String value, IconData icon, Color color) => Expanded(
          child: AppCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(height: 10),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(value,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800, fontSize: 22)),
                ),
                Text(label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.muted(context))),
              ],
            ),
          ),
        );
    return Row(
      children: [
        stat('Practiced', '${progress.attempted}', Icons.task_alt_rounded, AppColors.primary),
        const SizedBox(width: 10),
        stat('Accuracy', '${progress.accuracy}%', Icons.track_changes_rounded, AppColors.accent),
        const SizedBox(width: 10),
        stat('Best streak', '${progress.streak.best}', Icons.local_fire_department_rounded, AppColors.warning),
      ],
    );
  }
}

class _ModesRow extends StatelessWidget {
  const _ModesRow({required this.level});
  final int level;

  @override
  Widget build(BuildContext context) {
    final modes = [
      ('Unseen questions', 'Only ones you haven\'t tried', Icons.fiber_new_rounded, AppColors.primary, 'new'),
      ('Review mistakes', 'Retry what you got wrong', Icons.replay_rounded, AppColors.danger, 'mistakes'),
      ('Mixed levels', 'All difficulty levels', Icons.shuffle_rounded, AppColors.accent, 'all'),
    ];
    return ResponsiveGrid(
      minItemWidth: 280,
      spacing: 10,
      children: [
        for (final m in modes)
          AppCard(
            padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
            onTap: () => startQuiz(
              context,
              level: m.$5 == 'all' ? null : level,
              mode: m.$5 == 'all' ? 'mixed' : m.$5,
              title: m.$1,
              skipSetup: true,
            ),
            child: Row(
              children: [
                IconBox(icon: m.$3, color: m.$4, size: 40),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m.$1, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                      Text(m.$2,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.muted(context))),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right_rounded, color: AppColors.muted(context)),
              ],
            ),
          ),
      ],
    );
  }
}
