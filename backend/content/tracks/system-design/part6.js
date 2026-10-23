// JWT, OAuth & auth, HTTP status codes, API design, real-time communication, unique IDs, observability
module.exports = [
  {
    slug: 'jwt-oauth-auth',
    title: 'Authentication: JWT, OAuth, Sessions',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is the difference between authentication and authorization?',
        e: `
- **Authentication (AuthN):** *Who are you?* Verifying identity – password, OTP, biometrics, SSO. Failure -> **401 Unauthorized**.
- **Authorization (AuthZ):** *What are you allowed to do?* Checking permissions – roles (RBAC), attributes (ABAC), ownership. Failure -> **403 Forbidden**.

Authentication always happens first. Example: logging into GitHub = authN; being allowed to push to a repo = authZ.`,
      },
      {
        t: 'qa', l: 1,
        q: 'What is a JWT? Explain its structure.',
        e: `
**JWT (JSON Web Token)** is a compact, URL-safe token that carries **claims** and is **digitally signed** so the server can verify it wasn't tampered with.

Structure: \`header.payload.signature\` (each Base64URL encoded)

~~~
Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "sub": "user_42", "role": "admin", "iat": 1729500000, "exp": 1729500900 }
Signature: HMACSHA256(base64url(header) + "." + base64url(payload), secret)
~~~
- **Registered claims:** \`iss\` (issuer), \`sub\` (subject), \`aud\` (audience), \`exp\` (expiry), \`iat\`, \`nbf\`, \`jti\` (id).
- **Signed, not encrypted** – anyone can decode the payload, so **never put secrets/passwords** in it. (JWE is the encrypted variant.)
- **Algorithms:** HS256 (shared secret) or RS256/ES256 (private key signs, public key verifies – better for microservices).`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Can anyone read the payload of a standard (JWS) JWT without the secret key?',
        o: ['No, it is encrypted', 'Yes, it is only Base64URL encoded; the signature prevents tampering, not reading', 'Only the issuer can read it', 'Only with the public key'],
        a: 1,
        e: 'A signed JWT is not encrypted. Decode it at jwt.io and you will see the claims. Do not put sensitive data in it.',
      },
      {
        t: 'qa', l: 2,
        q: 'Session-based authentication vs JWT (token-based) authentication: pros and cons.',
        e: `
**Session-based (stateful)**
- Server creates a session (stored in memory/Redis/DB) and sends a **session id cookie**.
- **Pro:** Easy to **revoke** (delete session), small cookie, server controls everything.
- **Con:** Server must store sessions; needs shared store (Redis) for multiple servers; CSRF protection needed with cookies.

**JWT (stateless)**
- Server signs a token containing user info; client sends it on each request (\`Authorization: Bearer <token>\`).
- **Pro:** No server-side lookup -> scales well, great for microservices/mobile/third-party APIs.
- **Con:** **Hard to revoke** before expiry, larger size, payload visible, key management.

**Best practice hybrid:** short-lived access JWT (5-15 min) + long-lived **refresh token** stored server-side (revocable, rotated).`,
      },
      {
        t: 'qa', l: 2,
        q: 'What are access tokens and refresh tokens? How does token refresh work securely?',
        e: `
- **Access token:** short-lived (e.g. 15 min) JWT sent with every API call.
- **Refresh token:** long-lived (days/weeks), opaque random string stored server-side (hashed), used **only** to get a new access token at \`/auth/refresh\`.

**Flow**
1. Login -> server returns access + refresh token.
2. API call with expired access token -> 401.
3. Client calls \`/auth/refresh\` with the refresh token -> new access token (+ new refresh token).
4. Logout -> server deletes/revokes the refresh token.

**Security**
- **Refresh token rotation:** issue a new refresh token each time and invalidate the old; if an old one is reused, assume theft and revoke the whole family.
- Store refresh token in an **HttpOnly, Secure, SameSite cookie** (web) or secure storage (Keychain/Keystore on mobile).
- Bind to device, expire on inactivity.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Where is the safest place to store tokens in a browser web app to protect against XSS?',
        o: ['localStorage', 'sessionStorage', 'HttpOnly, Secure, SameSite cookie', 'A global JavaScript variable in window'],
        a: 2,
        e: 'HttpOnly cookies can\'t be read by JavaScript, so XSS can\'t steal them. Use SameSite and CSRF tokens to guard against CSRF.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is OAuth 2.0? Explain the Authorization Code flow with PKCE.',
        e: `
**OAuth 2.0** is an **authorization** framework that lets a third-party app access a user's resources on another service **without getting their password** (e.g. "Allow this app to read your Google Calendar").

**Roles:** Resource Owner (user), Client (app), Authorization Server (Google), Resource Server (Calendar API).

**Authorization Code + PKCE (recommended for web, mobile, SPAs)**
1. App creates a random \`code_verifier\` and its hash \`code_challenge\`.
2. App redirects user to the auth server: \`/authorize?response_type=code&client_id=..&redirect_uri=..&scope=calendar.read&state=xyz&code_challenge=..\`
3. User logs in and consents.
4. Auth server redirects back with a short-lived **authorization code** (+ \`state\` to prevent CSRF).
5. App exchanges code + \`code_verifier\` at \`/token\` -> **access token** (+ refresh token).
6. App calls the API with the access token.

PKCE prevents an intercepted code from being used by an attacker. The **Implicit flow** and **Password grant** are deprecated.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which OAuth 2.0 grant is meant for machine-to-machine (service to service) communication with no user involved?',
        o: ['Authorization Code', 'Client Credentials', 'Implicit', 'Device Code'],
        a: 1,
        e: 'Client Credentials grant: the service authenticates with its own client_id/secret (or private key) to get a token for its own permissions.',
      },
      {
        t: 'mcq', l: 2,
        q: 'What does OpenID Connect (OIDC) add on top of OAuth 2.0?',
        o: ['Encryption of all API traffic', 'An authentication layer: an ID token (JWT) with user identity, plus a userinfo endpoint', 'A new database', 'Rate limiting'],
        a: 1,
        e: 'OAuth 2.0 is about authorization (access tokens). OIDC adds authentication: "Login with Google" returns an ID token describing who the user is.',
      },
      {
        t: 'qa', l: 3,
        q: 'How do you revoke JWTs before they expire?',
        e: `
JWTs are stateless, so revocation needs some state:
- **Short expiry** (5-15 min) + refresh tokens -> revoke the refresh token; access token dies soon.
- **Denylist** of revoked token ids (\`jti\`) in Redis with TTL = remaining token lifetime; check on each request (small, fast).
- **Token version per user:** store \`tokenVersion\` in the user record and in the JWT; bump it on logout-all / password change; reject tokens with an older version (needs a lookup, can be cached).
- **Rotate signing keys** (nuclear option – invalidates everyone).
- For high-security use, **opaque tokens + introspection** endpoint instead of JWTs.`,
      },
      {
        t: 'qa', l: 3,
        q: 'What are common JWT security pitfalls?',
        e: `
- Accepting \`"alg": "none"\` or letting the token choose the algorithm (**algorithm confusion**: RS256 public key used as HS256 secret). Always whitelist algorithms on the server.
- **Weak HS256 secrets** that can be brute-forced -> use long random secrets or asymmetric keys.
- Not validating \`exp\`, \`iss\`, \`aud\`.
- Putting sensitive data (PII, passwords) in the payload.
- Long-lived access tokens with no revocation strategy.
- Storing tokens in localStorage (XSS theft).
- Not rotating keys / no \`kid\` header support with JWKS.
- Huge tokens (lots of claims) bloating every request header.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is SSO (Single Sign-On)?',
        o: ['Using one password for every website', 'Logging in once with a central identity provider to access multiple applications', 'A type of database index', 'Encrypting a single session'],
        a: 1,
        e: 'SSO uses protocols like SAML 2.0 or OIDC: users authenticate once with an IdP (Okta, Azure AD, Google) and are signed into many apps.',
      },
      {
        t: 'qa', l: 2,
        q: 'Explain RBAC vs ABAC authorization models.',
        e: `
**RBAC (Role-Based Access Control)**
- Permissions are assigned to **roles**; users get roles. *admin can delete users; editor can edit posts.*
- **Pro:** Simple, auditable. **Con:** "Role explosion" when rules get fine-grained.

**ABAC (Attribute-Based Access Control)**
- Decisions based on **attributes** of user, resource, action and environment. *Allow if user.department == doc.department AND time is working hours.*
- **Pro:** Very flexible. **Con:** Harder to reason about and audit.

**ReBAC (Relationship-Based)** – permissions from relationships (Google Zanzibar, OpenFGA): "user is a member of a team that owns the folder".

Policy engines: OPA (Open Policy Agent), Casbin, Cerbos, AWS Cedar.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Design authentication for a web app, a mobile app and a public API used by partners.',
        e: `
**Identity Provider** (own auth service or Auth0/Cognito/Keycloak) supporting OIDC.

**Web app**
- Authorization Code + PKCE via a backend (BFF). Session or tokens kept in **HttpOnly Secure SameSite cookies**; CSRF tokens.

**Mobile app**
- Authorization Code + PKCE using the system browser; store refresh token in Keychain/Keystore; short-lived access JWT; refresh rotation; biometric unlock locally.

**Partner API**
- **Client Credentials** OAuth flow (or API keys for simple cases) with scopes per partner; rate limits and quotas per client; mTLS for high-trust partners.

**Common**
- JWT access tokens (RS256) validated at the API gateway using JWKS.
- MFA, account lockout, password hashing with **bcrypt/argon2**.
- Audit logging, anomaly detection, token revocation strategy.`,
      },
    ],
  },
  {
    slug: 'http-status-codes',
    title: 'HTTP & Status Codes',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'Explain the HTTP status code classes with common examples.',
        e: `
**1xx Informational** – 100 Continue, 101 Switching Protocols (WebSocket upgrade)

**2xx Success**
- **200 OK** – success with body
- **201 Created** – resource created (return \`Location\` header)
- **202 Accepted** – accepted for async processing
- **204 No Content** – success without body (DELETE)

**3xx Redirection**
- **301 Moved Permanently**, **302 Found** (temporary), **304 Not Modified** (cache revalidation), **307/308** (redirects that keep the method)

**4xx Client errors**
- **400 Bad Request** – invalid input
- **401 Unauthorized** – not authenticated
- **403 Forbidden** – authenticated but not allowed
- **404 Not Found**, **405 Method Not Allowed**
- **409 Conflict** – e.g. duplicate, version conflict
- **422 Unprocessable Entity** – validation failed
- **429 Too Many Requests** – rate limited

**5xx Server errors**
- **500 Internal Server Error**, **502 Bad Gateway** (invalid upstream response), **503 Service Unavailable** (overloaded/maintenance), **504 Gateway Timeout** (upstream too slow)`,
      },
      {
        t: 'mcq', l: 1,
        q: 'A logged-in user tries to access an admin-only endpoint. Which status code is correct?',
        o: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '400 Bad Request'],
        a: 1,
        e: 'The user is authenticated (we know who they are) but lacks permission -> 403. 401 means missing or invalid credentials. Some APIs return 404 to hide the existence of resources.',
      },
      {
        t: 'mcq', l: 1,
        q: 'Which status code should a successful POST that creates a new resource return?',
        o: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
        a: 1,
        e: '201 Created, typically with a Location header pointing to the new resource and the created object in the body.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Nginx returns 504 to the client. What most likely happened?',
        o: ['The client sent invalid JSON', 'The upstream application server took too long to respond', 'The URL does not exist', 'The user is not logged in'],
        a: 1,
        e: '504 Gateway Timeout = the proxy did not receive a response from the upstream in time. 502 Bad Gateway = upstream returned an invalid response or refused the connection.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which HTTP methods are idempotent?',
        o: ['GET, PUT, DELETE (and HEAD, OPTIONS)', 'POST and PATCH only', 'Only GET', 'All methods'],
        a: 0,
        e: 'Idempotent = repeating the request has the same effect as making it once. GET, HEAD, OPTIONS, PUT and DELETE are idempotent. POST is not, and PATCH is not guaranteed to be.',
      },
      {
        t: 'qa', l: 2,
        q: 'PUT vs PATCH vs POST: what is the difference?',
        e: `
- **POST** – create a resource or trigger an action; **not idempotent** (two POSTs = two orders). \`POST /orders\`
- **PUT** – **replace** the entire resource at a known URI (create if not exists); **idempotent**. \`PUT /users/42\` with the full user object.
- **PATCH** – **partial update** of some fields; not necessarily idempotent (e.g. "increment counter"). \`PATCH /users/42 { "name": "Ali" }\`

Safe methods (no side effects): GET, HEAD, OPTIONS.`,
      },
      {
        t: 'qa', l: 2,
        q: 'What are the differences between HTTP/1.1, HTTP/2 and HTTP/3?',
        e: `
**HTTP/1.1**
- Text-based; one request at a time per TCP connection (pipelining rarely used) -> **head-of-line blocking**; browsers open ~6 connections per host.
- Keep-alive connections.

**HTTP/2**
- **Binary framing**, **multiplexing** many streams over one TCP connection
- **Header compression (HPACK)**, stream prioritization, server push (deprecated in practice)
- Still suffers **TCP-level** head-of-line blocking on packet loss.

**HTTP/3**
- Runs over **QUIC (UDP)** instead of TCP
- Independent streams -> no TCP head-of-line blocking
- Faster handshakes (0-RTT/1-RTT with TLS 1.3 built-in), **connection migration** (switch Wi-Fi -> 4G without reconnecting)
- Great for mobile/lossy networks.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What does 304 Not Modified mean?',
        o: ['The resource was deleted', 'The cached version the client has is still valid (conditional request using ETag/If-Modified-Since)', 'The server failed to modify the resource', 'Redirect to another URL'],
        a: 1,
        e: 'The client sent If-None-Match (ETag) or If-Modified-Since. The server says "nothing changed" with no body, saving bandwidth.',
      },
      {
        t: 'qa', l: 2,
        q: 'What is CORS and why does the browser send a preflight request?',
        e: `
**CORS (Cross-Origin Resource Sharing)** lets a server tell browsers which other **origins** (scheme + host + port) may read its responses. Browsers enforce the **Same-Origin Policy** by default.

**Simple requests** (GET/POST with simple headers) are sent directly; the browser checks \`Access-Control-Allow-Origin\` on the response.

**Preflight:** for "non-simple" requests (PUT/DELETE, JSON content type, custom headers like Authorization), the browser first sends:
~~~
OPTIONS /api/orders
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization, Content-Type
~~~
The server responds with \`Access-Control-Allow-Origin/Methods/Headers\` (+ \`Max-Age\` to cache the preflight). Only then is the real request sent.

CORS is a **browser** protection – it doesn't protect your API from curl/Postman/servers.`,
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: Choose the correct status codes for these cases: (1) email already registered, (2) invalid email format, (3) expired token, (4) order accepted and will be processed asynchronously, (5) database down.',
        e: `
1. **Email already registered -> 409 Conflict** (the request conflicts with current state).
2. **Invalid email format -> 400 Bad Request** or **422 Unprocessable Entity** (validation error) with field details in the body.
3. **Expired token -> 401 Unauthorized** (+ \`WWW-Authenticate\` header); client should refresh the token.
4. **Async order processing -> 202 Accepted** with a status URL / job id.
5. **Database down -> 503 Service Unavailable** (temporary; optionally \`Retry-After\`) – or 500 if it's an unexpected error.

Always return a consistent error body: \`{ "error": { "code": "EMAIL_TAKEN", "message": "...", "details": [...] } }\`.`,
      },
    ],
  },
  {
    slug: 'api-design',
    title: 'API Design (REST, GraphQL, gRPC)',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What are the principles of a good RESTful API design?',
        e: `
- **Resources as nouns, plural:** \`/users\`, \`/users/42/orders\` (not \`/getUser\`).
- **HTTP methods for actions:** GET read, POST create, PUT replace, PATCH update, DELETE remove.
- **Correct status codes** and consistent error format.
- **Stateless:** each request carries all needed info (auth token).
- **Filtering, sorting, pagination:** \`/orders?status=paid&sort=-createdAt&limit=20&cursor=abc\`
- **Versioning:** \`/v1/...\` or header based.
- **Idempotency** for safe retries (PUT/DELETE, idempotency keys for POST).
- **Security:** HTTPS, auth, rate limiting, input validation.
- **Documentation:** OpenAPI/Swagger.
- **HATEOAS** (optional): responses include links to related actions.
- Use consistent naming (camelCase or snake_case), ISO-8601 dates, UTC.`,
      },
      {
        t: 'qa', l: 2,
        q: 'Offset pagination vs cursor (keyset) pagination: which is better at scale?',
        e: `
**Offset pagination** – \`?page=1000&limit=20\` -> \`LIMIT 20 OFFSET 19980\`
- **Pro:** Simple, can jump to any page.
- **Con:** **Slow for deep pages** (DB still scans and discards all skipped rows).
- **Con:** **Inconsistent** results when rows are inserted/deleted between page loads (duplicates/missed items).

**Cursor / keyset pagination** – \`?limit=20&cursor=<last_seen_id_or_timestamp>\`
~~~sql
SELECT * FROM posts WHERE created_at < :cursor ORDER BY created_at DESC LIMIT 20;
~~~
- **Pro:** **Constant performance** using an index, stable under inserts. Ideal for infinite scroll/feeds.
- **Con:** Can't jump to page N; cursor must be based on a unique, sortable key (often \`(created_at, id)\`).

**At scale -> cursor pagination.**`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Why does "OFFSET 1000000 LIMIT 20" become slow?',
        o: ['Because LIMIT is not supported', 'The database must read and discard 1,000,000 rows before returning 20', 'Because of network latency', 'It is not slow'],
        a: 1,
        e: 'Offset requires scanning past all skipped rows. Keyset pagination (WHERE id < last_id) seeks directly using an index.',
      },
      {
        t: 'qa', l: 2,
        q: 'REST vs GraphQL vs gRPC: when to use each?',
        e: `
| | REST | GraphQL | gRPC |
|---|---|---|---|
| Format | JSON over HTTP | JSON, single endpoint, query language | Protobuf (binary) over HTTP/2 |
| Strength | Simple, cacheable, universal | Clients fetch exactly what they need; one round trip for nested data | Very fast, strongly typed contracts, streaming |
| Weakness | Over/under-fetching, many round trips | Caching is harder, N+1 resolvers, complex security (query depth) | Not browser-native (needs gRPC-Web), less human readable |
| Best for | Public APIs, CRUD | Mobile/web frontends with varied data needs, BFF | Internal microservice communication, low latency, streaming |

Common combo: **gRPC between services**, **REST or GraphQL at the edge** for clients.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which problem does GraphQL mainly solve compared to REST?',
        o: ['Security', 'Over-fetching and under-fetching (multiple round trips) by letting clients request exactly the fields they need', 'Database scaling', 'Binary serialization'],
        a: 1,
        e: 'Clients specify the shape of the response, possibly spanning several resources, in a single request.',
      },
      {
        t: 'qa', l: 2,
        q: 'What are the strategies for API versioning?',
        e: `
1. **URI versioning:** \`/v1/users\`, \`/v2/users\` – most common, explicit, easy to route and cache.
2. **Query parameter:** \`/users?version=2\`.
3. **Header versioning:** \`Accept: application/vnd.myapi.v2+json\` or \`API-Version: 2\` – cleaner URLs, harder to test in a browser.
4. **Date-based versions:** Stripe pins each account to an API version date (\`Stripe-Version: 2024-06-20\`).

**Best practices**
- Avoid breaking changes: add fields instead of renaming/removing; make new fields optional.
- Deprecate with notice (\`Deprecation\`/\`Sunset\` headers), monitor usage of old versions, give migration guides.`,
      },
      {
        t: 'qa', l: 3,
        q: 'How do you design an API for a long-running operation (e.g. generating a large report)?',
        e: `
**Asynchronous request-reply pattern**
1. \`POST /reports\` -> **202 Accepted** with \`{ "jobId": "r_123", "status": "pending" }\` and \`Location: /reports/r_123\`.
2. Work is queued and processed by workers.
3. Client gets the result via:
   - **Polling:** \`GET /reports/r_123\` -> \`{ status: "processing", progress: 40 }\` (respect \`Retry-After\`)
   - **Webhook / callback:** server POSTs to the client's URL when done
   - **Push:** WebSocket/SSE/mobile push notification
4. When complete: \`{ status: "done", downloadUrl: "<signed S3 URL>" }\`.

Also: idempotency key on POST, job expiry, cancellation endpoint (\`DELETE /reports/r_123\`), failure status with error details.`,
      },
      {
        t: 'mcq', l: 3,
        q: 'What is the N+1 query problem in GraphQL resolvers and a common fix?',
        o: ['Too many GraphQL endpoints; merge them', 'Fetching a list then one DB query per item for a nested field; fix with batching via DataLoader', 'Too many mutations; use REST', 'Missing indexes; add one per field'],
        a: 1,
        e: 'Resolving posts -> author for 100 posts can trigger 100 author queries. DataLoader batches the ids in one tick into a single "WHERE id IN (...)" query and caches per request.',
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: Design REST endpoints for a blogging platform with posts, comments and likes.',
        e: `
~~~
POST   /v1/posts                         create post            -> 201
GET    /v1/posts?author=42&tag=go&limit=20&cursor=..  list     -> 200
GET    /v1/posts/{postId}                get post               -> 200 / 404
PATCH  /v1/posts/{postId}                edit (author only)     -> 200 / 403
DELETE /v1/posts/{postId}                delete                 -> 204

GET    /v1/posts/{postId}/comments?cursor=..   list comments
POST   /v1/posts/{postId}/comments             add comment      -> 201
DELETE /v1/comments/{commentId}                delete comment   -> 204

PUT    /v1/posts/{postId}/likes/me       like (idempotent)      -> 204
DELETE /v1/posts/{postId}/likes/me       unlike (idempotent)    -> 204

GET    /v1/users/{userId}/posts          user's posts
~~~
Notes: PUT/DELETE for likes make them idempotent (double-tap safe); cursor pagination; auth via Bearer token; return like counts in the post payload (denormalized counter).`,
      },
    ],
  },
  {
    slug: 'realtime-communication',
    title: 'Real-time: WebSockets, SSE, Polling, Webhooks',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'Compare short polling, long polling, Server-Sent Events and WebSockets.',
        e: `
**Short polling:** client asks every N seconds ("anything new?").
- **Pro:** Simple. **Con:** Wasteful, delayed updates.

**Long polling:** client sends a request; server **holds it open** until data is available or timeout, then the client immediately reconnects.
- **Pro:** Near real-time over plain HTTP. **Con:** Connection overhead per message.

**Server-Sent Events (SSE):** one long-lived HTTP connection, **server -> client only** stream (\`text/event-stream\`), auto-reconnect built in.
- **Pro:** Simple, works through proxies, great for feeds, notifications, AI token streaming. **Con:** One direction, text only.

**WebSockets:** full-duplex, bidirectional persistent connection after an HTTP upgrade.
- **Pro:** Low latency both ways – chat, gaming, collaboration, trading. **Con:** Stateful connections are harder to scale and load balance.

**Webhooks:** server-to-server HTTP callbacks when an event occurs (Stripe payment succeeded).`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which technology is best for a multiplayer game requiring low-latency bidirectional communication?',
        o: ['Short polling', 'Server-Sent Events', 'WebSockets', 'Email'],
        a: 2,
        e: 'WebSockets provide persistent, full-duplex communication. (For extremely latency-sensitive games, UDP/WebRTC data channels are also used.)',
      },
      {
        t: 'mcq', l: 2,
        q: 'You need to stream live stock prices from server to browsers; clients never send data back. What is the simplest good choice?',
        o: ['WebSockets', 'Server-Sent Events', 'Short polling every 100ms', 'gRPC unary calls'],
        a: 1,
        e: 'SSE is simpler than WebSockets for one-way server-to-client streams, uses plain HTTP and reconnects automatically.',
      },
      {
        t: 'qa', l: 3,
        q: 'How do you scale WebSocket servers to millions of connections?',
        e: `
- **Horizontal scaling:** many WebSocket gateway servers; each holds ~100K-1M connections (tuned file descriptors, epoll, small per-connection memory).
- **Load balancer** with L4 or L7 WebSocket support; use least connections.
- **Connection registry:** store \`userId -> gatewayServerId\` in Redis so the backend knows where to deliver a message.
- **Pub/Sub backbone:** Redis Pub/Sub, Kafka or NATS to route messages between gateway servers (user A on server 1 messages user B on server 7).
- **Stateless business logic:** gateways only manage connections; chat logic lives in separate services.
- **Heartbeats/pings** to detect dead connections; **reconnect with backoff + jitter** on the client to avoid reconnect storms after a deploy.
- **Graceful draining** during deploys; resume from last message id after reconnect.`,
      },
      {
        t: 'qa', l: 2,
        q: 'How do you design reliable webhooks?',
        e: `
**Sender side**
- Deliver events via a **queue** with **retries + exponential backoff** (e.g. for up to 3 days).
- Include an **event id**, type, timestamp; **sign** the payload (HMAC-SHA256 header) so receivers can verify authenticity.
- Timeouts (e.g. 10s), DLQ after max attempts, dashboard to replay events.

**Receiver side**
- **Verify the signature** and timestamp (prevent replay attacks).
- **Respond 2xx quickly**, process asynchronously.
- Be **idempotent** – the same event may arrive more than once; store processed event ids.
- Don't rely on ordering; fetch latest state from the API if needed.`,
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: Design live delivery-tracking for a food delivery app (rider location shown on the customer\'s map).',
        e: `
1. **Rider app** sends GPS every 3-5 seconds (HTTP batch or a persistent WebSocket/MQTT connection) to a **Location Service**.
2. Location Service stores the **latest location** in Redis (\`GEOADD\` or a hash per rider with TTL) and publishes to a channel \`order:{id}:location\`.
3. **Customer app** opens a WebSocket/SSE connection to a **real-time gateway** subscribed to that order's channel; updates are pushed instantly.
4. **Historic path** is written asynchronously (Kafka -> time-series store) for analytics and disputes.
5. **ETA service** recomputes ETA periodically using maps/traffic data.
6. Scale: gateways horizontally, Redis Pub/Sub or Kafka for routing, throttle updates (smooth/animate on the client between points).`,
      },
    ],
  },
  {
    slug: 'unique-id-generation',
    title: 'Unique ID Generation',
    questions: [
      {
        t: 'qa', l: 2,
        q: 'How do you generate unique IDs in a distributed system? Compare the options.',
        e: `
1. **DB auto-increment:** simple, ordered. **Con:** Single point of failure, doesn't work across shards (unless using offsets: server 1 odd, server 2 even).
2. **UUID v4 (random, 128-bit):** generated anywhere, no coordination. **Con:** Large, **not sortable**, random inserts fragment B-tree indexes.
3. **UUID v7 / ULID:** time-ordered + random -> sortable, index friendly, no coordination. **Pro:** Great modern default.
4. **Ticket server (Flickr):** central DB hands out IDs (often in batches/ranges). **Con:** Needs HA.
5. **Twitter Snowflake (64-bit):**
~~~
| 1 bit sign | 41 bits timestamp (ms) | 10 bits machine id | 12 bits sequence |
~~~
   - ~69 years of timestamps, 1024 machines, 4096 IDs per ms per machine
   - **Pro:** Sortable by time, fits in BIGINT, no coordination at runtime.
   - **Con:** Needs unique machine ids and clock sync (clock going backwards must be handled).`,
      },
      {
        t: 'mcq', l: 2,
        q: 'In a Twitter Snowflake ID, what makes the IDs roughly sortable by creation time?',
        o: ['The machine id comes first', 'The most significant bits store the timestamp', 'They are random', 'They are generated by the database'],
        a: 1,
        e: 'The 41-bit millisecond timestamp sits in the high bits, so numeric order ≈ time order.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Why can random UUID v4 primary keys hurt write performance in MySQL InnoDB?',
        o: ['UUIDs cannot be indexed', 'Random keys insert into random positions of the clustered B-tree causing page splits and poor cache locality', 'UUIDs are too short', 'InnoDB does not support strings'],
        a: 1,
        e: 'Sequential keys append to the end of the index. Random keys scatter writes, increasing page splits, fragmentation and I/O. Use UUID v7/ULID or BIGINT.',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: In a Snowflake-based ID generator, the server clock moves backwards by 50ms due to NTP correction. What can go wrong and how do you handle it?',
        e: `
**Risk:** IDs generated after the jump may **duplicate** IDs generated in the previous 50ms (same timestamp + machine id + sequence) or break ordering.

**Handling**
- Track the **last timestamp** used. If \`now < lastTimestamp\`:
  - Small drift: **wait** until the clock catches up.
  - Large drift: **refuse** to generate IDs and alert (or switch to a spare machine id).
- Configure NTP to **slew** (gradually adjust) rather than step the clock.
- Some implementations use a logical clock: keep using \`lastTimestamp\` and increment the sequence, borrowing future milliseconds.`,
      },
    ],
  },
  {
    slug: 'observability',
    title: 'Observability: Logging, Metrics, Tracing',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What are the three pillars of observability?',
        e: `
1. **Logs** – timestamped records of discrete events (errors, requests). Use **structured JSON logs** with request ids. *Tools: ELK/OpenSearch, Loki, CloudWatch, Datadog.*
2. **Metrics** – numeric time-series aggregated over time (QPS, latency percentiles, CPU, error rate). Cheap to store, great for dashboards and alerts. *Tools: Prometheus + Grafana, Datadog, CloudWatch.*
3. **Traces** – the end-to-end path of a single request across services, made of spans with timings. Shows **where** time is spent. *Tools: Jaeger, Zipkin, Tempo, AWS X-Ray; instrumentation via OpenTelemetry.*

Monitoring tells you **that** something is wrong; observability helps you ask **why**.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Why are latency percentiles (p95, p99) preferred over averages?',
        o: ['They are easier to compute', 'Averages hide tail latency; p99 shows the experience of the slowest 1% of requests', 'Percentiles use less storage', 'Averages are always higher'],
        a: 1,
        e: 'An average of 100ms could hide 1% of requests taking 5 seconds. Users making many requests hit the tail often, so p95/p99 reflect real user experience.',
      },
      {
        t: 'qa', l: 2,
        q: 'What are the RED and USE methods for monitoring?',
        e: `
**RED** (for request-driven services)
- **Rate:** requests per second
- **Errors:** failed requests per second / error %
- **Duration:** latency distribution (p50, p95, p99)

**USE** (for resources: CPU, memory, disk, network)
- **Utilization:** % time busy
- **Saturation:** queued work (load average, queue length)
- **Errors:** error counts

Google SRE's **Four Golden Signals:** latency, traffic, errors, saturation.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the purpose of a correlation/trace ID passed through all services?',
        o: ['To authenticate users', 'To link logs and spans from different services that belong to the same request', 'To encrypt traffic', 'To load balance requests'],
        a: 1,
        e: 'Propagating a trace id (W3C traceparent header) lets you search all logs/spans of one request across the whole system.',
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Define good alerts for a checkout service. What should page an engineer at 3 AM?',
        e: `
**Page (urgent, user-impacting, actionable)**
- Checkout **error rate > 2% for 5 min** (SLO burn rate alerts)
- **p99 latency > 2s for 10 min**
- **Successful orders/min dropped > 50%** vs the same time last week (business metric)
- Payment provider failure rate spike

**Ticket / Slack (not urgent)**
- Disk 80% full, single instance restarts, certificate expiring in 14 days, elevated retry rates

**Good alerting practices**
- Alert on **symptoms** (users affected), not every cause (CPU 90% alone is not a page)
- Use **SLO burn-rate** alerts (fast + slow windows)
- Every alert links to a **runbook** and dashboard
- Avoid alert fatigue: delete noisy alerts, review after incidents.`,
      },
    ],
  },
];
