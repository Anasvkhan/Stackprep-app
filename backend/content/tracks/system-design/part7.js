// URL shortener, payment gateway design, distributed systems concepts, storage & file upload, search, security, availability/DR
module.exports = [
  {
    slug: 'url-shortener',
    title: 'URL Shortener Design',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'Design a URL shortener like bit.ly. Start with requirements and estimates.',
        e: `
**Functional**
- Shorten a long URL -> short URL (\`sho.rt/aZ3kP9q\`); optional custom alias & expiry
- Redirect short URL -> long URL
- Analytics (clicks) – optional

**Non-functional**
- Very low redirect latency, highly available, short codes not guessable (ideally), durable mappings

**Estimates**
- 100M new URLs/month ≈ **40 writes/s**; read:write ≈ 100:1 -> **~4,000 redirects/s** (peaks higher)
- 5 years: 100M × 12 × 5 = **6B URLs** × ~500 bytes ≈ **3 TB**
- **Code length:** Base62 (a-z, A-Z, 0-9): 62^7 ≈ **3.5 trillion** -> 7 chars is plenty

**API**
~~~
POST /api/v1/urls   { longUrl, customAlias?, expiresAt? } -> 201 { shortUrl }
GET  /{code}        -> 301/302 Location: longUrl
~~~`,
      },
      {
        t: 'qa', l: 2,
        q: 'URL shortener: how do you generate the short code? Compare hashing vs counter-based approaches.',
        e: `
**1. Hash + truncate:** \`base62(md5(longUrl))[0:7]\`
- **Pro:** Same URL -> same code (dedupe). **Con:** **Collisions** – must check DB and retry with salt; extra read per write.

**2. Counter + Base62 encoding** (most common)
- Unique numeric id (DB sequence, Snowflake, or **range allocation**) -> base62 encode: id 125 -> "21".
- **Pro:** No collisions, short codes. **Con:** Sequential codes are **guessable** (scramble with a bijective shuffle or add random bits).
- **Range allocation:** each app server gets a block of 1M ids from a coordinator (ZooKeeper/DB) -> no per-request coordination.

**3. Pre-generated key service (KGS)**
- Offline service generates random unique 7-char keys into a DB; app servers take batches of unused keys.
- **Pro:** Fast, random, no collisions. **Con:** Extra service; must handle keys lost when a server crashes (acceptable).

~~~js
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function toBase62(n) {
  let s = '';
  do { s = ALPHABET[n % 62] + s; n = Math.floor(n / 62); } while (n > 0);
  return s;
}
~~~`,
      },
      {
        t: 'mcq', l: 2,
        q: 'How many unique codes can a 7-character Base62 short code represent?',
        o: ['~62 million', '~3.5 billion', '~3.5 trillion', '~7 trillion'],
        a: 2,
        e: '62^7 = 3,521,614,606,208 ≈ 3.5 trillion combinations.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Should a URL shortener redirect with 301 or 302?',
        o: ['Always 301 because it is faster for everybody', '301 (permanent) is cached by browsers and reduces load but hides repeat clicks from analytics; 302 (temporary) hits the server each time so clicks can be tracked', 'Always 404', 'Always 200 with the long URL in the body'],
        a: 1,
        e: 'Trade-off: 301 = less server load, worse analytics; 302/307 = every click goes through your service, enabling accurate click tracking. bit.ly uses 301 but many analytics-focused services use 302.',
      },
      {
        t: 'qa', l: 3,
        q: 'URL shortener: draw the high level design and explain how you scale reads.',
        e: `
~~~
Client -> CDN/edge (optional cache of hot codes)
       -> Load Balancer -> URL Service (stateless, many instances)
                              |  read: Redis cache (code -> longUrl), LRU
                              |  miss: NoSQL/KV DB (DynamoDB/Cassandra) or sharded SQL
                              |  write: ID range allocator / KGS
                              +-> Kafka (click events) -> Analytics workers -> OLAP store
~~~
**Read scaling (100:1 read heavy)**
- **Redis cache** of hot codes (80/20 rule – cache top 20% of URLs), cache-aside with TTL.
- **CDN/edge** can serve redirects for very hot links.
- **Database:** key-value access pattern -> DynamoDB/Cassandra partitioned by code; or SQL sharded by hash(code). Read replicas.

**Other details**
- **Analytics** async via Kafka so redirects stay fast.
- **Expiry:** TTL attribute / lazy deletion on read + background cleanup.
- **Abuse:** validate URLs against malware/phishing lists, rate limit creation per user/IP.
- **Custom aliases:** check uniqueness with a conditional write (put-if-not-exists).`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: A celebrity tweets a short link and it receives 1 million clicks per minute. How does your URL shortener survive?',
        e: `
- The code becomes a **hot key**. Serve it from **multiple layers of cache**:
  - CDN/edge caching of the redirect response (short TTL like 60s with 302, or long with 301)
  - **In-process LRU cache** on each URL service instance (microsecond lookups, no Redis hop)
  - Redis (replicated; read from replicas)
- **Request coalescing** so a cache miss for that key triggers only one DB read.
- **Click analytics:** don't write to the DB per click; publish to Kafka and aggregate in batches (or count in Redis \`INCR\` and flush periodically).
- **Auto scaling** for the stateless service tier; rate limiting per IP against bots.`,
      },
    ],
  },
  {
    slug: 'payment-gateway-design',
    title: 'Payment Gateway / Payment System Design',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'Design a payment system for an e-commerce platform (like Stripe integration / internal payment service).',
        e: `
**Requirements:** charge customers, refunds, payouts to sellers, payment status, **exactly-once charging**, reconciliation, PCI-DSS compliance, high reliability.

**Components**
~~~
Checkout -> Payment Service -> Payment Executor -> PSP (Stripe/Adyen/PayPal) -> Card networks/banks
                 |                    |
          Payments DB (ledger)   Idempotency store
                 |
          Wallet / Ledger Service (double-entry)     Webhook handler <- PSP events
                 |
          Reconciliation jobs (daily settlement files from PSP)
~~~
**Flow**
1. Order service creates a **payment intent** with a unique \`payment_id\` (idempotency key), status \`CREATED\`.
2. Client enters card details on the **PSP's hosted form/SDK** (card data never touches your servers -> PCI scope reduced). PSP returns a token.
3. Payment service calls the PSP with the token + idempotency key; status \`PENDING\`.
4. PSP responds or sends a **webhook** -> status \`SUCCEEDED/FAILED\`.
5. On success: update **ledger** (double-entry), emit \`PaymentSucceeded\` -> order fulfilment.
6. **Reconciliation:** compare internal ledger with PSP settlement reports daily; flag mismatches.

**Key principles:** idempotency everywhere, state machine for payment status, retries with backoff for unknown states, never lose a payment event (outbox), strong consistency (SQL/ACID).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the MOST important technique to prevent double charging when a payment request times out and the client retries?',
        o: ['Increase the timeout', 'Idempotency keys passed to your API and to the payment provider', 'Use a faster database', 'Retry without any key'],
        a: 1,
        e: 'A timeout doesn\'t mean failure – the charge may have succeeded. With the same idempotency key, the retry returns the original result instead of charging again.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is a double-entry ledger and why do payment systems use it?',
        e: `
In **double-entry bookkeeping**, every transaction is recorded as **at least two entries** (debits and credits) that **sum to zero**.

| Transaction | Account | Debit | Credit |
|---|---|---|---|
| Customer pays $100 | Customer wallet | 100 | |
| | Merchant receivable | | 100 |

**Why**
- **Correctness:** sum of all entries must always be zero -> easy to detect bugs/fraud.
- **Auditability:** append-only, immutable history (never update balances in place; balance = sum of entries).
- **Reconciliation** with banks/PSPs is straightforward.

Store in an ACID relational DB; use integer minor units (cents) – **never floating point** for money.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'How should monetary amounts be stored?',
        o: ['As floating point numbers (e.g. 10.99)', 'As integers in the smallest unit (e.g. 1099 cents) or a decimal type, with currency code', 'As strings with currency symbol "$10.99"', 'It does not matter'],
        a: 1,
        e: 'Floating point cannot represent many decimals exactly (0.1 + 0.2 != 0.3). Use integer minor units or DECIMAL/NUMERIC, and always store the ISO currency code.',
      },
      {
        t: 'qa', l: 3,
        q: 'Payment system: how do you handle the case where the PSP call times out and you don\'t know if the payment succeeded?',
        e: `
This is the **unknown state** problem – the most important edge case in payments.

1. Mark the payment as **\`PENDING/UNKNOWN\`**, never as failed.
2. **Retry with the same idempotency key** – the PSP returns the original result if it processed it.
3. **Query the PSP** for payment status by your reference id (status polling job).
4. **Listen for webhooks** – the PSP will send the final status.
5. **Reconciliation job** at end of day catches anything still mismatched.
6. Show the user "Payment processing" rather than asking them to pay again.
7. Only **after confirmation** fulfil the order or release the inventory hold.

Never auto-retry with a *new* idempotency key – that risks a double charge.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Why do merchants use the payment provider\'s hosted fields / SDK tokenization instead of sending raw card numbers to their own backend?',
        o: ['It is faster', 'Card data never touches the merchant\'s servers, drastically reducing PCI-DSS compliance scope and breach risk', 'It is required by HTTP', 'It avoids using HTTPS'],
        a: 1,
        e: 'Tokenization means the merchant only stores a token (e.g. pm_123), not the PAN. Handling raw card data requires the strictest PCI-DSS level.',
      },
      {
        t: 'qa', l: 3,
        q: 'Explain the payment state machine and how webhooks fit in.',
        e: `
~~~
CREATED -> PENDING -> SUCCEEDED -> (PARTIALLY_)REFUNDED
                   -> FAILED
                   -> REQUIRES_ACTION (3-D Secure / OTP) -> PENDING
SUCCEEDED -> DISPUTED (chargeback) -> WON / LOST
~~~
- Only **valid transitions** are allowed (enforced in code + DB: \`UPDATE ... WHERE status = 'PENDING'\`).
- **Webhooks** from the PSP drive many transitions (async 3DS, bank transfers, chargebacks).
- Webhook handler: verify signature, **store the raw event**, dedupe by event id, apply the transition idempotently, ack 2xx quickly.
- Events may arrive **out of order** (e.g. \`refund.created\` before \`charge.succeeded\` is processed) -> check current state, or fetch the latest object from the PSP API.
- Every transition is appended to a **payment_events** history table for audit.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Your daily reconciliation shows 37 payments marked SUCCEEDED by the PSP but PENDING in your database. What happened and what do you do?',
        e: `
**Likely causes**
- Webhooks were **dropped** (endpoint down, returned 5xx, signature verification bug, timeouts)
- Webhook handler crashed after receiving but before committing
- Status polling job failing silently

**Immediate fix**
- Fetch each payment from the PSP API and **apply the correct state transition idempotently** (which triggers order fulfilment/notifications).
- Notify customers if their orders were delayed.

**Prevention**
- Persist webhook events first (inbox table), process asynchronously with retries.
- **Polling fallback** for payments stuck in PENDING > N minutes.
- **Alerts** on reconciliation mismatches and webhook failure rates.
- Run reconciliation more frequently (hourly) for critical flows.`,
      },
    ],
  },
  {
    slug: 'distributed-systems',
    title: 'Distributed Systems Concepts',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'What are the fallacies of distributed computing?',
        e: `
Eight false assumptions engineers make (L. Peter Deutsch, Sun Microsystems):
1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

Designing with these in mind leads to timeouts, retries, idempotency, encryption, service discovery, and caching.`,
      },
      {
        t: 'qa', l: 3,
        q: 'What is consensus? Explain the Raft algorithm at a high level.',
        e: `
**Consensus** = getting multiple nodes to agree on a value/sequence of operations even if some nodes fail. Used for leader election, replicated logs, configuration (etcd, ZooKeeper, Consul, CockroachDB, Kafka KRaft).

**Raft**
- Nodes are **Leader**, **Follower** or **Candidate**. Time is divided into **terms**.
- **Leader election:** followers that don't hear heartbeats within a random timeout become candidates and request votes; a candidate with a **majority** becomes leader for that term.
- **Log replication:** clients send commands to the leader; the leader appends to its log and replicates to followers; once a **majority** stores it, the entry is **committed** and applied.
- **Safety:** only nodes with up-to-date logs can win elections, so committed entries are never lost.
- A cluster of **2f + 1** nodes tolerates **f** failures (3 nodes -> 1 failure, 5 nodes -> 2).

Paxos solves the same problem but is harder to understand; Raft was designed for understandability.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'How many node failures can a 5-node Raft/etcd cluster tolerate while still making progress?',
        o: ['1', '2', '3', '4'],
        a: 1,
        e: 'A majority (quorum) of 3 out of 5 must be available, so up to 2 nodes can fail. That is why clusters use odd sizes (3, 5, 7).',
      },
      {
        t: 'mcq', l: 3,
        q: 'Why do consensus clusters usually have an odd number of nodes?',
        o: ['Odd numbers are faster', 'An even number adds cost without increasing fault tolerance (4 nodes tolerate 1 failure, same as 3)', 'Raft cannot run with even nodes', 'For licensing reasons'],
        a: 1,
        e: 'Quorum = floor(N/2) + 1. 3 nodes -> quorum 2 (tolerates 1). 4 nodes -> quorum 3 (still tolerates 1). Odd sizes maximize tolerance per node.',
      },
      {
        t: 'qa', l: 3,
        q: 'Why can\'t we rely on wall clock time in distributed systems? What are logical clocks?',
        e: `
**Physical clocks drift** and are corrected by NTP (can jump backwards). Two servers can disagree by milliseconds or more, so timestamps can't reliably order events (e.g. last-write-wins may drop the actual latest write).

**Logical clocks**
- **Lamport timestamps:** a counter incremented on each event and updated to \`max(local, received) + 1\` on message receipt. Gives an order consistent with causality (if A -> B then L(A) < L(B)), but can't detect concurrency.
- **Vector clocks:** each node keeps a vector of counters for all nodes. Can tell if two events are **causally related or concurrent** -> used for conflict detection (Dynamo, Riak).
- **Hybrid Logical Clocks (HLC):** combine physical time with a logical counter (CockroachDB, MongoDB).
- **TrueTime (Spanner):** bounded clock uncertainty using GPS/atomic clocks; waits out the uncertainty for external consistency.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is idempotency and why is it critical in distributed systems?',
        e: `
An operation is **idempotent** if performing it multiple times has the **same effect as once**.

**Why critical:** networks fail in ambiguous ways – a timeout doesn't tell you if the request was processed. Retries, at-least-once message delivery and client double-clicks all cause **duplicate requests**.

**Techniques**
- **Idempotency keys** stored with the result (payments)
- **Natural idempotency:** \`SET status = 'PAID'\` instead of \`balance = balance - 10\`
- **Unique constraints** (dedupe by message/event id)
- **Conditional writes / versions:** \`UPDATE ... WHERE version = 5\`
- **Upserts** instead of inserts`,
      },
      {
        t: 'qa', l: 3,
        q: 'What is leader election and when do you need it?',
        e: `
**Leader election** chooses one node among many to perform a special role, so that only one node does it at a time.

**Use cases**
- Single writer / primary database
- Running a **scheduled job exactly once** (cron across many instances)
- Partition ownership (Kafka partition leaders), coordinators

**How**
- Consensus systems: **etcd/ZooKeeper/Consul** leases (ephemeral nodes, lease TTL)
- Kubernetes **Lease** objects (client-go leaderelection)
- Database row lock / advisory lock with expiry
- Redis lock (best effort)

**Must handle:** leader crash (lease expiry -> new election), split brain (fencing tokens so the old leader's writes are rejected), GC pauses longer than the lease.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'What is a fencing token?',
        o: ['A firewall rule', 'A monotonically increasing number issued with each lock/lease, which the storage system checks so writes from a stale lock holder are rejected', 'An OAuth token', 'A token bucket parameter'],
        a: 1,
        e: 'If an old leader wakes up from a GC pause and writes with token 33 while the new leader has token 34, the storage rejects token 33.',
      },
      {
        t: 'qa', l: 3,
        q: 'Explain Event Sourcing and CQRS.',
        e: `
**Event Sourcing**
- Store **every state change as an immutable event** (\`AccountOpened\`, \`MoneyDeposited\`, \`MoneyWithdrawn\`) instead of only the current state.
- Current state = replay of events (with periodic **snapshots** for speed).
- **Pro:** Full audit trail, time travel/debugging, rebuild new read models anytime. **Con:** Complexity, event schema evolution, eventual consistency of projections.

**CQRS (Command Query Responsibility Segregation)**
- Separate the **write model** (commands, validation, normalized/event store) from **read models** (denormalized views optimized for queries, e.g. Elasticsearch, Redis, read tables).
- Read models are updated asynchronously from events.
- **Pro:** Scale reads/writes independently, optimized queries. **Con:** Eventual consistency, more moving parts.

They are often used together but are independent patterns.`,
      },
    ],
  },
  {
    slug: 'storage-file-upload',
    title: 'Blob Storage & File Uploads',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'Block storage vs file storage vs object storage: what is the difference?',
        e: `
- **Block storage:** raw disk volumes split into blocks, attached to one server (AWS EBS, SAN). Lowest latency; used for databases and OS disks.
- **File storage:** hierarchical file system shared over the network (NFS, AWS EFS, SMB). Multiple servers can mount it.
- **Object storage:** flat namespace of **objects** (data + metadata + key) accessed via HTTP API (AWS S3, GCS, Azure Blob, MinIO). Virtually unlimited scale, cheap, 11 nines durability; higher latency; immutable objects (replace whole object).

**Images, videos, backups, logs, static sites -> object storage.**`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Where should user-uploaded profile pictures be stored in a scalable web app?',
        o: ['In the relational database as BLOBs', 'On the local disk of the web server', 'In object storage (e.g. S3) with the URL/key saved in the database, served via CDN', 'In Redis'],
        a: 2,
        e: 'Local disks break when you have multiple stateless servers; DB BLOBs bloat the database. Object storage + CDN is cheap, durable and scalable.',
      },
      {
        t: 'qa', l: 2,
        q: 'How do you design large file uploads (e.g. 5 GB videos) efficiently?',
        e: `
1. **Pre-signed URLs:** client asks the backend for an upload URL; backend returns a **pre-signed S3 URL** (short expiry). The client uploads **directly to S3**, bypassing your servers (no bandwidth/memory load on app servers).
2. **Multipart / chunked upload:** split into parts (e.g. 10 MB), upload in **parallel**, retry failed parts only, then complete the multipart upload.
3. **Resumable uploads:** track uploaded parts so uploads continue after network loss (tus protocol, S3 multipart, GCS resumable).
4. **Post-processing:** S3 event -> queue -> workers (virus scan, transcoding, thumbnails); status updated in DB.
5. **Validation:** content type, size limits, checksums (MD5/SHA256) for integrity.
6. **Delivery:** via CDN, signed URLs for private files.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the main benefit of pre-signed URLs for uploads?',
        o: ['They compress files', 'Clients upload directly to object storage with temporary permission, so files don\'t pass through your app servers', 'They make files public forever', 'They encrypt the database'],
        a: 1,
        e: 'Pre-signed URLs grant time-limited permission for a specific operation on a specific key, offloading bandwidth and work from your servers.',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Design an image upload pipeline for a social app that needs thumbnails in 3 sizes and NSFW detection.',
        e: `
1. Client requests upload -> backend creates \`media\` record (status \`UPLOADING\`) and returns a **pre-signed URL**.
2. Client uploads the original directly to S3 \`raw/\` bucket.
3. **S3 event notification** -> SQS/Kafka -> **image workers**:
   - Validate type/size, strip EXIF (privacy: GPS data)
   - Generate thumbnails (150px, 600px, 1080px) in WebP/AVIF
   - Run **NSFW/moderation ML** model
4. Workers save outputs to \`processed/\` bucket and update the record to \`READY\` (or \`REJECTED\`).
5. Notify client via push/WebSocket; client shows images from the **CDN**.
6. Scale workers on queue depth; DLQ for failed images; idempotent processing by media id.
7. Lifecycle rules: move originals to cheaper storage (S3 Glacier) after 30 days.`,
      },
    ],
  },
  {
    slug: 'search-systems',
    title: 'Search & Elasticsearch',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'What is an inverted index and why is it used for full-text search?',
        e: `
An **inverted index** maps each **term** to the list of documents that contain it (posting list), like the index in a book.

~~~
"redis"   -> [doc1, doc4, doc9]
"cache"   -> [doc1, doc2]
"cluster" -> [doc4]
~~~
**Building it:** text goes through an **analyzer** – tokenization, lowercasing, stop-word removal, stemming ("running" -> "run"), synonyms.

**Query** "redis cache": intersect/union posting lists, then rank with relevance scoring (**BM25**, formerly TF-IDF).

A SQL \`LIKE '%redis%'\` can't use a B-tree index and scans everything; an inverted index answers in milliseconds over billions of docs.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Why shouldn\'t Elasticsearch usually be the primary source of truth?',
        o: ['It cannot store JSON', 'It is near real-time and optimized for search; it lacks ACID transactions, so data should be synced from a primary DB', 'It is too slow for search', 'It only supports numbers'],
        a: 1,
        e: 'Elasticsearch is typically a secondary index fed from the primary database (via CDC/events) so it can be rebuilt any time.',
      },
      {
        t: 'qa', l: 2,
        q: 'How do you keep Elasticsearch in sync with your primary database?',
        e: `
- **Dual writes** from the application (write DB, then ES) – simple, but risks inconsistency if one write fails.
- **Event-driven:** app publishes domain events (via **outbox**) -> consumer indexes into ES.
- **Change Data Capture (CDC):** Debezium reads the DB's WAL/binlog -> Kafka -> ES sink connector. Most reliable, no app changes.
- **Periodic batch re-index** for recovery/backfills; use **index aliases** to swap a freshly built index with zero downtime.

Expect **eventual consistency** (usually < 1-2 seconds).`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Design search autocomplete (typeahead) for an e-commerce site with 10K queries/sec.',
        e: `
**Requirements:** suggestions within ~100 ms after each keystroke, ranked by popularity, typo tolerance nice-to-have.

**Approach**
1. **Data:** aggregate popular search queries & product names offline (daily/hourly) from search logs.
2. **Data structure:** **Trie** where each node stores the top-K suggestions for that prefix (precomputed), or Elasticsearch **completion suggester / edge n-grams**.
3. **Serving:** autocomplete service holds the trie in memory (or Redis sorted sets per prefix: \`ZREVRANGE prefix:iph 0 9\`).
4. **Client optimizations:** **debounce** keystrokes (~150ms), cache results in the browser, cancel stale requests.
5. **Caching:** CDN/edge cache for short popular prefixes ("a", "ip").
6. **Updates:** rebuild trie periodically; trending queries via a streaming pipeline.
7. **Filtering:** remove offensive suggestions, personalize lightly (recent searches).`,
      },
    ],
  },
  {
    slug: 'security-in-design',
    title: 'Security in System Design',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'What security measures should every system design include?',
        e: `
- **Encryption in transit:** HTTPS/TLS everywhere, mTLS between services.
- **Encryption at rest:** DB/disk/S3 encryption with KMS-managed keys.
- **Authentication & authorization:** OAuth2/OIDC, least privilege, RBAC.
- **Secrets management:** Vault/AWS Secrets Manager; never hard-code secrets or commit them to git.
- **Input validation & output encoding:** prevent SQL injection, XSS, SSRF.
- **Rate limiting, WAF, DDoS protection** (Cloudflare, AWS Shield).
- **Network segmentation:** private subnets for DBs, security groups, no public DB access.
- **Audit logs** and monitoring for suspicious activity.
- **Data protection:** hash passwords (bcrypt/argon2), mask PII, comply with GDPR/PCI.
- **Dependency scanning, patching, backups,** incident response plan.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'How should passwords be stored?',
        o: ['Encrypted with AES so they can be decrypted later', 'Hashed with a slow, salted algorithm like bcrypt, scrypt or Argon2', 'Hashed with MD5', 'In plain text in a secure database'],
        a: 1,
        e: 'Passwords should be one-way hashed with a slow, salted algorithm resistant to brute force. Fast hashes (MD5/SHA-1) are crackable with GPUs; encryption is reversible.',
      },
      {
        t: 'qa', l: 2,
        q: 'How does a DDoS attack work and how do you mitigate it?',
        e: `
**DDoS (Distributed Denial of Service):** many compromised machines (botnet) flood a target to exhaust bandwidth, connections or CPU.

**Types**
- **Volumetric** (UDP floods, DNS/NTP amplification) – saturate bandwidth
- **Protocol** (SYN flood) – exhaust connection tables
- **Application layer (L7)** (HTTP floods on expensive endpoints) – hardest to distinguish from real users

**Mitigation**
- **CDN / anycast networks** absorb volume (Cloudflare, Akamai, AWS Shield)
- **WAF rules**, bot detection, CAPTCHA/JS challenges
- **Rate limiting** per IP/user/endpoint; geo blocking if appropriate
- **SYN cookies**, connection limits at LBs
- **Auto scaling** + caching to absorb load; protect expensive endpoints
- Hide origin IPs (only accept traffic from the CDN).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is SSRF (Server-Side Request Forgery)?',
        o: ['Injecting SQL into forms', 'Tricking a server into making requests to internal resources (e.g. cloud metadata endpoint 169.254.169.254) on the attacker\'s behalf', 'Stealing session cookies via JavaScript', 'Brute forcing passwords'],
        a: 1,
        e: 'Features like "fetch image from URL" can be abused to hit internal services. Mitigate with URL allowlists, blocking private IP ranges, IMDSv2 on AWS, and network egress controls.',
      },
    ],
  },
  {
    slug: 'availability-disaster-recovery',
    title: 'High Availability & Disaster Recovery',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'What are RTO and RPO?',
        e: `
- **RPO (Recovery Point Objective):** maximum acceptable **data loss** measured in time. RPO = 5 min means you can lose at most the last 5 minutes of data -> backups/replication must be at least that frequent.
- **RTO (Recovery Time Objective):** maximum acceptable **downtime** – how fast the service must be restored after a disaster.

Lower RPO/RTO = more expensive (synchronous replication, hot standby, multi-region active-active).`,
      },
      {
        t: 'qa', l: 2,
        q: 'Explain disaster recovery strategies: backup & restore, pilot light, warm standby, multi-site active-active.',
        e: `
| Strategy | How | RTO / RPO | Cost |
|---|---|---|---|
| **Backup & Restore** | Regular backups to another region; rebuild infra on disaster | Hours / hours | $ |
| **Pilot Light** | Core pieces (DB replica) always running in DR region; app servers off, started on disaster | 10s of minutes / minutes | $$ |
| **Warm Standby** | Scaled-down but fully working copy running in DR region; scale up on failover | Minutes / seconds-minutes | $$$ |
| **Multi-site Active-Active** | Full capacity in multiple regions serving traffic simultaneously | Near zero / near zero | $$$$ |

Always **test** DR regularly (game days) – an untested backup is not a backup.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Active-passive vs active-active failover: which statement is true?',
        o: ['In active-passive, both nodes serve traffic', 'In active-active, all nodes serve traffic; in active-passive, the standby only takes over on failure', 'Active-active never needs data replication', 'They are the same'],
        a: 1,
        e: 'Active-passive keeps a standby idle (simpler, wasted capacity). Active-active uses all capacity but needs load balancing and handling of concurrent writes/conflicts.',
      },
      {
        t: 'mcq', l: 1,
        q: 'What is the purpose of deploying across multiple Availability Zones (AZs)?',
        o: ['To reduce code size', 'To survive the failure of a single data center while keeping low latency between zones', 'To avoid using a load balancer', 'To make the database faster'],
        a: 1,
        e: 'AZs are physically separate data centers in a region with independent power/network, connected by low-latency links. Multi-AZ protects against a data-center-level outage.',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: An engineer accidentally ran DELETE FROM orders without WHERE in production. How should your system let you recover?',
        e: `
**Recovery options (need to exist beforehand!)**
- **Point-in-time recovery (PITR):** restore the DB to the second before the delete using base backup + WAL/binlog replay (RDS PITR, Postgres WAL archiving). Restore into a **new instance**, then copy the missing rows back.
- **Delayed replica:** a replica intentionally lagging by e.g. 1 hour – stop replication and extract data.
- **Soft deletes / audit tables / CDC stream** (Kafka retains change events) to rebuild data.

**Prevention**
- Least privilege: no direct write access to prod; changes via reviewed migrations
- Require \`WHERE\` (MySQL \`sql_safe_updates\`), run destructive queries in transactions
- Regular **restore drills**, monitored backups
- Blameless post-mortem.`,
      },
    ],
  },
];
