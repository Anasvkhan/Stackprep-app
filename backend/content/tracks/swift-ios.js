module.exports = {
  slug: 'swift-ios',
  title: 'Swift & iOS',
  subtitle: 'Optionals, ARC, SwiftUI, concurrency',
  description: 'Swift and iOS interview questions: optionals, value vs reference types, protocols, ARC and retain cycles, Swift concurrency, SwiftUI state and app lifecycle.',
  category: 'languages',
  roles: ['mobile'],
  icon: 'apple',
  color: '#F05138',
  order: 20,
  topics: [
    {
      slug: 'swift',
      title: 'Swift Language',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What are optionals in Swift and how do you unwrap them safely?',
          e: `
An **optional** (\`String?\`) either holds a value or \`nil\`.

~~~swift
if let name = user.name { print(name) }        // optional binding
guard let id = userId else { return }          // early exit
let display = user.nickname ?? "Guest"         // nil-coalescing
let count = user.friends?.count                // optional chaining
let forced = user.name!                        // force unwrap - crashes if nil
~~~
Avoid force unwrapping except where nil is truly impossible.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'struct vs class in Swift?',
          o: ['Same', 'Structs are value types (copied, no inheritance); classes are reference types (shared, inheritance, deinit, managed by ARC)', 'Structs support inheritance', 'Classes are copied on assignment'],
          a: 1,
          e: 'Swift prefers structs by default; arrays and dictionaries use copy-on-write.',
        },
        {
          t: 'qa', l: 2,
          q: 'How does ARC work and what is a retain cycle?',
          e: `
**ARC (Automatic Reference Counting)** frees a class instance when its strong reference count reaches zero.

A **retain cycle** happens when two objects strongly reference each other (or a closure captures \`self\` strongly while \`self\` holds the closure), so neither is ever freed -> memory leak.

**Fixes**
- \`weak var delegate: MyDelegate?\` (becomes nil when freed)
- \`unowned\` when the reference always outlives the owner
- Closure capture lists: \`{ [weak self] in self?.reload() }\`

Find leaks with Xcode's Memory Graph debugger and Instruments.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is protocol-oriented programming?',
          o: ['Networking protocols', 'Designing with protocols and protocol extensions (default implementations) for composition, instead of class inheritance', 'Using only classes', 'A testing method'],
          a: 1,
          e: 'Protocols can be adopted by structs, enums and classes.',
        },
      ],
    },
    {
      slug: 'ios',
      title: 'Concurrency, SwiftUI & App',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain Swift concurrency: async/await, Task and actors.',
          e: `
~~~swift
func loadProfile() async throws -> Profile {
    async let user = api.user()        // run concurrently
    async let posts = api.posts()
    return try await Profile(user: user, posts: posts)
}

Task { @MainActor in
    profile = try? await loadProfile()
}
~~~
- **async/await:** readable asynchronous code
- **Task / TaskGroup:** structured concurrency with cancellation
- **Actors:** reference types that protect their mutable state from data races (one task at a time)
- **@MainActor:** guarantees UI updates run on the main thread
- Swift 6 strict concurrency checks data races at compile time (\`Sendable\`)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'In SwiftUI, what is the difference between @State and @Binding?',
          o: ['Same', '@State owns local mutable view state; @Binding is a two-way reference to state owned by a parent', '@Binding owns state', '@State is global'],
          a: 1,
          e: 'For observable models: @Observable (iOS 17) or ObservableObject with @StateObject/@ObservedObject, and @Environment for shared dependencies.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why must UI updates happen on the main thread in iOS?',
          o: ['They don\'t', 'UIKit/SwiftUI are not thread-safe; updating UI from background threads causes glitches or crashes', 'The main thread is faster', 'For battery life only'],
          a: 1,
          e: 'Use @MainActor or DispatchQueue.main.async.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Where should you store a user\'s auth token on iOS?',
          o: ['UserDefaults', 'Keychain', 'A plist in the app bundle', 'Core Data in plain text'],
          a: 1,
          e: 'UserDefaults is unencrypted and meant for preferences.',
        },
      ],
    },
  ],
};
