// Database transactions, database scaling & replication, sharding, consistent hashing, CAP theorem
module.exports = [
  {
    slug: 'database-transactions',
    title: 'Database Transactions & Isolation',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is a database transaction? Explain ACID with a bank transfer example.',
        e: `
A **transaction** is a group of operations executed as a single logical unit.

~~~sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;   -- or ROLLBACK on error
~~~

- **Atomicity:** either both updates happen or neither (no money disappears if the server crashes between them).
- **Consistency:** rules hold before and after (e.g. balance >= 0, total money unchanged).
- **Isolation:** another transaction reading balances mid-transfer doesn't see a half-done state.
- **Durability:** once COMMIT returns, the transfer survives a crash (write-ahead log flushed to disk).`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which ACID property guarantees that committed data survives a power failure?',
        o: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        a: 3,
        e: 'Durability is typically implemented with a Write-Ahead Log (WAL / redo log) that is fsynced to disk before commit is acknowledged.',
      },
      {
        t: 'qa', l: 2,
        q: 'Explain read phenomena: dirty read, non-repeatable read, phantom read, lost update and write skew.',
        e: `
- **Dirty read:** T1 reads data written by T2 that is **not yet committed** (T2 may roll back).
- **Non-repeatable read:** T1 reads a row twice and gets **different values** because T2 updated and committed in between.
- **Phantom read:** T1 runs the same range query twice and gets **new/missing rows** because T2 inserted/deleted rows.
- **Lost update:** T1 and T2 both read balance=100, both write their own result; one update overwrites the other.
- **Write skew:** two transactions read the same data, make decisions, and update **different rows**, violating an invariant together (e.g. two doctors both go off-call, leaving nobody on call).`,
      },
      {
        t: 'qa', l: 2,
        q: 'What are the SQL transaction isolation levels and which anomalies does each prevent?',
        e: `
| Isolation level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| **Read Uncommitted** | possible | possible | possible |
| **Read Committed** | prevented | possible | possible |
| **Repeatable Read** | prevented | prevented | possible* |
| **Serializable** | prevented | prevented | prevented |

\\* MySQL InnoDB's Repeatable Read prevents most phantoms using next-key (gap) locks; Postgres Repeatable Read is snapshot isolation (no phantoms, but write skew possible).

**Defaults:** PostgreSQL, Oracle, SQL Server -> Read Committed. MySQL InnoDB -> Repeatable Read.

Higher isolation = more correctness but more locking/aborts and lower concurrency.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the default transaction isolation level in PostgreSQL?',
        o: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
        a: 1,
        e: 'PostgreSQL defaults to Read Committed (each statement sees a snapshot as of its start). MySQL InnoDB defaults to Repeatable Read.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which isolation level prevents ALL anomalies including write skew?',
        o: ['Read Committed', 'Repeatable Read', 'Snapshot Isolation', 'Serializable'],
        a: 3,
        e: 'Serializable makes concurrent transactions behave as if executed one at a time (via strict 2PL or Serializable Snapshot Isolation in Postgres), at the cost of more aborts/locking.',
      },
      {
        t: 'qa', l: 2,
        q: 'Optimistic vs pessimistic locking: explain with examples.',
        e: `
**Pessimistic locking** – lock the data before working on it; others wait.
~~~sql
BEGIN;
SELECT * FROM seats WHERE id = 7 FOR UPDATE;   -- row lock
UPDATE seats SET booked_by = 42 WHERE id = 7;
COMMIT;
~~~
- **Pro:** Safe under high contention. **Con:** Blocking, deadlock risk, lower throughput.

**Optimistic locking** – don't lock; detect conflicts at write time with a **version** column.
~~~sql
UPDATE products SET stock = 9, version = 6
WHERE id = 1 AND version = 5;      -- 0 rows updated => someone changed it, retry
~~~
- **Pro:** No locks, great when conflicts are rare. **Con:** Retries under high contention.

**Use:** pessimistic for hot rows (ticket seats, inventory in flash sales); optimistic for typical web edits (profile updates, documents).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Two users edit the same wiki page; conflicts are rare. Which approach fits best?',
        o: ['Pessimistic locking with SELECT ... FOR UPDATE held while the user edits', 'Optimistic locking with a version number check on save', 'No concurrency control', 'Serializable isolation for all queries'],
        a: 1,
        e: 'Holding DB locks during human think-time is terrible. Optimistic locking detects conflicting saves via the version column and asks the user to merge/retry.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is MVCC (Multi-Version Concurrency Control)?',
        e: `
**MVCC** keeps **multiple versions of a row** so readers never block writers and writers never block readers.

- Each transaction sees a **consistent snapshot** of the data as of its start time (or statement start).
- Updates create a new row version; old versions are kept for transactions that still need them.
- Old versions are cleaned up later (**VACUUM** in Postgres, purge of undo logs in InnoDB).

Used by PostgreSQL, MySQL InnoDB, Oracle, SQL Server (snapshot isolation), CockroachDB, MongoDB (WiredTiger).

Downside: storage bloat if long-running transactions prevent cleanup.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is a deadlock in databases and how can it be prevented?',
        e: `
A **deadlock** happens when T1 holds lock A and waits for lock B, while T2 holds B and waits for A.

Databases detect deadlocks (wait-for graph) and **abort one transaction** (the victim), which must be retried.

**Prevention**
- Always acquire locks in a **consistent order** (e.g. sort account ids before updating)
- Keep transactions **short**; no user/network calls inside them
- Use appropriate indexes (fewer rows locked)
- Lower isolation if acceptable; use optimistic locking
- Implement **retry with backoff** for deadlock errors (e.g. MySQL 1213, Postgres 40P01).`,
      },
      {
        t: 'qa', l: 3,
        q: 'How do you handle transactions across microservices? Explain 2PC and the Saga pattern.',
        e: `
Each microservice owns its database, so one local ACID transaction cannot span services.

**Two-Phase Commit (2PC)**
1. *Prepare:* coordinator asks all participants "can you commit?" – they lock resources and vote.
2. *Commit:* if all vote yes, coordinator tells everyone to commit; otherwise abort.
- **Pro:** Atomic. **Con:** Blocking (participants hold locks waiting for coordinator), coordinator SPOF, poor latency, not supported by many NoSQL/queues.

**Saga pattern** – a sequence of local transactions; each step publishes an event triggering the next. On failure, run **compensating transactions** to undo previous steps.
~~~
Order created -> Payment charged -> Inventory reserved -> Shipping scheduled
                  (fails) -> Refund payment -> Cancel order
~~~
- **Choreography:** services react to each other's events (decentralized, harder to track).
- **Orchestration:** a central orchestrator (e.g. Temporal, AWS Step Functions) tells services what to do.
- **Pro:** No distributed locks, scalable. **Con:** Eventual consistency, need idempotency and careful compensation design.

Combine with the **Outbox pattern** to atomically save state + publish events.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'In a Saga, what is a compensating transaction?',
        o: ['A transaction that retries forever', 'A transaction that semantically undoes the effect of a previous successful step (e.g. refund a payment)', 'A database rollback across services', 'A lock held by the coordinator'],
        a: 1,
        e: 'Since committed local transactions cannot be rolled back across services, sagas undo them by executing compensating actions like refunds or releasing reservations.',
      },
      {
        t: 'qa', l: 3,
        q: 'What is the Transactional Outbox pattern and what problem does it solve?',
        e: `
**Problem (dual write):** a service saves an order to its DB and then publishes \`OrderCreated\` to Kafka. If the app crashes between the two, the DB and the event stream disagree.

**Outbox pattern**
1. In the **same local DB transaction**, insert the order AND a row into an \`outbox\` table describing the event.
2. A separate **relay** (poller or CDC like Debezium reading the WAL/binlog) publishes outbox rows to the broker and marks them sent.
3. Consumers must be **idempotent** because the relay may publish an event more than once (at-least-once).

Result: the state change and the event are atomically recorded; no lost or phantom events.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Two users try to book the last seat on a flight at the exact same time. How do you guarantee only one succeeds?',
        e: `
**Option 1 – Pessimistic lock**
~~~sql
BEGIN;
SELECT status FROM seats WHERE flight_id = 9 AND seat_no = '12A' FOR UPDATE;
-- if available:
UPDATE seats SET status = 'BOOKED', user_id = 42 WHERE ...;
COMMIT;
~~~
The second transaction waits, then sees BOOKED and fails gracefully.

**Option 2 – Conditional (atomic) update**
~~~sql
UPDATE seats SET status = 'HELD', user_id = 42, hold_until = now() + interval '10 min'
WHERE flight_id = 9 AND seat_no = '12A' AND status = 'AVAILABLE';
-- rows affected = 1 => you got it; 0 => already taken
~~~

**Option 3 – Unique constraint** on (flight_id, seat_no) in a bookings table; the second insert fails.

**At scale:** temporary hold with expiry (payment window), Redis \`SET seat:9:12A user NX EX 600\` for the hold, then confirm in the DB after payment; release on timeout.`,
      },
    ],
  },
  {
    slug: 'database-scaling',
    title: 'Database Scaling & Replication',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What are the different ways to scale a database?',
        e: `
1. **Query & schema optimization:** indexes, avoid N+1, proper data types, connection pooling. (Cheapest – always first.)
2. **Vertical scaling:** bigger machine (CPU, RAM, faster SSD/IOPS).
3. **Caching:** Redis/Memcached in front of the DB.
4. **Read replicas (replication):** primary handles writes, replicas serve reads.
5. **Partitioning:** split big tables inside one DB (by range/list/hash, e.g. orders per month).
6. **Federation (functional partitioning):** separate DBs per domain (users DB, orders DB, products DB).
7. **Sharding (horizontal partitioning):** spread rows across multiple DB servers by a shard key.
8. **Denormalization / materialized views / CQRS:** pre-compute read models.
9. **Move workloads:** search to Elasticsearch, analytics to a warehouse, blobs to S3.
10. **Distributed SQL / NoSQL:** CockroachDB, Spanner, Cassandra, DynamoDB.`,
      },
      {
        t: 'qa', l: 1,
        q: 'What is database replication? Explain master-slave (primary-replica) and master-master.',
        e: `
**Replication** = keeping copies of the same data on multiple nodes.

**Primary-Replica (master-slave)**
- All **writes** go to the primary; changes stream to replicas (WAL/binlog).
- **Reads** can go to replicas.
- **Pro:** Read scaling, failover, backups from replicas. **Con:** Replication lag, primary is a write bottleneck.

**Multi-primary (master-master)**
- Multiple nodes accept writes and replicate to each other.
- **Pro:** Write availability, multi-region writes. **Con:** **Write conflicts** need resolution (last write wins, CRDTs, app logic), more complexity.

**Leaderless (Dynamo-style)**
- Any replica accepts reads/writes; quorums (R + W > N) ensure consistency (Cassandra, DynamoDB).`,
      },
      {
        t: 'mcq', l: 1,
        q: 'In a primary-replica setup, where should write operations go?',
        o: ['Any replica', 'The primary only', 'The replica with lowest load', 'All replicas in parallel by the app'],
        a: 1,
        e: 'In single-leader replication, only the primary accepts writes; replicas apply the primary\'s change log.',
      },
      {
        t: 'qa', l: 2,
        q: 'Synchronous vs asynchronous replication: trade-offs?',
        e: `
**Synchronous**
- Primary waits for replica(s) to confirm before acknowledging the commit.
- **Pro:** No data loss on failover (RPO = 0). **Con:** Higher write latency; if the replica is down, writes may block.

**Asynchronous**
- Primary acknowledges immediately; replicas catch up later.
- **Pro:** Fast writes, replica failures don't affect the primary. **Con:** **Replication lag**; recent writes can be lost if the primary crashes.

**Semi-synchronous**
- Wait for at least **one** replica (e.g. MySQL semi-sync, Postgres \`synchronous_standby_names\` with ANY 1). Common compromise.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'A user updates their profile and immediately refreshes, but sees the OLD data. The app reads from replicas. What is happening?',
        o: ['Cache penetration', 'Replication lag breaking read-your-writes consistency', 'A deadlock', 'Database sharding'],
        a: 1,
        e: 'Asynchronous replicas may lag behind the primary. Fixes: read from the primary for a short time after a user\'s write, track the user\'s last write LSN/timestamp and only use replicas that caught up, or sticky routing.',
      },
      {
        t: 'qa', l: 2,
        q: 'How do you guarantee read-your-own-writes consistency with read replicas?',
        e: `
- **Read from primary after write:** for N seconds after a user writes, route that user's reads to the primary.
- **Read critical data from primary:** e.g. "my profile", "my orders"; other users' data from replicas.
- **Track replication position:** store the commit LSN/GTID of the user's last write; only read from a replica that has applied it (or wait).
- **Session stickiness** to a single replica (monotonic reads).
- **Update the client/cache optimistically** with the written value.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What is database partitioning? Horizontal vs vertical partitioning?',
        e: `
**Partitioning** splits a large table into smaller pieces.

**Horizontal partitioning** – split **rows**. Each partition has the same columns.
- *Range:* orders_2025_01, orders_2025_02 (by date)
- *List:* by region (EU, US, ASIA)
- *Hash:* hash(user_id) % N
- When partitions live on **different servers**, it is called **sharding**.

**Vertical partitioning** – split **columns** into separate tables.
- e.g. \`users\` (id, name, email) and \`user_profiles\` (id, bio, avatar, preferences) – hot small columns separate from large rarely-used ones.

**Benefits:** partition pruning (queries scan fewer rows), easier archival (drop old partitions), smaller indexes.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is "federation" in database scaling?',
        o: ['Splitting databases by function/domain (users DB, products DB, orders DB)', 'Replicating one DB to many regions', 'Encrypting the database', 'Merging all databases into one'],
        a: 0,
        e: 'Federation (functional partitioning) gives each domain its own database, reducing load per DB. The cost is no cross-DB joins and transactions.',
      },
      {
        t: 'qa', l: 2,
        q: 'Why is connection pooling important and what tools are used?',
        e: `
Opening a DB connection is expensive (TCP + TLS + auth + process/thread allocation). Postgres uses a **process per connection**, so thousands of connections kill memory/CPU.

**Connection pooling** reuses a fixed set of open connections.
- **App-level pools:** HikariCP (Java), pg-pool / Prisma (Node), SQLAlchemy pool.
- **External poolers:** **PgBouncer**, Pgpool-II, **RDS Proxy**, ProxySQL (MySQL).

**Why external poolers matter at scale:** 100 app servers × 20 connections = 2000 connections. PgBouncer in transaction mode multiplexes them onto ~100 real DB connections. Essential for serverless (Lambda) apps too.`,
      },
      {
        t: 'qa', l: 3,
        q: 'How does automatic failover work for a primary database, and what is split-brain?',
        e: `
**Failover steps**
1. Health monitoring detects the primary is down (missed heartbeats).
2. A coordinator (Patroni + etcd, Orchestrator, Sentinel, cloud-managed like RDS Multi-AZ) **elects the most up-to-date replica**.
3. The replica is **promoted** to primary; other replicas re-point to it.
4. Clients are redirected (DNS update, VIP move, proxy reconfig).

**Split-brain:** the old primary was only *network partitioned*, not dead, and keeps accepting writes – now two primaries diverge.

**Prevention**
- Use a **consensus/quorum** system (etcd, ZooKeeper) to decide the leader – minority side can't elect.
- **Fencing / STONITH:** forcibly shut down or isolate the old primary.
- Leader leases with expiry; the old leader stops accepting writes when it loses the lease.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Your Postgres primary is at 90% CPU, 70% of queries are reads, writes are growing 10% per month. Plan the scaling.',
        e: `
**Short term (weeks)**
- Analyze \`pg_stat_statements\`: optimize top queries, add indexes, kill N+1 queries.
- Add **PgBouncer** to reduce connection overhead.
- **Cache** hot reads in Redis (cache-aside with TTL).
- Move reads to **read replicas** (handle replication lag for read-your-writes).

**Medium term (months)**
- Vertically scale the primary; archive old data / **partition** big tables by time.
- Move search/analytics off the OLTP DB (Elasticsearch, warehouse via CDC).
- Async heavy writes via queues (batch inserts).

**Long term**
- **Federation:** split by domain into separate DBs.
- **Shard** the largest write-heavy tables by tenant/user id (Citus for Postgres) or move to distributed SQL (CockroachDB/Yugabyte/Aurora).`,
      },
    ],
  },
  {
    slug: 'database-sharding',
    title: 'Database Sharding',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is database sharding?',
        e: `
**Sharding** = horizontally splitting data across **multiple database servers (shards)**, each holding a subset of rows. Together the shards hold the full dataset.

~~~
users with id hash % 4 == 0 -> Shard 0
users with id hash % 4 == 1 -> Shard 1
...
~~~
**Why**
- Data too large for one machine
- Write throughput beyond one primary
- Smaller indexes per shard -> faster queries
- Fault isolation (one shard down affects only some users)

**Cost:** complexity – routing, cross-shard queries/joins, distributed transactions, rebalancing.`,
      },
      {
        t: 'qa', l: 2,
        q: 'Explain the main sharding strategies.',
        e: `
**1. Range-based** – shard by ranges of a key (A-F, G-M; dates; id 1-1M).
- **Pro:** Efficient range queries. **Con:** Hotspots (all new data goes to the latest range).

**2. Hash-based** – \`shard = hash(key) % N\`.
- **Pro:** Even distribution. **Con:** Range queries hit all shards; changing N remaps almost all keys (use **consistent hashing** to fix).

**3. Directory / lookup-based** – a lookup service maps each key (or tenant) to a shard.
- **Pro:** Flexible, easy to move tenants. **Con:** Lookup service is an extra hop and potential SPOF (cache it).

**4. Geo-based** – shard by region/country.
- **Pro:** Data locality & residency compliance. **Con:** Uneven sizes.

**5. Entity/tenant-based** – each large customer gets its own shard (SaaS).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the biggest problem with "shard = hash(key) % N" when you add a new shard?',
        o: ['Hash functions become slower', 'Almost all keys map to a different shard, requiring massive data movement', 'Keys can no longer be hashed', 'Only reads are affected'],
        a: 1,
        e: 'Changing N changes the modulo result for most keys (~(N)/(N+1) of them). Consistent hashing or a fixed large number of virtual partitions (e.g. 1024 slots) minimizes movement.',
      },
      {
        t: 'qa', l: 2,
        q: 'How do you choose a good shard key?',
        e: `
A good shard key has:
- **High cardinality:** many distinct values (user_id is good, country is bad).
- **Even distribution:** no single value gets most traffic/data.
- **Query alignment:** most queries include the key so they hit **one shard** (avoid scatter-gather).
- **Stable:** the value doesn't change (changing it = moving data).
- **Avoids monotonic hot spots:** auto-increment ids or timestamps with range sharding put all writes on the last shard.

**Examples**
- Social app: \`user_id\` (a user's posts, followers on one shard)
- Chat: \`conversation_id\` (all messages of a chat together)
- SaaS: \`tenant_id\`
- Orders: \`customer_id\` (customer's order history on one shard)`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which shard key is the WORST choice for a large users table?',
        o: ['user_id (hashed)', 'email (hashed)', 'country', 'tenant_id for a multi-tenant SaaS with many similar tenants'],
        a: 2,
        e: 'Country has low cardinality and skewed distribution (a few countries hold most users), creating huge hot shards.',
      },
      {
        t: 'qa', l: 2,
        q: 'What are the challenges of sharding?',
        e: `
- **Cross-shard queries & joins:** need scatter-gather or denormalization.
- **Distributed transactions:** operations spanning shards need 2PC/sagas.
- **Hotspots / celebrity problem:** one key gets massive traffic.
- **Rebalancing / resharding:** moving data when adding shards without downtime.
- **Global unique IDs:** auto-increment per shard collides -> use Snowflake/UUIDs.
- **Secondary indexes:** a query by a non-shard-key column hits all shards (need global secondary indexes).
- **Operational complexity:** backups, schema migrations, monitoring per shard.
- **Referential integrity:** foreign keys across shards don't work.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'A celebrity user has 100M followers and their shard is overloaded. What is a common fix?',
        o: ['Delete the celebrity', 'Further split the hot key (e.g. append a suffix to spread it over multiple shards) and cache heavily', 'Switch to range sharding', 'Add an index'],
        a: 1,
        e: 'Hot keys are handled by key splitting/salting (celebrity_id#1..#N), dedicated shards, read replicas and caching. Twitter-like systems also treat celebrities differently in fan-out.',
      },
      {
        t: 'qa', l: 3,
        q: 'How do you reshard a live database with zero downtime?',
        e: `
1. **Pre-split into many logical shards** (e.g. 4096 virtual shards mapped to a few physical servers). Resharding then means moving whole virtual shards, never re-hashing keys.
2. **Copy phase:** snapshot the virtual shard to the new server, then stream ongoing changes (CDC / replication) to catch up.
3. **Dual reads/writes or replication** until the new copy is in sync; verify with checksums.
4. **Cutover:** briefly pause writes for that shard (or use a fenced switch), update the routing map/directory, resume.
5. **Cleanup:** delete data from the old server after a safety period.

Tools: Vitess (MySQL), Citus (Postgres), MongoDB balancer (chunk migration), DynamoDB/Cassandra do this automatically.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Sharding vs replication: which statement is correct?',
        o: ['Sharding copies the same data to all nodes; replication splits data', 'Sharding splits data across nodes for scale; replication copies data for availability and read scaling', 'They are the same', 'Replication is only used with NoSQL'],
        a: 1,
        e: 'They are complementary: production systems shard data and replicate each shard (e.g. each MongoDB shard is a replica set).',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Design sharding for a chat app with 1B messages/day. Users mostly load recent messages of one conversation.',
        e: `
**Shard key:** \`conversation_id\` – all messages of a chat live together; "load chat history" is a single-shard query.

**Within the shard:** primary key \`(conversation_id, message_id)\` where message_id is **time-sortable** (Snowflake), so recent messages are a fast range read.

**Storage:** wide-column (Cassandra/ScyllaDB) fits naturally – partition key conversation_id, clustering key message_id DESC. Discord moved from MongoDB to Cassandra to ScyllaDB for this.

**Big group chats:** partitions grow without bound -> **bucket by time**: partition key \`(conversation_id, month_bucket)\`.

**User inbox** ("my conversations sorted by last message") is a separate table sharded by \`user_id\` (denormalized).

**Hot conversations** (huge public channels): cache recent messages, rate limit, fan-out via pub/sub.`,
      },
    ],
  },
  {
    slug: 'consistent-hashing',
    title: 'Consistent Hashing',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'What is consistent hashing and why is it used?',
        e: `
**Problem:** with \`hash(key) % N\`, adding/removing a server remaps almost every key -> cache misses storm / huge data movement.

**Consistent hashing**
- Map both **servers and keys** onto a hash ring (0 ... 2^32-1).
- A key belongs to the **first server clockwise** from its position.
- Adding a server only takes keys from its clockwise neighbor; removing one moves only its keys to the next server.
- Only ~**K/N keys move** (K = keys, N = servers) instead of nearly all.

~~~
        S1
     /      \\
  k3          k1 -> S2
   |          |
  S3 -- k2 -- S2
~~~
**Used in:** DynamoDB, Cassandra, Riak, Memcached clients, CDNs, load balancers (Maglev), Discord.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'In consistent hashing with N servers, roughly what fraction of keys must move when one server is added?',
        o: ['All keys', 'About 1/N of the keys', 'About half of the keys', 'None'],
        a: 1,
        e: 'Only the keys falling between the new server and its predecessor move, which on average is about 1/(N+1) ≈ 1/N of the keys.',
      },
      {
        t: 'qa', l: 2,
        q: 'What are virtual nodes (vnodes) in consistent hashing?',
        e: `
With few servers on the ring, segments are uneven -> some servers get much more data. Also, when a server leaves, its whole load falls on **one** neighbor.

**Virtual nodes:** each physical server is placed on the ring **many times** (e.g. 100-256 positions using hash(server#1), hash(server#2) ...).

**Benefits**
- **Even distribution** of keys
- When a server fails, its load spreads across **many** servers
- **Heterogeneous hardware:** stronger servers get more vnodes (weights)
- Smoother rebalancing

Cassandra used 256 vnodes per node by default (now fewer with better token allocation).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the main purpose of virtual nodes in a consistent hash ring?',
        o: ['Encrypt keys', 'Distribute load more evenly and spread a failed node\'s keys across many nodes', 'Reduce memory used by keys', 'Replace replication'],
        a: 1,
        e: 'Multiple positions per physical node smooth out uneven segments and avoid overloading a single neighbor on failure.',
      },
      {
        t: 'qa', l: 3,
        q: 'How is replication done on a consistent hash ring (e.g. Dynamo/Cassandra)?',
        e: `
- With replication factor **N = 3**, a key is stored on the **first 3 distinct physical nodes** clockwise from its hash (the "preference list").
- Skip vnodes that belong to the same physical server (and ideally pick different racks/AZs).
- Reads/writes use **quorums**: write to W replicas, read from R replicas; **R + W > N** gives strong-ish consistency (e.g. N=3, W=2, R=2).
- **Hinted handoff:** if a replica is down, another node temporarily stores the write and hands it back later.
- **Anti-entropy:** Merkle trees compare replicas and repair differences.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'Which alternative to ring-based consistent hashing gives minimal disruption and perfect balance without a ring, by picking the server with the highest hash(key, server) score?',
        o: ['Modulo hashing', 'Rendezvous (Highest Random Weight) hashing', 'Round robin', 'Linear probing'],
        a: 1,
        e: 'Rendezvous hashing computes a score for every server and picks the max. When a server leaves, only its keys move. Jump consistent hash is another lightweight alternative.',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: You run a distributed cache of 10 Memcached nodes. One node dies. Compare what happens with modulo hashing vs consistent hashing.',
        e: `
**Modulo hashing (hash % 10 -> hash % 9)**
- ~90% of keys now map to a different node -> massive cache miss storm -> database is flooded -> possible outage (thundering herd).

**Consistent hashing**
- Only the ~10% of keys owned by the dead node miss; they now map to the next nodes on the ring (spread across many nodes with vnodes).
- The other 90% are still hits.
- DB load increases by about 10% of cache traffic, which is usually survivable.

**Extra protection:** replicate hot keys, rate limit cache-miss DB queries, warm the replacement node gradually.`,
      },
    ],
  },
  {
    slug: 'cap-theorem',
    title: 'CAP Theorem & Consistency Models',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is the CAP theorem?',
        e: `
In a distributed data store, when a **network Partition** happens, you must choose between **Consistency** and **Availability**.

- **C – Consistency (linearizability):** every read gets the most recent write (or an error).
- **A – Availability:** every request to a non-failed node gets a (non-error) response, though maybe stale.
- **P – Partition tolerance:** the system keeps working despite messages being lost between nodes.

Since network partitions **will** happen in real distributed systems, P is not optional. So the real choice during a partition is:
- **CP:** refuse some requests to stay consistent (e.g. HBase, MongoDB with majority, ZooKeeper, etcd, Spanner).
- **AP:** keep answering, possibly with stale data, reconcile later (e.g. Cassandra, DynamoDB default, Couchbase, CouchDB).

When there is no partition, a system can be both consistent and available.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'According to CAP, during a network partition a distributed system must choose between:',
        o: ['Consistency and Partition tolerance', 'Availability and Partition tolerance', 'Consistency and Availability', 'Latency and Throughput'],
        a: 2,
        e: 'Partition tolerance is required for any distributed system, so during a partition the trade-off is Consistency vs Availability.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which system is typically classified as AP?',
        o: ['ZooKeeper', 'etcd', 'Cassandra (with low consistency levels)', 'A single-node PostgreSQL'],
        a: 2,
        e: 'Cassandra prioritizes availability with tunable consistency (ONE, QUORUM, ALL). ZooKeeper and etcd are CP (they use quorum consensus and reject writes without a majority).',
      },
      {
        t: 'qa', l: 2,
        q: 'What is the PACELC theorem?',
        e: `
**PACELC** extends CAP:
- **If Partition (P):** choose **Availability (A)** or **Consistency (C)**.
- **Else (E)** (normal operation): choose **Latency (L)** or **Consistency (C)**.

Even without failures, strong consistency needs coordination between replicas, which adds latency.

| System | P: A or C | E: L or C |
|---|---|---|
| Cassandra, DynamoDB | PA | EL |
| MongoDB (default) | PC | EC |
| Spanner, CockroachDB | PC | EC |
| PNUTS (Yahoo) | PC | EL |`,
      },
      {
        t: 'qa', l: 2,
        q: 'Explain consistency models: strong, eventual, causal, read-your-writes, monotonic reads.',
        e: `
- **Strong consistency (linearizability):** after a write completes, all reads see it. Behaves like a single copy.
- **Sequential consistency:** all nodes see operations in the same order (not necessarily real-time).
- **Causal consistency:** causally related operations are seen in order by everyone (a reply is never seen before the comment it replies to); concurrent ones may differ.
- **Read-your-writes:** a user always sees their own updates.
- **Monotonic reads:** once you've seen a value, you never see an older one later.
- **Eventual consistency:** if writes stop, all replicas eventually converge. No guarantee about when.

Stronger models = easier to program, but more coordination, latency and less availability.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'A social media "like" counter shows 1,203 likes to one user and 1,205 to another for a few seconds. What consistency is acceptable here?',
        o: ['Strong consistency is mandatory', 'Eventual consistency is acceptable', 'Serializable transactions are required', 'Two-phase commit is required'],
        a: 1,
        e: 'Small, temporary inconsistencies in like counts are harmless; eventual consistency allows higher availability and lower latency.',
      },
      {
        t: 'mcq', l: 2,
        q: 'With N=3 replicas, which quorum configuration guarantees that a read sees the latest write?',
        o: ['W=1, R=1', 'W=2, R=2', 'W=1, R=2', 'W=0, R=3'],
        a: 1,
        e: 'Strong read guarantee requires R + W > N, so read and write sets overlap. W=2, R=2 gives 4 > 3.',
      },
      {
        t: 'qa', l: 3,
        q: 'How do eventually consistent systems resolve conflicting writes?',
        e: `
- **Last-Write-Wins (LWW):** keep the write with the highest timestamp. Simple, but silently drops concurrent updates and depends on clock sync.
- **Vector clocks / version vectors:** detect concurrent versions; store siblings and let the app/client merge (Riak, original Dynamo shopping cart).
- **CRDTs (Conflict-free Replicated Data Types):** data types that merge automatically and deterministically – G-Counter, PN-Counter, OR-Set, LWW-Register, RGA for text. Used in Redis Enterprise active-active, collaborative editors (Yjs, Automerge).
- **Application-specific merge:** e.g. union of cart items, prompt the user to resolve (Git-style).
- **Avoid conflicts:** route all writes for a given key to a single leader/home region.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: For each feature, choose CP or AP: (a) bank balance, (b) shopping cart, (c) seat booking, (d) social feed, (e) inventory count display.',
        e: `
- **(a) Bank balance / transfers – CP.** Never show or act on wrong money; better to reject a request during a partition.
- **(b) Shopping cart – AP.** Always let users add items; merge carts later (Amazon Dynamo's original use case).
- **(c) Seat booking – CP** for the booking/commit step (no double booking). Browsing seat maps can be AP (slightly stale availability).
- **(d) Social feed – AP.** A post showing up a few seconds late is fine.
- **(e) Inventory display – AP** ("in stock" may be slightly stale), but the **checkout/reservation** must be CP to avoid overselling.

Insight: CAP choices are made **per feature/operation**, not for the entire system.`,
      },
    ],
  },
];
