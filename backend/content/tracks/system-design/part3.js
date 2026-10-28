// Caching, Redis, SQL vs NoSQL, database indexing
module.exports = [
  {
    slug: 'caching',
    title: 'Caching Strategies',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is caching and where can caches exist in a system?',
        e: `
**Caching** stores copies of frequently accessed data in a faster storage layer so future requests are served faster and the source (DB/service) is under less load.

**Cache layers (client to DB)**
1. **Browser cache** (HTTP caching headers, service workers)
2. **CDN / edge cache**
3. **Reverse proxy cache** (Nginx, Varnish)
4. **Application cache** – in-process (memory, LRU map) or distributed (Redis, Memcached)
5. **Database cache** – buffer pool, query cache, materialized views
6. **OS / disk page cache, CPU caches**

**Good candidates:** read-heavy data that changes rarely, expensive computations, session data, rendered pages.`,
      },
      {
        t: 'qa', l: 1,
        q: 'Explain cache-aside, read-through, write-through, write-back and write-around strategies.',
        e: `
**Cache-aside (lazy loading)** – most common
1. App reads cache; on **miss**, reads DB, then writes result to cache.
2. On write: update DB, then **invalidate** (delete) the cache key.
- **Pro:** Only requested data is cached; cache failure isn't fatal.
- **Con:** First request is slow; possible stale data.

**Read-through** – the cache library itself loads from DB on a miss (app only talks to cache).

**Write-through** – write goes to cache **and** DB synchronously.
- **Pro:** Cache always fresh. **Con:** Higher write latency, caches data that may never be read.

**Write-back (write-behind)** – write to cache only, flushed to DB asynchronously later.
- **Pro:** Very fast writes, batches DB writes. **Con:** Risk of data loss if cache dies before flush.

**Write-around** – write directly to DB, skip cache; cache filled on read.
- **Pro:** Avoids polluting cache with write-once data. **Con:** Recent writes cause cache misses.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'In the cache-aside pattern, what does the application do on a cache miss?',
        o: ['Reads from the database, stores the result in the cache, and returns it', 'Waits for the cache to fill itself from the database in the background', 'Returns an error and lets the client retry the request later', 'Writes an empty placeholder value to the database to mark the miss for the next request'],
        a: 0,
        e: 'Cache-aside = lazy loading. The application is responsible for loading data into the cache after a miss.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which write strategy gives the fastest writes but risks data loss if the cache crashes?',
        o: ['Cache-aside', 'Write-through (sync)', 'Write-around', 'Write-back (write-behind)'],
        a: 3,
        e: 'Write-back acknowledges writes once they are in the cache and persists to the DB later asynchronously, so a crash before flushing loses data.',
      },
      {
        t: 'qa', l: 1,
        q: 'What are cache eviction policies? Explain LRU, LFU and FIFO.',
        e: `
When the cache is full, an **eviction policy** decides what to remove.

- **LRU (Least Recently Used):** evict the item not accessed for the longest time. Good general default. Implemented with hash map + doubly linked list (O(1)).
- **LFU (Least Frequently Used):** evict the item accessed the fewest times. Good when popularity is stable; needs aging to avoid old popular items sticking.
- **FIFO:** evict the oldest inserted item regardless of usage. Simple but often poor hit ratio.
- **Random:** surprisingly decent and cheap.
- **TTL-based expiry:** items expire after a fixed time (complements eviction).

Redis supports: \`noeviction, allkeys-lru, volatile-lru, allkeys-lfu, volatile-lfu, allkeys-random, volatile-random, volatile-ttl\`.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is cache invalidation and why is it considered hard?',
        e: `
**Cache invalidation** = removing/updating cached data when the source of truth changes so users don't see stale data.

**Approaches**
- **TTL expiry:** simplest; accept staleness for up to TTL.
- **Explicit invalidation on write:** delete the key after updating the DB.
- **Event-driven:** DB change events (CDC, e.g. Debezium -> Kafka) trigger invalidation in all caches.
- **Versioned keys:** \`user:42:v7\`; bump version on change.

**Why hard**
- Race conditions: a reader can put an old value back in cache right after a writer deleted it.
- Data cached in many places (CDN, app memory on many servers, Redis).
- Derived/aggregated data depends on many sources.
- Distributed failures: the DB write succeeds but the cache delete fails.

Common mitigations: delete (not update) on write, short TTL as a safety net, "delayed double delete", CDC-based invalidation.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'When updating data with cache-aside, why is it usually better to DELETE the cache key rather than UPDATE it with the new value?',
        o: ['Concurrent writes can leave an older value if you set it; deleting forces a fresh read', 'Updating a cache key in place is not possible once a TTL has been set on it in Redis', 'Deleting is the only write operation that Redis supports for strings', 'Deleting the key makes the database faster by reducing its index size'],
        a: 0,
        e: 'With two concurrent writers, the cache sets can happen in a different order than the DB writes, leaving stale data. Deleting is idempotent and the next read repopulates from the DB.',
      },
      {
        t: 'qa', l: 2,
        q: 'What are cache stampede (thundering herd), cache penetration and cache avalanche? How do you prevent them?',
        e: `
**Cache stampede / thundering herd / dogpile**
A hot key expires and thousands of requests hit the DB at once to rebuild it.
- *Fix:* mutex/lock so only one request rebuilds (others wait or get stale), request coalescing, **early probabilistic refresh**, serve stale while revalidating.

**Cache penetration**
Requests for keys that **don't exist** (e.g. random ids from an attacker) always miss and hit the DB.
- *Fix:* cache **null/empty results** with a short TTL, **Bloom filter** of valid ids, input validation.

**Cache avalanche**
Many keys expire at the **same time** (or the cache cluster crashes), overwhelming the DB.
- *Fix:* add **random jitter** to TTLs, HA cache (replicas, cluster), circuit breakers / rate limiting on the DB path, warm the cache on startup.

**Hot key**
One key receives huge traffic (celebrity profile).
- *Fix:* local in-process cache on top of Redis, replicate the key (key#1..key#N), read replicas.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Attackers request random non-existent product IDs, causing every request to hit the database. What is this called and what is a good fix?',
        o: ['Cache penetration; cache null results and/or use a Bloom filter', 'Hot key; shard the product table by ID', 'Cache avalanche; add more RAM to the cache servers and restart them', 'Cache stampede; increase the TTL of popular keys'],
        a: 0,
        e: 'Cache penetration. Caching "not found" for a short time and checking a Bloom filter of existing IDs stops the DB from being hit for invalid keys.',
      },
      {
        t: 'mcq', l: 3,
        q: 'Thousands of cache keys were set with the same 1 hour TTL during a deploy, and an hour later the DB crashed. What is the simplest prevention?',
        o: ['Switch to write-through caching for all keys', 'Add random jitter to TTLs so expirations spread out', 'Use a longer TTL of 2 hours for all keys', 'Disable caching entirely until the next deploy is done'],
        a: 1,
        e: 'Synchronized expiry causes a cache avalanche. TTL = base + random(0..N) spreads the reload load over time.',
      },
      {
        t: 'qa', l: 2,
        q: 'Local (in-process) cache vs distributed cache: trade-offs?',
        e: `
| | Local cache (e.g. LRU map, Caffeine, node-cache) | Distributed cache (Redis, Memcached) |
|---|---|---|
| Latency | Nanoseconds (no network) | ~0.2-1 ms network hop |
| Capacity | Limited by one server's RAM | Scales with the cluster |
| Consistency | Each server has its own copy -> can diverge | Single shared copy |
| Survives restarts | No | Yes (with persistence/replicas) |
| Invalidation | Hard across N servers (need pub/sub) | One delete |

**Common pattern:** two-level cache – small local L1 cache with short TTL for ultra-hot keys + Redis as L2.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: A product page is viewed 50K times/sec during a flash sale, but stock count must be accurate. How do you cache it?',
        e: `
Split the page data by **how fresh it must be**:

1. **Static product info** (title, images, description): CDN + Redis with long TTL; invalidate on edit.
2. **Price:** Redis with short TTL or event-based invalidation on price change.
3. **Stock count:** don't cache in the browser/CDN. Keep the authoritative counter in **Redis** (\`DECR\` is atomic) and show an approximate value ("only a few left") on the page, refreshed every few seconds.
4. **Purchase:** atomically reserve stock in Redis (Lua script: check > 0 and decrement), then create the order asynchronously via a queue; reconcile with the DB.
5. **Protect the DB:** request coalescing for misses, local L1 cache for the hottest product, rate limiting / virtual waiting room.

Key idea: cache aggressively what can be stale; use atomic operations (not cache) for what must be correct.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'What does "cache hit ratio" measure?',
        o: ['The number of servers currently in the cache cluster', 'The memory used by the cache', 'The percentage of requests served from the cache', 'How fast the cache is'],
        a: 2,
        e: 'Hit ratio = hits / (hits + misses). A low hit ratio means the cache is not effective (wrong keys, TTL too short, cache too small).',
      },
    ],
  },
  {
    slug: 'redis',
    title: 'Redis',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is Redis and why is it so fast?',
        e: `
**Redis** (REmote DIctionary Server) is an open-source, **in-memory key-value data store** used as a cache, database, message broker and for real-time features.

**Why fast**
- Data lives in **RAM** (no disk seeks on reads)
- **Single-threaded event loop** for commands -> no locks/context switches (I/O threads exist since Redis 6)
- **Efficient data structures** (hash tables, skip lists, compact listpacks)
- **I/O multiplexing** (epoll/kqueue) handles thousands of connections
- Simple RESP protocol, pipelining

Typical latency: sub-millisecond; 100K+ ops/sec per instance.`,
      },
      {
        t: 'qa', l: 1,
        q: 'What data structures does Redis support and what are their use cases?',
        e: `
| Type | Example use case |
|---|---|
| **String** | Caching JSON/HTML, counters (\`INCR\`), distributed locks (\`SET NX PX\`) |
| **Hash** | Objects: \`HSET user:1 name Ali age 30\` |
| **List** | Queues (\`LPUSH\`/\`BRPOP\`), recent activity feeds |
| **Set** | Unique items, tags, mutual friends (\`SINTER\`) |
| **Sorted Set (ZSet)** | Leaderboards (\`ZADD\`, \`ZREVRANGE\`), priority queues, sliding-window rate limiting |
| **Bitmap** | Daily active users, feature flags per user id |
| **HyperLogLog** | Approximate unique counts (unique visitors) with ~12 KB memory |
| **Geospatial** | Nearby drivers/restaurants (\`GEOADD\`, \`GEOSEARCH\`) |
| **Streams** | Append-only log with consumer groups (Kafka-like event streaming) |
| **Pub/Sub** | Real-time messaging, chat, cache invalidation broadcasts |`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which Redis data structure is best for a real-time game leaderboard?',
        o: ['Sorted Set', 'Set', 'List', 'String'],
        a: 0,
        e: 'Sorted sets keep members ordered by score with O(log N) updates. ZINCRBY updates scores, ZREVRANGE gets the top N, ZREVRANK gets a user\'s rank.',
      },
      {
        t: 'qa', l: 2,
        q: 'Explain Redis persistence: RDB vs AOF.',
        e: `
**RDB (snapshots)**
- Point-in-time snapshot of the dataset saved to disk at intervals (\`save 900 1\`), via a forked child process.
- **Pro:** Compact, fast restarts, good for backups. **Con:** Can lose data since the last snapshot.

**AOF (Append Only File)**
- Logs every write command; replayed on restart.
- \`appendfsync always | everysec | no\` – \`everysec\` loses at most ~1 second.
- **Pro:** More durable. **Con:** Bigger files, slower restart (mitigated by AOF rewrite).

**Hybrid (recommended):** RDB + AOF (\`aof-use-rdb-preamble yes\`).
**No persistence:** pure cache use case.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which command atomically sets a key only if it does not exist and gives it an expiry (used for simple distributed locks)?',
        o: ['GETSET key value', 'MSET key value', 'SET key value NX PX 30000', 'SETEX key 30000 value NX'],
        a: 2,
        e: 'SET with NX (only if not exists) and PX/EX (expiry) is atomic. Release the lock safely with a Lua script that deletes only if the value matches your unique token.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is the difference between Redis replication, Redis Sentinel and Redis Cluster?',
        e: `
**Replication (master-replica)**
- Replicas asynchronously copy the master. Used for read scaling and redundancy.

**Redis Sentinel** – high availability
- Monitors master and replicas, performs **automatic failover** (promotes a replica), tells clients the new master address.
- Does NOT shard data; dataset must fit on one node.

**Redis Cluster** – horizontal scaling + HA
- Data is **sharded across masters** using **16,384 hash slots** (\`CRC16(key) % 16384\`).
- Each master has replicas; automatic failover built in.
- Multi-key operations only work when keys are in the same slot -> use **hash tags** \`{user:42}:cart\`, \`{user:42}:profile\`.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'How many hash slots does Redis Cluster use to distribute keys?',
        o: ['1,024', '65,536', '16,384', '4,096'],
        a: 2,
        e: 'Redis Cluster has 16,384 hash slots. Each key maps to slot CRC16(key) mod 16384 and each master owns a range of slots.',
      },
      {
        t: 'qa', l: 2,
        q: 'Redis vs Memcached: when would you choose which?',
        e: `
| | Redis | Memcached |
|---|---|---|
| Data types | Rich (hashes, lists, sets, zsets, streams, geo) | Strings only |
| Persistence | RDB/AOF | None |
| Replication / HA | Yes (Sentinel, Cluster) | No (client-side sharding) |
| Threading | Mostly single-threaded command execution | Multi-threaded |
| Extras | Pub/Sub, Lua, transactions, TTL per key | Simple, very fast cache |

**Choose Redis** for almost everything (sessions, leaderboards, queues, rate limiting, locks).
**Choose Memcached** for a simple, large, multi-threaded pure cache of strings/HTML.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Why is running KEYS * on a production Redis server dangerous?',
        o: ['It deletes all keys that match the pattern', 'It is not a valid command in Redis 6 and later versions', 'It disables persistence while it is running', 'It is O(N) and blocks the single-threaded server'],
        a: 3,
        e: 'KEYS scans every key and blocks all other clients. Use SCAN, which iterates incrementally with a cursor.',
      },
      {
        t: 'qa', l: 3,
        q: 'How do you implement a distributed lock with Redis? What is Redlock and what are its criticisms?',
        e: `
**Single instance lock**
~~~
SET lock:order:42 <unique-token> NX PX 30000     # acquire
-- release only if we still own it (Lua, atomic):
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
~~~
- Unique token prevents deleting someone else's lock; TTL prevents deadlocks if the holder crashes.

**Redlock:** acquire the lock on a majority (e.g. 3 of 5) of independent Redis masters within a time limit.

**Criticisms (Martin Kleppmann)**
- Relies on timing assumptions; GC pauses or clock jumps can make two clients believe they hold the lock.
- No **fencing tokens**: the protected resource can't reject a stale lock holder.

**Recommendation:** for correctness-critical locks use a consensus system (ZooKeeper, etcd) with fencing tokens, or design operations to be idempotent. Redis locks are fine for efficiency (avoiding duplicate work).`,
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: Implement "users online in the last 5 minutes" and "daily active users" for 50M users using Redis.',
        e: `
**Online in last 5 minutes – Sorted Set**
~~~
ZADD online <timestamp> <userId>        # on every heartbeat
ZREMRANGEBYSCORE online 0 <now-300>     # drop stale users
ZCARD online                            # count
~~~

**Daily active users – Bitmap (exact)**
~~~
SETBIT dau:2026-10-22 <userId> 1
BITCOUNT dau:2026-10-22
BITOP OR wau dau:d1 dau:d2 ... dau:d7   # weekly active
~~~
50M users ≈ 6 MB per day. Needs numeric user ids.

**Approximate unique visitors – HyperLogLog**
~~~
PFADD uv:2026-10-22 <userId>
PFCOUNT uv:2026-10-22          # ~0.81% error, 12 KB per key
~~~`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Redis memory is full and you see OOM errors in production. What do you do?',
        e: `
**Immediate**
- Check \`INFO memory\`, \`maxmemory\`, \`maxmemory-policy\`. If used as a cache, set \`allkeys-lru\` or \`allkeys-lfu\` instead of \`noeviction\`.
- Find big keys: \`redis-cli --bigkeys\`, \`MEMORY USAGE key\`, \`--memkeys\`.
- Check keys without TTL (\`volatile-*\` policies can't evict them).

**Root causes & fixes**
- Missing TTLs -> always set expiry on cache keys
- Huge collections (a list with millions of items) -> split or cap (\`LTRIM\`)
- Storing large JSON blobs -> compress, store only needed fields (hashes)
- Memory fragmentation -> \`activedefrag yes\`
- Replication/AOF rewrite buffers during forks -> leave headroom (keep usage < ~70% of RAM)

**Scale**
- Vertical (bigger node) or **Redis Cluster** to shard data across nodes.`,
      },
    ],
  },
  {
    slug: 'sql-vs-nosql',
    title: 'SQL vs NoSQL',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is the difference between SQL and NoSQL databases?',
        e: `
| | SQL (Relational) | NoSQL |
|---|---|---|
| Data model | Tables with rows/columns, fixed schema | Document, key-value, wide-column, graph; flexible schema |
| Relationships | JOINs, foreign keys | Usually denormalized / embedded |
| Transactions | Strong ACID | Varies; often BASE / eventual consistency (many now support ACID) |
| Scaling | Traditionally vertical; horizontal is harder (sharding) | Designed for horizontal scaling |
| Query | SQL (standard, powerful) | Database-specific APIs |
| Examples | PostgreSQL, MySQL, SQL Server, Oracle | MongoDB, Cassandra, DynamoDB, Redis, Neo4j |

**Rule of thumb:** start with SQL for structured, relational, transactional data; pick NoSQL for massive scale, flexible schemas, or specific access patterns.`,
      },
      {
        t: 'qa', l: 1,
        q: 'What are the types of NoSQL databases? Give examples and use cases.',
        e: `
1. **Key-Value:** Redis, DynamoDB, Riak – caching, sessions, shopping carts.
2. **Document:** MongoDB, Couchbase, Firestore – JSON-like documents; product catalogs, CMS, user profiles.
3. **Wide-Column:** Cassandra, HBase, ScyllaDB, Bigtable – huge write throughput, time-series, IoT, messaging (Discord used Cassandra).
4. **Graph:** Neo4j, Amazon Neptune – relationships; social networks, recommendations, fraud detection.
5. **Others:** Time-series (InfluxDB, TimescaleDB), Search (Elasticsearch), Vector databases (Pinecone, pgvector) for AI embeddings.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which database type is the best fit for a "friends of friends" recommendation feature?',
        o: ['Time-series database', 'Graph database', 'Key-value store', 'Wide-column store'],
        a: 1,
        e: 'Graph databases store relationships as first-class edges, making multi-hop traversals (friends of friends) efficient compared to many recursive JOINs.',
      },
      {
        t: 'mcq', l: 1,
        q: 'Which is the best choice for a banking system where money transfers must be fully consistent?',
        o: ['An eventually consistent key-value store with replicas', 'A relational database with ACID transactions', 'A search engine', 'A cache like Memcached'],
        a: 1,
        e: 'Money transfers need atomicity and strong consistency (debit and credit happen together or not at all). Relational databases provide ACID transactions out of the box.',
      },
      {
        t: 'mcq', l: 2,
        q: 'You need to store 1 million writes/second of IoT sensor data and query it by device and time. Which is the best fit?',
        o: ['SQLite on each gateway', 'Cassandra or a time-series DB', 'Neo4j graph database', 'A single large MySQL instance'],
        a: 1,
        e: 'Wide-column stores (Cassandra/ScyllaDB) use LSM trees for very high write throughput and partition naturally by (device_id, time bucket). Time-series databases are also purpose-built for this.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is ACID vs BASE?',
        e: `
**ACID** (traditional RDBMS)
- **Atomicity:** all or nothing
- **Consistency:** constraints/invariants always hold
- **Isolation:** concurrent transactions don't interfere
- **Durability:** committed data survives crashes

**BASE** (many distributed NoSQL systems)
- **Basically Available:** system responds even during failures
- **Soft state:** state may change over time without input (replication catching up)
- **Eventually consistent:** replicas converge given no new writes

ACID favors correctness; BASE favors availability and scale. Many modern databases offer tunable consistency (Cassandra, DynamoDB) or distributed ACID (Spanner, CockroachDB, MongoDB multi-doc transactions).`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is denormalization and why is it common in NoSQL?',
        e: `
**Normalization** splits data into many tables to avoid duplication (3NF). Reads need JOINs.

**Denormalization** duplicates data so a read can be served from one place without joins.
- *Example:* store the author's name inside each blog post document, not just author_id.

**Why NoSQL denormalizes**
- No (or expensive) JOINs across partitions
- Design around **access patterns**: "one query = one partition read"

**Trade-offs**
- **Pro:** Fast reads, simpler queries, horizontal scale
- **Con:** Data duplication, more complex writes, risk of inconsistency (update the name in many places – often handled asynchronously via events).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which statement about modern MongoDB is TRUE?',
        o: ['It can only run on a single server, without any replicas', 'It supports multi-document ACID transactions and sharding', 'It requires a fixed schema for every collection', 'It has no support for transactions of any kind'],
        a: 1,
        e: 'MongoDB supports multi-document ACID transactions (replica sets since 4.0, sharded clusters since 4.2), optional schema validation, replica sets and sharding.',
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: Choose databases for an e-commerce platform (users, orders, product catalog, cart, search, recommendations).',
        e: `
**Polyglot persistence** – use the right DB per need:
- **Users, orders, payments, inventory:** PostgreSQL/MySQL (ACID, relations, reporting).
- **Product catalog** (varied attributes per category): MongoDB / document store, or Postgres JSONB.
- **Shopping cart & sessions:** Redis (fast, TTL) or DynamoDB.
- **Search & filters:** Elasticsearch/OpenSearch (full text, facets), synced from the catalog via CDC/events.
- **Recommendations:** graph DB or offline ML pipelines; vector DB for similarity.
- **Analytics:** data warehouse (BigQuery, Snowflake, Redshift).
- **Images:** S3 + CDN.

Mention the cost: more systems = more operational complexity and data sync (use events/CDC).`,
      },
      {
        t: 'qa', l: 3,
        q: 'What are NewSQL databases?',
        e: `
**NewSQL** databases provide the **SQL interface and ACID transactions** of relational databases with the **horizontal scalability** of NoSQL.

**Examples:** Google Spanner, CockroachDB, YugabyteDB, TiDB, Amazon Aurora (scale-out storage, single writer), PlanetScale/Vitess (sharded MySQL).

**How:** automatic sharding into ranges, consensus replication (Raft/Paxos) per shard, distributed transactions (2PC + MVCC). Spanner uses **TrueTime** (GPS + atomic clocks) for external consistency.

**Trade-offs:** higher write latency (consensus round trips), cost, operational differences from Postgres/MySQL.`,
      },
    ],
  },
  {
    slug: 'database-indexing',
    title: 'Database Indexing',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is a database index and how does it improve performance?',
        e: `
An **index** is a separate data structure (usually a **B+ tree**) that stores column values in sorted order with pointers to rows, like the index at the back of a book.

- Without an index: **full table scan** O(N).
- With a B+ tree index: **O(log N)** lookups, efficient range queries and ORDER BY.

~~~sql
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE email = 'a@b.com';   -- uses the index
~~~

**Cost of indexes**
- Extra storage
- **Slower writes** (INSERT/UPDATE/DELETE must update every index)
- Too many indexes confuse the planner and waste memory.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'What is the main downside of adding many indexes to a table?',
        o: ['Primary keys stop working once there are more than five', 'Reads become slower, because the planner checks every index', 'Writes become slower and storage increases', 'The table can no longer be queried while indexes rebuild'],
        a: 2,
        e: 'Each index must be maintained on every insert/update/delete, adding write overhead and disk/memory usage.',
      },
      {
        t: 'qa', l: 2,
        q: 'Clustered vs non-clustered index: what is the difference?',
        e: `
**Clustered index**
- Determines the **physical order** of rows; the table data IS the index leaf level.
- Only **one** per table (usually the primary key). InnoDB (MySQL) always clusters by PK.
- Range scans on the clustered key are very fast.

**Non-clustered (secondary) index**
- Separate structure with key values + pointer to the row (in InnoDB the pointer is the **primary key**, so lookups do a second "bookmark lookup").
- Many per table.

**Tip:** in InnoDB, use a small, monotonically increasing PK (BIGINT auto increment / time-ordered UUID v7). Random UUID v4 PKs cause page splits and fragmentation.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is a composite index and the leftmost prefix rule?',
        e: `
A **composite index** covers multiple columns, e.g. \`INDEX (country, city, age)\`. Entries are sorted by country, then city, then age.

**Leftmost prefix rule** – the index can be used for queries that filter on a **left prefix**:
- Uses the index: \`WHERE country = 'PK'\`
- Uses the index: \`WHERE country = 'PK' AND city = 'Lahore'\`
- Uses the index: \`WHERE country = 'PK' AND city = 'Lahore' AND age > 25\`
- Cannot use the index: \`WHERE city = 'Lahore'\` (skips country)
- Partly: \`WHERE country = 'PK' AND age = 30\` uses only the country part

**Column order guideline:** equality columns first, then range columns; more selective / most queried columns earlier. A range condition stops the use of columns after it for seeking.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Given INDEX(last_name, first_name), which query CANNOT use the index efficiently for lookup?',
        o: ['WHERE last_name = \'Khan\'', 'WHERE last_name = \'Khan\' AND first_name = \'Ali\'', 'WHERE first_name = \'Ali\'', 'WHERE last_name LIKE \'Kh%\''],
        a: 2,
        e: 'The index is sorted by last_name first. Filtering only on first_name skips the leftmost column, so a seek is not possible.',
      },
      {
        t: 'mcq', l: 2,
        q: 'What is a covering index?',
        o: ['An index containing all columns a query needs, so rows are not read', 'A backup copy of an index used if the original is corrupted', 'An index on every column of the table', 'An index that covers rows from multiple tables at once, like a join'],
        a: 0,
        e: 'If the index has all selected and filtered columns (e.g. via INCLUDE columns), the DB answers from the index alone ("index-only scan"), avoiding extra row lookups.',
      },
      {
        t: 'mcq', l: 2,
        q: "Why might WHERE LOWER(email) = 'a@b.com' NOT use an index on email?",
        o: ['Indexes do not work with string columns, only with numeric ones', 'Because email is unique, the database always prefers a full scan', 'LOWER is not valid SQL in most databases, so the planner rewrites the query and drops the index', 'A function on the indexed column makes it non-sargable; use an expression index'],
        a: 3,
        e: 'The index stores raw email values, not LOWER(email). Use an expression index (CREATE INDEX ON users (LOWER(email))) or store normalized emails.',
      },
      {
        t: 'qa', l: 2,
        q: 'B-Tree vs Hash index vs other index types: when to use which?',
        e: `
- **B-Tree / B+ Tree (default):** equality + range (\`<, >, BETWEEN\`), ORDER BY, prefix LIKE \`'abc%'\`.
- **Hash index:** only equality lookups, O(1); no ranges or sorting.
- **Bitmap index:** low cardinality columns (gender, status) in data warehouses.
- **GIN / inverted index:** full text search, JSONB, arrays (Postgres).
- **GiST / R-tree:** geospatial (PostGIS), ranges.
- **BRIN:** huge, naturally ordered tables (time-series) – tiny index.
- **Partial index:** \`WHERE status = 'active'\` – index only a subset.
- **Unique index:** enforces uniqueness.
- **LSM-tree based storage** (Cassandra, RocksDB): optimized for writes.`,
      },
      {
        t: 'qa', l: 2,
        q: 'How do you find out whether a query uses an index?',
        e: `
Use the query plan:
~~~sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
~~~
Look for:
- **Seq Scan / type=ALL** -> full table scan (bad for large tables)
- **Index Scan / Index Only Scan / type=ref/range** -> index used
- Estimated vs actual rows (stale statistics -> run \`ANALYZE\`)
- Sort operations (filesort) that a better index could avoid

MongoDB: \`db.orders.find({...}).explain("executionStats")\` -> \`IXSCAN\` vs \`COLLSCAN\`, docsExamined vs nReturned.

Here the ideal index is \`(user_id, created_at DESC)\`.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'Why is an index on a "gender" column with 2 values usually NOT helpful for a B-tree?',
        o: ['Indexes only work on numeric columns, not on text columns', 'Because gender is a reserved word, the index is ignored', 'B-trees cannot store string values, only numbers and dates, so the index is skipped', 'Low selectivity: ~50% of rows match, so a full scan is cheaper'],
        a: 3,
        e: 'The optimizer skips indexes when a predicate matches a large fraction of rows. Low-cardinality columns work better as part of a composite index or a partial index.',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: A query "SELECT * FROM orders WHERE status = \'PENDING\' AND created_at > now() - interval \'1 day\' ORDER BY created_at" takes 8 seconds on a 200M row table. How do you optimize it?',
        e: `
1. **EXPLAIN ANALYZE** – likely a sequential scan + sort.
2. **Composite index:** \`(status, created_at)\` – equality column first, then range/sort column. The DB seeks to \`PENDING\` and reads rows already ordered by created_at (no sort).
3. **Partial index** (if PENDING is a small fraction):
   \`CREATE INDEX ON orders(created_at) WHERE status = 'PENDING';\` – tiny and fast.
4. **Avoid SELECT \***: fetch only needed columns -> possible **covering index** (\`INCLUDE (id, user_id, amount)\`).
5. **Partition** the table by month on created_at so old partitions are skipped (partition pruning).
6. Create indexes **CONCURRENTLY** in Postgres to avoid locking writes.
7. Keep statistics fresh (\`ANALYZE\`), and paginate with keyset pagination instead of OFFSET.`,
      },
    ],
  },
];
