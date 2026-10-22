module.exports = {
  slug: 'flutter',
  title: 'Flutter',
  subtitle: 'Widgets, state, rendering, performance',
  description: 'Flutter interview questions: widget tree, Stateless vs Stateful, lifecycle, keys, BuildContext, state management, navigation, rendering pipeline, platform channels, performance and testing.',
  category: 'frameworks',
  roles: ['mobile'],
  icon: 'flutter',
  color: '#02569B',
  order: 37,
  topics: [
    {
      slug: 'widgets',
      title: 'Widgets & Lifecycle',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'StatelessWidget vs StatefulWidget?',
          e: `
- **StatelessWidget:** immutable; its output depends only on its constructor arguments and inherited data. Rebuilt when the parent rebuilds it.
- **StatefulWidget:** has a separate long-lived **State** object holding mutable data. Calling \`setState()\` marks it dirty so \`build()\` runs again.

The widget itself is always immutable and cheap; the State object persists across rebuilds.`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the StatefulWidget lifecycle.',
          e: `
1. **createState()** – framework creates the State
2. **initState()** – one-time setup (controllers, subscriptions). No inherited widgets here.
3. **didChangeDependencies()** – after initState and whenever an InheritedWidget it depends on changes
4. **build()** – returns the UI; may run many times, keep it fast and side-effect free
5. **didUpdateWidget(old)** – parent rebuilt with a new widget configuration
6. **setState()** – schedules a rebuild
7. **deactivate()** – removed from the tree (may be reinserted)
8. **dispose()** – permanent removal: dispose controllers, cancel streams/timers

Check \`mounted\` before calling setState after an await.`,
        },
        {
          t: 'qa', l: 2,
          q: 'What are the widget, element and render object trees?',
          e: `
- **Widget tree:** immutable configuration (blueprints) – recreated cheaply on every build.
- **Element tree:** instantiated widgets that hold position in the tree and link widgets to render objects; elements persist and are **updated** when a new widget of the same type and key arrives.
- **RenderObject tree:** does layout, painting and hit testing (expensive, reused).

This is why rebuilding widgets is cheap: Flutter diffs new widgets against existing elements and only updates render objects that changed.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'When do you need Keys in Flutter?',
          o: ['Never', 'When widgets of the same type are reordered, added or removed in a collection and must keep their state (e.g. list items with text fields or animations)', 'Only for forms', 'Only for images'],
          a: 1,
          e: 'ValueKey/ObjectKey for list items, UniqueKey to force recreation, GlobalKey to access state across the tree (use sparingly).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is BuildContext?',
          o: ['The app theme', 'A handle to a widget\'s location (its Element) in the tree, used to look up inherited widgets like Theme, MediaQuery and Navigator', 'A global singleton', 'The device screen'],
          a: 1,
          e: 'Using a context above a Scaffold/Provider to look for it fails; use a Builder or a lower context.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Why use const constructors for widgets?',
          o: ['Required by Dart', 'Const widgets are canonicalized and skipped during rebuilds, improving performance', 'They enable hot reload', 'They make widgets stateful'],
          a: 1,
          e: 'Enable the prefer_const_constructors lint.',
        },
      ],
    },
    {
      slug: 'state-management',
      title: 'State Management & Navigation',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Compare popular Flutter state management approaches.',
          e: `
- **setState:** local, ephemeral UI state in one widget.
- **InheritedWidget:** built-in way to pass data down efficiently; foundation of most solutions.
- **Provider:** simple DI + ChangeNotifier built on InheritedWidget; good for small/medium apps.
- **Riverpod:** compile-safe, testable, no BuildContext needed, great for async state (\`AsyncValue\`).
- **BLoC/Cubit:** events -> states with streams; strict separation, very testable, popular in large teams.
- **GetX / MobX / Redux:** alternatives with different trade-offs.

Separate **ephemeral UI state** (tab index) from **app state** (auth, cart, cached API data).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'In Provider, what is the difference between context.watch<T>() and context.read<T>()?',
          o: ['None', 'watch subscribes and rebuilds the widget on changes; read gets the value once without listening (use in callbacks)', 'read rebuilds; watch does not', 'watch is for streams only'],
          a: 1,
          e: 'context.select<T, R>() rebuilds only when a selected part changes.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Navigator 1.0 vs Navigator 2.0 (Router API)?',
          o: ['Same API', 'Navigator 1.0 is imperative (push/pop); Navigator 2.0 is declarative, driving the page stack from app state, which helps with deep links and web URLs (go_router wraps it)', 'Navigator 2.0 removes routes', 'Navigator 1.0 only works on web'],
          a: 1,
          e: 'go_router is the most common choice for URL-based navigation.',
        },
      ],
    },
    {
      slug: 'performance-platform',
      title: 'Rendering, Performance & Platform',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does Flutter render UI differently from React Native?',
          e: `
- **Flutter** draws every pixel itself with its own rendering engine (**Impeller**, formerly Skia) onto a canvas. It doesn't use native UI components, so the UI looks identical across platforms and performance is predictable. Dart compiles **AOT to native machine code** for release builds.
- **React Native** renders **real native platform views**, controlled from JavaScript (the new architecture uses JSI/Fabric instead of the old async bridge).

Flutter: consistent pixel-perfect UI, great performance. React Native: native look by default, JavaScript ecosystem.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you optimize Flutter app performance?',
          e: `
- Use **const** widgets; split big build methods into smaller widgets so rebuilds are scoped
- Avoid heavy work in \`build()\`; cache computations
- **ListView.builder / SliverList** for long lists (lazy building); set \`itemExtent\` when possible
- Use \`select\`/\`Selector\` to rebuild only what changed
- **RepaintBoundary** for complex, frequently repainting parts; avoid excessive Opacity/clip (use \`FadeTransition\`)
- Resize/cached images (\`cacheWidth\`, \`cached_network_image\`)
- Move CPU-heavy work to isolates (\`compute\`)
- Profile in **profile mode** with Flutter DevTools (frame chart, rebuild counts, raster vs UI thread)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How does Flutter call native Android/iOS APIs not covered by plugins?',
          o: ['It cannot', 'Platform channels (MethodChannel, EventChannel) or FFI/Pigeon for type-safe bindings', 'Using WebViews only', 'Through REST APIs'],
          a: 1,
          e: 'MethodChannel sends async messages between Dart and Kotlin/Swift code.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Hot reload vs hot restart?',
          o: ['Same thing', 'Hot reload injects code changes and keeps app state; hot restart restarts the app and resets state', 'Hot restart keeps state', 'Hot reload reinstalls the app'],
          a: 1,
          e: 'Changes to initState, globals or main() usually need a hot restart.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which test types does Flutter support?',
          o: ['Only manual testing', 'Unit tests, widget tests (testWidgets with a simulated environment) and integration tests on devices', 'Only integration tests', 'Snapshot tests only'],
          a: 1,
          e: 'Golden tests compare rendered widgets to reference images.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your Flutter app janks when scrolling a feed of images. How do you investigate and fix it?',
          e: `
1. Run in **profile mode** and open DevTools' performance view: is the **UI thread** (build/layout) or **raster thread** slow?
2. **UI thread:** heavy \`build()\` methods, rebuilding the whole list on every change, synchronous JSON parsing -> split widgets, use const, \`select\`, move parsing to \`compute\`.
3. **Raster thread:** large images decoded at full resolution, expensive effects (Opacity, shadows, clipping, saveLayer) -> resize images with \`cacheWidth\`, use cached images, simplify effects, \`RepaintBoundary\`.
4. Use \`ListView.builder\` with stable keys and pagination.
5. Re-measure after each change.`,
        },
      ],
    },
  ],
};
