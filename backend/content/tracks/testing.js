module.exports = {
  slug: 'testing',
  title: 'Software Testing',
  subtitle: 'Unit, integration, E2E, TDD',
  description: 'Testing interview questions: test pyramid, unit/integration/E2E tests, mocking, TDD, test doubles, coverage, flaky tests and testing strategies for frontend and backend.',
  category: 'fundamentals',
  roles: ['frontend', 'backend', 'fullstack', 'software-engineer', 'mobile'],
  icon: 'bug',
  color: '#22C55E',
  order: 66,
  topics: [
    {
      slug: 'fundamentals',
      title: 'Testing Fundamentals',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the test pyramid.',
          e: `
~~~
        /  E2E  \\        few, slow, expensive, high confidence in real flows
       /---------\\
      / Integration\\     some – modules + DB/APIs together
     /-------------\\
    /     Unit      \\    many – fast, isolated, cheap
~~~
- **Unit tests:** test a function/class in isolation (milliseconds). Most of your tests.
- **Integration tests:** test components working together (API + real DB, service + queue).
- **E2E tests:** test full user flows through the UI (Playwright/Cypress) – slow and flaky-prone, keep them for critical paths.

Variation: the **testing trophy** (Kent C. Dodds) emphasizes integration tests for frontend apps.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which test type verifies a single function in isolation with dependencies mocked?',
          o: ['E2E test', 'Unit test', 'Load test', 'Smoke test'],
          a: 1,
          e: 'Unit tests are fast and pinpoint failures precisely.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are mocks, stubs, spies and fakes?',
          e: `
**Test doubles** replace real dependencies in tests:
- **Dummy:** passed but never used.
- **Stub:** returns predefined answers (\`getUser()\` always returns a fixed user).
- **Spy:** records how it was called (arguments, call count), may call through to the real implementation.
- **Mock:** pre-programmed with expectations and verifies interactions ("\`sendEmail\` must be called once with X").
- **Fake:** a working lightweight implementation (in-memory database/repository).

Over-mocking couples tests to implementation details – prefer testing behavior and use real dependencies when cheap (e.g. Testcontainers for DBs).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is TDD (Test-Driven Development)?',
          o: ['Writing tests after release', 'Red-Green-Refactor: write a failing test, write minimal code to pass, then refactor', 'Testing only in production', 'Only manual testing'],
          a: 1,
          e: 'TDD drives design toward testable, decoupled code. BDD expresses tests as behavior specifications (Given/When/Then).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Is 100% code coverage a guarantee of bug-free code?',
          o: ['Yes', 'No – coverage shows which lines ran, not whether assertions are meaningful or edge cases and integrations are correct', 'Only for TypeScript', 'Only with E2E tests'],
          a: 1,
          e: 'Use coverage to find untested areas; mutation testing (Stryker) measures test quality better.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the AAA pattern in unit tests?',
          o: ['Always Assert Anything', 'Arrange, Act, Assert', 'Async, Await, Assert', 'API, Auth, Access'],
          a: 1,
          e: 'Set up data, perform the action, verify the outcome – keeps tests readable.',
        },
      ],
    },
    {
      slug: 'strategies',
      title: 'Testing Strategies & Practices',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you test a REST API endpoint that uses a database?',
          e: `
- **Integration tests** with a real database:
  - **Testcontainers** spins up Postgres/Mongo in Docker per test run
  - or an in-memory replacement (mongodb-memory-server) for speed
- Seed known data per test; clean up (transactions rolled back, truncate, or fresh DB)
- Call the app in-process with **supertest** (Node), assert status codes, body and DB side effects
- Mock only **external** third-party services (payment provider, email) with tools like nock/MSW or WireMock
- Cover validation errors, auth failures (401/403), not found and happy paths
- Run in CI in parallel with isolated databases`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a flaky test and a common cause?',
          o: ['A test that always fails', 'A test that passes or fails non-deterministically, often due to timing/async waits, shared state, test order dependence or external services', 'A slow test', 'A skipped test'],
          a: 1,
          e: 'Fix with proper awaiting (no arbitrary sleeps), isolated data, deterministic clocks/randomness, and mocking unstable dependencies.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which tools are commonly used for browser end-to-end testing?',
          o: ['Jest only', 'Playwright, Cypress, Selenium/WebdriverIO', 'Postman', 'ESLint'],
          a: 1,
          e: 'Playwright supports multiple browsers, auto-waiting, tracing and parallel runs.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are smoke, regression, load and contract tests?',
          e: `
- **Smoke test:** quick check that the most important functions work after a deploy ("does it start, can I log in?").
- **Regression test:** ensures previously working features still work after changes (usually the automated suite).
- **Load / performance test:** behavior under expected and peak load (k6, JMeter, Gatling, Artillery); stress tests push beyond limits; soak tests run long durations.
- **Contract test:** verifies that a provider API satisfies consumers' expectations (Pact) – key for microservices to catch breaking changes without full E2E environments.
- **Snapshot test:** compares output to a stored snapshot (UI components) – useful but easy to over-approve.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your team has almost no tests on a legacy codebase and is scared to change it. How do you introduce testing?',
          e: `
1. **Start at the edges:** add a few high-value **E2E/integration (characterization) tests** around critical flows (login, checkout) to capture current behavior.
2. **Set up CI** to run tests on every PR; make the suite fast and reliable.
3. **Test new code and every bug fix** (write a failing test reproducing the bug first).
4. **Refactor for testability** gradually: extract pure functions, introduce dependency injection, seams around external services.
5. Add unit tests as modules are touched ("boy scout rule"); avoid big-bang test sprints.
6. Track coverage trends on changed code, not a global number.
7. Fix or quarantine flaky tests quickly to keep trust.`,
        },
      ],
    },
  ],
};
