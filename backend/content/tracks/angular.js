module.exports = {
  slug: 'angular',
  title: 'Angular',
  subtitle: 'Components, DI, RxJS, signals',
  description: 'Angular interview questions: components, modules vs standalone, dependency injection, change detection, RxJS, signals, routing, forms and performance.',
  category: 'frameworks',
  roles: ['frontend', 'fullstack'],
  icon: 'shield',
  color: '#DD0031',
  order: 22,
  topics: [
    {
      slug: 'core',
      title: 'Components, Templates & DI',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What are the main building blocks of an Angular application?',
          e: `
- **Components:** UI building blocks (class + template + styles) declared with \`@Component\`.
- **Templates:** HTML with Angular syntax – interpolation \`{{ }}\`, property binding \`[prop]\`, event binding \`(event)\`, two-way \`[(ngModel)]\`, control flow \`@if / @for / @switch\`.
- **Directives:** attribute (\`ngClass\`) and structural behaviors.
- **Services:** reusable logic injected via **dependency injection**.
- **Pipes:** transform values in templates (\`date\`, \`currency\`, \`async\`).
- **Routing:** navigation between views.
- **Standalone components** (default since v17) or NgModules for organization.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which syntax is two-way data binding in Angular?',
          o: ['[value]', '(value)', '{{ value }}', '[(ngModel)]'],
          a: 3,
          e: '"Banana in a box" [(...)] combines property binding [] and event binding ().',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does providedIn: "root" mean on an @Injectable service?',
          o: ['The service can only be injected into AppComponent and its direct child components', 'A new instance is created for every component that injects the service', 'A single app-wide singleton is created, and it is tree-shakable if unused', 'The service is registered only for server-side rendering and skipped in the browser'],
          a: 2,
          e: 'Providing in a component\'s providers array instead creates an instance per component subtree.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which lifecycle hook runs when an @Input property changes?',
          o: ['ngAfterViewInit', 'ngOnInit', 'ngOnDestroy', 'ngOnChanges'],
          a: 3,
          e: 'Order: constructor -> ngOnChanges -> ngOnInit -> ngDoCheck -> ngAfterContentInit -> ngAfterViewInit -> ... -> ngOnDestroy.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do components communicate in Angular?',
          e: `
- **Parent -> child:** \`@Input()\` / \`input()\` signal inputs
- **Child -> parent:** \`@Output()\` with \`EventEmitter\` / \`output()\`
- **Template reference / ViewChild:** parent accesses child instance
- **Shared service** with a Subject/BehaviorSubject or signal for siblings and unrelated components
- **State management:** NgRx Store / Signal Store for complex apps
- **Router** params/state for navigation context`,
        },
      ],
    },
    {
      slug: 'change-detection',
      title: 'Change Detection & Signals',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does change detection work in Angular? What is OnPush?',
          e: `
Traditionally, **Zone.js** patches async APIs (events, timers, XHR). After any async event, Angular runs change detection **from the root down**, checking every component's bindings.

**OnPush strategy** (\`changeDetection: ChangeDetectionStrategy.OnPush\`): the component is checked only when:
- An \`@Input\` reference changes
- An event originates from the component or its children
- An \`async\` pipe emits / a signal it reads changes
- \`markForCheck()\` is called

OnPush + immutable data greatly reduces work in large apps.

**Zoneless Angular** (signals-based) removes Zone.js and updates only what depends on changed signals.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What are Angular signals?',
          o: ['Reactive primitives (signal, computed, effect) that track dependencies and notify consumers', 'Interceptors that react to HTTP requests and responses before they reach components', 'Router events emitted on navigation start, end and error that components can subscribe and react to', 'Lightweight Web Workers that run component logic off the main thread'],
          a: 0,
          e: 'const count = signal(0); const double = computed(() => count() * 2); count.set(1). They enable fine-grained reactivity and zoneless change detection.',
        },
        {
          t: 'mcq', l: 3,
          q: 'A component with OnPush does not update after you push an item into an input array. Why?',
          o: ['The array reference did not change, so OnPush does not detect the mutation', 'Arrays are passed by value to inputs, so the child receives a stale copy', 'OnPush components require you to call ngOnChanges manually after each push', 'OnPush only checks inputs during ngOnInit, so later changes are always ignored'],
          a: 0,
          e: 'Create a new array (items = [...items, newItem]) or use signals/markForCheck.',
        },
      ],
    },
    {
      slug: 'rxjs',
      title: 'RxJS & HTTP',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is the difference between switchMap, mergeMap, concatMap and exhaustMap?',
          e: `
All map each source value to an inner Observable, but differ in concurrency:
- **switchMap:** cancels the previous inner observable when a new value arrives. Use for: Search typeahead (only latest request matters).
- **mergeMap:** runs all inner observables concurrently. Use for: Parallel independent requests.
- **concatMap:** queues and runs one at a time in order. Use for: Ordered saves.
- **exhaustMap:** ignores new values while an inner observable is active. Use for: Prevent double-submit on a login button.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Observable vs Promise: which is true?',
          o: ['Observables are eager and single-valued, while Promises can emit a stream of values', 'Observables are lazy, can emit many values and can be cancelled; Promises are eager and resolve once', 'Promises can be cancelled natively with abort(), while Observables cannot be stopped once subscribed', 'Both are eager, start immediately, and resolve with exactly one value'],
          a: 1,
          e: 'Angular HttpClient returns cold Observables; the request is made only when subscribed.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which Subject type replays the latest value to new subscribers and requires an initial value?',
          o: ['ReplaySubject', 'Subject', 'BehaviorSubject', 'AsyncSubject'],
          a: 2,
          e: 'BehaviorSubject is commonly used for state in services. ReplaySubject replays N past values; AsyncSubject emits the last value on completion.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you avoid memory leaks from subscriptions in Angular?',
          e: `
- Use the **\`async\` pipe** in templates – it subscribes and unsubscribes automatically.
- Use **\`takeUntilDestroyed()\`** (Angular 16+) or \`takeUntil(destroy$)\`.
- Convert to signals with \`toSignal()\`.
- HttpClient observables complete after one response, but long-lived streams (\`interval\`, router events, store selects, WebSockets) must be unsubscribed.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is an HTTP interceptor used for?',
          o: ['Declaring application routes and guarding them based on the current user\'s role and permissions', 'Modifying outgoing requests or incoming responses globally, e.g. auth tokens, 401 handling', 'Rendering templates on the server before the response is sent to the browser', 'Compiling TypeScript into JavaScript as part of the HTTP request pipeline'],
          a: 1,
          e: 'Functional interceptors are registered with provideHttpClient(withInterceptors([authInterceptor])).',
        },
      ],
    },
    {
      slug: 'routing-forms-perf',
      title: 'Routing, Forms & Performance',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'Which route guard prevents navigation away from a page with unsaved changes?',
          o: ['canActivate', 'canDeactivate', 'resolve', 'canMatch'],
          a: 1,
          e: 'canActivate controls entering a route, canMatch decides if a route config matches (useful for lazy loading by role), resolve prefetches data.',
        },
        {
          t: 'qa', l: 2,
          q: 'Template-driven forms vs reactive forms?',
          e: `
**Template-driven**
- Logic in the template with \`ngModel\`; simple forms; async and less explicit.

**Reactive forms**
- Form model defined in the component (\`FormGroup\`, \`FormControl\`, \`FormBuilder\`), synchronous access, strongly typed (v14+).
- Easier dynamic forms, complex validation, unit testing.

Use reactive forms for anything non-trivial.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you improve performance in an Angular app?',
          e: `
- **OnPush** change detection / signals / zoneless
- **Lazy-load routes** (\`loadComponent\`, \`loadChildren\`) and \`@defer\` blocks for heavy components
- \`track\` in \`@for\` (trackBy) to avoid re-creating DOM nodes
- Pure pipes instead of methods in templates
- Virtual scrolling (CDK) for long lists
- Unsubscribe from streams; avoid heavy work in templates
- AOT + production builds, bundle analysis, image directive \`NgOptimizedImage\`
- SSR/hydration with Angular Universal (\`@angular/ssr\`)`,
        },
        {
          t: 'mcq', l: 3,
          q: 'Why is calling a method like {{ getTotal() }} in a template a performance concern?',
          o: ['It runs on every change detection cycle, potentially many times per second', 'Template methods are called only once, so the total never updates on new data', 'It is a template syntax error, because templates may only reference properties', 'It disables AOT compilation for the whole component and falls back to JIT'],
          a: 0,
          e: 'Use computed signals, pure pipes or precomputed properties instead.',
        },
      ],
    },
  ],
};
