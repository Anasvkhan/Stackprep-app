import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/models.dart';
import '../services/api.dart';
import '../state/app_state.dart';
import '../widgets/async_view.dart';
import '../widgets/common.dart';
import 'auth_screen.dart';
import 'role_select_screen.dart';
import 'track_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.user!;
    final t = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
        children: [
          MaxWidth(
            maxWidth: 820,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _AccountCard(user: user).entrance(0),
                const SizedBox(height: 20),
                const SectionHeader('Preferences'),
                AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      ListTile(
                        leading: IconBox(icon: iconFor(state.role?.icon), color: AppColors.primary, size: 38),
                        title: const Text('Designation', style: TextStyle(fontWeight: FontWeight.w700)),
                        subtitle: Text(state.role?.title ?? 'Not set'),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const RoleSelectScreen(changing: true)),
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: IconBox(icon: Icons.signal_cellular_alt_rounded, color: AppColors.levelColors[user.level]!, size: 38),
                        title: const Text('Experience level', style: TextStyle(fontWeight: FontWeight.w700)),
                        subtitle: Text(LevelOption.all.firstWhere((l) => l.id == user.level).title),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () => _pickLevel(context, user.level),
                      ),
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            const IconBox(icon: Icons.palette_rounded, color: AppColors.accent, size: 38),
                            const SizedBox(width: 16),
                            const Expanded(child: Text('Theme', style: TextStyle(fontWeight: FontWeight.w700))),
                            SegmentedButton<ThemeMode>(
                              showSelectedIcon: false,
                              segments: const [
                                ButtonSegment(value: ThemeMode.light, icon: Icon(Icons.light_mode_rounded), tooltip: 'Light theme'),
                                ButtonSegment(value: ThemeMode.system, icon: Icon(Icons.brightness_auto_rounded), tooltip: 'System theme'),
                                ButtonSegment(value: ThemeMode.dark, icon: Icon(Icons.dark_mode_rounded), tooltip: 'Dark theme'),
                              ],
                              selected: {state.themeMode},
                              onSelectionChanged: (s) => state.setThemeMode(s.first),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ).entrance(1),
                const SizedBox(height: 24),
                const SectionHeader('Your progress'),
                AsyncView<ProgressData>(
                  reloadKey: state.dataVersion,
                  load: Api.progress,
                  loading: const SizedBox(height: 200, child: SkeletonList(count: 3)),
                  builder: (context, p, _) => _ProgressSection(progress: p),
                ),
                const SizedBox(height: 24),
                const SectionHeader('Account'),
                AppCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.restart_alt_rounded, color: AppColors.warning),
                        title: const Text('Reset progress'),
                        onTap: () => _confirmReset(context),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.logout_rounded, color: AppColors.danger),
                        title: const Text('Log out'),
                        onTap: () => _confirmLogout(context, user.isGuest),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Center(
                  child: Text('StackPrep v1.0.0', style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
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
                subtitle: Text(l.subtitle),
                trailing: l.id == current ? const Icon(Icons.check_rounded) : null,
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
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
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

  Future<void> _confirmLogout(BuildContext context, bool isGuest) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out?'),
        content: Text(isGuest
            ? 'You are using a guest account. Logging out will permanently lose your progress. Create an account first to keep it.'
            : 'You can log back in anytime with your email.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Log out')),
        ],
      ),
    );
    if (ok == true && context.mounted) context.read<AppState>().logout();
  }
}

class _AccountCard extends StatelessWidget {
  const _AccountCard({required this.user});
  final AppUser user;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final initials = user.isGuest
        ? '?'
        : user.name.trim().split(RegExp(r'\s+')).take(2).map((p) => p.isEmpty ? '' : p[0].toUpperCase()).join();
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(gradient: AppColors.gradient, borderRadius: BorderRadius.circular(22)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white,
                child: Text(initials,
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 20)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user.isGuest ? 'Guest user' : user.name,
                        style: t.textTheme.titleLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                    Text(user.email ?? 'Progress is saved on this device only',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.85))),
                  ],
                ),
              ),
            ],
          ),
          if (user.isGuest) ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary),
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AuthScreen())),
                icon: const Icon(Icons.cloud_upload_rounded),
                label: const Text('Create account to save progress'),
              ),
            ),
          ],
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
    final started = progress.tracks.where((x) => x.attempted > 0).toList()
      ..sort((a, b) => b.attempted.compareTo(a.attempted));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _mini(context, '${progress.attempted}', 'Practiced'),
            const SizedBox(width: 10),
            _mini(context, '${progress.accuracy}%', 'Accuracy'),
            const SizedBox(width: 10),
            _mini(context, '${progress.quizzes}', 'Quizzes'),
            const SizedBox(width: 10),
            _mini(context, '${progress.streak.current}🔥', 'Streak'),
          ],
        ),
        const SizedBox(height: 14),
        if (started.isEmpty)
          AppCard(
            child: Row(
              children: [
                const Text('🚀', style: TextStyle(fontSize: 28)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text('Start practicing and your track-wise progress will show up here.',
                      style: t.textTheme.bodyMedium?.copyWith(color: t.hintColor)),
                ),
              ],
            ),
          )
        else
          AppCard(
            child: Column(
              children: [
                for (var i = 0; i < started.length; i++) ...[
                  if (i > 0) const SizedBox(height: 14),
                  _TrackProgressRow(track: started[i]),
                ],
              ],
            ),
          ),
        if (progress.recentSessions.isNotEmpty) ...[
          const SizedBox(height: 20),
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

  Widget _mini(BuildContext context, String value, String label) => Expanded(
        child: AppCard(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
          child: Column(
            children: [
              FittedBox(
                child: Text(value, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
              ),
              Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Theme.of(context).hintColor)),
            ],
          ),
        ),
      );

  Widget _sessionTile(BuildContext context, SessionSummary s) {
    final pct = s.total == 0 ? 0 : (s.correct * 100 / s.total).round();
    final color = pct >= 70 ? AppColors.success : (pct >= 50 ? AppColors.warning : AppColors.danger);
    final d = s.createdAt;
    final date = '${d.day}/${d.month}/${d.year}';
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withValues(alpha: 0.14),
        child: Text('$pct%', style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 12)),
      ),
      title: Text(s.trackTitle, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text('${s.correct}/${s.total} correct · $date'),
    );
  }
}

class _TrackProgressRow extends StatelessWidget {
  const _TrackProgressRow({required this.track});
  final TrackProgress track;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
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
                    Expanded(child: Text(track.title, style: const TextStyle(fontWeight: FontWeight.w700))),
                    Text('${track.attempted}/${track.total} · ${track.accuracy}%',
                        style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
                  ],
                ),
                const SizedBox(height: 6),
                ProgressBar(value: track.progress, color: color, height: 5),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
