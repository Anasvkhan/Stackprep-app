/// Basic form checks for sign up, login and password reset. Stricter than the
/// backend, so anything that passes here is also accepted by the server.
class Validators {
  static final _nameRe = RegExp(r"^\p{L}[\p{L} .'-]*$", unicode: true);
  static final _emailRe = RegExp(r'^[\w.+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$');

  static String? name(String? v) {
    final s = (v ?? '').trim();
    if (s.isEmpty) return 'Please enter your name';
    if (s.length < 2) return 'Name must be at least 2 characters';
    if (!_nameRe.hasMatch(s)) return 'Use letters only';
    return null;
  }

  static String? email(String? v) {
    final s = (v ?? '').trim();
    if (s.isEmpty) return 'Please enter your email';
    if (!_emailRe.hasMatch(s)) return 'Enter a valid email, e.g. name@example.com';
    return null;
  }

  static String? newPassword(String? v) {
    final s = v ?? '';
    if (s.isEmpty) return 'Please enter a password';
    if (s.length < 6) return 'Password must be at least 6 characters';
    if (!RegExp(r'[A-Za-z]').hasMatch(s) || !RegExp(r'\d').hasMatch(s)) {
      return 'Use at least one letter and one number';
    }
    return null;
  }

  static String? loginPassword(String? v) => (v ?? '').isEmpty ? 'Please enter your password' : null;

  static String? resetCode(String? v) =>
      RegExp(r'^\d{6}$').hasMatch((v ?? '').trim()) ? null : 'Enter the 6-digit code from the email';
}
