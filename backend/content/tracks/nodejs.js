module.exports = {
  slug: 'nodejs',
  title: 'Node.js',
  subtitle: 'Runtime, modules, APIs, production',
  description:
    'Node.js interview questions: architecture, libuv, modules, worker threads, child processes, security, performance, scaling and production best practices.',
  category: 'frameworks',
  roles: ['backend', 'fullstack'],
  icon: 'dns',
  color: '#16A34A',
  order: 30,
  topics: [
    {
      slug: 'architecture',
      title: 'Architecture & Internals',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is Node.js and what is it good for?',
          e: `
**Node.js** is a JavaScript runtime built on Chrome's **V8** engine and **libuv**, letting you run JS on the server.

**Key traits:** single-threaded event loop, non-blocking async I/O, huge npm ecosystem, same language on frontend and backend.

**Good for:** REST/GraphQL APIs, real-time apps (chat, notifications via WebSockets), streaming, BFF/API gateways, CLIs, serverless functions.

**Not ideal for:** CPU-heavy work (video encoding, ML, heavy computation) unless offloaded to worker threads or other services.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which library provides Node.js with its event loop and thread pool?',
          o: ['V8', 'OpenSSL', 'libuv', 'npm'],
          a: 2,
          e: 'V8 executes JavaScript; libuv provides the event loop, async I/O abstraction and the thread pool.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which of these operations uses the libuv thread pool?',
          o: ['TCP socket reads and writes', 'setTimeout and setInterval callbacks', 'Promise.then, queueMicrotask and process.nextTick callbacks', 'fs.readFile, crypto.pbkdf2, zlib, dns.lookup'],
          a: 3,
          e: 'Network I/O uses OS async primitives (epoll/kqueue). File system, some crypto, compression and dns.lookup use the thread pool (default size 4).',
        },
        {
          t: 'qa', l: 2,
          q: 'What is the difference between worker_threads, child_process and cluster?',
          e: `
| | worker_threads | child_process | cluster |
|---|---|---|---|
| What | Threads in the same process | Separate OS processes | Forked Node processes sharing a port |
| Memory | Can share memory (SharedArrayBuffer), transfer ArrayBuffers | Separate | Separate |
| Use for | CPU-heavy JS (hashing, parsing, image ops) | Running other programs/scripts (ffmpeg, python), isolation | Using all CPU cores for an HTTP server |
| Communication | postMessage | stdio, IPC | IPC |

In Kubernetes, prefer one process per container and scale replicas instead of cluster.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the purpose of package-lock.json?',
          o: ['It locks exact versions of the whole dependency tree for reproducible installs', 'It stores environment variables for each install environment', 'It prevents the package from being published to the npm registry by mistake from a local machine', 'It lists the scripts that npm run can execute for the project'],
          a: 0,
          e: 'Commit the lockfile and use `npm ci` in CI/production for deterministic, faster installs.',
        },
        {
          t: 'mcq', l: 1,
          q: 'In semantic versioning, what does "^1.4.2" allow npm to install?',
          o: ['Any 1.x.x version >= 1.4.2', 'Only patch updates, i.e. 1.4.x', 'Exactly 1.4.2 and nothing else', 'Any version, including 2.x and later'],
          a: 0,
          e: '^ allows minor and patch updates (not major). ~1.4.2 allows only patch updates (1.4.x).',
        },
        {
          t: 'qa', l: 2,
          q: 'CommonJS vs ES Modules in Node.js: differences and gotchas.',
          e: `
| | CommonJS | ES Modules |
|---|---|---|
| Syntax | \`require\`, \`module.exports\` | \`import\`, \`export\` |
| Loading | Synchronous, dynamic | Static, async; top-level \`await\` |
| Enable | default for .js (unless "type": "module") | \`.mjs\` or \`"type": "module"\` |
| Globals | \`__dirname\`, \`__filename\` | use \`import.meta.url\` / \`import.meta.dirname\` |

**Gotchas:** ESM can import CJS (default export = module.exports); CJS can \`require()\` ESM only in newer Node versions (22+), otherwise use dynamic \`import()\`. File extensions are required in ESM relative imports.`,
        },
      ],
    },
    {
      slug: 'http-apis',
      title: 'HTTP Servers & APIs',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'How do you create a basic HTTP server in Node.js without frameworks?',
          e: `
~~~js
const http = require('node:http');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  res.writeHead(404).end();
});

server.listen(3000, () => console.log('listening on 3000'));
~~~
Frameworks (Express, Fastify, NestJS) add routing, middleware, body parsing, validation and error handling on top of this.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is Fastify often faster than Express?',
          o: ['It is written in C++ and only exposes a thin JavaScript wrapper', 'Schema-based serialization, a radix-tree router and a low-overhead plugin system', 'It caches every response in memory and serves repeated requests without running the route handlers', 'It runs every request on a separate worker thread across all CPU cores'],
          a: 1,
          e: 'Fastify compiles JSON schemas into fast serializers/validators and has a highly optimized router, typically handling more requests per second.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you implement graceful shutdown in a Node.js API?',
          e: `
When Kubernetes/PM2 stops a pod it sends **SIGTERM**. Shut down cleanly:

~~~js
const server = app.listen(PORT);

async function shutdown(signal) {
  console.log(signal, 'received, shutting down');
  server.close(async () => {          // stop accepting new connections
    await mongoose.connection.close(); // close DB / Redis / queues
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // force exit
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
~~~
Also: fail the readiness probe first so the load balancer stops sending traffic, and close idle keep-alive connections (\`server.closeIdleConnections()\`).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Where should configuration like DB URLs and API keys live in a Node app?',
          o: ['In the frontend bundle so the client and the server always share exactly the same config values', 'In package.json under a config key so npm can load them at startup', 'Hard-coded in source files so every environment uses the same values', 'Environment variables (via a validated config module), secrets from a secret manager'],
          a: 3,
          e: 'Follow the 12-factor app: config in env vars, never commit secrets, validate config at startup (zod/envalid), and use Vault/AWS Secrets Manager in production.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your Node API calls a slow third-party service. Under load, response times explode and memory grows. What do you change?',
          e: `
- **Timeouts** on outgoing requests (\`AbortSignal.timeout(2000)\`), so requests don't hang forever.
- **HTTP keep-alive agent** with a bounded \`maxSockets\` (undici/agentkeepalive) to reuse connections.
- **Circuit breaker** (opossum) to fail fast when the dependency is unhealthy, with a fallback (cached data).
- **Cache** responses in Redis when possible.
- **Concurrency limits / bulkheads** so the slow dependency can't consume all resources.
- **Async processing** via a queue if the client doesn't need the result immediately.
- **Retry with exponential backoff + jitter** only for idempotent calls.
- Monitor with tracing (OpenTelemetry) to see the slow span.`,
        },
      ],
    },
    {
      slug: 'security',
      title: 'Security in Node.js',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What security best practices do you follow in a Node.js API?',
          e: `
- **Input validation** with schemas (zod, joi, class-validator); reject unknown fields.
- **Helmet** for secure HTTP headers; strict **CORS** allowlist.
- **Rate limiting** (express-rate-limit / gateway) especially on auth endpoints.
- **Parameterized queries / ORM** to prevent SQL/NoSQL injection (sanitize \`$\` operators in Mongo queries).
- **Password hashing** with bcrypt/argon2; JWT with short expiry; secrets in env/secret manager.
- **Dependency security:** \`npm audit\`, Dependabot/Snyk, lockfile, avoid unmaintained packages.
- **Limit body size** (\`express.json({ limit: '100kb' })\`) and file uploads.
- Avoid \`eval\`, \`child_process.exec\` with user input (command injection), and regexes vulnerable to ReDoS.
- Run as non-root in containers, enable HTTPS, log security events.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which MongoDB query is vulnerable to NoSQL injection if req.body is used directly?',
          c: `User.findOne({ email: req.body.email, password: req.body.password });`,
          o: ['Only on Windows servers, where query objects are parsed differently', 'It is safe, because MongoDB does not use SQL, so no query can be injected', 'An attacker can send {"password": {"$ne": null}} to bypass the check', 'Only if the email is invalid, since Mongo then ignores the password'],
          a: 2,
          e: 'Operator injection: objects with $ operators change query semantics. Validate types (must be strings), use express-mongo-sanitize, and never compare plaintext passwords (hash + bcrypt.compare).',
        },
        {
          t: 'mcq', l: 3,
          q: 'What is ReDoS?',
          o: ['A denial of service attack that floods Redis with connections', 'A DNS attack that redirects requests to a malicious server', 'A Docker vulnerability that lets one container exhaust the host\'s memory', 'A regex with catastrophic backtracking that blocks the event loop'],
          a: 3,
          e: 'Patterns like /^(a+)+$/ take exponential time on inputs like "aaaa...b". Since Node is single-threaded, one request can freeze the server. Use safe regexes, input length limits, or RE2.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why should you avoid child_process.exec with user-provided input?',
          o: ['It only works on Linux, so the app breaks on Windows and macOS', 'exec runs a shell, allowing command injection (e.g. "file.txt; rm -rf /")', 'It returns promises, which crash the whole process if they are not awaited or caught', 'It is slow because it spawns a new Node.js process for every call'],
          a: 1,
          e: 'Prefer execFile/spawn with an argument array (no shell) and validate inputs against an allowlist.',
        },
      ],
    },
    {
      slug: 'production',
      title: 'Performance, Scaling & Production',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you scale a Node.js application?',
          e: `
1. **Vertical within a machine:** cluster mode/PM2 to use all cores.
2. **Horizontal:** run many stateless instances (containers/pods) behind a load balancer; auto scale on CPU/latency.
3. **Statelessness:** sessions in Redis/JWT, files in S3, no in-memory state that must be shared.
4. **Caching:** Redis, HTTP caching, CDN.
5. **Offload work:** background queues (BullMQ, SQS) for emails, reports, image processing.
6. **Worker threads** for CPU-heavy tasks.
7. **Database scaling:** connection pooling, read replicas, indexing.
8. **Microservices** for independently scalable domains (only when needed).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the best way to keep a Node.js process running and restart it on crash in production on a VM?',
          o: ['Use nodemon to watch and restart the app', 'Use a process manager like PM2 or systemd', 'Run node app.js in a terminal session', 'Use a cron job that starts it every minute'],
          a: 1,
          e: 'nodemon is for development. PM2/systemd/Kubernetes restart crashed processes, manage logs and enable zero-downtime reloads.',
        },
        {
          t: 'qa', l: 3,
          q: 'How do you profile a slow Node.js API?',
          e: `
- **APM / tracing:** OpenTelemetry, Datadog, New Relic – find the slow endpoint and which span (DB, HTTP call) dominates.
- **Event loop lag:** \`perf_hooks.monitorEventLoopDelay()\`; high lag = CPU blocking.
- **CPU profiling:** \`node --cpu-prof\`, \`--inspect\` + Chrome DevTools, clinic.js (doctor, flame, bubbleprof), 0x flame graphs.
- **Load testing:** autocannon/k6 to reproduce.
- **DB:** slow query logs, \`explain()\`, N+1 detection.
- **Common fixes:** add indexes, caching, avoid sync APIs (\`fs.readFileSync\`, \`JSON.parse\` of huge payloads) in request paths, batch queries, stream large responses, compress responses.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why should you avoid fs.readFileSync inside a request handler?',
          o: ['It blocks the event loop while reading, stalling all other requests', 'It does not exist in modern Node.js; only the callback and promise versions do', 'It is deprecated and prints a warning on every request', 'It cannot read JSON files, so data must be parsed manually'],
          a: 0,
          e: 'Sync APIs are fine at startup (loading config), but in request paths use async APIs or caching.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does the NODE_ENV=production environment variable typically change?',
          o: ['Nothing; it is only a label that libraries are not allowed to read', 'It enables built-in TypeScript compilation so .ts files can run directly without any build step', 'Libraries like Express enable optimizations (view caching, terse errors); dev-only paths skip', 'It disables all logging, including errors, to improve performance'],
          a: 2,
          e: 'Express caches templates and hides stack traces; many libraries skip dev checks. Always set it in production.',
        },
      ],
    },
  ],
};
