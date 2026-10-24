import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/api_client.dart';
import '../core/theme.dart';
import '../core/validators.dart';
import '../services/api.dart';
import '../widgets/brand.dart';
import '../widgets/common.dart';
import 'auth_screen.dart';

/// Forgot password: enter email -> a 6-digit code is emailed -> on the same screen
/// enter the code with a new password. Returns to Login when done.
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  static const _resendSeconds = 60;

  GlobalKey<FormState> _form = GlobalKey<FormState>();
  AutovalidateMode _autovalidate = AutovalidateMode.disabled;
  final _email = TextEditingController();
  final _code = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _codeSent = false;
  bool _loading = false;
  bool _obscure = true;
  int _cooldown = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _email.dispose();
    _code.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _timer?.cancel();
    setState(() => _cooldown = _resendSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() => _cooldown--);
      if (_cooldown <= 0) t.cancel();
    });
  }

  bool _validate() {
    FocusScope.of(context).unfocus();
    if (_form.currentState!.validate()) return true;
    setState(() => _autovalidate = AutovalidateMode.onUserInteraction);
    return false;
  }

  Future<void> _sendCode({bool resend = false}) async {
    if (!resend && !_validate()) return;
    setState(() => _loading = true);
    try {
      await Api.forgotPassword(_email.text.trim().toLowerCase());
      if (!mounted) return;
      setState(() {
        _codeSent = true;
        _form = GlobalKey<FormState>();
        _autovalidate = AutovalidateMode.disabled;
      });
      _startCooldown();
      showSnack(context, resend ? 'A new code has been sent.' : 'Code sent. Check your email.');
    } on ApiException catch (e) {
      if (mounted) showSnack(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _reset() async {
    if (!_validate()) return;
    setState(() => _loading = true);
    try {
      final message = await Api.resetPassword(
        email: _email.text.trim().toLowerCase(),
        code: _code.text.trim(),
        password: _password.text,
      );
      if (!mounted) return;
      showSnack(context, message);
      Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (mounted) showSnack(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _changeEmail() {
    _timer?.cancel();
    setState(() {
      _codeSent = false;
      _cooldown = 0;
      _code.clear();
      _password.clear();
      _confirm.clear();
      _form = GlobalKey<FormState>();
      _autovalidate = AutovalidateMode.disabled;
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final muted = AppColors.muted(context);
    final noSpaces = FilteringTextInputFormatter.deny(RegExp(r'\s'));

    Widget eye() => IconButton(
          icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
          onPressed: () => setState(() => _obscure = !_obscure),
        );

    return Scaffold(
      appBar: AppBar(title: const BrandTitle(size: 30)),
      body: SafeArea(
        child: MaxWidth(
          maxWidth: 460,
          child: Form(
            key: _form,
            autovalidateMode: _autovalidate,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              children: [
                AppCard(
                  radius: 24,
                  padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: IconBox(icon: Icons.lock_reset_rounded, color: t.colorScheme.primary, size: 48),
                      ),
                      const SizedBox(height: 14),
                      Text('Forgot password',
                          style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Text(
                        _codeSent
                            ? 'Enter the 6-digit code from the email and choose a new password.'
                            : 'Enter the email of your account. We\'ll send you a 6-digit code to reset your password.',
                        style: t.textTheme.bodyMedium?.copyWith(color: muted, height: 1.45),
                      ),
                      const SizedBox(height: 22),
                      LabeledField(
                        label: 'Email',
                        child: TextFormField(
                          controller: _email,
                          enabled: !_codeSent,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          autocorrect: false,
                          autofillHints: const [AutofillHints.email],
                          inputFormatters: [noSpaces, LengthLimitingTextInputFormatter(100)],
                          onFieldSubmitted: (_) => _codeSent ? null : _sendCode(),
                          decoration: const InputDecoration(
                            hintText: 'you@example.com',
                            prefixIcon: Icon(Icons.mail_outline_rounded),
                          ),
                          validator: Validators.email,
                        ),
                      ),
                      if (!_codeSent) ...[
                        const SizedBox(height: 24),
                        GradientButton(
                          label: 'Send code',
                          icon: Icons.send_rounded,
                          loading: _loading,
                          onPressed: _sendCode,
                        ),
                      ] else
                        ..._resetFields(context, noSpaces, eye),
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

  List<Widget> _resetFields(BuildContext context, TextInputFormatter noSpaces, Widget Function() eye) {
    final t = Theme.of(context);
    final muted = AppColors.muted(context);
    return [
      Align(
        alignment: Alignment.centerRight,
        child: TextButton.icon(
          onPressed: _loading ? null : _changeEmail,
          icon: const Icon(Icons.edit_outlined, size: 16),
          label: const Text('Change email'),
        ),
      ),
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: t.colorScheme.primary.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.mark_email_read_outlined, size: 18, color: t.colorScheme.primary),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'If this email is registered, a code is on its way. It expires in 10 minutes. Check your spam folder too.',
                style: t.textTheme.bodySmall?.copyWith(color: muted, height: 1.45),
              ),
            ),
          ],
        ),
      ).animate().fadeIn(duration: 300.ms),
      const SizedBox(height: 16),
      LabeledField(
        label: '6-digit code',
        child: TextFormField(
          controller: _code,
          autofocus: true,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.oneTimeCode],
          inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
          style: AppTheme.mono(context, size: 18, weight: FontWeight.w700, letterSpacing: 6, height: 1.2),
          decoration: const InputDecoration(hintText: '000000', prefixIcon: Icon(Icons.pin_outlined)),
          validator: Validators.resetCode,
        ),
      ),
      const SizedBox(height: 16),
      LabeledField(
        label: 'New password',
        hint: '6+ chars · letter + number',
        child: TextFormField(
          controller: _password,
          obscureText: _obscure,
          textInputAction: TextInputAction.next,
          autocorrect: false,
          enableSuggestions: false,
          autofillHints: const [AutofillHints.newPassword],
          inputFormatters: [noSpaces, LengthLimitingTextInputFormatter(64)],
          decoration: InputDecoration(
            hintText: '••••••••',
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: eye(),
          ),
          validator: Validators.newPassword,
        ),
      ),
      const SizedBox(height: 16),
      LabeledField(
        label: 'Confirm password',
        child: TextFormField(
          controller: _confirm,
          obscureText: _obscure,
          textInputAction: TextInputAction.done,
          autocorrect: false,
          enableSuggestions: false,
          inputFormatters: [noSpaces, LengthLimitingTextInputFormatter(64)],
          onFieldSubmitted: (_) => _reset(),
          decoration: InputDecoration(
            hintText: '••••••••',
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: eye(),
          ),
          validator: (v) {
            if ((v ?? '').isEmpty) return 'Please confirm your new password';
            if (v != _password.text) return 'Passwords do not match';
            return null;
          },
        ),
      ),
      const SizedBox(height: 24),
      GradientButton(
        label: 'Update password',
        icon: Icons.check_rounded,
        loading: _loading,
        onPressed: _reset,
      ),
      const SizedBox(height: 8),
      Center(
        child: TextButton(
          onPressed: _loading || _cooldown > 0 ? null : () => _sendCode(resend: true),
          child: Text(_cooldown > 0 ? 'Resend code in ${_cooldown}s' : 'Resend code'),
        ),
      ),
    ];
  }
}
