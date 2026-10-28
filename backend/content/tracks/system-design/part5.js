// Message queues (Kafka/RabbitMQ), key-value store, rate limiting, retry & resilience, service discovery
module.exports = [
  {
    slug: 'message-queues',
    title: 'Message Queues (Kafka / RabbitMQ)',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is a message queue and why is it used?',
        e: `
A **message queue** lets services communicate **asynchronously**: a **producer** sends messages to a queue/broker and **consumers** process them later.

~~~
Order Service --(OrderPlaced)--> [ Queue / Broker ] --> Email worker
                                                     --> Inventory service
                                                     --> Analytics
~~~
**Benefits**
- **Decoupling:** producer doesn't need to know consumers or wait for them
- **Load leveling / buffering:** absorbs traffic spikes; consumers process at their own pace
- **Reliability:** messages persist if a consumer is down; retries
- **Scalability:** add more consumers to process in parallel
- **Async UX:** respond to the user immediately ("Your video is processing")

**Examples:** Kafka, RabbitMQ, AWS SQS/SNS, Google Pub/Sub, Azure Service Bus, Redis Streams, NATS.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'A user uploads a video that takes 5 minutes to transcode. What is the best approach?',
        o: ['Keep the HTTP request open for 5 minutes and stream progress until transcoding finishes', 'Raise the HTTP timeout to 10 minutes so the request does not fail', 'Put a job on a queue, return immediately, and notify the user when done', 'Transcode the video on the client before uploading it to the server'],
        a: 2,
        e: 'Long-running work should be async: enqueue the job, respond with 202 Accepted (job id), let workers process it and notify via webhook/push/polling.',
      },
      {
        t: 'qa', l: 1,
        q: 'Point-to-point queue vs publish/subscribe: what is the difference?',
        e: `
**Point-to-point (work queue)**
- Each message is consumed by **exactly one** consumer (competing consumers).
- Used for distributing tasks: image processing jobs, emails.
- e.g. SQS queue, RabbitMQ queue.

**Publish/Subscribe (pub/sub)**
- Each message is delivered to **all subscribers** (each subscription gets a copy).
- Used for events many services care about: \`UserSignedUp\` -> email, analytics, CRM.
- e.g. SNS topics, Kafka topics with multiple consumer groups, RabbitMQ fanout exchange, Google Pub/Sub.`,
      },
      {
        t: 'qa', l: 2,
        q: 'Explain Kafka architecture: topics, partitions, offsets, brokers, consumer groups.',
        e: `
- **Topic:** a named stream of records (e.g. \`orders\`).
- **Partition:** a topic is split into partitions; each is an **ordered, append-only log** stored on disk. Partitions are the unit of parallelism.
- **Offset:** position of a record in a partition. Consumers track their offset (stored in \`__consumer_offsets\`).
- **Broker:** a Kafka server storing partitions. A cluster has many brokers.
- **Replication:** each partition has a **leader** and follower replicas (replication factor e.g. 3); **ISR** = in-sync replicas.
- **Producer:** writes records; the **key** decides the partition (\`hash(key) % partitions\`) -> same key = same partition = ordered.
- **Consumer group:** consumers sharing a group id split partitions among themselves; **each partition is read by only one consumer in the group**. Different groups each get all messages (pub/sub).
- **Retention:** messages stay for a time/size limit (e.g. 7 days) even after consumption -> replayable. Log compaction keeps the latest value per key.
- **Controller / KRaft:** cluster metadata management (ZooKeeper removed in Kafka 4.0).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'A Kafka topic has 6 partitions and a consumer group has 8 consumers. What happens?',
        o: ['Kafka creates 2 more partitions automatically', '6 consumers get one partition each and 2 stay idle', 'Messages are duplicated so each of the 8 consumers gets all of them', 'All 8 consumers share the load equally'],
        a: 1,
        e: 'Within a consumer group, a partition is assigned to at most one consumer. Max parallelism = number of partitions, so extra consumers sit idle.',
      },
      {
        t: 'mcq', l: 2,
        q: 'How do you guarantee that all events for the same order are processed in order in Kafka?',
        o: ['Use order_id as the message key so its events share a partition', 'Use a separate consumer group for each order', 'Increase the replication factor of the topic', 'Use a random key so the order\'s events spread evenly across all partitions'],
        a: 0,
        e: 'Kafka guarantees ordering only within a partition. Keying by order_id routes all events of that order to the same partition.',
      },
      {
        t: 'qa', l: 2,
        q: 'Kafka vs RabbitMQ: when would you use each?',
        e: `
| | Kafka | RabbitMQ |
|---|---|---|
| Model | Distributed **commit log** (pull-based) | Traditional **message broker** (push-based, AMQP) |
| Retention | Keeps messages for days; **replay** possible | Messages removed once acknowledged |
| Throughput | Millions msgs/sec, horizontal via partitions | Tens of thousands/sec per node |
| Ordering | Per partition | Per queue (single consumer) |
| Routing | Simple (topic + key) | **Rich routing:** direct, topic, fanout, headers exchanges |
| Features | Stream processing (Kafka Streams, ksqlDB), event sourcing, CDC | Priorities, per-message TTL, delayed messages, RPC patterns |

**Kafka:** event streaming, activity tracking, logs/metrics pipelines, event sourcing, CDC, analytics.
**RabbitMQ:** task queues, complex routing, request/reply, low-latency job distribution where replay isn't needed.`,
      },
      {
        t: 'qa', l: 2,
        q: 'Explain delivery semantics: at-most-once, at-least-once, exactly-once.',
        e: `
- **At-most-once:** messages may be **lost** but never duplicated. (Ack/commit offset **before** processing.) OK for metrics where some loss is fine.
- **At-least-once:** messages are **never lost** but may be **duplicated**. (Process first, then ack.) Most common default -> consumers must be **idempotent**.
- **Exactly-once:** each message affects the result exactly once. Hard in distributed systems.
  - Kafka offers exactly-once *within Kafka* via **idempotent producers + transactions** (read-process-write).
  - End-to-end exactly-once usually = **at-least-once delivery + idempotent processing** (dedupe with a message id / unique constraint).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'With at-least-once delivery, what must consumers be?',
        o: ['Written in Java', 'Idempotent', 'Stateless', 'Single-threaded'],
        a: 1,
        e: 'Duplicates will happen (retries, rebalances). Idempotency (e.g. storing processed message ids, upserts, unique constraints) prevents double charging or double emails.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is a Dead Letter Queue (DLQ)?',
        e: `
A **DLQ** is a separate queue where messages go after they **fail processing repeatedly** (e.g. after 5 retries) or are malformed ("poison messages").

**Why**
- Prevents one bad message from blocking the queue or being retried forever
- Allows inspection, alerting, fixing and **re-driving** messages later

**Good practice**
- Retry with exponential backoff before sending to DLQ (retry topics in Kafka: \`orders.retry.1m\`, \`orders.retry.10m\`, \`orders.dlq\`)
- Include error metadata (exception, attempt count, timestamp)
- Alert when DLQ depth > 0.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'Why is Kafka able to achieve very high throughput?',
        o: ['Sequential disk writes, page cache, batching, compression, zero-copy', 'It keeps all data in RAM only and never writes to disk', 'It uses an internal SQL engine that indexes every message', 'It does not replicate data across brokers, so each write is acknowledged instantly'],
        a: 0,
        e: 'Kafka appends to logs sequentially (fast even on HDDs), relies on the page cache, batches and compresses records, and uses sendfile() zero-copy to move data from disk to network.',
      },
      {
        t: 'qa', l: 3,
        q: 'What is consumer lag and how do you handle backpressure?',
        e: `
**Consumer lag** = latest offset in the partition − consumer's committed offset. Growing lag means consumers can't keep up.

**Handling it**
- **Scale consumers** (up to the number of partitions); increase partitions if needed (plan ahead – it changes key -> partition mapping).
- **Optimize processing:** batch DB writes, async I/O, avoid slow external calls per message.
- **Backpressure:** pause fetching (\`consumer.pause()\`) when downstream is saturated; bounded in-memory buffers.
- **Prioritize:** separate topics for critical vs bulk traffic.
- **Shed load:** drop/sample non-critical events.
- **Monitor & alert** on lag (Burrow, Kafka exporter, CloudWatch for SQS \`ApproximateAgeOfOldestMessage\`).`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: A payment event consumer occasionally charges customers twice. What is wrong and how do you fix it?',
        e: `
**Cause:** at-least-once delivery. The consumer processed the message (charged the card) but crashed or rebalanced **before committing the offset/ack**, so the message was redelivered and processed again.

**Fixes**
1. **Idempotency key:** every payment message carries a unique \`payment_id\`. Before charging, check a \`processed_payments\` table; insert with a **unique constraint** in the same transaction as recording the charge.
2. Pass the idempotency key to the payment provider (Stripe \`Idempotency-Key\` header) so the provider also dedupes.
3. Use the **outbox/inbox pattern**: store the incoming message id in an inbox table within the same DB transaction as the business change.
4. Commit offsets only after successful processing; keep processing time < \`max.poll.interval.ms\` to avoid rebalances.
5. Alert on duplicate attempts.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which AWS service is a fully managed message QUEUE?',
        o: ['S3', 'SNS', 'Route 53', 'SQS'],
        a: 3,
        e: 'SQS = queue (point-to-point, pull). SNS = pub/sub topic (push to subscribers). A common pattern is SNS fan-out to multiple SQS queues.',
      },
    ],
  },
  {
    slug: 'key-value-store',
    title: 'Key-Value Store Design',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'Design a distributed key-value store (like DynamoDB / Cassandra). What are the key components?',
        e: `
**Requirements:** \`put(key, value)\`, \`get(key)\`; small values (<10 KB); huge scale; high availability; tunable consistency; low latency.

**Core components**
1. **Partitioning:** consistent hashing with virtual nodes to spread keys across nodes.
2. **Replication:** each key stored on N nodes (e.g. 3) clockwise on the ring, across AZs.
3. **Consistency:** quorum reads/writes – W + R > N for strong; lower for speed.
4. **Conflict resolution:** vector clocks or last-write-wins; CRDTs.
5. **Failure detection:** gossip protocol (nodes exchange heartbeats).
6. **Temporary failures:** sloppy quorum + **hinted handoff**.
7. **Permanent failures:** anti-entropy repair with **Merkle trees**.
8. **Storage engine:** write to commit log -> **memtable** -> flush to **SSTables** (LSM tree); **Bloom filters** to skip SSTables on reads; compaction.
9. **Coordinator:** any node can receive a request and forward to replicas.

Trade-off is AP (Dynamo) vs CP (etcd/Spanner) depending on requirements.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the purpose of a Bloom filter in a key-value store read path?',
        o: ['Replicate SSTables to other nodes', 'Encrypt each key with a hash before it is written to an SSTable on disk', 'Keep keys sorted inside each SSTable', 'Quickly tell that a key is definitely NOT in an SSTable'],
        a: 3,
        e: 'A Bloom filter can return false positives but never false negatives. "Not present" means skip that file, which saves disk I/O.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is an LSM tree and why is it good for write-heavy workloads?',
        e: `
**Log-Structured Merge tree** (used by Cassandra, RocksDB, LevelDB, HBase, ScyllaDB):

**Write path**
1. Append to a **commit log / WAL** (durability, sequential write)
2. Insert into an in-memory sorted **memtable**
3. When full, flush memtable to disk as an immutable sorted **SSTable**
4. Background **compaction** merges SSTables, drops overwritten/deleted (tombstoned) data

**Read path:** memtable -> SSTables newest to oldest (Bloom filters + sparse indexes to skip files).

**Why write-friendly:** writes are sequential appends, no in-place updates or random I/O (unlike B-trees).
**Trade-offs:** reads may check multiple files (read amplification), compaction uses CPU/IO (write amplification), space amplification. B-trees are better for read-heavy workloads.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'What is "hinted handoff"?',
        o: ['A query optimization that hints which index the database should use', 'Another node holds a down replica\'s writes and delivers them later', 'A way to encrypt data in transit between replicas', 'A load balancing algorithm that hands requests to the least busy node'],
        a: 1,
        e: 'Hinted handoff keeps writes available during temporary failures (sloppy quorum). Permanent divergence is repaired later via Merkle-tree anti-entropy.',
      },
      {
        t: 'mcq', l: 3,
        q: 'Why do Dynamo-style systems use Merkle trees?',
        o: ['To elect a new leader among replicas after a network partition heals and data diverges', 'To build secondary indexes over each replica\'s data', 'To compare replicas and find which key ranges differ, minimizing repair traffic', 'To compress values before they are written to disk'],
        a: 2,
        e: 'Replicas compare root hashes; only mismatching subtrees are explored, so synchronization transfers only the differing ranges.',
      },
      {
        t: 'qa', l: 3,
        q: 'What is the gossip protocol and where is it used?',
        e: `
In **gossip** (epidemic) protocols, each node periodically picks a few random peers and exchanges state (membership, heartbeats, versions). Information spreads exponentially fast, like rumors.

**Used for**
- Failure detection & cluster membership (Cassandra, DynamoDB, Consul/Serf, Redis Cluster)
- Spreading metadata (token ownership, schema versions)

**Properties:** decentralized (no SPOF), scalable (O(log N) rounds to reach all), tolerant to node failures; eventually consistent view of the cluster. Often paired with **phi-accrual failure detectors** that output a suspicion level instead of a binary dead/alive.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: In your key-value store, N=3. The business wants writes to never fail even if 2 nodes are down, but reads should usually be fresh. What settings do you choose?',
        e: `
- **W = 1** (sloppy quorum + hinted handoff): a write succeeds as long as **any** node accepts it, so writes survive 2 failures.
- **R = 2 or 3** for reads that are *usually* fresh; or R = 1 for speed.
- Note **R + W = 3 = N** is not > N, so strong consistency is not guaranteed; you accept **eventual consistency**.
- Use **read repair** (on read, if replicas disagree, update stale ones) and periodic **anti-entropy** to converge quickly.
- Resolve conflicts with **vector clocks** or LWW.

Explain the trade-off clearly: maximum write availability (AP) costs strict consistency.`,
      },
    ],
  },
  {
    slug: 'rate-limiting',
    title: 'Rate Limiting',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is rate limiting and why do APIs need it?',
        e: `
**Rate limiting** controls how many requests a client (user, IP, API key) can make in a time window, e.g. *100 requests per minute*.

**Why**
- Protect services from **overload** and traffic spikes
- Prevent **abuse**: brute-force login, scraping, spam, DDoS
- **Fair usage** between tenants
- **Cost control** (e.g. expensive AI/SMS APIs)
- Monetization: free vs paid tiers

When exceeded, respond with **HTTP 429 Too Many Requests** plus headers like \`Retry-After\`, \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which HTTP status code should be returned when a client exceeds the rate limit?',
        o: ['429 Too Many Requests', '403 Forbidden', '400 Bad Request', '503 Service Unavailable'],
        a: 0,
        e: '429 Too Many Requests, ideally with a Retry-After header telling the client when to retry.',
      },
      {
        t: 'qa', l: 2,
        q: 'Explain the rate limiting algorithms: token bucket, leaky bucket, fixed window, sliding window log, sliding window counter.',
        e: `
**1. Token bucket** (most popular – AWS, Stripe)
- Bucket holds up to B tokens, refilled at R tokens/sec. Each request takes a token; empty -> reject.
- **Pro:** Allows **bursts** up to B, smooth average rate. Memory efficient.

**2. Leaky bucket**
- Requests enter a FIFO queue processed at a **constant rate**; overflow is dropped.
- **Pro:** Smooth output rate (good for protecting downstream). **Con:** Bursts get queued/dropped.

**3. Fixed window counter**
- Count requests per window (e.g. per minute: key \`user:42:12:05\`).
- **Pro:** Simple. **Con:** **Boundary burst:** 100 requests at 12:00:59 + 100 at 12:01:00 = 200 in 2 seconds.

**4. Sliding window log**
- Store timestamps of each request (sorted set); count those within the last 60s.
- **Pro:** Accurate. **Con:** Memory heavy (one entry per request).

**5. Sliding window counter**
- Weighted mix of current and previous fixed windows:
  \`count = current + previous × (overlap % of previous window)\`
- **Pro:** Accurate enough, low memory. Used by Cloudflare.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which rate limiting algorithm allows short bursts while enforcing an average rate?',
        o: ['Fixed window', 'Token bucket', 'Leaky bucket', 'None of them'],
        a: 1,
        e: 'Token bucket lets clients spend accumulated tokens in a burst (up to bucket capacity) while the refill rate enforces the long-term average.',
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the main flaw of the fixed window counter algorithm?',
        o: ['It cannot be implemented in Redis without Lua scripts', 'It uses too much memory, since every request timestamp is stored', 'Bursts at window boundaries can allow up to 2x the limit', 'It blocks all requests once the window starts'],
        a: 2,
        e: 'A client can send the full limit at the end of one window and again at the start of the next. Sliding windows fix this.',
      },
      {
        t: 'qa', l: 3,
        q: 'Design a distributed rate limiter for an API with 50 servers.',
        e: `
**Where:** at the **API gateway / middleware** before business logic (also per-service limits).

**Storage:** a centralized fast store – **Redis** (cluster) – so all 50 servers share counters.

**Algorithm in Redis (atomic with Lua)**
~~~lua
-- token bucket: KEYS[1]=bucket key, ARGV: capacity, refill_rate, now
local b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(b[1]) or tonumber(ARGV[1])
local ts = tonumber(b[2]) or tonumber(ARGV[3])
tokens = math.min(ARGV[1], tokens + (ARGV[3] - ts) * ARGV[2])
local allowed = tokens >= 1
if allowed then tokens = tokens - 1 end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', ARGV[3])
redis.call('EXPIRE', KEYS[1], 3600)
return allowed and 1 or 0
~~~
Lua makes check-and-decrement **atomic** (no race between servers).

**Design details**
- Keys: \`rl:{apiKey}:{endpoint}\`; rules in config (per tier/endpoint)
- Return 429 + rate limit headers
- **Fail open** if Redis is down (or fall back to local in-memory limits) – don't take the API down
- **Latency:** Redis call ~1 ms; for extreme scale use local counters synced periodically (approximate)
- Multi-region: per-region limits or async replicated counters`,
      },
      {
        t: 'mcq', l: 3,
        q: 'Two app servers read a Redis counter (value 99, limit 100), both increment and allow the request. Which technique prevents this race condition?',
        o: ['Use atomic INCR or a Lua script for check-and-increment', 'Use a bigger Redis instance so reads are faster', 'Read the counter twice and compare before allowing', 'Increase the limit slightly so small overshoots from races do not matter'],
        a: 0,
        e: 'GET-then-SET is not atomic. INCR returns the new value atomically (then compare to limit), and Lua scripts run atomically on the Redis server.',
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: Your login endpoint is being brute-forced. How do you apply rate limiting?',
        e: `
- **Per IP:** e.g. 20 attempts / 10 min per IP (catches single-source attacks).
- **Per account (username/email):** e.g. 5 failed attempts / 15 min, then lock or require CAPTCHA – catches distributed attacks on one account.
- **Progressive delays / exponential backoff** after failures.
- **CAPTCHA** after N failures, and **MFA**.
- **Global anomaly detection:** spikes in failed logins across many accounts (credential stuffing) -> WAF rules, bot detection.
- Return the **same generic error** for wrong user/wrong password (don't reveal which).
- Alert security team, notify users of suspicious attempts.`,
      },
      {
        t: 'qa', l: 2,
        q: 'Rate limiting vs throttling vs load shedding: what is the difference?',
        e: `
- **Rate limiting:** caps requests **per client** over time (fairness, abuse prevention) – excess gets 429.
- **Throttling:** slowing down or queueing requests rather than rejecting (sometimes used interchangeably with rate limiting).
- **Load shedding:** the **server** drops low-priority requests when it is **overloaded overall**, regardless of who sent them, to keep critical traffic working (e.g. drop analytics, keep checkout). Returns 503.
- **Backpressure:** downstream signals upstream to slow down.`,
      },
    ],
  },
  {
    slug: 'retry-resilience',
    title: 'Retry Pattern, Circuit Breaker & Resilience',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is the retry pattern? What are exponential backoff and jitter?',
        e: `
**Retry pattern:** automatically retry a failed operation when the failure is likely **transient** (network blip, timeout, 503, 429, deadlock).

**Exponential backoff:** wait longer after each failed attempt: 100ms, 200ms, 400ms, 800ms ... up to a max.

**Jitter:** add randomness to the wait so thousands of clients don't retry at the exact same moment (synchronized retry storms).
~~~js
async function withRetry(fn, retries = 5, base = 100, cap = 5000) {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (attempt >= retries || !isTransient(err)) throw err;
      const exp = Math.min(cap, base * 2 ** attempt);
      const delay = Math.random() * exp;          // "full jitter"
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
~~~
**Rules:** retry only idempotent operations (or use idempotency keys), limit attempts, never retry 4xx errors like 400/401/404.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which error should generally NOT be retried?',
        o: ['400 Bad Request', '503 Service Unavailable', '429 Too Many Requests (after Retry-After)', 'Connection timeout'],
        a: 0,
        e: '400 means the request itself is invalid; retrying the same request will fail again. Transient errors (timeouts, 503, 429, 502/504) are retry candidates.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Why is jitter added to exponential backoff?',
        o: ['To make retries faster by skipping some of the backoff delay', 'To encrypt request timing so attackers cannot guess the schedule', 'To spread out retries from many clients and avoid retry storms', 'To reduce the total number of retries each client makes'],
        a: 2,
        e: 'Without jitter, clients that failed together retry together, repeatedly hammering the recovering service in waves.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is the circuit breaker pattern? Explain its states.',
        e: `
A **circuit breaker** wraps calls to a remote service and **stops calling it when it keeps failing**, giving it time to recover and failing fast for callers.

**States**
- **Closed:** normal; calls pass through. Failures are counted. If failure rate exceeds a threshold (e.g. 50% over 20 calls) -> **Open**.
- **Open:** calls fail immediately (or return a fallback) without hitting the service. After a timeout (e.g. 30s) -> **Half-Open**.
- **Half-Open:** allow a few trial requests. Success -> **Closed**; failure -> back to **Open**.

~~~
 Closed --(failures > threshold)--> Open --(timeout)--> Half-Open
   ^                                                      |
   +---------------(trial calls succeed)------------------+
~~~
**Benefits:** prevents cascading failures, saves resources (threads/connections), faster responses.
**Libraries:** Resilience4j (Java), Polly (.NET), opossum (Node), Istio/Envoy outlier detection.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'In which circuit breaker state are a limited number of test requests allowed through?',
        o: ['Closed', 'Locked', 'Open', 'Half-Open'],
        a: 3,
        e: 'Half-Open probes whether the downstream has recovered. Successes close the circuit; a failure re-opens it.',
      },
      {
        t: 'qa', l: 2,
        q: 'What other resilience patterns should you know? (timeouts, bulkhead, fallback, idempotency)',
        e: `
- **Timeouts:** every remote call needs a timeout; without one, threads hang forever and the caller dies too. Set them slightly above the dependency's p99.
- **Bulkhead:** isolate resources per dependency (separate thread/connection pools) so one slow dependency can't exhaust everything – like ship compartments.
- **Fallback / graceful degradation:** return cached/default data ("recommendations unavailable", show popular items).
- **Idempotency:** safe to retry without side effects (idempotency keys).
- **Rate limiting & load shedding:** protect yourself from callers.
- **Health checks & auto restarts.**
- **Retry budgets:** limit retries to e.g. 10% of traffic to avoid amplification.
- **Hedged requests:** send a duplicate request to another replica if the first is slow (tail latency).
- **Chaos engineering:** inject failures to verify all of the above (Netflix Chaos Monkey).`,
      },
      {
        t: 'mcq', l: 3,
        q: 'Service A calls B, B calls C. Each layer retries 3 times. If C is down, how many calls can C receive for ONE user request?',
        o: ['1, since C is down and the first error stops every layer', '3, since only B calls C directly', '6, since A and B each retry 3 times', '9 or more, since retries multiply across layers'],
        a: 3,
        e: 'Retries multiply across layers: with 3 attempts at A and 3 at B, C sees 3 × 3 = 9 calls (4 × 4 = 16 if "3 retries" means 4 attempts each). Retry only at one layer (usually the edge) and use retry budgets plus circuit breakers.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is an idempotency key and how do you implement it for a POST /payments API?',
        e: `
An **idempotency key** is a unique client-generated id (UUID) sent with a non-idempotent request so retries don't repeat the side effect.

~~~
POST /payments
Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
~~~
**Server flow**
1. Look up the key in an \`idempotency_keys\` table / Redis.
2. **Not found:** insert key with status \`processing\` (unique constraint prevents concurrent duplicates), process the payment, store the **response**, mark \`completed\`.
3. **Found & completed:** return the **stored response** – don't charge again.
4. **Found & processing:** return 409 / tell the client to retry later.
5. Expire keys after e.g. 24 hours; validate the same key isn't reused with a different payload.

Stripe popularized this pattern.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: The recommendation service becomes slow (5s responses) and your whole product page goes down. Why, and how do you prevent it?',
        e: `
**Why – cascading failure**
- Product page calls recommendations synchronously with no/high timeout.
- Requests pile up waiting; app server threads/connections are exhausted.
- Now even requests that don't need recommendations can't be served -> the entire site fails.

**Prevention**
1. **Timeout** the call aggressively (e.g. 300 ms).
2. **Circuit breaker:** after repeated failures, skip calling it for 30 s.
3. **Fallback:** show cached or generic "popular products" instead.
4. **Bulkhead:** separate connection pool for the recommendation client so it can't starve others.
5. **Async / parallel loading:** render the page without recommendations and load them client-side lazily.
6. **Monitor** per-dependency latency and alert.

Principle: non-critical dependencies must never be able to take down critical paths.`,
      },
    ],
  },
  {
    slug: 'service-discovery',
    title: 'Service Discovery',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is service discovery and why do microservices need it?',
        e: `
In dynamic environments (containers, auto scaling), service instances come and go and their **IPs change constantly**. Hard-coding addresses doesn't work.

**Service discovery** lets services find the network locations of other services automatically.

**Components**
- **Service registry:** database of available instances and their health (Consul, etcd, ZooKeeper, Eureka, Kubernetes API/DNS).
- **Registration:** instances register on startup (self-registration) or are registered by the platform (third-party registration, e.g. Kubernetes).
- **Health checks:** unhealthy instances are removed.
- **Lookup:** clients query the registry (or DNS) to get instances.`,
      },
      {
        t: 'qa', l: 2,
        q: 'Client-side vs server-side service discovery: what is the difference?',
        e: `
**Client-side discovery**
- The client queries the registry, gets a list of instances and **load balances itself**.
- e.g. Netflix Eureka + Ribbon, gRPC with xDS, Consul client libraries.
- **Pro:** No extra hop, smart LB decisions. **Con:** Discovery logic in every client/language.

**Server-side discovery**
- The client calls a **load balancer/router**, which queries the registry and forwards the request.
- e.g. AWS ALB + ECS, **Kubernetes Services (kube-proxy)**, Consul + Nginx.
- **Pro:** Clients stay simple. **Con:** Extra network hop; LB must be HA.

**Service mesh** moves client-side discovery into a sidecar proxy, giving benefits of both.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'How does service discovery work by default in Kubernetes?',
        o: ['Each pod must register itself with a Eureka server on startup', 'Through Docker Hub, which tracks where each image is running', 'Services get a stable virtual IP and DNS name via CoreDNS, routing to healthy pods', 'Pods call each other using hard-coded pod IPs that are written into the deployment YAML'],
        a: 2,
        e: 'A Kubernetes Service gives a stable ClusterIP and DNS name; endpoints are updated automatically from pods that pass readiness probes; kube-proxy (iptables/IPVS) or eBPF routes traffic.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which tool is NOT primarily used as a service registry?',
        o: ['etcd', 'Grafana', 'Eureka', 'Consul'],
        a: 1,
        e: 'Grafana is a dashboard/visualization tool. Consul, etcd, ZooKeeper and Eureka are commonly used as service registries.',
      },
      {
        t: 'qa', l: 3,
        q: 'What happens if the service registry itself goes down? How is this handled?',
        e: `
- Registries are run as **clusters with consensus** (Consul/etcd use Raft, ZooKeeper uses ZAB) across AZs, so losing a minority of nodes is fine.
- **Client caching:** clients keep the last known instance list and keep working (stale but usable) if the registry is unreachable (Eureka's self-preservation mode does this).
- **DNS caching** in DNS-based discovery.
- **AP vs CP choice:** Eureka chose AP (keeps serving possibly stale data); Consul/etcd are CP (writes need a quorum).
- Health checks at the LB level still remove truly dead instances.`,
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: During deploys, some requests fail with "connection refused" because traffic reaches pods that are shutting down. How do you fix it?',
        e: `
- **Readiness probes:** pods receive traffic only when ready.
- **Graceful shutdown:** on SIGTERM, stop accepting new connections, finish in-flight requests, then exit.
- **preStop hook / delay:** sleep a few seconds before shutdown so the endpoint removal propagates to kube-proxy, load balancers and client caches.
- Set \`terminationGracePeriodSeconds\` long enough for draining.
- **Connection draining / deregistration delay** on cloud load balancers.
- Clients: retry idempotent requests once on connection errors.
- Rolling update with \`maxUnavailable: 0\` and \`maxSurge\` so capacity is maintained.`,
      },
    ],
  },
];
