import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';

/// The only onboarding question: what is your designation?
///
/// - [standalone]: pushed from the welcome screen; creates a guest account on continue.
/// - [changing]: pushed from the profile screen to change the designation.
/// - neither: shown by the root gate for a signed-in user without a designation.
class RoleSelectScreen extends StatefulWidget {
  const RoleSelectScreen({super.key, this.standalone = false, this.changing = false});
  final bool standalone;
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
      if (widget.standalone) {
        await state.startAsGuest(_selected!);
        nav.popUntil((r) => r.isFirst);
      } else {
        await state.updateProfile(role: _selected);
        if (widget.changing) nav.pop();
      }
    } on ApiException catch (e) {
      if (mounted) showSnack(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final roles = context.watch<AppState>().roles;
    final hasBack = widget.standalone || widget.changing;

    return Scaffold(
      appBar: hasBack ? AppBar() : null,
      body: SafeArea(
        child: MaxWidth(
          maxWidth: 720,
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                  children: [
                    if (!hasBack) const SizedBox(height: 24),
                    Text(widget.changing ? 'Change designation' : 'What\'s your designation?',
                            style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800))
                        .animate()
                        .fadeIn()
                        .slideX(begin: -0.05),
                    const SizedBox(height: 8),
                    Text(
                      'We\'ll show the tracks and questions that matter for your role. You can change this anytime.',
                      style: t.textTheme.bodyMedium?.copyWith(color: t.hintColor, height: 1.5),
                    ).animate().fadeIn(delay: 100.ms),
                    const SizedBox(height: 24),
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
          color: selected ? primary.withValues(alpha: 0.08) : t.cardColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: selected ? primary : t.dividerColor, width: selected ? 2 : 1),
        ),
        child: Row(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: selected ? primary : primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: selected ? Colors.white : primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: t.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 3),
                  Text(description, style: t.textTheme.bodySmall?.copyWith(color: t.hintColor)),
                ],
              ),
            ),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (c, a) => ScaleTransition(scale: a, child: c),
              child: selected
                  ? Icon(Icons.check_circle_rounded, key: const ValueKey(1), color: primary)
                  : Icon(Icons.circle_outlined, key: const ValueKey(0), color: t.dividerColor),
            ),
          ],
        ),
      ),
    );
  }
}
