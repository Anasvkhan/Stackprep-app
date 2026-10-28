module.exports = {
  slug: 'kotlin-android',
  title: 'Kotlin & Android',
  subtitle: 'Kotlin, coroutines, Compose, lifecycle',
  description: 'Kotlin and Android interview questions: null safety, data classes, coroutines and Flow, Activity/Fragment lifecycle, ViewModel, Jetpack Compose and architecture.',
  category: 'languages',
  roles: ['mobile'],
  icon: 'android',
  color: '#7F52FF',
  order: 19,
  topics: [
    {
      slug: 'kotlin',
      title: 'Kotlin Language',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between val and var in Kotlin?',
          o: ['val is read-only; var is mutable', 'var is a constant; val can be reassigned', 'val is only allowed for numeric types', 'There is no difference; both can be reassigned'],
          a: 0,
          e: 'val does not make the referenced object immutable. const val is a compile-time constant.',
        },
        {
          t: 'qa', l: 1,
          q: 'What do data classes give you?',
          e: `
\`data class User(val id: Int, val name: String)\` automatically generates:
- \`equals()\` / \`hashCode()\` based on constructor properties
- \`toString()\`
- \`copy()\` for immutable updates: \`user.copy(name = "Ali")\`
- \`componentN()\` for destructuring: \`val (id, name) = user\`

Ideal for models and UI state.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What do the scope functions let, apply, also, run and with differ in?',
          o: ['How the object is referenced (it vs this) and what they return', 'Nothing; they are aliases kept for readability', 'The thread or dispatcher each lambda is executed on', 'Only their names; behaviour, receivers and return values are all identical'],
          a: 0,
          e: 'apply/also return the object (configuration, side effects); let/run/with return the lambda result (transformations, null checks with ?.let).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a sealed class used for?',
          o: ['Encrypting a class\'s fields so they cannot be read through reflection', 'A restricted hierarchy of known subtypes so when-expressions are exhaustive', 'Preventing instantiation so the class acts like a static utility holder with only companion members', 'Making a class thread-safe by sealing access to its mutable state'],
          a: 1,
          e: 'The compiler checks that all subtypes are handled in a when expression.',
        },
      ],
    },
    {
      slug: 'coroutines-android',
      title: 'Coroutines, Lifecycle & Compose',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are Kotlin coroutines and structured concurrency?',
          e: `
**Coroutines** are lightweight, suspendable computations for async code written sequentially.

~~~kotlin
viewModelScope.launch {
    _state.value = UiState.Loading
    val user = withContext(Dispatchers.IO) { repo.fetchUser() }   // suspends, doesn't block
    _state.value = UiState.Success(user)
}
~~~
- **Dispatchers:** Main (UI), IO (network/disk), Default (CPU work)
- **Structured concurrency:** coroutines run inside a **scope** (viewModelScope, lifecycleScope); cancelling the scope cancels all children, so no leaks.
- \`launch\` returns a Job; \`async\` returns a Deferred result (\`await()\`).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'StateFlow vs SharedFlow?',
          o: ['SharedFlow always holds a current state value, while StateFlow is meant only for one-off events', 'They are the same; SharedFlow is the older name for StateFlow', 'StateFlow is cold and restarts for each collector, SharedFlow is hot', 'StateFlow holds a current value and replays it (UI state); SharedFlow suits one-off events'],
          a: 3,
          e: 'Collect flows lifecycle-aware with repeatOnLifecycle or collectAsStateWithLifecycle in Compose.',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the Activity lifecycle and why ViewModel exists.',
          e: `
**Lifecycle:** \`onCreate\` -> \`onStart\` -> \`onResume\` (visible and interactive) -> \`onPause\` -> \`onStop\` -> \`onDestroy\`.

**Configuration changes** (rotation, language) destroy and recreate the Activity, losing in-memory state.

**ViewModel** survives configuration changes and holds UI state and business logic for a screen; it is cleared only when the screen is finished. Use **SavedStateHandle** to survive process death for small state.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is Jetpack Compose recomposition?',
          o: ['Garbage collecting composables that are no longer on screen', 'Re-running composables whose read state changed to update the UI', 'Rebuilding the APK after code changes during development', 'Restarting the Activity when the configuration, locale or theme changes'],
          a: 1,
          e: 'Use remember, derivedStateOf, stable/immutable classes and lazy layouts to keep recompositions cheap.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which architecture is recommended by Google for Android apps?',
          o: ['Everything in the Activity, which handles the UI, network calls and the database directly', 'Only classic MVC, with a Controller class for each screen and no ViewModel', 'Layered: UI layer (Compose + ViewModel), optional domain, data layer, with UDF and DI', 'Singletons everywhere so that every screen can reach shared state directly'],
          a: 2,
          e: 'Room for local DB, Retrofit/Ktor for networking, WorkManager for background work.',
        },
      ],
    },
  ],
};
