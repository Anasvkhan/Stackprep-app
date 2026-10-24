import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/api_client.dart';
import '../models/models.dart';

enum AuthStatus { loading, signedOut, needsRole, ready }

/// Holds the session (token + user), theme mode and a `dataVersion` counter
/// that screens watch to know when to refetch.
///
/// Startup never waits for the server: designations are bundled in the app and
/// the signed-in user is cached on the device, then refreshed in the background.
/// This matters because the free backend sleeps when idle and takes ~50s to wake.
class AppState extends ChangeNotifier {
  static const _tokenKey = 'sp_token';
  static const _userKey = 'sp_user';
  static const _themeKey = 'sp_theme';

  final _api = ApiClient.instance;

  AuthStatus status = AuthStatus.loading;
  AppUser? user;
  final List<RoleOption> roles = RoleOption.all;
  final List<CategoryOption> categories = CategoryOption.all;
  ThemeMode themeMode = ThemeMode.system;
  int dataVersion = 0;
  String? startupError;

  SharedPreferences? _prefs;

  RoleOption? get role => roles.where((r) => r.id == user?.role).firstOrNull;

  Future<void> init() async {
    status = AuthStatus.loading;
    startupError = null;
    notifyListeners();

    _api.onUnauthorized = () => _signOutLocal();

    // Any failure here must end in an error screen with Retry, never an endless spinner.
    try {
      _prefs ??= await SharedPreferences.getInstance();
      themeMode = ThemeMode.values[_prefs!.getInt(_themeKey) ?? ThemeMode.system.index];

      final token = _prefs!.getString(_tokenKey);
      final cached = _prefs!.getString(_userKey);
      if (token == null || cached == null) {
        // No saved session, or a token without a saved profile (older install):
        // ask the user to log in rather than wait for the server on the splash screen.
        return _signOutLocal();
      }

      // Show the app immediately with the saved profile, then sync with the server.
      _api.token = token;
      _applyUser(jsonDecode(cached) as Map<String, dynamic>);
      refreshUser();
    } catch (e) {
      startupError = 'Something went wrong while starting the app.';
      debugPrint('Startup failed: $e');
      notifyListeners();
    }
  }

  void _applyUser(Map<String, dynamic> json) {
    user = AppUser.fromJson(json);
    status = user!.role == null ? AuthStatus.needsRole : AuthStatus.ready;
    notifyListeners();
  }

  Future<void> _setUser(Map<String, dynamic> json) async {
    _applyUser(json);
    await _prefs?.setString(_userKey, jsonEncode(json));
  }

  Future<void> _saveSession(Map<String, dynamic> res) async {
    _api.token = res['token'];
    await _prefs?.setString(_tokenKey, res['token']);
    await _setUser(res['user']);
  }

  Future<void> login(String email, String password) async {
    final res = await _api.post('/auth/login', {'email': email, 'password': password});
    await _saveSession(res);
    bumpData();
  }

  /// Creates the account without signing in: the user logs in next, and only
  /// then picks a designation.
  Future<void> register(String name, String email, String password) async {
    await _api.post('/auth/register', {'name': name, 'email': email, 'password': password});
  }

  Future<void> updateProfile({String? role, int? level, String? name}) async {
    final res = await _api.patch('/users/me', {
      'role': ?role,
      'level': ?level,
      'name': ?name,
    });
    await _setUser(res['user']);
    bumpData();
  }

  /// Syncs the cached profile with the server. Failures (offline, sleeping server) are ignored;
  /// an expired session triggers sign-out through [ApiClient.onUnauthorized].
  Future<void> refreshUser() async {
    try {
      final res = await _api.get('/auth/me', timeout: const Duration(seconds: 75));
      await _setUser(res['user']);
    } catch (_) {}
  }

  void bumpData() {
    dataVersion++;
    notifyListeners();
  }

  void setThemeMode(ThemeMode mode) {
    themeMode = mode;
    _prefs?.setInt(_themeKey, mode.index);
    notifyListeners();
  }

  Future<void> logout() async => _signOutLocal();

  void _signOutLocal() {
    _api.token = null;
    _prefs?.remove(_tokenKey);
    _prefs?.remove(_userKey);
    user = null;
    status = AuthStatus.signedOut;
    notifyListeners();
  }
}
