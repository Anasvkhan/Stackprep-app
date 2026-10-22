import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/api_client.dart';
import '../models/models.dart';
import '../services/api.dart';

enum AuthStatus { loading, signedOut, needsRole, ready }

/// Holds the session (token + user), app metadata, theme mode and a
/// `dataVersion` counter that screens watch to know when to refetch.
class AppState extends ChangeNotifier {
  static const _tokenKey = 'sp_token';
  static const _themeKey = 'sp_theme';

  final _api = ApiClient.instance;

  AuthStatus status = AuthStatus.loading;
  AppUser? user;
  List<RoleOption> roles = [];
  List<CategoryOption> categories = [];
  ThemeMode themeMode = ThemeMode.system;
  int dataVersion = 0;
  String? startupError;

  SharedPreferences? _prefs;

  RoleOption? get role => roles.where((r) => r.id == user?.role).firstOrNull;

  Future<void> init() async {
    status = AuthStatus.loading;
    startupError = null;
    notifyListeners();

    _prefs ??= await SharedPreferences.getInstance();
    themeMode = ThemeMode.values[_prefs!.getInt(_themeKey) ?? ThemeMode.system.index];
    _api.onUnauthorized = () => _signOutLocal();

    try {
      final meta = await Api.meta();
      roles = (meta['roles'] as List).map((r) => RoleOption.fromJson(r)).toList();
      categories = (meta['categories'] as List).map((c) => CategoryOption.fromJson(c)).toList();
    } on ApiException catch (e) {
      startupError = e.message;
      notifyListeners();
      return;
    }

    final token = _prefs!.getString(_tokenKey);
    if (token == null) {
      status = AuthStatus.signedOut;
      notifyListeners();
      return;
    }
    _api.token = token;
    try {
      final res = await _api.get('/auth/me');
      _setUser(res['user']);
    } on ApiException catch (e) {
      if (e.status == 401) {
        _signOutLocal();
      } else {
        startupError = e.message;
        notifyListeners();
      }
    }
  }

  void _setUser(Map<String, dynamic> json) {
    user = AppUser.fromJson(json);
    status = user!.role == null ? AuthStatus.needsRole : AuthStatus.ready;
    notifyListeners();
  }

  Future<void> _saveSession(Map<String, dynamic> res) async {
    _api.token = res['token'];
    await _prefs?.setString(_tokenKey, res['token']);
    _setUser(res['user']);
  }

  /// Onboarding: create a guest account with the chosen designation.
  Future<void> startAsGuest(String roleId) async {
    final res = await _api.post('/auth/guest');
    _api.token = res['token'];
    await _prefs?.setString(_tokenKey, res['token']);
    final upd = await _api.patch('/users/me', {'role': roleId});
    _setUser(upd['user']);
  }

  Future<void> login(String email, String password) async {
    final res = await _api.post('/auth/login', {'email': email, 'password': password});
    await _saveSession(res);
    bumpData();
  }

  /// Registers a new account. If the current user is a guest, the guest is upgraded and keeps progress.
  Future<void> register(String name, String email, String password) async {
    final res = await _api.post('/auth/register', {'name': name, 'email': email, 'password': password});
    final hadRole = user?.role;
    await _saveSession(res);
    if (user?.role == null && hadRole != null) await updateProfile(role: hadRole);
  }

  Future<void> updateProfile({String? role, int? level, String? name}) async {
    final res = await _api.patch('/users/me', {
      'role': ?role,
      'level': ?level,
      'name': ?name,
    });
    _setUser(res['user']);
    bumpData();
  }

  Future<void> refreshUser() async {
    try {
      final res = await _api.get('/auth/me');
      _setUser(res['user']);
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
    user = null;
    status = AuthStatus.signedOut;
    notifyListeners();
  }
}
