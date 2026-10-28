module.exports = {
  slug: 'dart',
  title: 'Dart',
  subtitle: 'Null safety, async, isolates',
  description: 'Dart interview questions: types and null safety, final vs const, classes and mixins, futures and streams, isolates and event loop.',
  category: 'languages',
  roles: ['mobile'],
  icon: 'code',
  color: '#0175C2',
  order: 18,
  topics: [
    {
      slug: 'core',
      title: 'Core Language & Null Safety',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between final and const in Dart?',
          o: ['There is no difference; both create values that are fixed at compile time', 'const variables can be reassigned later, while final variables cannot', 'final is assigned once at runtime; const is a compile-time constant (deeply immutable)', 'final is a compile-time constant (deeply immutable), while const is assigned once at runtime'],
          a: 2,
          e: 'final now = DateTime.now() is allowed; const now = DateTime.now() is not. Const widgets in Flutter are reused instead of rebuilt.',
        },
        {
          t: 'qa', l: 1,
          q: 'Explain sound null safety in Dart.',
          e: `
Types are **non-nullable by default**. A variable can hold null only if its type has \`?\`.

~~~dart
String name = 'Ali';     // can never be null
String? nickname;        // may be null

nickname?.length;        // null-aware access
nickname ?? 'none';      // default value
nickname!.length;        // assert non-null (throws if null - use sparingly)
late final Config cfg;   // initialized later, before first use
~~~
"Sound" means the compiler guarantees a non-nullable variable is never null at runtime, removing a whole class of crashes.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a mixin in Dart?',
          o: ['A generic type that mixes several type parameters into a single class', 'An async function that mixes Futures and Streams into one return value that can be awaited', 'A special constructor that mixes default values into a class\'s fields', 'A way to reuse a class\'s members across multiple class hierarchies using "with"'],
          a: 3,
          e: 'Flutter uses mixins like SingleTickerProviderStateMixin and AutomaticKeepAliveClientMixin.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does a factory constructor allow?',
          o: ['Returning an existing instance, a subtype, or a cached object instead of a new one', 'Spawning a new isolate that constructs the object off the main thread', 'Marking a class as abstract so that only its subclasses can be instantiated, never the class itself', 'It can only create brand new instances, but with named parameters'],
          a: 0,
          e: 'Common for singletons and fromJson constructors.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What are Dart 3 records and patterns?',
          o: ['Compile-time annotations that record metadata about a class and match it with generated code', 'Records are anonymous immutable aggregates like (int, String); patterns enable destructuring', 'Message formats for sending data between isolates, matched by a port pattern', 'Typed rows returned from a database query, matched against a schema pattern'],
          a: 1,
          e: 'final (lat, lng) = getLocation(); sealed classes + switch expressions give exhaustive checks.',
        },
      ],
    },
    {
      slug: 'async',
      title: 'Async, Streams & Isolates',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Future vs Stream?',
          e: `
- **Future<T>:** a single value (or error) available later. Use \`async/await\`.
- **Stream<T>:** a sequence of values over time (or errors). Use \`await for\`, \`listen\`, or \`StreamBuilder\` in Flutter.

~~~dart
Future<User> fetchUser() async => User.fromJson(await api.get('/me'));

Stream<int> ticker() async* {
  for (var i = 0; ; i++) {
    await Future.delayed(const Duration(seconds: 1));
    yield i;
  }
}
~~~
**Single-subscription** streams allow one listener (file reads); **broadcast** streams allow many (events). Always cancel subscriptions in \`dispose\`.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How does Dart handle concurrency? What are isolates?',
          e: `
Dart runs code in **isolates**: each has its own memory heap and a single-threaded **event loop** (no shared memory, so no data races).

- The event loop processes the **microtask queue** first (\`scheduleMicrotask\`, completed futures), then the **event queue** (I/O, timers, gestures).
- Async I/O doesn't block, but **CPU-heavy work** (parsing a huge JSON, image processing) on the main isolate freezes the UI (jank).
- Offload heavy work with \`Isolate.run(() => heavyWork())\` or Flutter's \`compute()\`. Isolates communicate by message passing.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output order?',
          c: `void main() {
  print('A');
  Future(() => print('B'));
  scheduleMicrotask(() => print('C'));
  print('D');
}`,
          o: ['A D C B', 'A D B C', 'A C D B', 'A B C D'],
          a: 0,
          e: 'Synchronous code first (A, D), then microtasks (C), then the event queue (B).',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you run several independent futures concurrently and wait for all of them?',
          o: ['await a(); await b(); await c(); one after another', 'await Future.wait([a(), b(), c()])', 'Spawn a separate isolate for each future', 'Start each one in a for loop with sleep between them'],
          a: 1,
          e: 'Future.wait runs them concurrently; with Dart 3 records you can also await (a(), b()).wait.',
        },
      ],
    },
  ],
};
