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
          o: ['No difference', 'final is assigned once at runtime; const is a compile-time constant (deeply immutable and canonicalized)', 'const can be reassigned', 'final is compile-time only'],
          a: 1,
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
          o: ['A type of constructor', 'A way to reuse a class\'s members across multiple class hierarchies using "with", without inheritance', 'A generic type', 'An async function'],
          a: 1,
          e: 'Flutter uses mixins like SingleTickerProviderStateMixin and AutomaticKeepAliveClientMixin.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does a factory constructor allow?',
          o: ['Only creating new instances', 'Returning an existing instance, a subtype, or a cached object instead of always creating a new one', 'Making classes abstract', 'Creating isolates'],
          a: 1,
          e: 'Common for singletons and fromJson constructors.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What are Dart 3 records and patterns?',
          o: ['Database rows', 'Records are anonymous immutable aggregates like (int, String); patterns allow destructuring and exhaustive switch matching', 'Annotations', 'Isolate messages'],
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
          o: ['A B C D', 'A D C B', 'A D B C', 'A C D B'],
          a: 1,
          e: 'Synchronous code first (A, D), then microtasks (C), then the event queue (B).',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you run several independent futures concurrently and wait for all of them?',
          o: ['await each in sequence', 'await Future.wait([a(), b(), c()])', 'Use a for loop with sleep', 'Use isolates for each'],
          a: 1,
          e: 'Future.wait runs them concurrently; with Dart 3 records you can also await (a(), b()).wait.',
        },
      ],
    },
  ],
};
