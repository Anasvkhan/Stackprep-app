import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../state/app_state.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';

/// Login / create account. When a guest creates an account, their progress is kept.
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
    final isGuest = context.watch<AppState>().user?.isGuest == true;

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: MaxWidth(
          maxWidth: 460,
          child: Form(
            key: _form,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
              children: [
                const BrandMark(size: 52).animate().scale(curve: Curves.easeOutBack, duration: 450.ms),
                const SizedBox(height: 20),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
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
                      : isGuest
                          ? 'Save your progress and continue on any device.'
                          : 'Track your progress across devices.',
                  style: t.textTheme.bodyMedium?.copyWith(color: t.hintColor),
                ),
                const SizedBox(height: 28),
                AnimatedSize(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  child: _login
                      ? const SizedBox(width: double.infinity)
                      : Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: TextFormField(
                            controller: _name,
                            textInputAction: TextInputAction.next,
                            textCapitalization: TextCapitalization.words,
                            decoration: const InputDecoration(
                              labelText: 'Full name',
                              prefixIcon: Icon(Icons.person_outline_rounded),
                            ),
                            validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your name' : null,
                          ),
                        ),
                ),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.email],
                  decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.alternate_email_rounded)),
                  validator: (v) {
                    final s = v?.trim() ?? '';
                    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(s) ? null : 'Enter a valid email';
                  },
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _password,
                  obscureText: _obscure,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (v) => (v == null || v.length < 6) ? 'At least 6 characters' : null,
                ),
                const SizedBox(height: 28),
                GradientButton(label: _login ? 'Login' : 'Create account', loading: _loading, onPressed: _submit),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => setState(() => _login = !_login),
                  child: Text(_login ? 'New here? Create an account' : 'Already have an account? Login'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
