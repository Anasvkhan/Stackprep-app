import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../core/theme.dart';
import '../state/app_state.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';

/// Sign up / login. Every user has an account; progress is saved to it.
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, this.startWithLogin = false});
  final bool startWithLogin;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  late bool _login = widget.startWithLogin;
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _obscure = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    final state = context.read<AppState>();
    final nav = Navigator.of(context);
    setState(() => _loading = true);
    try {
      if (_login) {
        await state.login(_email.text.trim(), _password.text);
      } else {
        await state.register(_name.text.trim(), _email.text.trim(), _password.text);
      }
      nav.popUntil((r) => r.isFirst);
    } on ApiException catch (e) {
      if (mounted) showSnack(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const BrandTitle(size: 30)),
      body: SafeArea(
        child: MaxWidth(
          maxWidth: 460,
          child: Form(
            key: _form,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              children: [
                PillSegmented<bool>(
                  segments: const [
                    PillSegment(false, 'Sign up', icon: Icons.person_add_alt_1_rounded),
                    PillSegment(true, 'Login', icon: Icons.login_rounded),
                  ],
                  selected: _login,
                  onChanged: (v) => setState(() => _login = v),
                ),
                const SizedBox(height: 16),
                AppCard(
                  radius: 24,
                  padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 250),
                        layoutBuilder: (current, previous) =>
                            Stack(alignment: Alignment.centerLeft, children: [...previous, ?current]),
                        child: Text(
                          _login ? 'Welcome back' : 'Create your account',
                          key: ValueKey(_login),
                          style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _login
                            ? 'Login to continue your preparation.'
                            : 'Your progress is saved to your account and works on any device.',
                        style: t.textTheme.bodyMedium?.copyWith(color: AppColors.muted(context), height: 1.45),
                      ),
                      const SizedBox(height: 22),
                      AnimatedSize(
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOut,
                        child: _login
                            ? const SizedBox(width: double.infinity)
                            : Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: _Field(
                                  label: 'Full name',
                                  child: TextFormField(
                                    controller: _name,
                                    textInputAction: TextInputAction.next,
                                    textCapitalization: TextCapitalization.words,
                                    decoration: const InputDecoration(
                                      hintText: 'Your name',
                                      prefixIcon: Icon(Icons.person_outline_rounded),
                                    ),
                                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                                  ),
                                ),
                              ),
                      ),
                      _Field(
                        label: 'Email',
                        child: TextFormField(
                          controller: _email,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          decoration: const InputDecoration(
                            hintText: 'you@example.com',
                            prefixIcon: Icon(Icons.mail_outline_rounded),
                          ),
                          validator: (v) {
                            final s = v?.trim() ?? '';
                            return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(s) ? null : 'Enter a valid email';
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      _Field(
                        label: 'Password',
                        hint: 'Min. 6 chars',
                        child: TextFormField(
                          controller: _password,
                          obscureText: _obscure,
                          textInputAction: TextInputAction.done,
                          onFieldSubmitted: (_) => _submit(),
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                              onPressed: () => setState(() => _obscure = !_obscure),
                            ),
                          ),
                          validator: (v) => (v == null || v.length < 6) ? 'At least 6 characters' : null,
                        ),
                      ),
                      const SizedBox(height: 24),
                      GradientButton(
                        label: _login ? 'Login' : 'Create account',
                        icon: _login ? Icons.arrow_forward_rounded : null,
                        loading: _loading,
                        onPressed: _submit,
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => setState(() => _login = !_login),
                        child: Text(_login ? 'New here? Create an account' : 'Already have an account? Login'),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.05, end: 0),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Label above a form field, with an optional monospace hint on the right.
class _Field extends StatelessWidget {
  const _Field({required this.label, required this.child, this.hint});
  final String label;
  final String? hint;
  final Widget child;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Row(
        children: [
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w700)),
          ),
          if (hint != null) MonoCaption(hint!),
        ],
      ),
      const SizedBox(height: 8),
      child,
    ],
  );
}
