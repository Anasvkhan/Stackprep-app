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
          o: ['No difference', 'val is read-only (cannot be reassigned); var is mutable', 'var is constant', 'val is only for numbers'],
          a: 1,
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
          o: ['Nothing', 'How the object is referenced (it vs this) and what they return (lambda result vs the object itself)', 'Thread they run on', 'Only naming'],
          a: 1,
          e: 'apply/also return the object (configuration, side effects); let/run/with return the lambda result (transformations, null checks with ?.let).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a sealed class used for?',
          o: ['Preventing instantiation', 'Representing a restricted hierarchy of known subtypes so when-expressions can be exhaustive (e.g. UiState: Loading, Success, Error)', 'Encryption', 'Threading'],
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
          o: ['Same', 'StateFlow always holds a current value and replays it to new collectors (UI state); SharedFlow is configurable and suited for one-off events', 'SharedFlow holds state', 'StateFlow is cold'],
          a: 1,
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
          o: ['Rebuilding the APK', 'Re-running composable functions whose read state has changed to update the UI', 'Restarting the Activity', 'Garbage collection'],
          a: 1,
          e: 'Use remember, derivedStateOf, stable/immutable classes and lazy layouts to keep recompositions cheap.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which architecture is recommended by Google for Android apps?',
          o: ['Everything in the Activity', 'Layered architecture: UI layer (Compose + ViewModel), optional domain layer, data layer (repositories), with unidirectional data flow and DI (Hilt)', 'Only MVC', 'Singletons everywhere'],
          a: 1,
          e: 'Room for local DB, Retrofit/Ktor for networking, WorkManager for background work.',
        },
      ],
    },
  ],
};
