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
          o: ['{{ value }}', '[value]', '(value)', '[(ngModel)]'],
          a: 3,
          e: '"Banana in a box" [(...)] combines property binding [] and event binding ().',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does providedIn: "root" mean on an @Injectable service?',
          o: ['The service is only available in AppComponent', 'A single app-wide singleton is created, and it is tree-shakable if unused', 'A new instance per component', 'The service runs on the server'],
          a: 1,
          e: 'Providing in a component\'s providers array instead creates an instance per component subtree.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which lifecycle hook runs when an @Input property changes?',
          o: ['ngOnInit', 'ngOnChanges', 'ngAfterViewInit', 'ngOnDestroy'],
          a: 1,
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
          o: ['HTTP interceptors', 'Reactive primitives (signal, computed, effect) that track dependencies and notify consumers precisely when values change', 'Routing events', 'Web Workers'],
          a: 1,
          e: 'const count = signal(0); const double = computed(() => count() * 2); count.set(1). They enable fine-grained reactivity and zoneless change detection.',
        },
        {
          t: 'mcq', l: 3,
          q: 'A component with OnPush does not update after you push an item into an input array. Why?',
          o: ['OnPush is broken', 'The array reference did not change, so OnPush does not detect the mutation', 'Arrays are not allowed as inputs', 'You need ngOnInit'],
          a: 1,
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
- **switchMap:** cancels the previous inner observable when a new value arrives. ✅ Search typeahead (only latest request matters).
- **mergeMap:** runs all inner observables concurrently. ✅ Parallel independent requests.
- **concatMap:** queues and runs one at a time in order. ✅ Ordered saves.
- **exhaustMap:** ignores new values while an inner observable is active. ✅ Prevent double-submit on a login button.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Observable vs Promise: which is true?',
          o: ['Both are eager and single-valued', 'Observables are lazy, can emit multiple values over time and can be cancelled (unsubscribe); Promises are eager and resolve once', 'Promises can be cancelled natively', 'Observables cannot be used for HTTP'],
          a: 1,
          e: 'Angular HttpClient returns cold Observables; the request is made only when subscribed.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which Subject type replays the latest value to new subscribers and requires an initial value?',
          o: ['Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject'],
          a: 1,
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
          o: ['Rendering templates', 'Modifying outgoing requests/incoming responses globally, e.g. adding auth tokens, handling 401s, logging, retries', 'Defining routes', 'Compiling TypeScript'],
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
          o: ['canActivate', 'canDeactivate', 'canMatch', 'resolve'],
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
          o: ['It is a syntax error', 'It runs on every change detection cycle, potentially many times per second', 'Methods cannot return numbers', 'It disables AOT'],
          a: 1,
          e: 'Use computed signals, pure pipes or precomputed properties instead.',
        },
      ],
    },
  ],
};
