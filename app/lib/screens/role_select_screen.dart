import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../core/theme.dart';
import '../state/app_state.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';

/// Asked once right after sign up: what is your designation?
///
/// - [changing]: pushed from the profile screen to change the designation.
/// - otherwise: shown by the root gate for a signed-in user without a designation.
class RoleSelectScreen extends StatefulWidget {
  const RoleSelectScreen({super.key, this.changing = false});
  final bool changing;

  @override
  State<RoleSelectScreen> createState() => _RoleSelectScreenState();
}

class _RoleSelectScreenState extends State<RoleSelectScreen> {
  String? _selected;
  bool _loading = false;

  static const _descriptions = {
    'frontend': 'HTML, CSS, JavaScript, React, Next.js, Angular, Vue',
    'backend': 'Node.js, APIs, databases, Java, Python, Go, .NET',
    'fullstack': 'Frontend + backend + databases + DevOps',
    'software-engineer': 'DSA, OOP, system design, CS fundamentals',
    'mobile': 'Flutter, Dart, React Native, Kotlin, Swift',
    'devops': 'Linux, Docker, Kubernetes, CI/CD, AWS, Terraform',
  };

  @override
  void initState() {
    super.initState();
    _selected = context.read<AppState>().user?.role;
  }

  Future<void> _continue() async {
    final state = context.read<AppState>();
    final nav = Navigator.of(context);
    setState(() => _loading = true);
    try {
      await state.updateProfile(role: _selected);
      if (widget.changing) nav.pop();
    } on ApiException catch (e) {
      if (mounted) showSnack(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }


  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final state = context.watch<AppState>();
    final roles = state.roles;
    final firstName = (state.user?.name ?? '').trim().split(RegExp(r'\s+')).first;

    return Scaffold(
      appBar: widget.changing
          ? AppBar()
          : AppBar(
              automaticallyImplyLeading: false,
              titleSpacing: 20,
              title: const BrandTitle(size: 30),
              actions: [
                TextButton.icon(
                  onPressed: state.logout,
                  icon: const Icon(Icons.logout_rounded, size: 18),
                  label: const Text('Log out'),
                ),
                const SizedBox(width: 8),
              ],
            ),
      body: SafeArea(
        child: MaxWidth(
          maxWidth: 720,
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                  children: [
                    if (!widget.changing && firstName.isNotEmpty) ...[
                      Align(
                        alignment: Alignment.centerLeft,
                        child: CountPill('Welcome, $firstName', icon: Icons.circle),
                      ),
                      const SizedBox(height: 12),
                    ],
                    Text(widget.changing ? 'Change designation' : 'What\'s your designation?',
                            style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3))
                        .animate()
                        .fadeIn()
                        .slideX(begin: -0.05),
                    const SizedBox(height: 8),
                    Text(
                      'We\'ll show the tracks and questions that matter for your role. You can change this anytime.',
                      style: t.textTheme.bodyMedium?.copyWith(color: AppColors.muted(context), height: 1.5),
                    ).animate().fadeIn(delay: 100.ms),
                    const SizedBox(height: 22),
                    LayoutBuilder(builder: (context, c) {
                      final cols = c.maxWidth > 560 ? 2 : 1;
                      return Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          for (var i = 0; i < roles.length; i++)
                            SizedBox(
                              width: (c.maxWidth - 12 * (cols - 1)) / cols,
                              child: _RoleCard(
                                title: roles[i].title,
                                description: _descriptions[roles[i].id] ?? '',
                                icon: iconFor(roles[i].icon),
                                selected: _selected == roles[i].id,
                                onTap: () => setState(() => _selected = roles[i].id),
                              ).entrance(i),
                            ),
                        ],
                      );
                    }),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: GradientButton(
                  label: widget.changing ? 'Save' : 'Continue',
                  icon: widget.changing ? Icons.check_rounded : Icons.arrow_forward_rounded,
                  loading: _loading,
                  onPressed: _selected == null ? null : _continue,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final primary = t.colorScheme.primary;
    return Pressable(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? primary.withValues(alpha: 0.07) : t.cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: selected ? primary : t.dividerColor, width: selected ? 2 : 1),
          boxShadow: AppColors.isDark(context)
              ? null
              : [BoxShadow(color: AppColors.primary.withValues(alpha: selected ? 0.12 : 0.04), blurRadius: 10, offset: const Offset(0, 3))],
        ),
        child: Row(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: selected ? AppColors.primary : primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: selected ? Colors.white : primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 3),
                  Text(description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: t.textTheme.bodySmall?.copyWith(color: AppColors.muted(context), height: 1.4)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (c, a) => ScaleTransition(scale: a, child: c),
              child: selected
                  ? Icon(Icons.check_circle_rounded, key: const ValueKey(1), color: primary, size: 24)
                  : Container(
                      key: const ValueKey(0),
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: primary.withValues(alpha: 0.10),
                        border: Border.all(color: primary.withValues(alpha: 0.25), width: 1.5),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
