module.exports = {
  slug: 'software-architecture',
  title: 'Software Architecture',
  subtitle: 'Microservices, DDD, event-driven',
  description:
    'Architectural styles and patterns asked in senior interviews: monolith vs microservices, communication patterns, event-driven architecture, DDD, clean/hexagonal architecture, CQRS and migration strategies.',
  category: 'system-design',
  roles: ['backend', 'fullstack', 'software-engineer', 'devops'],
  icon: 'hub',
  color: '#0D9488',
  order: 4,
  topics: [
    {
      slug: 'monolith-microservices',
      title: 'Monolith vs Microservices',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is the difference between a monolith and microservices?',
          e: `
**Monolith:** one deployable application containing all features, usually one database.
- ✅ Simple to develop, test, deploy and debug; no network calls between modules; easy transactions.
- ❌ Grows hard to understand; one bug can take down everything; scaling is all-or-nothing; slow deploys for big teams.

**Microservices:** many small services, each owning one business capability and its own data, deployed independently.
- ✅ Independent deploys and scaling, team autonomy, tech flexibility, fault isolation.
- ❌ Distributed system complexity: network failures, eventual consistency, distributed transactions, observability, DevOps overhead.

**Modular monolith** is a great middle ground: one deployable with strict module boundaries – easy to split later.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'A 5-person startup is building its first product. Which architecture is usually best?',
          o: ['50 microservices on Kubernetes', 'A well-structured (modular) monolith', 'Serverless functions for every endpoint with separate databases', 'Microfrontends'],
          a: 1,
          e: 'Microservices add operational cost that only pays off with scale and multiple teams. Start simple and split when boundaries are clear.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you decide service boundaries in microservices?',
          e: `
- Align with **business capabilities / bounded contexts** (DDD): Orders, Payments, Catalog, Shipping – not technical layers.
- **High cohesion, low coupling:** things that change together stay together.
- Each service **owns its data**; other services use its API/events (no shared DB).
- Avoid "chatty" services that need many synchronous calls to complete one request.
- Consider team structure (**Conway's law**): one team per service or group of services.
- Start coarse-grained; split when there's a clear reason (scaling, release cadence, team ownership).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is a shared database between microservices considered an anti-pattern?',
          o: ['Databases cannot be shared', 'It tightly couples services through schema; one team\'s change can break others and services cannot deploy or scale independently', 'It is slower', 'It is more secure'],
          a: 1,
          e: 'Database-per-service keeps encapsulation; data needed by others is exposed via APIs or events.',
        },
        {
          t: 'qa', l: 3,
          q: 'Synchronous vs asynchronous communication between microservices?',
          e: `
**Synchronous (REST/gRPC request-response)**
- ✅ Simple, immediate response, easy to reason about.
- ❌ Temporal coupling: if the callee is down/slow, the caller fails; latency adds up in call chains; cascading failures.

**Asynchronous (events/messages via Kafka, RabbitMQ, SQS)**
- ✅ Loose coupling, resilience (queue buffers outages), easy fan-out to many consumers, load leveling.
- ❌ Eventual consistency, harder debugging/tracing, need idempotency, ordering and schema evolution.

**Guideline:** use sync for queries needing an immediate answer (get price); async for commands/events where the caller doesn't need to wait (order placed -> email, inventory, analytics). Add timeouts, retries and circuit breakers to sync calls.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: How would you migrate a large monolith to microservices without a big-bang rewrite?',
          e: `
Use the **Strangler Fig pattern**:
1. Put a **routing layer** (API gateway/reverse proxy) in front of the monolith.
2. Pick a well-bounded, high-value capability (e.g. notifications, search) and build it as a new service.
3. Route that functionality's traffic to the new service; the monolith still handles the rest.
4. **Data migration:** give the new service its own DB; sync data via CDC/events during transition; then make the service the owner.
5. Use an **anti-corruption layer** to translate between old and new models.
6. Repeat capability by capability; remove dead code from the monolith.

Prerequisites: CI/CD, monitoring, tracing, automated tests, and first **modularizing** the monolith internally.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is a "distributed monolith"?',
          o: ['A monolith deployed on many servers', 'Microservices so tightly coupled (shared DB, synchronous chains, coordinated releases) that they have the downsides of both styles', 'A monolith with a CDN', 'A serverless app'],
          a: 1,
          e: 'If services must be deployed together, you have a distributed monolith.',
        },
      ],
    },
    {
      slug: 'event-driven',
      title: 'Event-Driven Architecture',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is event-driven architecture?',
          e: `
Components communicate by producing and reacting to **events** (facts that happened: \`OrderPlaced\`, \`PaymentFailed\`) via a broker.

**Patterns**
- **Event notification:** thin event, consumers call back for details.
- **Event-carried state transfer:** event contains the needed data so consumers don't call back.
- **Event sourcing:** events are the source of truth.

**Benefits:** decoupling, scalability, extensibility (new consumers without changing producers), real-time reactions.
**Challenges:** eventual consistency, debugging flows, event schema versioning (use a schema registry with Avro/Protobuf), idempotent consumers, ordering.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between a command and an event?',
          o: ['No difference', 'A command asks a specific service to do something (may be rejected); an event announces that something already happened (to any interested listeners)', 'Events are synchronous', 'Commands are broadcast to everyone'],
          a: 1,
          e: 'Commands are imperative (ChargeCard), events are past tense (CardCharged).',
        },
        {
          t: 'mcq', l: 3,
          q: 'Choreography vs orchestration in sagas: which is true?',
          o: ['They are the same', 'Choreography: services react to each other\'s events without a central coordinator; Orchestration: a central orchestrator directs each step', 'Orchestration has no central component', 'Choreography requires 2PC'],
          a: 1,
          e: 'Choreography is decentralized but harder to track; orchestration (Temporal, Step Functions, Camunda) gives visibility and explicit flow control.',
        },
      ],
    },
    {
      slug: 'ddd-clean',
      title: 'DDD, Clean & Hexagonal Architecture',
      questions: [
        {
          t: 'qa', l: 3,
          q: 'Explain key Domain-Driven Design concepts.',
          e: `
**Strategic DDD**
- **Ubiquitous language:** shared vocabulary between devs and domain experts used in code.
- **Bounded context:** a boundary within which a model is consistent (e.g. "Customer" means different things in Sales vs Support).
- **Context mapping:** relationships between contexts (anti-corruption layer, shared kernel, customer/supplier).

**Tactical DDD**
- **Entity:** has identity that persists over time (Order #123).
- **Value object:** defined by attributes, immutable (Money, Address).
- **Aggregate:** cluster of objects treated as one unit with an **aggregate root** enforcing invariants; transactions don't cross aggregates.
- **Repository:** collection-like access to aggregates.
- **Domain event:** something meaningful that happened in the domain.
- **Domain service:** logic that doesn't belong to one entity.`,
        },
        {
          t: 'qa', l: 3,
          q: 'What are Clean Architecture and Hexagonal (Ports & Adapters) architecture?',
          e: `
Both aim to keep **business logic independent of frameworks, databases and UI**.

**Hexagonal (Ports & Adapters)**
- Core domain/application in the center.
- **Ports:** interfaces the core defines (\`OrderRepository\`, \`PaymentGateway\`).
- **Adapters:** implementations (Postgres repository, Stripe client, REST controller, Kafka consumer).

**Clean Architecture** (concentric layers): Entities -> Use cases -> Interface adapters -> Frameworks & drivers.
**Dependency rule:** source code dependencies point **inward**; inner layers know nothing about outer layers.

**Benefits:** testability (mock ports), swap DB/frameworks, business rules are clear.
**Cost:** more boilerplate – use pragmatically for complex domains.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'In clean architecture, which direction should dependencies point?',
          o: ['From domain to database', 'Inward: frameworks/DB/UI depend on use cases and domain, never the reverse', 'In both directions', 'Outward to the UI'],
          a: 1,
          e: 'The domain defines interfaces (ports) that infrastructure implements (dependency inversion).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the Twelve-Factor App methodology recommend for configuration?',
          o: ['Hard-code config in source', 'Store config in environment variables, separate from code', 'Keep config in the database only', 'Use XML files committed to git'],
          a: 1,
          e: 'Other factors include: one codebase, explicit dependencies, stateless processes, port binding, disposability, dev/prod parity, logs as event streams.',
        },
        {
          t: 'qa', l: 2,
          q: 'What is serverless architecture? Pros and cons.',
          e: `
**Serverless** (AWS Lambda, Cloud Functions, Azure Functions, Cloudflare Workers): you deploy functions; the provider manages servers, scaling and availability. Pay per execution.

**Pros:** no server management, automatic scaling to zero and to thousands, pay-per-use, fast to build event-driven glue (S3 upload -> resize image).

**Cons:** cold starts, execution time/memory limits, vendor lock-in, harder local testing/debugging, connection limits to relational DBs (use RDS Proxy), cost can exceed containers at constant high load.

Good for: spiky/irregular workloads, event processing, cron jobs, MVPs.`,
        },
      ],
    },
  ],
};
