// Fundamentals, high level architecture, scaling 0 -> million, back of the envelope estimation
module.exports = [
  {
    slug: 'hld-fundamentals',
    title: 'High Level Architecture & Fundamentals',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is High Level Design (HLD) and how is it different from Low Level Design (LLD)?',
        e: `
**HLD** describes the system at the component level: which services exist, how they talk to each other, where data lives and how the system scales.
- Components: clients, load balancers, API gateway, services, databases, caches, queues, CDN
- Data flow between them, APIs, choice of SQL/NoSQL, replication, sharding
- Non functional concerns: scalability, availability, latency, cost

**LLD** zooms into a single component: classes, interfaces, design patterns, database schema details, method signatures, sequence of calls.

| HLD | LLD |
|---|---|
| Architecture diagram | Class / sequence diagrams |
| "Use Kafka between Order and Payment service" | "OrderService has placeOrder(cart) that emits OrderPlaced" |
| Audience: architects, seniors | Audience: developers implementing it |

In interviews, "Design Twitter" is HLD; "Design a parking lot class structure" is LLD.`,
      },
      {
        t: 'qa', l: 1,
        q: 'What are functional and non-functional requirements? Give examples for a ride sharing app.',
        e: `
**Functional requirements** = what the system must *do* (features).
- Rider can request a ride, see nearby drivers, track the driver live
- Driver can accept/decline, navigate, complete a trip
- Payments and trip history

**Non-functional requirements** = how *well* it must do it (quality attributes).
- **Availability:** 99.99% (ride booking should rarely be down)
- **Latency:** driver matching < 2s, location updates every 3-5s
- **Scalability:** millions of concurrent location updates
- **Consistency:** a driver must never be assigned to two rides (strong consistency here)
- **Durability:** trips and payments must never be lost
- **Security & compliance:** PCI for payments, PII protection

Always clarify both at the start of a design interview; NFRs drive the architecture choices.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which of these is a NON-functional requirement?',
        o: ['Users can upload a profile picture', 'The system should respond within 200 ms for 99% of requests', 'Users can reset their password', 'Admins can ban users'],
        a: 1,
        e: 'Latency targets are a quality attribute of the system (non-functional). The others describe features (functional).',
      },
      {
        t: 'qa', l: 1,
        q: 'Draw and explain a typical high level architecture of a modern web application.',
        e: `
~~~
 Clients (Web / Mobile)
        |
      DNS  ---> CDN (static assets, images, video)
        |
  Load Balancer / API Gateway  (TLS termination, auth, rate limiting)
        |
  +-----------+-----------+
  | Service A | Service B |   stateless app servers (auto scaled)
  +-----+-----+-----+-----+
        |           |
     Cache (Redis)  Message Queue (Kafka/RabbitMQ) --> Workers
        |                                     |
  Primary DB  --replication-->  Read Replicas   Object storage (S3)
        |
  Search (Elasticsearch), Analytics / Data warehouse
~~~
**Key ideas**
1. **Stateless app tier** behind a load balancer so you can add servers horizontally.
2. **Cache** hot reads to reduce DB load and latency.
3. **Database** with replication for availability and read scaling; sharding when write volume grows.
4. **Async processing** via queues for slow work (emails, video encoding, notifications).
5. **CDN** for static/media content close to users.
6. **Observability**: logs, metrics, tracing across all components.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Why should application servers be stateless in a horizontally scaled system?',
        o: ['Stateless servers use less CPU', 'Any request can go to any server, so servers can be added/removed freely', 'Stateless servers do not need a database', 'It makes the code shorter'],
        a: 1,
        e: 'When session/state is stored externally (Redis, DB, JWT), the load balancer can route any request to any instance, enabling auto scaling and painless failover.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is the difference between vertical scaling and horizontal scaling? When would you choose each?',
        e: `
**Vertical scaling (scale up):** add more CPU/RAM/disk to one machine.
- **Pro:** Simple, no code changes, no distributed system problems
- **Con:** Hardware limit, expensive at the top end, single point of failure, downtime to upgrade

**Horizontal scaling (scale out):** add more machines and distribute load.
- **Pro:** Near-unlimited scale, fault tolerance, commodity hardware
- **Con:** Needs load balancing, stateless services, data partitioning, deals with consistency and network issues

**When to choose**
- Early stage / databases that are hard to distribute -> scale vertically first.
- Stateless web/app tier -> horizontal from day one (cheap and easy).
- Massive data or traffic -> horizontal (sharding, replicas).

Most real systems use both: big DB servers (vertical) + many app servers (horizontal).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'A service has 99.9% availability. Approximately how much downtime is allowed per year?',
        o: ['52.6 minutes', '8.76 hours', '3.65 days', '5.26 minutes'],
        a: 1,
        e: `99.9% ("three nines") = 0.1% of 365 days ≈ **8.76 hours/year** (~43.8 min/month).
- 99% ≈ 3.65 days
- 99.99% ≈ 52.6 minutes
- 99.999% ≈ 5.26 minutes`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Two components each with 99.9% availability are called in SERIES (both are required). What is the overall availability?',
        o: ['99.9%', '99.99%', '≈ 99.8%', '≈ 99.95%'],
        a: 2,
        e: 'Series availability = A1 × A2 = 0.999 × 0.999 ≈ 0.998 (99.8%). Dependencies in series reduce availability. In PARALLEL (redundant), availability = 1 - (1-A1)(1-A2) = 99.9999%.',
      },
      {
        t: 'qa', l: 2,
        q: 'Explain SLA, SLO and SLI with examples.',
        e: `
- **SLI (Service Level Indicator):** the actual measured metric. *e.g. percentage of requests served under 300 ms, error rate, uptime.*
- **SLO (Service Level Objective):** internal target for an SLI. *e.g. 99.9% of requests < 300 ms over 30 days.*
- **SLA (Service Level Agreement):** contract with customers including penalties. *e.g. 99.9% monthly uptime, otherwise 10% credit.*

SLOs are usually stricter than SLAs so you get warned before breaching the contract. The gap between 100% and the SLO is the **error budget**, which teams spend on releases and experiments.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is back-of-the-envelope estimation? Estimate storage for a Twitter-like app with 200M DAU.',
        e: `
Quick approximate calculations to size a system (QPS, storage, bandwidth) and justify design choices.

**Assumptions**
- 200M DAU, each posts 2 tweets/day -> 400M tweets/day
- Tweet: 300 bytes text + metadata ≈ 1 KB
- 10% tweets have media, avg 500 KB

**Write QPS:** 400M / 86,400 ≈ **~4,600 tweets/s** (peak ~2-3x ≈ 10-15K/s)

**Storage per day**
- Text: 400M × 1 KB = **400 GB/day**
- Media: 40M × 500 KB = **20 TB/day**

**5 years:** 20.4 TB × 365 × 5 ≈ **~37 PB** (before replication ×3)

**Read QPS:** if each user reads 100 tweets/day -> 20B reads/day ≈ **230K reads/s** -> read heavy -> caching + fan-out matters.

Handy numbers: 1 day ≈ 86,400 s ≈ 10^5 s; 1M req/day ≈ 12 req/s.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Roughly how many requests per second is 10 million requests per day?',
        o: ['~12', '~115', '~1,150', '~11,500'],
        a: 1,
        e: '10,000,000 / 86,400 ≈ 115 requests/second (average). Plan for peaks of 2-5x the average.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which operation is the FASTEST?',
        o: ['Reading 1 MB sequentially from SSD', 'A round trip within the same data center', 'Main memory (RAM) reference', 'Disk seek on HDD'],
        a: 2,
        e: `Latency numbers every engineer should know (approx):
- L1 cache: 0.5 ns, RAM reference: ~100 ns
- Round trip in same data center: ~0.5 ms
- Read 1 MB sequentially from SSD: ~1 ms
- HDD seek: ~10 ms
- Cross-continent round trip: ~150 ms`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is a Single Point of Failure (SPOF) and how do you eliminate it?',
        e: `
A **SPOF** is any component whose failure brings down the whole system (a single DB, single load balancer, one region, one DNS provider).

**How to eliminate**
- **Redundancy:** run N+1 instances of every component (multiple app servers, LB pairs with failover/VRRP, managed LBs).
- **Database replication** with automatic failover (primary + standby).
- **Multi-AZ / multi-region** deployment.
- **Health checks** so traffic is routed away from dead nodes.
- **Remove hidden SPOFs:** config servers, secrets service, a single cron box, a single person with deploy access!

In interviews, after drawing a design, walk through each box and ask "what happens if this dies?".`,
      },
      {
        t: 'qa', l: 3,
        q: 'How do you approach a system design interview? Describe your framework.',
        e: `
A 45-60 min structure that works well:

1. **Clarify requirements (5 min)** – functional features, out of scope, users, scale, read/write ratio, latency, consistency needs.
2. **Estimate (3-5 min)** – DAU, QPS (avg/peak), storage, bandwidth. Identify read- vs write-heavy.
3. **API design (5 min)** – key endpoints / events: \`POST /tweets\`, \`GET /feed?cursor=\`.
4. **Data model (5 min)** – entities, SQL vs NoSQL, partition keys.
5. **High level design (10 min)** – boxes & arrows: clients, LB, services, DB, cache, queue, CDN.
6. **Deep dives (15 min)** – the hardest parts: feed fan-out, sharding, consistency, hot keys, failure handling.
7. **Bottlenecks & trade-offs (5 min)** – SPOFs, scaling further, monitoring, cost, what you'd do with more time.

Tips: think out loud, state assumptions, discuss trade-offs (never "one right answer"), let the interviewer steer deep dives.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Your service latency suddenly increased from 80 ms to 2 s during peak traffic. How do you investigate and fix it?',
        e: `
**1. Scope the problem**
- All endpoints or one? All regions or one? Started after a deploy/config change?
- Check dashboards: p50/p95/p99 latency, error rate, traffic (QPS), saturation.

**2. Find the bottleneck (USE / RED method)**
- App servers: CPU, memory, GC pauses, thread pool / event loop lag
- DB: slow query log, lock waits, connection pool exhaustion, replication lag
- Cache: hit ratio dropped? (cache eviction or a cold cache after restart)
- Downstream dependencies: distributed tracing shows which span is slow
- Network: packet loss, LB saturation

**3. Mitigate quickly**
- Roll back recent deploy, scale out app tier, increase pool sizes carefully
- Enable rate limiting / load shedding for non-critical traffic
- Serve stale cache, turn off expensive features (feature flags)

**4. Fix root cause**
- Add missing index, fix N+1 queries, add caching, add timeouts + circuit breakers, async the slow work

**5. Prevent**
- Load tests, alerts on p99, capacity planning, post-mortem.`,
      },
    ],
  },
  {
    slug: 'scale-zero-to-million',
    title: 'Scale From 0 to Million Users',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'Walk through how you would scale a web application from a single server to 1 million users.',
        e: `
**Stage 1 – Single server (0 - 1K users)**
Web app + DB + files on one machine. DNS points to its IP.

**Stage 2 – Separate DB (1K - 10K)**
Move DB to its own server so web and data tiers scale independently.

**Stage 3 – Load balancer + multiple web servers (10K - 100K)**
- Make app servers **stateless** (sessions in Redis/JWT)
- LB distributes traffic, health checks remove dead servers

**Stage 4 – Database replication**
- Primary for writes, **read replicas** for reads (most apps are read heavy)
- Failover: promote a replica if primary dies

**Stage 5 – Cache + CDN (100K - 500K)**
- Redis/Memcached for hot data (cache-aside)
- CDN for static assets, images, videos

**Stage 6 – Async processing**
- Message queue + workers for emails, notifications, image processing

**Stage 7 – Multiple data centers / regions**
- GeoDNS routes users to nearest region, data replicated across regions

**Stage 8 – 1M+ users: Sharding & microservices**
- Shard the database (by user_id), split monolith by domain
- Logging, metrics, monitoring, automation (CI/CD, auto scaling)`,
      },
      {
        t: 'mcq', l: 1,
        q: 'What is usually the FIRST step when a single-server app starts struggling?',
        o: ['Shard the database', 'Move the database to a separate server', 'Rewrite into microservices', 'Use multiple regions'],
        a: 1,
        e: 'Separating the web tier from the data tier is the simplest first step; it lets each be scaled and tuned independently. Sharding and microservices come much later.',
      },
      {
        t: 'mcq', l: 1,
        q: 'Where should user session data be stored so that any web server can handle any request?',
        o: ['In the memory of each web server', 'In a shared store like Redis or in a signed token (JWT)', 'In the load balancer logs', 'In local files on each server'],
        a: 1,
        e: 'Externalizing session state (Redis/DB) or making it self-contained (JWT) keeps web servers stateless so they can be scaled horizontally.',
      },
      {
        t: 'mcq', l: 2,
        q: 'An app is 90% reads and 10% writes and the database CPU is maxed out. What is the most effective first fix?',
        o: ['Shard the database by user id', 'Add read replicas and a cache layer', 'Switch to a NoSQL database', 'Increase web servers'],
        a: 1,
        e: 'For read-heavy workloads, caching hot data and routing reads to replicas removes most load from the primary. Sharding is mainly needed when WRITES or data size exceed a single node.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is auto scaling and what metrics would you use to trigger it?',
        e: `
**Auto scaling** automatically adds/removes instances based on load, so you pay for what you use and survive spikes.

**Common triggers**
- CPU utilization (e.g. scale out at > 65% avg)
- Request count per target / QPS
- Latency (p95)
- Queue depth / consumer lag (for workers)
- Custom business metrics (active connections, jobs pending)

**Types**
- **Reactive** (target tracking / step scaling on metrics)
- **Scheduled** (known peaks like 9 AM or sales)
- **Predictive** (ML based on historical patterns)

**Gotchas**
- Instances need warm-up time -> keep headroom, scale out fast, scale in slowly (cooldown)
- App must be stateless; DB must handle more connections (use pooling / proxies like PgBouncer/RDS Proxy).`,
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: A marketing campaign will bring 20x normal traffic for 2 hours next Friday. How do you prepare?',
        e: `
1. **Estimate** expected peak QPS and which endpoints get hit (landing page, signup, checkout).
2. **Load test** at 1.5x the expected peak in staging to find bottlenecks.
3. **Pre-scale** app servers (scheduled scaling) and warm the load balancers if required.
4. **Cache aggressively**: CDN for landing pages and assets, Redis for product/catalog data, pre-warm caches.
5. **Protect the DB**: read replicas, connection pooling, ensure indexes on hot queries.
6. **Async** non-critical work (emails, analytics) via queues.
7. **Rate limiting & graceful degradation**: queue/waiting room for checkout, disable heavy features via flags.
8. **Monitoring & on-call**: dashboards, alerts, a runbook, rollback plan, people on standby.
9. **Freeze risky deploys** before the event.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which technique routes users to the geographically closest data center?',
        o: ['Round robin load balancing', 'GeoDNS / latency-based DNS routing', 'Database sharding', 'Sticky sessions'],
        a: 1,
        e: 'GeoDNS (or latency-based routing like AWS Route 53) resolves the domain to the IP of the nearest/fastest region.',
      },
      {
        t: 'qa', l: 3,
        q: 'What challenges appear when moving from one data center to multi-region active-active?',
        e: `
- **Data replication & consistency:** writes in two regions can conflict. Need conflict resolution (last-write-wins, CRDTs) or route each user's writes to a "home" region.
- **Replication lag:** users may read stale data when routed to another region.
- **Traffic routing:** GeoDNS / anycast, failover when a region is down.
- **Global uniqueness:** IDs must be unique across regions (Snowflake IDs, UUIDs).
- **Latency of cross-region calls:** avoid synchronous cross-region dependencies.
- **Cost:** duplicated infrastructure, cross-region data transfer fees.
- **Testing & deployment:** deploy region by region, test failover regularly (chaos engineering).
- **Compliance:** data residency (GDPR) may restrict where data lives.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Your startup has 50K users on a monolith with one Postgres DB. Growth is 3x every 6 months. What is your 12 month scaling plan?',
        e: `
**Now (50K -> 150K)**
- Add monitoring (APM, slow query logs) to find real bottlenecks
- Stateless app servers behind a LB with auto scaling
- Redis cache for hot reads and sessions; CDN for assets
- Indexes and query optimization; connection pooling (PgBouncer)

**6 months (150K -> 450K)**
- Postgres read replicas for read traffic, vertical scale the primary
- Background jobs via a queue (emails, reports, webhooks)
- Modularize the monolith (clear domain boundaries) – "modular monolith"

**12 months (450K -> 1.3M+)**
- Extract services only where needed (e.g. notifications, search, payments)
- Search into Elasticsearch, analytics into a warehouse
- Plan sharding / partitioning for the biggest tables (by tenant/user id) or move specific workloads to a distributed DB
- Multi-AZ, backups + tested restore, DR plan

**Principle:** measure first, scale the actual bottleneck, avoid premature microservices.`,
      },
    ],
  },
];
