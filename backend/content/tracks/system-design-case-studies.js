// Classic "Design X" interview questions with full walkthroughs.
module.exports = {
  slug: 'system-design-case-studies',
  title: 'System Design: Case Studies',
  subtitle: 'Design WhatsApp, Twitter, Uber, YouTube...',
  description:
    'Complete walkthroughs of the most asked "Design X" interview problems: requirements, estimation, APIs, data model, high level design, deep dives and trade-offs.',
  category: 'system-design',
  roles: ['backend', 'fullstack', 'software-engineer', 'devops', 'mobile', 'frontend'],
  icon: 'architecture',
  color: '#8B5CF6',
  order: 2,
  topics: [
    {
      slug: 'design-chat-app',
      title: 'Design a Chat App (WhatsApp)',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design WhatsApp / a 1:1 and group chat system.',
          e: `
**Requirements**
- 1:1 and group chat (up to ~500 members), online/last seen, delivery & read receipts, media, push notifications, message history across devices
- NFR: low latency (<200ms delivery), high availability, messages never lost, ordered per conversation

**Estimates:** 500M DAU × 40 msgs/day = 20B msgs/day ≈ **230K msgs/s**; ~100 bytes each -> 2 TB/day text.

**High level design**
~~~
Clients <-WebSocket-> Chat Gateway servers (stateful connections)
                         |   session registry: userId -> gateway (Redis)
                         v
                  Chat Service --> Message store (Cassandra/ScyllaDB)
                         |  --> Kafka --> Push notification service (APNs/FCM)
                         |          --> Group fan-out workers
                  Presence Service (Redis, heartbeats)
                  Media Service -> S3 + CDN (pre-signed uploads)
~~~
**Message flow (A -> B)**
1. A sends over WebSocket with a client message id.
2. Gateway -> Chat service assigns a **sequence number per conversation** (ordering) and persists the message.
3. ACK to A (✓ sent).
4. Look up B's gateway in the session registry; if online, push; B acks (✓✓ delivered).
5. If offline -> store in B's inbox and send a push notification; deliver on reconnect.
6. Read receipt flows back the same way (blue ticks).

**Data model** (Cassandra): \`messages(conversation_id, message_id(time-sortable), sender, body, ...)\` partitioned by conversation; \`user_inbox(user_id, conversation_id, last_msg)\`.

**Group chats:** fan-out on write to each member's inbox (fine for ≤ 500 members).

**Deep dives:** end-to-end encryption (Signal protocol – server stores only ciphertext), multi-device sync via per-device queues, idempotent delivery with client ids, reconnect + resync from last seen sequence.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why do chat systems commonly use WebSockets instead of HTTP polling?',
          o: ['WebSockets are cheaper to implement', 'Persistent bidirectional connections deliver messages instantly with far less overhead than repeated polling requests', 'HTTP cannot carry text', 'WebSockets do not need servers'],
          a: 1,
          e: 'Polling wastes requests and adds latency. Mobile apps also use push notifications when the app is backgrounded.',
        },
        {
          t: 'mcq', l: 3,
          q: 'How can the server know which gateway server user B is connected to?',
          o: ['Broadcast every message to all gateways', 'Maintain a session registry (e.g. Redis: userId -> gatewayId) updated on connect/disconnect, or route via pub/sub channels per user', 'Ask the client for its IP', 'Use DNS'],
          a: 1,
          e: 'Broadcasting does not scale. A registry or per-user pub/sub topic routes messages directly.',
        },
        {
          t: 'qa', l: 3,
          q: 'How do you implement online status / last seen at WhatsApp scale?',
          e: `
- Clients send **heartbeats** every ~30s over the WebSocket.
- Presence service stores \`user:{id}:lastSeen\` in Redis with TTL; if TTL expires -> offline.
- On connect/disconnect events, update immediately.
- **Fan-out only to interested users:** subscribers who currently have the chat open or the contact list visible – not to all contacts of the user (expensive).
- Batch/throttle presence updates to avoid storms when many users flap (bad networks).
- Respect privacy settings (hide last seen).`,
        },
      ],
    },
    {
      slug: 'design-news-feed',
      title: 'Design a News Feed (Twitter / Instagram)',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design Twitter: post tweets, follow users, and home timeline.',
          e: `
**Requirements:** post tweets (text/media), follow/unfollow, home timeline (tweets of people you follow, reverse chronological or ranked), user timeline, likes. Read-heavy (~100:1).

**Estimates:** 300M DAU, 500M tweets/day ≈ 6K writes/s; timeline reads ~300K/s.

**Core problem: generating the home timeline**

**1. Fan-out on read (pull):** at read time, fetch recent tweets from everyone you follow and merge.
- **Pro:** Cheap writes. **Con:** Slow reads for users following thousands.

**2. Fan-out on write (push):** when a user tweets, insert the tweet id into each follower's **precomputed timeline cache** (Redis list).
- **Pro:** Very fast reads. **Con:** Celebrities with 100M followers -> massive write amplification.

**3. Hybrid (what Twitter does):** push for normal users; for **celebrities**, don't fan out – merge their tweets at read time.

**Components**
~~~
Tweet Service -> Tweets DB (sharded by tweet_id, Snowflake ids) + Media in S3/CDN
            -> Kafka -> Fan-out workers -> Timeline cache (Redis: user_id -> [tweet_ids])
Social Graph Service (followers/following; sharded by user_id)
Timeline Service: read cache + merge celebrity tweets + hydrate tweet objects (from cache)
Search (Elasticsearch), Ranking/ML service, Notification service
~~~
**Details:** keep only the last ~800 tweet ids per timeline in Redis; inactive users' timelines rebuilt on demand; cursor pagination by tweet id; counters (likes) via sharded counters / async aggregation.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is pure fan-out-on-write a problem for celebrity accounts?',
          o: ['Celebrities post too rarely', 'A single post must be written into millions of follower timelines, causing huge write spikes and delays', 'Celebrities cannot have caches', 'It breaks sharding'],
          a: 1,
          e: 'The hybrid approach skips fan-out for high-follower accounts and merges their posts at read time.',
        },
        {
          t: 'qa', l: 3,
          q: 'How would you implement like counts for posts that receive millions of likes?',
          e: `
- Store individual likes \`(post_id, user_id)\` with a unique constraint (prevents double likes, supports "did I like this").
- Counting with \`COUNT(*)\` per read is too slow; maintain a **counter**.
- A single counter row becomes a **hot spot** -> use **sharded counters** (N sub-counters, increment a random one, sum on read) or **Redis INCR** with periodic persistence.
- Or stream like events through **Kafka** and aggregate in batches (eventual consistency is fine for counts).
- Show approximate counts for huge numbers ("1.2M").`,
        },
      ],
    },
    {
      slug: 'design-video-streaming',
      title: 'Design YouTube / Netflix',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design YouTube: video upload and streaming.',
          e: `
**Requirements:** upload videos, stream smoothly on any device/network, search, view counts, recommendations. Massive storage and bandwidth; reads >> writes.

**Upload pipeline**
1. Client requests upload -> gets **pre-signed URL**; uploads original (resumable multipart) to object storage.
2. Event -> queue -> **transcoding workers** (DAG of tasks): split into segments, encode into multiple resolutions/bitrates (240p ... 4K) and codecs (H.264, VP9, AV1), generate thumbnails, run content moderation.
3. Output: **HLS/DASH** segments (2-10s chunks) + manifest files, stored in object storage.
4. Metadata (title, status, owner) in a DB; status updated to READY.

**Streaming**
- Player downloads the manifest, then segments from the **CDN** (most traffic served from edge caches).
- **Adaptive bitrate (ABR):** player switches quality per segment based on bandwidth.
- Popular videos pushed to edges proactively; long-tail served from origin/regional caches (Netflix uses its own Open Connect appliances inside ISPs).

**Other components:** view counting via event stream (batch aggregation), search (Elasticsearch), recommendations (offline ML + online serving), comments service, DRM for premium content.

**Cost optimizations:** encode popular videos in more formats, rarely watched videos fewer; cold storage for old originals.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is adaptive bitrate streaming (HLS/DASH)?',
          o: ['Streaming only in 4K', 'The video is split into small segments encoded at multiple qualities, and the player picks the best quality per segment based on network conditions', 'Compressing video with zip', 'Using UDP only'],
          a: 1,
          e: 'This prevents buffering on slow networks and gives high quality on fast ones.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which component serves the vast majority of video bytes in a streaming platform?',
          o: ['The application servers', 'The CDN / edge caches', 'The SQL database', 'The load balancer'],
          a: 1,
          e: 'Video segments are static files ideal for edge caching close to users.',
        },
      ],
    },
    {
      slug: 'design-ride-sharing',
      title: 'Design Uber / Ride Sharing',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design Uber: match riders with nearby drivers.',
          e: `
**Requirements:** riders request rides, see nearby drivers, get matched quickly, live tracking, pricing (surge), payments, trip history.

**Scale:** millions of drivers sending GPS every ~4s -> **~1M location updates/s** at peak.

**Location service**
- Drivers send location over a persistent connection -> **Location service** updates an in-memory geospatial index.
- **Geospatial indexing:** divide the map into cells – **Geohash**, **Google S2** or **Uber H3** (hexagons). Store \`cell -> set of driver ids\` in Redis/in-memory sharded by region. Redis \`GEOADD/GEOSEARCH\` works for smaller scale.
- Location history goes async to Kafka -> storage for analytics/ETA models.

**Matching (dispatch) service**
1. Rider requests -> find available drivers in the rider's cell + neighboring cells.
2. Rank by ETA (road network routing, not straight-line distance).
3. Send offer to the best driver; if declined/timeout, next driver.
4. **Lock** the driver atomically (state AVAILABLE -> RESERVED) to avoid double assignment.

**Other services:** Trip service (state machine: requested -> accepted -> arrived -> in progress -> completed), Pricing/surge (supply vs demand per cell), Payment, Notifications, Maps/ETA.

**Reliability:** regions sharded geographically; if a matching node fails, state recoverable from the trip DB; idempotent trip transitions.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'Why are geohash/S2/H3 cells used for "find nearby drivers"?',
          o: ['They encrypt locations', 'They map 2D coordinates to cell ids so nearby points share prefixes/cells, turning proximity search into fast lookups of a few cells', 'They reduce GPS errors', 'They are required by mobile OSes'],
          a: 1,
          e: 'Scanning all drivers and computing distances is O(N). Cell-based indexes limit the search to the rider\'s cell and neighbors.',
        },
        {
          t: 'mcq', l: 3,
          q: 'How do you prevent the same driver from being assigned to two riders at once?',
          o: ['Hope it does not happen', 'Atomic state transition on the driver record (compare-and-set / conditional update / distributed lock with lease)', 'Increase GPS frequency', 'Use a CDN'],
          a: 1,
          e: 'e.g. UPDATE drivers SET status = "RESERVED" WHERE id = ? AND status = "AVAILABLE"; only one request succeeds.',
        },
      ],
    },
    {
      slug: 'design-notification-system',
      title: 'Design a Notification System',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design a notification system supporting push, SMS and email.',
          e: `
**Requirements:** send notifications via iOS push (APNs), Android push (FCM), SMS (Twilio), email (SES/SendGrid); user preferences/opt-outs; templates; scheduling; at-least-once with no spammy duplicates; millions/day.

**Design**
~~~
Services -> Notification API (validate, auth, rate limit)
         -> Preference/User service check (opt-outs, quiet hours, device tokens)
         -> Kafka topics per channel (push, sms, email)
         -> Channel workers -> 3rd party providers
         -> Delivery status -> Notification log DB / analytics
~~~
**Key points**
- **Templates** with i18n rendering
- **Queues per channel** so a slow SMS provider doesn't block push
- **Retries with backoff** and DLQ; failover to a secondary provider
- **Idempotency key / dedupe** (notification_id) to avoid duplicates on retries
- **Rate limiting per user** (don't send 50 notifications in a minute) and per provider quotas
- **Priority:** OTPs/security alerts on a high-priority path; marketing on low priority, batched
- Track delivered/opened/clicked; clean up invalid device tokens.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why should OTP/security notifications use a separate high-priority queue from marketing emails?',
          o: ['They are larger', 'So bulk marketing traffic can never delay time-critical messages', 'Marketing emails are illegal', 'OTPs do not need queues'],
          a: 1,
          e: 'Priority isolation (separate topics/workers) protects latency-sensitive notifications.',
        },
      ],
    },
    {
      slug: 'design-ecommerce-flash-sale',
      title: 'Design E-commerce & Flash Sale',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design an e-commerce checkout that can survive a flash sale (100K users buying 1,000 items at once) without overselling.',
          e: `
**Challenges:** huge burst traffic, inventory correctness (no overselling), fairness, payment latency.

**Design**
1. **Pre-sale:** static product pages on CDN, pre-warmed caches, scaled infrastructure, load tested.
2. **Virtual waiting room / queue:** admit users at a controlled rate (token issued) to protect backend services.
3. **Inventory reservation in Redis:** stock counter \`stock:sku123 = 1000\`. Atomic Lua script: if stock > 0 then DECR and record reservation (user, expiry). Rejects instantly when sold out.
4. **Async order creation:** successful reservations publish to Kafka; order service persists orders in the DB (source of truth) and starts payment.
5. **Reservation expiry:** unpaid reservations released after ~10 minutes (delayed queue / TTL), stock incremented back.
6. **Payment** with idempotency keys; order state machine.
7. **Rate limiting & bot protection** (CAPTCHA, per-user purchase limits).
8. **Reconciliation** between Redis counter and DB.

Never do "SELECT stock; if > 0 UPDATE" without atomicity – race conditions cause overselling.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'Which approach prevents overselling the last item when two requests arrive simultaneously?',
          o: ['Read stock, check in application code, then update', 'Atomic conditional decrement (UPDATE ... SET stock = stock - 1 WHERE id = ? AND stock > 0) or a Redis Lua script', 'Caching the stock in the browser', 'Retrying until it works'],
          a: 1,
          e: 'Check-then-act must happen atomically in the data store; otherwise both requests see stock = 1.',
        },
      ],
    },
    {
      slug: 'design-file-storage',
      title: 'Design Google Drive / Dropbox',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design Dropbox / Google Drive: file upload, sync across devices and sharing.',
          e: `
**Requirements:** upload/download files, sync changes across devices, sharing & permissions, version history, large files, offline edits.

**Key ideas**
- **Chunking:** split files into blocks (~4 MB), identified by **content hash** (SHA-256).
- **Deduplication:** identical blocks stored once (across users too).
- **Delta sync:** when a file changes, only modified blocks are uploaded.
- **Block storage:** S3/object storage; **metadata DB** (SQL) stores files, versions, block lists, folder tree, permissions.

**Flow**
1. Client watches local folder, computes block hashes, asks the server which blocks are missing.
2. Uploads missing blocks directly to storage (pre-signed URLs).
3. Commits a new file version (list of block hashes) to the metadata service.
4. **Notification service** (long polling/WebSocket) tells other devices of the change; they download missing blocks.

**Conflicts:** if two devices edit offline, keep both ("conflicted copy") or last-writer-wins with version history.

**Other:** sharing via ACLs and signed links, encryption at rest, cold storage for old versions, quotas.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why does Dropbox split files into chunks identified by their hash?',
          o: ['To compress them', 'To enable deduplication, resumable uploads and delta sync (upload only changed chunks)', 'Because S3 requires it', 'For encryption only'],
          a: 1,
          e: 'Changing one paragraph in a 1 GB file uploads a few MB instead of the whole file.',
        },
      ],
    },
    {
      slug: 'design-misc',
      title: 'More Classic Designs',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design a web crawler (like Googlebot).',
          e: `
**Components**
1. **Seed URLs** -> **URL Frontier** (prioritized queues: by importance/freshness; per-host queues for politeness).
2. **Fetchers** (distributed workers): DNS resolution (cached), respect **robots.txt** and crawl delays, download pages.
3. **Content parser:** extract links and text; detect duplicates via content hashing / SimHash.
4. **URL filter & dedupe:** normalize URLs; Bloom filter / seen-URL store to avoid re-crawling.
5. **Storage:** raw pages to object storage; extracted content to the indexing pipeline.

**Concerns:** politeness (don't DDoS a site), spider traps (infinite calendars), freshness (recrawl based on change rate), scale (billions of pages – shard frontier by host hash), fault tolerance (checkpointing).`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Design a distributed job scheduler (run millions of scheduled/cron jobs reliably).',
          e: `
**Requirements:** schedule one-time and recurring jobs, run each exactly when due (at-least-once with idempotency), retries, visibility of status, horizontal scale.

**Design**
- **Job store** (SQL/Cassandra): job definition, next_run_at, status, retries.
- **Scheduler nodes** partitioned by job id ranges/time buckets; each polls "jobs due in the next minute" from its partition (index on next_run_at) – or use a time-bucketed table / Redis sorted set (score = run time).
- Due jobs are **pushed to a queue** (Kafka/SQS); **worker pool** executes them.
- **Leasing:** a job is claimed with a lease (owner + expiry) so if a worker dies, another picks it up after expiry.
- **Retries** with backoff, DLQ; job handlers must be **idempotent**.
- Leader election/partition ownership via ZooKeeper/etcd to avoid double scheduling.
- Recurring jobs compute the next run on completion.

Real-world: Airflow (workflows), Temporal, Quartz, Kubernetes CronJobs, AWS EventBridge Scheduler.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Design a ticket booking system (BookMyShow / Ticketmaster).',
          e: `
**Requirements:** browse events, view seat map, select seats, hold them while paying, confirm booking, no double booking, handle huge spikes for popular events.

**Seat locking**
- Seat states: AVAILABLE -> HELD (with expiry, e.g. 10 min) -> BOOKED.
- Hold via atomic conditional update (\`WHERE status = 'AVAILABLE'\`) or Redis \`SET seat:{event}:{seat} {user} NX EX 600\`.
- Expired holds are released automatically (TTL / background job).

**Booking flow:** select seats -> hold -> payment (idempotency key) -> confirm (HELD -> BOOKED in a transaction) -> ticket issued; on payment failure release seats.

**Scale for hot events:** virtual waiting room, cache seat maps (refresh every few seconds, final check at hold time), shard by event id, rate limit/bot protection.

**Consistency:** booking data in an ACID DB; seat map reads can be slightly stale.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Design a real-time leaderboard for a game with 10M players.',
          e: `
- **Redis Sorted Set:** \`ZINCRBY leaderboard <points> <playerId>\` on score updates (O(log N)).
- **Top N:** \`ZREVRANGE leaderboard 0 99 WITHSCORES\`.
- **Player rank:** \`ZREVRANK leaderboard <playerId>\`; neighbors with ZREVRANGE around the rank.
- **Multiple boards:** daily/weekly keys (\`lb:2026-10-22\`) with expiry; per-region boards.
- **Scale beyond one node:** shard by score ranges or keep the global top-K in one set and approximate ranks for the long tail; Redis Cluster for memory.
- **Durability:** persist score events to a DB/Kafka; rebuild Redis from them if lost.
- Push updates to clients via WebSockets for "live" feel (throttled).`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Design Google Docs style real-time collaborative editing.',
          e: `
**Challenge:** multiple users editing the same document concurrently must converge to the same result.

**Approaches**
- **Operational Transformation (OT):** operations (insert/delete at position) are transformed against concurrent ops by a central server. Used by Google Docs.
- **CRDTs:** data structures (e.g. RGA, Yjs, Automerge) where each character has a unique id; merges are commutative, works peer-to-peer/offline.

**Architecture**
- Clients connect via **WebSocket** to a collaboration server responsible for that document (sticky routing by doc id).
- Server orders/transforms operations, broadcasts them, and periodically **snapshots** the document to storage; operation log for history/undo.
- **Presence:** cursors and selections broadcast (ephemeral, not persisted).
- **Offline:** queue local ops and sync on reconnect (CRDTs shine here).
- Permissions checked per document; version history from snapshots + op logs.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'Which technique lets collaborative editors merge concurrent edits without a central server ordering operations?',
          o: ['Two-phase commit', 'CRDTs (Conflict-free Replicated Data Types)', 'Sticky sessions', 'Database sharding'],
          a: 1,
          e: 'CRDT merges are commutative, associative and idempotent, so replicas converge regardless of message order.',
        },
      ],
    },
  ],
};
