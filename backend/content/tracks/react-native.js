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
          o: ['Expo cannot build production apps', 'Expo provides a managed toolchain (EAS builds, OTA updates, many native APIs); bare gives full native control. With dev builds and config plugins, Expo supports most custom native code', 'Bare React Native has no native code', 'They use different React versions'],
          a: 1,
          e: 'Expo is the recommended starting point for most new apps.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How is layout done in React Native?',
          o: ['CSS Grid', 'Flexbox via the Yoga layout engine, with flexDirection defaulting to column', 'Absolute positioning only', 'HTML tables'],
          a: 1,
          e: 'Styles are JS objects (StyleSheet.create); units are density-independent pixels.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which library is the standard for navigation in React Native?',
          o: ['react-router-dom', 'React Navigation (or Expo Router, built on it)', 'Next.js router', 'Redux'],
          a: 1,
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
          o: ['They use CSS', 'Animations run as worklets on the UI thread, independent of the JS thread', 'They are pre-recorded videos', 'They reduce frame rate'],
          a: 1,
          e: 'The Animated API with useNativeDriver: true also offloads supported properties to native.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Where should you store sensitive data like auth tokens in a React Native app?',
          o: ['AsyncStorage in plain text', 'Secure storage backed by iOS Keychain / Android Keystore (expo-secure-store, react-native-keychain)', 'In Redux only', 'In a global variable'],
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
          o: ['App Store releases', 'Shipping JavaScript/asset updates directly to users without a store review (EAS Update, CodePush), as long as native code is unchanged', 'Firmware updates', 'Push notifications'],
          a: 1,
          e: 'Native changes still require a new store build.',
        },
      ],
    },
  ],
};
