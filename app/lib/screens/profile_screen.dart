import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';
import 'role_select_screen.dart';
import 'track_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.user!;
    final t = Theme.of(context);
    final muted = AppColors.muted(context);

    Widget prefTile({
      required Widget leading,
      required String label,
      required String value,
      required VoidCallback onTap,
    }) =>
        InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
            child: Row(
              children: [
                leading,
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(label, style: t.textTheme.bodySmall?.copyWith(color: muted)),
                      Text(value,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700, fontSize: 15)),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right_rounded, color: muted),
              ],
            ),
          ),
        );

    return Scaffold(
      appBar: const BrandAppBar(subtitle: 'Profile'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
        children: [
          MaxWidth(
            maxWidth: 820,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _AccountCard(user: user, role: state.role?.title).entrance(0),
                const SizedBox(height: 24),
                const SectionHeader('Preferences'),
                AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      prefTile(
                        leading: IconBox(icon: iconFor(state.role?.icon), color: AppColors.primary, size: 40),
                        label: 'Designation',
                        value: state.role?.title ?? 'Not set',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const RoleSelectScreen(changing: true)),
                        ),
                      ),
                      const Divider(height: 1),
                      prefTile(
                        leading: IconBox(
                          icon: Icons.signal_cellular_alt_rounded,
                          color: AppColors.levelColors[user.level]!,
                          size: 40,
                        ),
                        label: 'Experience level',
                        value: () {
                          final l = LevelOption.all.firstWhere((l) => l.id == user.level);
                          return '${l.title} (${l.subtitle})';
                        }(),
                        onTap: () => _pickLevel(context, user.level),
                      ),
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const IconBox(icon: Icons.palette_rounded, color: AppColors.accent, size: 40),
                                const SizedBox(width: 14),
                                Text('Theme mode',
                                    style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700, fontSize: 15)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            PillSegmented<ThemeMode>(
                              segments: const [
                                PillSegment(ThemeMode.light, 'Light', icon: Icons.light_mode_rounded),
                                PillSegment(ThemeMode.system, 'System', icon: Icons.brightness_auto_rounded),
                                PillSegment(ThemeMode.dark, 'Dark', icon: Icons.dark_mode_rounded),
                              ],
                              selected: state.themeMode,
                              onChanged: state.setThemeMode,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ).entrance(1),
                const SizedBox(height: 28),
                const SectionHeader('Your progress'),
                AsyncView<ProgressData>(
                  reloadKey: state.dataVersion,
                  load: Api.progress,
                  loading: const SizedBox(height: 200, child: SkeletonList(count: 3)),
                  builder: (context, p, _) => _ProgressSection(progress: p),
                ),
                const SizedBox(height: 28),
                const SectionHeader('Account'),
                AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      ListTile(
                        leading: const IconBox(icon: Icons.restart_alt_rounded, color: AppColors.warning, size: 40),
                        title: const Text('Reset progress', style: TextStyle(fontWeight: FontWeight.w700)),
                        subtitle: Text('Clear attempts, quiz history and bookmarks',
                            style: t.textTheme.bodySmall?.copyWith(color: muted)),
                        trailing: Icon(Icons.chevron_right_rounded, color: muted),
                        onTap: () => _confirmReset(context),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const IconBox(icon: Icons.logout_rounded, color: AppColors.danger, size: 40),
                        title: const Text('Log out',
                            style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.danger)),
                        subtitle: user.email == null
                            ? null
                            : Text('Sign out of ${user.email}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: t.textTheme.bodySmall?.copyWith(color: muted)),
                        trailing: Icon(Icons.chevron_right_rounded, color: muted),
                        onTap: () => _confirmLogout(context),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Center(
                  child: Text('StackPrep v1.0.0', style: AppTheme.mono(context, size: 11.5, color: muted)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickLevel(BuildContext context, int current) async {
    final level = await showModalBottomSheet<int>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final l in LevelOption.all)
              ListTile(
                leading: CircleAvatar(radius: 6, backgroundColor: AppColors.levelColors[l.id]),
                title: Text(l.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text(l.subtitle, style: AppTheme.mono(ctx, size: 12, color: AppColors.muted(ctx))),
                trailing: l.id == current ? Icon(Icons.check_circle_rounded, color: Theme.of(ctx).colorScheme.primary) : null,
                onTap: () => Navigator.pop(ctx, l.id),
              ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
    if (level != null && context.mounted) await context.read<AppState>().updateProfile(level: level);
  }

  Future<void> _confirmReset(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reset all progress?'),
        content: const Text('This removes your attempts, quiz history and bookmarks. This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger, minimumSize: const Size(0, 44)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    final state = context.read<AppState>();
    try {
      await Api.resetProgress();
      state.bumpData();
      if (context.mounted) showSnack(context, 'Progress reset');
    } catch (e) {
      if (context.mounted) showSnack(context, '$e', error: true);
    }
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('Your progress is saved to your account. You can log back in anytime with your email.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(0, 44)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
    if (ok == true && context.mounted) context.read<AppState>().logout();
  }
}

class _AccountCard extends StatelessWidget {
  const _AccountCard({required this.user, this.role});
  final AppUser user;
  final String? role;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: AppColors.gradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.28), blurRadius: 22, offset: const Offset(0, 10))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
            ),
            child: InitialsAvatar(name: user.name, size: 58, inverted: true),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(user.name,
                        style: t.textTheme.titleLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(20)),
                      child: Text('${LevelOption.name(user.level)} level'.toUpperCase(),
                          style: AppTheme.mono(context, size: 10, weight: FontWeight.w700, color: const Color(0xFF00201B), height: 1.3)),
                    ),
                  ],
                ),
                if (role != null) ...[
                  const SizedBox(height: 2),
                  Text(role!, style: TextStyle(color: Colors.white.withValues(alpha: 0.92), fontWeight: FontWeight.w600)),
                ],
                if (user.email != null)
                  Text(user.email!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTheme.mono(context, size: 12, color: Colors.white.withValues(alpha: 0.8))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProgressSection extends StatelessWidget {
  const _ProgressSection({required this.progress});
  final ProgressData progress;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final muted = AppColors.muted(context);
    final started = progress.tracks.where((x) => x.attempted > 0).toList()
      ..sort((a, b) => b.attempted.compareTo(a.attempted));

    final stats = [
      ('Practiced', '${progress.attempted}', 'questions', Icons.task_alt_rounded, AppColors.primary),
      ('Accuracy', '${progress.accuracy}%', null, Icons.track_changes_rounded, AppColors.accent),
      ('Quizzes', '${progress.quizzes}', 'completed', Icons.quiz_outlined, const Color(0xFF3B82F6)),
      ('Day streak', '${progress.streak.current}', 'days', Icons.local_fire_department_rounded, AppColors.warning),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LayoutBuilder(builder: (context, c) {
          final cols = c.maxWidth >= 600 ? 4 : 2;
          final w = (c.maxWidth - 10 * (cols - 1)) / cols;
          return Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              for (final s in stats)
                SizedBox(
                  width: w,
                  child: AppCard(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(child: MonoCaption(s.$1)),
                            Icon(s.$4, size: 18, color: s.$5),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(s.$2, style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                            if (s.$3 != null) ...[
                              const SizedBox(width: 6),
                              Flexible(
                                child: Text(s.$3!,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: t.textTheme.bodySmall?.copyWith(color: muted)),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        }),
        const SizedBox(height: 14),
        if (started.isEmpty)
          AppCard(
            child: Row(
              children: [
                const IconBox(icon: Icons.rocket_launch_rounded, color: AppColors.primary, size: 44),
                const SizedBox(width: 12),
                Expanded(
                  child: Text('Start practicing and your track-wise progress will show up here.',
                      style: t.textTheme.bodyMedium?.copyWith(color: muted)),
                ),
              ],
            ),
          )
        else
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('Active prep tracks',
                          style: t.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                    ),
                    CountPill('${started.length} active'.toUpperCase()),
                  ],
                ),
                const SizedBox(height: 14),
                for (var i = 0; i < started.length; i++) ...[
                  if (i > 0) const SizedBox(height: 14),
                  _TrackProgressRow(track: started[i]),
                ],
              ],
            ),
          ),
        if (progress.recentSessions.isNotEmpty) ...[
          const SizedBox(height: 28),
          const SectionHeader('Recent quizzes'),
          AppCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                for (var i = 0; i < progress.recentSessions.length; i++) ...[
                  if (i > 0) const Divider(height: 1),
                  _sessionTile(context, progress.recentSessions[i]),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _sessionTile(BuildContext context, SessionSummary s) {
    final pct = s.total == 0 ? 0 : (s.correct * 100 / s.total).round();
    final color = pct >= 70 ? AppColors.success : (pct >= 50 ? AppColors.warning : AppColors.danger);
    final d = s.createdAt;
    final date = '${d.day}/${d.month}/${d.year}';
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      leading: ProgressRing(
        value: pct / 100,
        color: color,
        size: 44,
        stroke: 4,
        label: (_) => Text('$pct%', style: AppTheme.mono(context, size: 10.5, weight: FontWeight.w700, color: color)),
      ),
      title: Text(s.trackTitle, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text('${s.correct}/${s.total} correct · $date',
          style: AppTheme.mono(context, size: 11.5, color: AppColors.muted(context))),
    );
  }
}

class _TrackProgressRow extends StatelessWidget {
  const _TrackProgressRow({required this.track});
  final TrackProgress track;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forTheme(context, track.color);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => TrackScreen(slug: track.slug))),
      child: Row(
        children: [
          IconBox(icon: iconFor(track.icon), color: color, size: 36),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(track.title,
                          maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
                    ),
                    Text('${track.attempted}/${track.total} · ${track.accuracy}%',
                        style: AppTheme.mono(context, size: 11.5, weight: FontWeight.w600, color: color)),
                  ],
                ),
                const SizedBox(height: 6),
                ProgressBar(value: track.progress, color: color, height: 6),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
