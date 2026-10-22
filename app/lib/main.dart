import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme.dart';
import 'screens/role_select_screen.dart';
import 'screens/shell.dart';
import 'screens/splash_screen.dart';
import 'screens/welcome_screen.dart';
import 'state/app_state.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(ChangeNotifierProvider(create: (_) => AppState()..init(), child: const StackPrepApp()));
}

class StackPrepApp extends StatelessWidget {
  const StackPrepApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeMode = context.select<AppState, ThemeMode>((s) => s.themeMode);
    return MaterialApp(
      title: 'StackPrep',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: themeMode,
      home: const RootGate(),
    );
  }
}

/// Picks the first screen based on the session state.
class RootGate extends StatelessWidget {
  const RootGate({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final Widget child = switch (state.status) {
      _ when state.startupError != null => SplashScreen(error: state.startupError, onRetry: state.init),
      AuthStatus.loading => const SplashScreen(),
      AuthStatus.signedOut => const WelcomeScreen(),
      AuthStatus.needsRole => const RoleSelectScreen(),
      AuthStatus.ready => const Shell(),
    };
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 450),
      switchInCurve: Curves.easeOutCubic,
      transitionBuilder: (c, a) => FadeTransition(
        opacity: a,
        child: ScaleTransition(scale: Tween(begin: 0.98, end: 1.0).animate(a), child: c),
      ),
      child: KeyedSubtree(key: ValueKey(state.startupError ?? state.status), child: child),
    );
  }
}
