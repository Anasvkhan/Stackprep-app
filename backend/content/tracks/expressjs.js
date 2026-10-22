module.exports = {
  slug: 'expressjs',
  title: 'Express.js',
  subtitle: 'Routing, middleware, REST APIs',
  description: 'Express.js interview questions: middleware, routing, error handling, validation, authentication, security and project structure.',
  category: 'frameworks',
  roles: ['backend', 'fullstack'],
  icon: 'api',
  color: '#475569',
  order: 31,
  topics: [
    {
      slug: 'middleware-routing',
      title: 'Middleware & Routing',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is middleware in Express?',
          e: `
**Middleware** is a function with access to \`req\`, \`res\` and \`next\` that runs in the request-response cycle. It can:
- Execute code, modify \`req\`/\`res\`
- End the response
- Call \`next()\` to pass control to the next middleware (or \`next(err)\` to jump to error handlers)

~~~js
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => console.log(req.method, req.url, res.statusCode, Date.now() - start, 'ms'));
  next();
}
app.use(logger);
~~~
**Types:** application-level (\`app.use\`), router-level, built-in (\`express.json\`, \`express.static\`), third-party (cors, helmet, morgan), error-handling (4 args).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What happens if a middleware neither sends a response nor calls next()?',
          o: ['Express automatically sends 200', 'The request hangs until the client times out', 'Express throws an error', 'The next middleware runs anyway'],
          a: 1,
          e: 'Every middleware must either end the response or call next(); otherwise the request stays pending.',
        },
        {
          t: 'mcq', l: 1,
          q: 'How do you define an error-handling middleware in Express?',
          o: ['A function with (req, res)', 'A function with 4 parameters (err, req, res, next), registered after routes', 'app.error(fn)', 'Using try/catch in app.listen'],
          a: 1,
          e: 'Express identifies error handlers by their 4-argument signature. Register them after all routes.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Does the order of app.use() calls matter?',
          o: ['No', 'Yes, middleware and routes execute in the order they are registered', 'Only for GET routes', 'Only in production'],
          a: 1,
          e: 'e.g. express.json() must be registered before routes that read req.body; 404 handler and error handler go last.',
        },
        {
          t: 'qa', l: 1,
          q: 'Explain req.params, req.query and req.body.',
          e: `
~~~js
// GET /users/42?include=posts
app.get('/users/:id', (req, res) => {
  req.params.id;        // '42'      – route parameters
  req.query.include;    // 'posts'   – query string
});

// POST /users  with JSON body
app.post('/users', express.json(), (req, res) => {
  req.body.name;        // parsed body (needs body-parsing middleware)
});
~~~
All values from params/query are **strings** – validate and convert them.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you structure a large Express application?',
          e: `
A layered, feature-based structure:
~~~
src/
  app.js            # express app, global middleware
  server.js         # starts http server, graceful shutdown
  config/           # env validation
  modules/
    users/
      user.routes.js       # routing only
      user.controller.js   # HTTP layer: parse req, send res
      user.service.js      # business logic
      user.repository.js   # DB access
      user.schema.js       # validation (zod/joi)
  middleware/       # auth, error handler, rate limit
  utils/
~~~
Principles: thin controllers, business logic in services (testable without HTTP), centralized error handling, dependency injection for testability.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is express.Router() used for?',
          o: ['Starting the server', 'Creating modular, mountable route handlers (mini-apps) for grouping related routes', 'Connecting to the database', 'Serving static files'],
          a: 1,
          e: 'e.g. app.use("/api/users", userRouter) keeps route definitions organized per feature.',
        },
      ],
    },
    {
      slug: 'errors-validation',
      title: 'Error Handling & Validation',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you implement centralized error handling in Express?',
          e: `
~~~js
class AppError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  res.json(user);
}));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) logger.error(err);        // log unexpected errors with stack
  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : err.message,
    code: err.code,
  });
});
~~~
Don't leak stack traces to clients in production.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Where should request validation happen?',
          o: ['Only in the frontend', 'At the API boundary (middleware/schema) before business logic, in addition to DB constraints', 'Only in the database', 'Validation is not needed with JSON'],
          a: 1,
          e: 'Client-side validation can be bypassed. Validate every request server-side with schemas (zod, joi, express-validator) and keep DB constraints as the last line of defense.',
        },
        {
          t: 'scenario', l: 2,
          q: 'Scenario: Write a reusable validation middleware using zod.',
          e: `
~~~js
const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  Object.assign(req, result.data); // use parsed/coerced values
  next();
};

const createUser = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.coerce.number().int().min(18).optional(),
  }).strict(),
});

app.post('/users', validate(createUser), createUserController);
~~~`,
        },
      ],
    },
    {
      slug: 'auth-security',
      title: 'Authentication & Security',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you implement JWT authentication middleware in Express?',
          e: `
~~~js
const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

app.get('/admin/stats', auth(['admin']), statsController);
~~~
Pin the algorithm, keep access tokens short-lived, and use refresh tokens for renewal.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which middleware sets security-related HTTP headers like Content-Security-Policy and X-Content-Type-Options?',
          o: ['morgan', 'helmet', 'cors', 'compression'],
          a: 1,
          e: 'helmet sets sensible security headers. morgan logs requests, cors configures CORS, compression gzips responses.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Your API is behind a load balancer and rate limiting blocks ALL users together. What is the likely fix?',
          o: ['Remove rate limiting', 'Set app.set("trust proxy", 1) so req.ip uses the real client IP from X-Forwarded-For', 'Use a bigger server', 'Switch to HTTP/2'],
          a: 1,
          e: 'Without trust proxy, every request appears to come from the load balancer IP, so all users share one limit bucket.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How should CORS be configured for a production API used by https://app.example.com with cookies?',
          o: ['origin: "*" with credentials: true', 'origin: "https://app.example.com", credentials: true', 'Disable CORS', 'Allow all origins dynamically without checks'],
          a: 1,
          e: 'Browsers reject "*" with credentials. Use an explicit allowlist of origins.',
        },
      ],
    },
    {
      slug: 'performance-testing',
      title: 'Performance & Testing',
      questions: [
        {
          t: 'mcq', l: 2,
          q: 'Which is the recommended way to test Express routes without starting a real server port?',
          o: ['Manual testing with Postman only', 'Supertest with the exported app instance (with Jest/Vitest)', 'curl in a shell script', 'Testing is not possible'],
          a: 1,
          e: 'Export the app separately from app.listen(); supertest(app).get("/users").expect(200).',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you improve the performance of an Express API?',
          e: `
- Enable **gzip/brotli compression** (or at the reverse proxy)
- **Cache** responses (Redis, HTTP Cache-Control/ETag)
- Use **connection pooling** and **indexes**; avoid N+1 queries
- **Paginate** large lists; select only needed fields
- Avoid sync/blocking code in handlers; move CPU work to workers/queues
- Run **multiple instances** (cluster/PM2/K8s) behind a load balancer
- Put Nginx/CDN in front for TLS and static assets
- Set \`NODE_ENV=production\`
- Consider Fastify for very high throughput`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is a key difference between Express 4 and Express 5?',
          o: ['Express 5 removed middleware', 'Express 5 forwards rejected promises from async handlers to error middleware automatically and updates path matching syntax', 'Express 5 requires TypeScript', 'Express 5 is a frontend framework'],
          a: 1,
          e: 'Express 5 (stable since 2024) handles async errors natively, drops deprecated APIs, and uses path-to-regexp v8 (e.g. wildcards must be named).',
        },
      ],
    },
  ],
};
