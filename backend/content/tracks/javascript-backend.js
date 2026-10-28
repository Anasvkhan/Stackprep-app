module.exports = {
  slug: 'javascript-backend',
  title: 'JavaScript (Backend)',
  subtitle: 'JS for server-side developers',
  description:
    'JavaScript as asked in backend interviews: async patterns, error handling, the Node.js event loop phases, memory and performance, streams, buffers and concurrency in a single thread.',
  category: 'languages',
  roles: ['backend', 'fullstack'],
  icon: 'javascript',
  color: '#CA8A04',
  order: 11,
  topics: [
    {
      slug: 'core-language',
      title: 'Core Language for Backend',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What is the output?',
          c: `const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n);`,
          o: ['undefined', '1', '2', 'ReferenceError'],
          a: 2,
          e: 'Objects are assigned by reference; `a` and `b` point to the same object.',
        },
        {
          t: 'qa', l: 1,
          q: 'Is JavaScript pass-by-value or pass-by-reference?',
          e: `
JavaScript is always **pass-by-value**, but for objects the *value* is a **reference**.

~~~js
function update(obj) { obj.name = 'B'; }   // mutates the shared object
function replace(obj) { obj = { name: 'C' }; } // only re-assigns the local copy
const u = { name: 'A' };
update(u);  // u.name === 'B'
replace(u); // u.name still 'B'
~~~
This matters in backends when you mutate request bodies, shared config or cached objects by accident – clone when needed.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the safest way to check if an object has its own property "id"?',
          o: ['"id" in obj', 'obj.id !== undefined', 'Object.hasOwn(obj, "id")', 'obj.hasOwnProperty === true'],
          a: 2,
          e: '`Object.hasOwn` checks own properties (not the prototype chain) and works even for objects created with Object.create(null). `in` also checks inherited properties.',
        },
        {
          t: 'qa', l: 2,
          q: 'What is prototype pollution and why is it dangerous on servers?',
          e: `
**Prototype pollution** happens when user input can set properties on \`Object.prototype\`, e.g. via unsafe deep-merge of JSON:

~~~js
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
({}).isAdmin; // true for EVERY object in the process!
~~~
**Impact:** privilege escalation, DoS, even RCE through gadget chains in libraries.

**Prevention**
- Use safe merge libraries (lodash >= 4.17.21), reject keys \`__proto__\`, \`constructor\`, \`prototype\`
- Validate input with schemas (zod/joi)
- Use \`Object.create(null)\` or \`Map\` for dictionaries of user keys
- \`node --disable-proto=delete\`, keep dependencies updated (\`npm audit\`)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which number type should you use for IDs that exceed 2^53 - 1 (e.g. Twitter Snowflake IDs)?',
          o: ['number', 'BigInt or string', 'Number.MAX_VALUE', 'float'],
          a: 1,
          e: 'Numbers lose precision beyond Number.MAX_SAFE_INTEGER (9007199254740991). Use BigInt in code and send such IDs as strings in JSON.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does JSON.stringify do with BigInt, undefined and Date values?',
          o: ['BigInt becomes a string, undefined becomes null, and Date becomes a numeric Unix timestamp', 'All three become null in the output, since JSON has no matching types', 'All three are serialized correctly and restored by JSON.parse', 'BigInt throws TypeError, undefined properties are omitted, Date becomes an ISO string'],
          a: 3,
          e: 'You need a replacer or a toJSON for BigInt. Dates call toISOString via toJSON. Functions and undefined are dropped from objects (become null in arrays).',
        },
      ],
    },
    {
      slug: 'async-patterns',
      title: 'Async Patterns & Error Handling',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Compare callbacks, promises and async/await.',
          e: `
**Callbacks** (Node error-first style)
~~~js
fs.readFile('a.txt', (err, data) => { if (err) return done(err); /* ... */ });
~~~
- **Con:** Callback hell, inversion of control, easy to forget error handling.

**Promises**
- Chainable, single resolution, centralized \`.catch\`.

**async/await**
- Syntactic sugar over promises; reads like synchronous code, works with \`try/catch\`.
~~~js
const data = await fs.promises.readFile('a.txt', 'utf8');
~~~
Use \`util.promisify\` to convert callback APIs.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What happens to an unhandled promise rejection in modern Node.js (v15+)?',
          o: ['It is silently ignored and the promise is garbage collected', 'The process crashes (default --unhandled-rejections=throw)', 'It is logged as a warning only and the process keeps running', 'Node retries the rejected promise once before giving up'],
          a: 1,
          e: 'Since Node 15 unhandled rejections are treated like uncaught exceptions and terminate the process. Always await/catch promises; log and crash gracefully in process.on("unhandledRejection").',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is wrong with this code?',
          c: `app.get('/users', async (req, res) => {
  const users = await db.getUsers(); // may throw
  res.json(users);
});`,
          o: ['res.json cannot send arrays, so the response fails to serialize', 'Nothing; Express 4 automatically catches the rejection and calls the error middleware', 'async functions are not allowed as route handlers in Express', 'In Express 4, the rejection never reaches error middleware, so the request hangs'],
          a: 3,
          e: 'Express 4 does not catch async errors. Wrap handlers (try/catch + next(err), or an asyncHandler wrapper). Express 5 forwards rejected promises to error middleware automatically.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you limit concurrency when processing 10,000 async tasks (e.g. API calls)?',
          e: `
\`Promise.all\` on 10,000 tasks fires them all at once -> rate limits, socket exhaustion, memory spikes.

**Use a concurrency pool:**
~~~js
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}
await mapLimit(userIds, 10, sendEmail); // at most 10 in flight
~~~
Libraries: \`p-limit\`, \`p-map\`, BullMQ queues for durable background processing.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the output?',
          c: `async function run() {
  try {
    return Promise.reject(new Error('boom'));
  } catch (e) {
    return 'caught';
  }
}
run().then(console.log, (e) => console.log('rejected:', e.message));`,
          o: ['undefined', 'caught', 'rejected: boom', 'Unhandled error crash'],
          a: 2,
          e: 'Returning a promise without awaiting it means the try/catch never sees the rejection. Use `return await` inside try blocks.',
        },
        {
          t: 'qa', l: 3,
          q: 'Operational errors vs programmer errors: how should a Node backend handle each?',
          e: `
**Operational errors** – expected runtime problems: invalid input, DB timeout, 3rd-party API down, file not found.
- Handle them: validate, retry with backoff, return proper HTTP status, log with context.

**Programmer errors** – bugs: reading a property of undefined, wrong argument types, logic errors.
- You can't "handle" them safely; the process may be in an unknown state.
- Log, **crash and restart** (PM2/Kubernetes), fix the bug.

**Practices**
- Central error middleware mapping custom error classes (\`NotFoundError\`, \`ValidationError\`) to status codes
- \`process.on('uncaughtException')\` / \`unhandledRejection\`: log, flush, exit(1)
- Graceful shutdown on SIGTERM (stop accepting, finish in-flight, close DB)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which Promise method is best when you want results of all tasks even if some fail (e.g. sending notifications to many users)?',
          o: ['Promise.allSettled', 'Promise.all', 'Promise.any', 'Promise.race'],
          a: 0,
          e: 'allSettled returns { status, value | reason } for each promise, so one failure does not reject the whole batch.',
        },
      ],
    },
    {
      slug: 'event-loop-node',
      title: 'Event Loop in Node.js',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain the phases of the Node.js event loop.',
          e: `
Node's event loop (libuv) runs in phases; each has a FIFO queue of callbacks:

1. **Timers** – \`setTimeout\` / \`setInterval\` callbacks whose time has elapsed
2. **Pending callbacks** – some system I/O callbacks deferred from the previous loop (e.g. TCP errors)
3. **Idle, prepare** – internal
4. **Poll** – retrieve new I/O events and run I/O callbacks (fs, network); may block here waiting for I/O
5. **Check** – \`setImmediate\` callbacks
6. **Close callbacks** – e.g. \`socket.on('close')\`

Between each callback, Node drains **\`process.nextTick\` queue first**, then the **Promise microtask queue**.

Heavy CPU work blocks all phases -> every request waits.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output order in Node.js?',
          c: `setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));`,
          o: ['timeout immediate nextTick promise (timers always run first)', 'nextTick promise timeout immediate (timeout/immediate order may vary)', 'immediate timeout promise nextTick (setImmediate always runs before timers)', 'promise nextTick immediate timeout (promises always run first)'],
          a: 1,
          e: 'nextTick runs before promise microtasks. From the main module, the order of setTimeout(0) vs setImmediate is not guaranteed (depends on process performance); inside an I/O callback, setImmediate always runs first.',
        },
        {
          t: 'mcq', l: 3,
          q: 'Why can recursive process.nextTick calls be dangerous?',
          o: ['They are slower than setTimeout, so deep recursion makes every request take noticeably longer', 'Node throws a RangeError after 10 nested nextTick calls in a row', 'The nextTick queue is fully drained before continuing, so recursion starves I/O', 'They leak memory, but only on Windows due to how libuv schedules ticks'],
          a: 2,
          e: 'Recursively scheduling nextTick (or microtasks) prevents the loop from reaching the poll phase, freezing I/O. Use setImmediate to yield.',
        },
        {
          t: 'qa', l: 2,
          q: 'How does Node.js handle thousands of concurrent connections with a single thread?',
          e: `
- JavaScript runs on one thread, but **I/O is non-blocking**: network sockets use OS mechanisms (epoll/kqueue/IOCP) via **libuv**.
- When a request waits for DB/network, the thread is free to serve other requests; callbacks run when data arrives.
- Some operations without async OS APIs (fs, DNS lookup, crypto, zlib) run in **libuv's thread pool** (default 4 threads, \`UV_THREADPOOL_SIZE\`).

**Great for:** I/O-bound workloads (APIs, real-time, proxies).
**Weak at:** CPU-bound work (image processing, big JSON parsing, crypto in JS) – offload to **worker_threads**, child processes, or separate services.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: One endpoint does a heavy synchronous calculation (300 ms CPU). Under load, ALL endpoints become slow. Why and how do you fix it?',
          e: `
**Why:** the CPU work blocks the single event loop thread. While it runs, no other callback (other requests, timers, health checks) can execute, so latency rises for everyone.

**Fixes**
1. **worker_threads** pool (e.g. Piscina) to run the calculation off the main thread.
2. Move it to a **background job queue** (BullMQ + Redis) if the result can be async.
3. **Optimize/cache** the computation (memoize results, precompute).
4. Break work into chunks with \`setImmediate\` to yield between chunks.
5. Use a **separate service** in a better-suited language for heavy CPU tasks.
6. Scale horizontally with the cluster module / multiple pods (helps throughput, not per-request blocking).

Detect with event loop lag metrics (\`perf_hooks.monitorEventLoopDelay\`), clinic.js, --prof.`,
        },
      ],
    },
    {
      slug: 'memory-performance',
      title: 'Memory, GC & Performance',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does garbage collection work in V8?',
          e: `
V8 uses a **generational** garbage collector:
- **Young generation (new space):** most objects die young. Collected frequently with a fast **Scavenge** (copying) algorithm.
- **Old generation:** objects that survive a few scavenges are promoted. Collected with **Mark-Sweep-Compact** (incremental & concurrent marking to reduce pauses).

An object is collected when it is no longer **reachable** from roots (globals, stack, closures).

Tune with \`--max-old-space-size=4096\` (MB) for large heaps.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which is a common cause of memory leaks in Node.js servers?',
          o: ['Unbounded in-memory caches, global arrays, and event listeners never removed', 'Declaring variables with const, which keeps them alive for the whole process', 'Using async/await, which keeps every awaited promise in memory forever', 'Parsing JSON, since parsed objects are never released by the garbage collector'],
          a: 0,
          e: 'Objects held by long-lived references (module-level Maps, timers, listeners, closures) are never garbage collected. Use bounded LRU caches, remove listeners, clear intervals.',
        },
        {
          t: 'qa', l: 3,
          q: 'How would you debug a memory leak in a production Node.js service?',
          e: `
1. **Confirm:** memory (RSS/heapUsed) grows steadily over time and doesn't drop after GC; container restarts with OOM.
2. **Reproduce** under load in staging (autocannon/k6).
3. **Heap snapshots:** take 2-3 snapshots over time (\`--inspect\` + Chrome DevTools, \`v8.writeHeapSnapshot()\`, \`heapdump\`) and compare – look at objects whose count keeps growing and their **retainers**.
4. **Allocation timeline / sampling heap profiler** to find code paths allocating.
5. Typical culprits: global caches without eviction, listeners added per request, closures capturing large objects, unresolved promises piling up, large \`Buffer\`s retained.
6. **Fix** and verify memory stays flat; add alerts on heap usage.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is JSON.parse of a 200 MB payload problematic in a Node API?',
          o: ['It corrupts large numbers and strings when the payload is above 100 MB', 'It is synchronous and CPU/memory heavy, blocking the event loop and spiking memory', 'JSON.parse is asynchronous, so the request handler finishes before the parsed data is ready', 'JSON.parse only supports payloads up to 1 MB and throws for anything larger'],
          a: 1,
          e: 'Use streaming parsers (stream-json), limit request body sizes, paginate, or process in worker threads.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which Node.js module lets you use multiple CPU cores by forking worker processes that share a server port?',
          o: ['events', 'fs', 'http', 'cluster'],
          a: 3,
          e: 'The cluster module (or PM2 cluster mode) forks one process per core. In containers, it is common to run one process per container and scale with replicas instead.',
        },
      ],
    },
    {
      slug: 'streams-buffers',
      title: 'Streams, Buffers & Events',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are streams in Node.js and why use them?',
          e: `
**Streams** process data **piece by piece (chunks)** instead of loading it all into memory.

**Types:** Readable (fs.createReadStream, req), Writable (res, fs.createWriteStream), Duplex (TCP socket), Transform (zlib gzip, crypto).

~~~js
const { pipeline } = require('node:stream/promises');
await pipeline(
  fs.createReadStream('big.log'),
  zlib.createGzip(),
  fs.createWriteStream('big.log.gz'),
);
~~~
**Why**
- Constant memory for huge files (GBs)
- Faster time-to-first-byte (send data as it's produced)
- **Backpressure:** a slow consumer automatically slows the producer

Use \`pipeline()\` (not \`.pipe\`) to propagate errors and clean up streams.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is backpressure in streams?',
          o: ['A slow writable signals the readable to pause, so memory does not fill up', 'An HTTP header that tells the client to slow down its upload rate', 'An error raised when a readable stream tries to open a missing file', 'Compressing data in a stream when the destination is slower than the source'],
          a: 0,
          e: 'write() returns false when the internal buffer exceeds highWaterMark; the producer should wait for the "drain" event. pipe/pipeline handle this automatically.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is a Buffer in Node.js?',
          o: ['A fixed-size chunk of raw binary memory outside the V8 heap', 'A database cursor that streams rows from a query result', 'A JSON object that holds binary data encoded as a base64 string', 'A mutable string type used for text that changes often'],
          a: 0,
          e: 'Buffers (a Uint8Array subclass) represent binary data: files, network packets, images. Convert with buf.toString("utf8"|"base64").',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the EventEmitter pattern.',
          e: `
\`EventEmitter\` implements the **observer / pub-sub** pattern inside a process; many core modules (streams, http server) extend it.

~~~js
const { EventEmitter } = require('node:events');
class OrderService extends EventEmitter {
  place(order) { /* save... */ this.emit('placed', order); }
}
const svc = new OrderService();
svc.on('placed', (o) => sendEmail(o));
svc.once('placed', (o) => console.log('first order', o.id));
~~~
- Listeners run **synchronously** in registration order.
- Emitting \`'error'\` without a listener **crashes** the process.
- Default max 10 listeners warning (possible leak) – \`setMaxListeners\`.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Implement a CSV export endpoint for 5 million rows without running out of memory.',
          e: `
- **Stream from the DB** with a cursor (\`pg-query-stream\`, Mongo \`find().cursor()\`, knex \`.stream()\`) instead of loading all rows.
- **Transform** each row to a CSV line (csv-stringify stream).
- **Pipe to the response** with \`pipeline(dbStream, csvTransform, res)\`; set headers \`Content-Type: text/csv\`, \`Content-Disposition: attachment\`.
- Optionally gzip (\`zlib.createGzip()\`).
- Backpressure ensures we only read from the DB as fast as the client downloads.
- For very large/slow exports: generate **asynchronously** via a job, upload to S3, email a signed download link.`,
        },
      ],
    },
  ],
};
