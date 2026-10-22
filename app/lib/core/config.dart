import 'package:flutter/foundation.dart';

/// API base URL.
/// Override at build/run time: flutter run --dart-define=API_URL=https://api.example.com/api
class AppConfig {
  static const _fromEnv = String.fromEnvironment('API_URL');

  static String get apiUrl {
    if (_fromEnv.isNotEmpty) return _fromEnv;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      // Android emulator reaches the host machine through 10.0.2.2
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  static const appName = 'StackPrep';
}
