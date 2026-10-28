module.exports = {
  slug: 'react-native',
  title: 'React Native',
  subtitle: 'Architecture, navigation, performance',
  description: 'React Native interview questions: architecture (JSI, Fabric, TurboModules), Expo vs bare, navigation, styling, lists, performance, native modules and offline storage.',
  category: 'frameworks',
  roles: ['mobile', 'frontend'],
  icon: 'smartphone',
  color: '#61DAFB',
  order: 38,
  topics: [
    {
      slug: 'core',
      title: 'Architecture & Basics',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain React Native\'s architecture (old bridge vs new architecture).',
          e: `
**Old architecture:** JavaScript thread and native thread communicated through an **asynchronous JSON bridge** – serialization overhead and no synchronous calls.

**New architecture** (default since RN 0.76):
- **JSI (JavaScript Interface):** JS can hold references to C++ objects and call native methods directly, synchronously when needed.
- **Fabric:** new rendering system – concurrent React features, synchronous layout.
- **TurboModules:** lazily loaded native modules via JSI.
- **Codegen:** type-safe interfaces generated from TypeScript specs.
- **Hermes:** JS engine optimized for mobile (bytecode precompilation, faster startup).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Expo vs bare React Native?',
          o: ['Bare React Native has no native code at all, while Expo adds iOS and Android projects', 'They use different React versions, so libraries built for one do not work in the other', 'Expo cannot build production apps, so you must eject before publishing to the stores', 'Expo gives a managed toolchain (EAS, OTA updates); bare gives full native control'],
          a: 3,
          e: 'Expo is the recommended starting point for most new apps.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How is layout done in React Native?',
          o: ['Absolute positioning only, with x/y coordinates per view', 'HTML-style tables with rows and cells', 'Flexbox via Yoga, flexDirection defaults to column', 'CSS Grid, with grid-template-columns'],
          a: 2,
          e: 'Styles are JS objects (StyleSheet.create); units are density-independent pixels.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which library is the standard for navigation in React Native?',
          o: ['React Navigation (or Expo Router)', 'Redux with a route reducer', 'react-router-dom', 'The Next.js App Router for native'],
          a: 0,
          e: 'Stack, tab and drawer navigators; deep linking support.',
        },
      ],
    },
    {
      slug: 'performance',
      title: 'Performance & Native',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you render long lists efficiently in React Native?',
          e: `
- Use **FlatList/SectionList** (virtualized), or **FlashList** (Shopify) for better performance
- Provide a stable \`keyExtractor\`
- Memoize items with \`React.memo\` and stable callbacks
- \`getItemLayout\` for fixed-height rows (skips measurement)
- Tune \`initialNumToRender\`, \`windowSize\`, \`maxToRenderPerBatch\`
- Optimize images (proper sizes, caching with expo-image/FastImage)
- Never use a ScrollView with .map for hundreds of items`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why do animations with react-native-reanimated stay smooth even when the JS thread is busy?',
          o: ['They lower the frame rate automatically whenever the JS thread is busy, so frames look even', 'Animations run as worklets on the UI thread, independent of the JS thread', 'They use CSS animations that the native view layer runs for free', 'They are pre-recorded video clips played on top of the native views'],
          a: 1,
          e: 'The Animated API with useNativeDriver: true also offloads supported properties to native.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Where should you store sensitive data like auth tokens in a React Native app?',
          o: ['In a global JavaScript variable that is cleared when the app closes', 'iOS Keychain / Android Keystore (expo-secure-store)', 'AsyncStorage, in plain text', 'In the Redux store only'],
          a: 1,
          e: 'AsyncStorage/MMKV are unencrypted by default and fine for non-sensitive data.',
        },
        {
          t: 'qa', l: 3,
          q: 'What causes slow startup in React Native apps and how do you improve it?',
          e: `
- **Large JS bundle:** remove unused dependencies, lazy-load screens and heavy modules
- Use **Hermes** (precompiled bytecode)
- Avoid expensive work on app launch (sync storage reads, big JSON parsing, initializing all SDKs) – defer non-critical work
- New architecture: **TurboModules** load native modules lazily
- Keep the splash screen until essential data is ready, then render progressively
- Measure with Flipper/React DevTools profilers and platform tools (Android Studio profiler, Xcode Instruments)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What are OTA (over-the-air) updates in React Native?',
          o: ['Shipping JS/asset updates to users without store review, if native code is unchanged', 'Push notifications that tell the user a new version is in the store', 'Firmware updates for the device that React Native apps can trigger', 'Regular App Store and Play Store releases that are downloaded and installed in the background'],
          a: 0,
          e: 'Native changes still require a new store build.',
        },
      ],
    },
  ],
};
