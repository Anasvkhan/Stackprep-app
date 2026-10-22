import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const primary = Color(0xFF6C5CE7);
  static const primaryDark = Color(0xFF4B3FCF);
  static const accent = Color(0xFF00C2A8);
  static const success = Color(0xFF16A34A);
  static const danger = Color(0xFFE5484D);
  static const warning = Color(0xFFF59E0B);

  static const gradient = LinearGradient(
    colors: [Color(0xFF7C6CF2), Color(0xFF5A4BDB)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const levelColors = {1: Color(0xFF10B981), 2: Color(0xFFF59E0B), 3: Color(0xFFEF4444)};

  static Color fromHex(String? hex, {Color fallback = primary}) {
    if (hex == null || hex.isEmpty) return fallback;
    final h = hex.replaceFirst('#', '');
    final v = int.tryParse(h.length == 6 ? 'FF$h' : h, radix: 16);
    return v == null ? fallback : Color(v);
  }

  /// Track color adjusted so very dark brand colors stay visible in dark mode.
  static Color forTheme(BuildContext context, String? hex) {
    final c = fromHex(hex);
    if (Theme.of(context).brightness == Brightness.dark && c.computeLuminance() < 0.12) {
      return Color.lerp(c, Colors.white, 0.45)!;
    }
    return c;
  }
}

class AppTheme {
  static ThemeData light() => _build(Brightness.light);
  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
      primary: isDark ? const Color(0xFF9D90FF) : AppColors.primary,
      surface: isDark ? const Color(0xFF12121A) : const Color(0xFFF7F7FB),
    );
    final base = ThemeData(useMaterial3: true, colorScheme: scheme, brightness: brightness);
    final text = GoogleFonts.plusJakartaSansTextTheme(base.textTheme).apply(
      bodyColor: isDark ? const Color(0xFFE9E9F2) : const Color(0xFF1C1B29),
      displayColor: isDark ? Colors.white : const Color(0xFF14131F),
    );

    final cardColor = isDark ? const Color(0xFF1C1C28) : Colors.white;
    final border = isDark ? const Color(0xFF2B2B3A) : const Color(0xFFE8E8F0);

    return base.copyWith(
      scaffoldBackgroundColor: scheme.surface,
      textTheme: text,
      cardColor: cardColor,
      dividerColor: border,
      appBarTheme: AppBarTheme(
        backgroundColor: scheme.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: text.titleLarge?.copyWith(fontWeight: FontWeight.w700),
      ),
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: border)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.primary, width: 1.6),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: text.titleSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, 52),
          side: BorderSide(color: border),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: text.titleSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        side: BorderSide(color: border),
        labelStyle: text.labelLarge,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: cardColor,
        indicatorColor: scheme.primary.withValues(alpha: 0.14),
        surfaceTintColor: Colors.transparent,
        height: 68,
        labelTextStyle: WidgetStatePropertyAll(text.labelSmall?.copyWith(fontWeight: FontWeight.w600)),
      ),
      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: cardColor,
        indicatorColor: scheme.primary.withValues(alpha: 0.14),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: cardColor,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      pageTransitionsTheme: PageTransitionsTheme(builders: {
        ...base.pageTransitionsTheme.builders,
        TargetPlatform.android: const FadeForwardsPageTransitionsBuilder(),
        TargetPlatform.windows: const FadeForwardsPageTransitionsBuilder(),
        TargetPlatform.linux: const FadeForwardsPageTransitionsBuilder(),
      }),
    );
  }

  static TextStyle mono(BuildContext context, {double size = 13.5}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, height: 1.5);
}
