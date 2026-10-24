import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// "Kinetic Logic" design system (see DESIGN.md exported from Stitch).
class AppColors {
  static const primary = Color(0xFF6C5CE7);
  static const primaryDark = Color(0xFF4834D4);
  static const accent = Color(0xFF00C2A8);
  static const success = Color(0xFF16A34A);
  static const danger = Color(0xFFE5484D);
  static const warning = Color(0xFFF59E0B);
  static const slate = Color(0xFF64748B);

  /// Metrics / hero surfaces: deep indigo into iris at 135 degrees.
  static const gradient = LinearGradient(
    colors: [Color(0xFF4834D4), Color(0xFF6C5CE7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Primary buttons: iris with a slightly deeper end.
  static const buttonGradient = LinearGradient(
    colors: [Color(0xFF6C5CE7), Color(0xFF5341CD)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const levelColors = {1: success, 2: warning, 3: danger};

  static bool isDark(BuildContext context) => Theme.of(context).brightness == Brightness.dark;

  /// Surface level 2: code panels, badge trays, segmented control tracks.
  static Color surface2(BuildContext context) => isDark(context) ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9);

  /// Secondary text and metadata.
  static Color muted(BuildContext context) => isDark(context) ? const Color(0xFF94A3B8) : slate;

  /// Text color on tinted primary surfaces (secondary buttons, links).
  static Color primaryText(BuildContext context) => isDark(context) ? const Color(0xFFB4AAFF) : primaryDark;

  static Color fromHex(String? hex, {Color fallback = primary}) {
    if (hex == null || hex.isEmpty) return fallback;
    final h = hex.replaceFirst('#', '');
    final v = int.tryParse(h.length == 6 ? 'FF$h' : h, radix: 16);
    return v == null ? fallback : Color(v);
  }

  /// Track color adjusted so very dark brand colors stay visible in dark mode.
  static Color forTheme(BuildContext context, String? hex) {
    final c = fromHex(hex);
    if (isDark(context) && c.computeLuminance() < 0.12) {
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
    final canvas = isDark ? const Color(0xFF0B0F19) : const Color(0xFFF8FAFC);
    final cardColor = isDark ? const Color(0xFF131B2E) : Colors.white;
    final surface2 = isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9);
    final border = isDark ? const Color(0xFF243049) : const Color(0xFFE2E8F0);
    final muted = isDark ? const Color(0xFF94A3B8) : AppColors.slate;
    final primary = isDark ? const Color(0xFF9D90FF) : AppColors.primary;

    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
      primary: primary,
      secondary: AppColors.accent,
      error: AppColors.danger,
      surface: canvas,
    );
    final base = ThemeData(useMaterial3: true, colorScheme: scheme, brightness: brightness);
    final text = GoogleFonts.plusJakartaSansTextTheme(base.textTheme).apply(
      bodyColor: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF0B1C30),
      displayColor: isDark ? Colors.white : const Color(0xFF0B1C30),
    );
    final monoLabel = GoogleFonts.jetBrainsMono(fontSize: 12, fontWeight: FontWeight.w600);

    OutlineInputBorder outline(Color c, [double w = 1.5]) =>
        OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: c, width: w));

    return base.copyWith(
      scaffoldBackgroundColor: canvas,
      textTheme: text,
      cardColor: cardColor,
      dividerColor: border,
      hintColor: muted,
      appBarTheme: AppBarTheme(
        backgroundColor: canvas,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: text.titleLarge?.copyWith(fontWeight: FontWeight.w700, fontSize: 19),
      ),
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? surface2 : canvas,
        hintStyle: TextStyle(color: muted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        border: outline(border),
        enabledBorder: outline(border),
        focusedBorder: outline(primary, 1.8),
        errorBorder: outline(AppColors.danger),
        focusedErrorBorder: outline(AppColors.danger, 1.8),
        prefixIconColor: muted,
        suffixIconColor: muted,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: text.titleSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, 52),
          backgroundColor: surface2,
          foregroundColor: isDark ? const Color(0xFFB4AAFF) : AppColors.primaryDark,
          side: BorderSide(color: border),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: text.titleSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: text.labelLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: ChipThemeData(
        showCheckmark: false,
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        color: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? AppColors.primary : cardColor,
        ),
        side: WidgetStateBorderSide.resolveWith(
          (s) => BorderSide(color: s.contains(WidgetState.selected) ? AppColors.primary : border),
        ),
        labelStyle: monoLabel.copyWith(
          color: WidgetStateColor.resolveWith((s) => s.contains(WidgetState.selected) ? Colors.white : muted),
        ),
        iconTheme: IconThemeData(size: 16, color: muted),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: cardColor,
        indicatorColor: AppColors.primary.withValues(alpha: isDark ? 0.22 : 0.10),
        indicatorShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        height: 68,
        iconTheme: WidgetStateProperty.resolveWith(
          (s) => IconThemeData(color: s.contains(WidgetState.selected) ? primary : muted),
        ),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (s) => monoLabel.copyWith(fontSize: 11, color: s.contains(WidgetState.selected) ? primary : muted),
        ),
      ),
      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: cardColor,
        indicatorColor: AppColors.primary.withValues(alpha: isDark ? 0.22 : 0.10),
        selectedIconTheme: IconThemeData(color: primary),
        unselectedIconTheme: IconThemeData(color: muted),
        selectedLabelTextStyle: monoLabel.copyWith(fontSize: 11, color: primary),
        unselectedLabelTextStyle: monoLabel.copyWith(fontSize: 11, color: muted),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: cardColor,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: cardColor,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
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

  /// JetBrains Mono: stats, badges, timers, code.
  static TextStyle mono(
    BuildContext context, {
    double size = 13.5,
    FontWeight? weight,
    Color? color,
    double height = 1.5,
    double? letterSpacing,
  }) =>
      GoogleFonts.jetBrainsMono(
        fontSize: size,
        height: height,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing,
      );
}
