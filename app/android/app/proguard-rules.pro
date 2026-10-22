# Only used if code shrinking (R8) is turned back on for release builds.
# shared_preferences_android calls Kotlin code from Dart via JNI; R8 can't see those calls
# and strips the classes, crashing the app at startup (NoSuchMethodError / ClassNotFoundException).
-keep class io.flutter.plugins.** { *; }
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**
