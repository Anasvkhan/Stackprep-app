// Load balancer, types of load balancers, proxy & reverse proxy, API gateway, DNS, CDN
module.exports = [
  {
    slug: 'load-balancer',
    title: 'Load Balancer & Its Types',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is a load balancer and why do we need it?',
        e: `
A **load balancer (LB)** sits in front of a group of servers and distributes incoming requests among them.

**Why**
- **Scalability:** spread traffic across many servers (horizontal scaling)
- **High availability:** health checks remove unhealthy servers automatically
- **No single server overload:** better latency
- **Zero downtime deploys:** drain a server, deploy, add it back (rolling/blue-green)
- **Extra features:** TLS termination, compression, sticky sessions, WAF, rate limiting (L7)

~~~
Clients -> [ Load Balancer ] -> Server 1
                             -> Server 2
                             -> Server 3
~~~
Examples: Nginx, HAProxy, Envoy, AWS ALB/NLB, GCP Load Balancing, F5 (hardware).`,
      },
      {
        t: 'qa', l: 1,
        q: 'What are the different types of load balancers?',
        e: `
**By OSI layer**
- **Layer 4 (Transport) LB:** routes based on IP + port (TCP/UDP). Doesn't look inside the request. Very fast, low overhead. *e.g. AWS NLB, HAProxy TCP mode.*
- **Layer 7 (Application) LB:** understands HTTP – routes by URL path, host, headers, cookies; can terminate TLS, rewrite, cache. *e.g. AWS ALB, Nginx, Envoy.*

**By implementation**
- **Hardware LB:** dedicated appliances (F5, Citrix). Very high throughput, expensive.
- **Software LB:** Nginx, HAProxy, Envoy, Traefik on commodity servers.
- **Cloud / managed LB:** AWS ELB (ALB/NLB/GWLB), Azure LB, GCP LB.

**By scope**
- **DNS load balancing:** DNS returns different IPs (round robin / geo).
- **Global Server Load Balancing (GSLB):** routes across regions/data centers (anycast, GeoDNS).
- **Internal LB:** between microservices inside a private network.
- **Client-side load balancing:** client picks the server using a service registry (gRPC, Netflix Ribbon).`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which load balancer can route /api/* to one group of servers and /images/* to another?',
        o: ['Hardware switch', 'DNS round robin', 'Layer 4 load balancer', 'Layer 7 load balancer'],
        a: 3,
        e: 'Path based routing requires reading the HTTP request, which only a Layer 7 (application layer) load balancer does. L4 only sees IP/port.',
      },
      {
        t: 'qa', l: 1,
        q: 'Explain common load balancing algorithms.',
        e: `
**Static**
- **Round Robin:** requests go to servers in order 1,2,3,1,2,3. Simple; assumes equal servers.
- **Weighted Round Robin:** bigger servers get more requests (weights).
- **IP Hash / Consistent Hash:** hash(client IP or key) -> same server each time (stickiness, cache locality).

**Dynamic**
- **Least Connections:** send to the server with fewest active connections. Good for long-lived connections (WebSockets).
- **Weighted Least Connections:** least connections adjusted by capacity.
- **Least Response Time:** fewest connections + lowest latency.
- **Power of Two Random Choices:** pick 2 random servers, send to the less loaded one. Scales well, avoids herd behavior.

**Choosing**
- Uniform short requests -> round robin
- Variable request duration / long connections -> least connections
- Need affinity (cache per user, sessions) -> consistent hashing`,
      },
      {
        t: 'mcq', l: 2,
        q: 'You serve WebSocket connections that last for hours. Which algorithm balances load best?',
        o: ['Least connections', 'Round robin', 'Random', 'IP hash only'],
        a: 0,
        e: 'Long-lived connections make round robin uneven over time. Least connections sends new connections to the server currently handling the fewest.',
      },
      {
        t: 'qa', l: 2,
        q: 'What are health checks in a load balancer? Active vs passive?',
        e: `
Health checks decide whether a backend should receive traffic.

- **Active health checks:** the LB periodically calls an endpoint (e.g. \`GET /health\` every 10s). After N failures, the server is marked unhealthy; after M successes, healthy again.
- **Passive health checks:** the LB watches real traffic; if a server returns errors/timeouts repeatedly, it's ejected (outlier detection in Envoy).

**Good /health design**
- **Liveness:** "process is up" (cheap)
- **Readiness:** "can serve traffic" (DB reachable, warmed up). Don't make it too deep or one DB blip removes ALL servers at once (cascading failure).`,
      },
      {
        t: 'qa', l: 2,
        q: 'What are sticky sessions (session affinity)? What are their drawbacks?',
        e: `
**Sticky sessions** make the LB send all requests from a client to the **same backend**, usually via a cookie (e.g. \`AWSALB\`) or IP hash.

**Use when:** legacy apps store session in server memory, or for cache locality.

**Drawbacks**
- Uneven load (some servers get "heavy" users)
- If that server dies, the user's session is lost
- Makes auto scaling/scale-in harder (must drain sessions)

**Better:** make servers stateless – store sessions in Redis or use JWT tokens.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What does "TLS termination at the load balancer" mean?',
        o: ['The LB blocks all HTTPS traffic and only accepts plain HTTP from clients', 'TLS certificates are stored only on the backends, and the LB never sees them', 'The LB downgrades clients to HTTP so backends do less encryption work', 'The LB decrypts HTTPS and forwards traffic to backends, often as plain HTTP'],
        a: 3,
        e: 'The LB holds the certificate, handles the TLS handshake and decryption (CPU heavy), and backends receive decrypted traffic. For zero-trust, re-encrypt to backends (TLS passthrough or end-to-end TLS).',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which AWS load balancer works at Layer 4 and supports millions of requests per second with static IPs?',
        o: ['Classic Load Balancer', 'CloudFront', 'Network Load Balancer (NLB)', 'Application Load Balancer (ALB)'],
        a: 2,
        e: 'NLB operates at Layer 4 (TCP/UDP/TLS), offers ultra low latency, static/Elastic IPs per AZ, and very high throughput. ALB is Layer 7 (HTTP/HTTPS, path/host routing).',
      },
      {
        t: 'qa', l: 3,
        q: 'The load balancer itself can be a single point of failure. How is that solved?',
        e: `
- **Active-passive pair** with a floating virtual IP (VRRP/keepalived). If the active LB dies, the passive takes over the VIP.
- **Active-active** LBs behind DNS (multiple A records) or **anycast** IPs.
- **Managed cloud LBs** (AWS ALB/NLB) are internally distributed across AZs and scale automatically.
- **Multi-region:** GSLB/GeoDNS in front of regional LBs; health-check based DNS failover.
- **Layered:** L4 LB tier (ECMP routing) in front of a fleet of L7 proxies (how Google/Facebook do it with Maglev/Katran).`,
      },
      {
        t: 'mcq', l: 3,
        q: 'What is the main problem with plain DNS round robin as a load balancing strategy?',
        o: ['It cannot work with IPv6 addresses, only with IPv4 A records', 'Resolvers cache records, so a dead server keeps getting traffic until TTL expires', 'It only works over UDP, so clients behind TCP-only networks fail', 'It requires sticky sessions so each client always reaches the same server, which DNS cannot do'],
        a: 1,
        e: 'DNS has no health checking by default and responses are cached (TTL, client caches). Failures propagate slowly and load is uneven. Health-checked DNS with low TTL helps but is still coarse.',
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: After adding a new server to the pool, it immediately crashes under load while others are fine. Why, and how do you fix it?',
        e: `
**Likely cause:** with *least connections*, a brand new server has 0 connections, so the LB floods it. It also has a **cold cache**, cold JIT/connection pools, so it is slower than others.

**Fixes**
- **Slow start / warm-up mode:** gradually ramp traffic to new instances (supported by ALB, Nginx Plus, Envoy, HAProxy).
- **Readiness checks:** only add the server after warm-up (caches primed, connections established).
- Use **round robin or P2C** with weights during warm-up.
- Pre-warm caches from a snapshot or by replaying traffic.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Design the load balancing layer for a global app with users in Asia, Europe and the US.',
        e: `
1. **Global routing:** GeoDNS / latency based routing (Route 53, Cloudflare) or **anycast** IP so users hit the closest region.
2. **Regional entry:** each region has a highly available L7 load balancer (managed ALB or Envoy fleet) spread across 3 AZs.
3. **TLS termination** at the edge (CDN/edge PoPs) to reduce handshake latency; HTTP/2 or HTTP/3 to origin.
4. **Internal LBs / service mesh** for service-to-service traffic.
5. **Health-check-based failover:** if a region is unhealthy, DNS shifts traffic to the next closest region (needs capacity headroom ~ N+1 regions).
6. **Data:** decide which data is region-local vs globally replicated so that failover still works.
7. **DDoS protection & WAF** at the edge (Cloudflare, AWS Shield).`,
      },
    ],
  },
  {
    slug: 'proxy-reverse-proxy',
    title: 'Proxy & Reverse Proxy',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is a proxy server (forward proxy)?',
        e: `
A **forward proxy** sits between **clients** and the internet and makes requests **on behalf of clients**. The destination server sees the proxy's IP, not the client's.

~~~
Client -> Forward Proxy -> Internet (servers)
~~~
**Uses**
- Anonymity / hiding client IP (VPN-like)
- Content filtering in offices/schools (block sites)
- Caching common content to save bandwidth
- Bypassing geo restrictions
- Logging/monitoring outbound traffic

Examples: Squid, corporate proxies.`,
      },
      {
        t: 'qa', l: 1,
        q: 'What is a reverse proxy and what are its benefits?',
        e: `
A **reverse proxy** sits in front of **servers** and receives requests on their behalf. Clients talk to the proxy and don't know which backend served them.

~~~
Client -> Internet -> Reverse Proxy -> Server A / Server B
~~~
**Benefits**
- **Load balancing** across backends
- **Security:** hides backend IPs/topology, single hardened entry point, WAF
- **TLS termination**
- **Caching & compression** of responses
- **Static file serving**
- **Routing** (\`/api\` -> API servers, \`/\` -> frontend)
- **Rate limiting, request buffering** (protects slow app servers from slow clients)

Examples: Nginx, HAProxy, Envoy, Traefik, Cloudflare.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which statement correctly differentiates a forward proxy and a reverse proxy?',
        o: ['Both are the same thing; only the configuration file differs', 'Forward proxy acts for clients; reverse proxy acts for servers', 'A reverse proxy only works over UDP, a forward proxy over TCP', 'Forward proxy protects servers; reverse proxy protects clients'],
        a: 1,
        e: 'Forward proxy = client side (hides/controls clients). Reverse proxy = server side (hides/protects/balances servers).',
      },
      {
        t: 'mcq', l: 2,
        q: 'Is every load balancer a reverse proxy?',
        o: ['Only hardware load balancers are reverse proxies; software ones like Nginx or HAProxy are not', 'No, they are unrelated; a reverse proxy never distributes any traffic', 'An L7 LB is a reverse proxy, but a reverse proxy can front just one backend', 'Yes, always; every load balancer and reverse proxy are the same thing'],
        a: 2,
        e: 'An L7 LB is a reverse proxy that distributes load. A reverse proxy is still useful with a single server for TLS, caching, compression and security.',
      },
      {
        t: 'qa', l: 2,
        q: 'Compare Reverse Proxy vs Load Balancer vs API Gateway.',
        e: `
| | Reverse Proxy | Load Balancer | API Gateway |
|---|---|---|---|
| Main job | Front door for servers | Distribute traffic | Manage APIs for clients |
| Layer | L7 | L4 or L7 | L7 |
| Features | TLS, caching, compression, routing | Algorithms, health checks | Auth, rate limiting, request aggregation, transformation, API keys, versioning, analytics |
| Examples | Nginx, HAProxy | AWS ALB/NLB, HAProxy | Kong, AWS API Gateway, Apigee |

They overlap: Nginx can be all three. Think of it as increasing "API awareness": LB -> Reverse proxy -> API gateway.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Why does Nginx in front of a Node.js app improve performance with slow mobile clients?',
        o: ['Nginx runs JavaScript faster than Node.js does', 'Nginx disables TLS for mobile clients so the handshake is shorter', 'Nginx buffers slow clients so the app server is freed quickly', 'Nginx converts HTTP to UDP for mobile networks'],
        a: 2,
        e: 'Request/response buffering: Nginx absorbs slow connections (event-driven, cheap per connection) and talks to the app over a fast local connection, so app workers are not held up.',
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: You have a React frontend and a Node API on the same server. How would you configure a reverse proxy?',
        e: `
Use Nginx as the single entry point on ports 80/443:

~~~nginx
server {
  listen 443 ssl http2;
  server_name app.example.com;
  ssl_certificate     /etc/ssl/fullchain.pem;
  ssl_certificate_key /etc/ssl/privkey.pem;

  gzip on;

  location / {                       # React static build
    root /var/www/app/build;
    try_files $uri /index.html;      # SPA fallback
  }

  location /api/ {                    # Node API
    proxy_pass http://127.0.0.1:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
~~~
Benefits: same origin (no CORS), TLS in one place, static files served efficiently, Node not exposed directly. Redirect port 80 to 443.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which header is commonly added by a reverse proxy to pass the original client IP to the backend?',
        o: ['X-Forwarded-For', 'X-Real-Host', 'Client-Address', 'Origin-IP'],
        a: 0,
        e: 'X-Forwarded-For (and X-Real-IP) carry the original client IP; X-Forwarded-Proto carries the original scheme. Backends must only trust these from known proxies.',
      },
      {
        t: 'qa', l: 3,
        q: 'What is a sidecar proxy and how does it relate to a service mesh?',
        e: `
A **sidecar proxy** (e.g. Envoy) runs next to each service instance (same pod) and intercepts all its inbound/outbound traffic.

A **service mesh** (Istio, Linkerd, Consul Connect) = sidecars (data plane) + a control plane that configures them.

**What the mesh gives you without code changes**
- mTLS between services (zero trust)
- Retries, timeouts, circuit breaking
- Traffic splitting (canary, A/B), fault injection
- Load balancing, service discovery
- Uniform metrics & distributed tracing

**Trade-offs:** extra latency (~1ms per hop), resource overhead, operational complexity. Newer "sidecarless" modes (Istio ambient, eBPF/Cilium) reduce overhead.`,
      },
    ],
  },
  {
    slug: 'api-gateway',
    title: 'API Gateway',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is an API Gateway and what problems does it solve?',
        e: `
An **API Gateway** is a single entry point for all client requests to a set of backend services (usually microservices).

~~~
Mobile / Web -> API Gateway -> User Service
                            -> Order Service
                            -> Payment Service
~~~
**Responsibilities**
- **Routing** requests to the right service
- **Authentication & authorization** (validate JWT / API keys once at the edge)
- **Rate limiting & throttling**
- **Request/response transformation** (REST <-> gRPC, field filtering)
- **Aggregation / composition** (one call fans out to many services)
- **Caching**, **SSL termination**, **CORS**
- **Monitoring, logging, analytics**, API versioning

Without it, clients would need to know every service address and each service would re-implement auth, rate limiting etc.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which is NOT a typical responsibility of an API gateway?',
        o: ['Authenticating requests and validating access tokens', 'Rate limiting clients by API key or IP', 'Running business logic like calculating order discounts', 'Routing requests to the right backend service'],
        a: 2,
        e: 'Gateways handle cross-cutting concerns. Putting business logic in the gateway couples it to services and makes it a bottleneck ("smart endpoints, dumb pipes").',
      },
      {
        t: 'qa', l: 2,
        q: 'What is the Backend for Frontend (BFF) pattern?',
        e: `
**BFF** = a separate API gateway/backend for each type of client (web, mobile, smart TV, partners).

**Why**
- Mobile needs smaller payloads and fewer round trips; web may need richer data
- Each frontend team owns its BFF and can evolve it independently
- Avoids one giant "one-size-fits-all" gateway

~~~
Mobile app -> Mobile BFF -\\
                          -> Microservices
Web app    -> Web BFF ----/
~~~
**Trade-off:** code duplication across BFFs; keep shared logic in downstream services. GraphQL is often used as a BFF.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'What is the biggest risk of an API gateway?',
        o: ['It makes the system too secure for clients to call it directly', 'It can become a single point of failure and a performance bottleneck', 'It cannot handle HTTPS, so traffic must be encrypted elsewhere', 'It removes the need for load balancers, which reduces redundancy across the whole system'],
        a: 1,
        e: 'All traffic flows through it, so it must be highly available (multiple instances behind an LB), horizontally scalable and kept thin.',
      },
      {
        t: 'mcq', l: 2,
        q: 'A mobile screen needs data from User, Orders and Recommendations services. Which gateway feature reduces round trips?',
        o: ['DNS caching on the gateway', 'Request aggregation / composition', 'TLS passthrough to each service', 'Sticky sessions per mobile client'],
        a: 1,
        e: 'The gateway (or BFF) calls the 3 services in parallel and returns one combined response, saving the mobile client multiple slow network round trips.',
      },
      {
        t: 'qa', l: 2,
        q: 'Name popular API gateways and when you would pick each.',
        e: `
- **AWS API Gateway:** serverless, pay per request, integrates with Lambda/Cognito/IAM. Great for AWS-native, spiky traffic.
- **Kong:** open source (Nginx/OpenResty based), plugin ecosystem, self-hosted or cloud.
- **Apigee (Google):** enterprise API management, monetization, developer portals.
- **Azure API Management.**
- **Envoy / Istio ingress gateway, Traefik, NGINX:** Kubernetes-native ingress.
- **Spring Cloud Gateway / Netflix Zuul:** Java microservices ecosystems.
- **GraphQL gateways (Apollo Router):** federated GraphQL over many services.`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Design authentication at the API gateway for 30 microservices.',
        e: `
1. **Client logs in** with an Identity Provider (Auth service / Keycloak / Auth0 / Cognito) via OAuth2/OIDC, gets a short-lived **JWT access token** + refresh token.
2. **Gateway validates** the JWT on every request: signature (cached JWKS public keys), expiry, issuer, audience. No DB call needed.
3. Gateway **rejects** invalid tokens with 401, enforces coarse **scopes/roles** (403).
4. Gateway **forwards identity** to services via headers (\`X-User-Id\`, \`X-Roles\`) or passes the JWT through.
5. **Services do fine-grained authorization** (e.g. "can this user edit order 123?").
6. **Internal traffic** is protected with mTLS (service mesh) so services only trust calls coming via the gateway/mesh.
7. **Revocation:** short token TTL (5-15 min) + refresh tokens; denylist in Redis for emergencies (logout, compromised).
8. Rate limit per user/API key at the gateway.`,
      },
      {
        t: 'qa', l: 3,
        q: 'API Gateway vs Service Mesh: what is the difference?',
        e: `
| | API Gateway | Service Mesh |
|---|---|---|
| Traffic | **North-south** (external clients -> services) | **East-west** (service <-> service) |
| Location | Edge of the system | Sidecar next to every service |
| Concerns | Auth of end users, API keys, rate limiting, aggregation, API products | mTLS, retries, timeouts, circuit breaking, observability between services |
| Examples | Kong, AWS API GW, Apigee | Istio, Linkerd, Consul |

They complement each other: gateway at the edge, mesh inside the cluster.`,
      },
    ],
  },
  {
    slug: 'dns',
    title: 'DNS (Domain Name System)',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What happens when you type www.google.com in the browser? (DNS resolution focus)',
        e: `
1. **Browser cache** -> **OS cache** (and hosts file) checked for the IP.
2. Query goes to the **recursive resolver** (ISP / 8.8.8.8 / 1.1.1.1).
3. Resolver asks a **Root name server** -> "ask the .com TLD servers".
4. Resolver asks the **TLD server (.com)** -> "ask google.com's authoritative name servers".
5. Resolver asks the **Authoritative name server** -> returns the A/AAAA record (IP).
6. Resolver **caches** the answer for its TTL and returns it to the OS/browser.

Then: TCP handshake (+ TLS handshake) -> HTTP request -> server response -> browser parses HTML, fetches CSS/JS/images, renders the page.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which DNS record maps a domain name to an IPv4 address?',
        o: ['TXT', 'MX', 'CNAME', 'A'],
        a: 3,
        e: `- **A:** name -> IPv4
- **AAAA:** name -> IPv6
- **CNAME:** alias name -> another name
- **MX:** mail servers
- **TXT:** text (SPF, domain verification)
- **NS:** authoritative name servers
- **SRV:** service host + port`,
      },
      {
        t: 'mcq', l: 1,
        q: 'What does the TTL value on a DNS record control?',
        o: ['The encryption level', 'How many servers are allowed to use the record', 'How long resolvers may cache the record', 'The maximum size of the record'],
        a: 2,
        e: 'TTL (in seconds) = how long the answer can be cached. Low TTL allows fast changes/failover but more DNS queries; high TTL improves performance but changes propagate slowly.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Why can\'t you put a CNAME record on the root/apex domain (example.com) in standard DNS?',
        o: ['A CNAME cannot coexist with other records, and the apex needs SOA and NS', 'Root domains only support IPv6 AAAA records, not aliases', 'It is allowed everywhere; the restriction only applies to subdomains like www', 'CNAME records are only allowed for mail servers and MX lookups'],
        a: 0,
        e: 'A CNAME must be the only record for a name, but the zone apex needs SOA/NS records. Providers offer ALIAS/ANAME or "CNAME flattening" (e.g. Route 53 Alias) to work around this.',
      },
      {
        t: 'qa', l: 2,
        q: 'How is DNS used for load balancing and failover?',
        e: `
- **Round robin DNS:** multiple A records; resolvers rotate them.
- **Weighted routing:** e.g. 90% to v1, 10% to v2 (canary).
- **Latency-based routing:** return the region with the lowest latency for that user.
- **Geo DNS / geolocation routing:** route by user country (also used for data residency).
- **Failover routing:** health checks on the primary; if unhealthy, DNS returns the secondary.

**Limits:** client caching & TTL -> slow failover; no per-request balancing; some clients ignore TTL. Usually combined with LBs inside each region.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'Which transport protocol does DNS primarily use for normal queries?',
        o: ['TCP on port 53 only', 'UDP on port 53', 'ICMP echo packets', 'HTTP on port 80'],
        a: 1,
        e: 'DNS uses UDP port 53 for speed; TCP 53 is used when responses exceed size limits and for zone transfers. Modern privacy options: DNS over HTTPS (DoH) and DNS over TLS (DoT).',
      },
      {
        t: 'qa', l: 3,
        q: 'What are common DNS attacks and how do you defend against them?',
        e: `
- **DNS spoofing / cache poisoning:** attacker injects fake records into a resolver cache -> users sent to malicious IPs. *Defense: DNSSEC (signed records), source port randomization.*
- **DDoS on DNS servers:** (e.g. Dyn 2016 attack). *Defense: anycast DNS, multiple providers, rate limiting.*
- **DNS amplification:** spoofed small queries produce large responses aimed at a victim. *Defense: disable open resolvers, response rate limiting.*
- **DNS hijacking / registrar account takeover.** *Defense: registrar lock, MFA, monitoring.*
- **DNS tunneling** for data exfiltration. *Defense: monitor unusual query patterns.*
- **Subdomain takeover:** dangling CNAME to a deleted cloud resource. *Defense: clean up DNS when deprovisioning.*`,
      },
      {
        t: 'scenario', l: 2,
        q: 'Scenario: You migrated your app to a new server IP, but some users still hit the old server for hours. Why, and how should migrations be done?',
        e: `
**Why:** resolvers, OS and browsers cached the old A record until its **TTL** expired (some ignore TTL or have a high minimum).

**Proper migration**
1. Days before, **lower the TTL** (e.g. 86400 -> 60 seconds) and wait for the old TTL to expire.
2. Bring the new server up and test it (hosts file / direct IP).
3. **Switch the record**; with low TTL most clients move within minutes.
4. **Keep the old server running** (or proxy to the new one) for a while to catch stragglers.
5. Raise TTL again after things are stable.

Even better: put a load balancer/CDN with a stable address in front so backend IP changes don't need DNS changes.`,
      },
    ],
  },
  {
    slug: 'cdn',
    title: 'CDN (Content Delivery Network)',
    questions: [
      {
        t: 'qa', l: 1,
        q: 'What is a CDN and how does it work?',
        e: `
A **CDN** is a geographically distributed network of **edge servers (PoPs)** that cache content close to users.

**Flow**
1. User requests \`cdn.example.com/logo.png\`; DNS/anycast routes them to the nearest edge.
2. **Cache hit:** edge returns it immediately (low latency).
3. **Cache miss:** edge fetches from the **origin** (your server/S3), caches it per TTL / Cache-Control, returns it.

**Benefits**
- Lower latency (content is physically closer)
- Reduced origin load and bandwidth cost
- High availability & absorbs traffic spikes
- DDoS protection, WAF, TLS at the edge

Examples: Cloudflare, Akamai, AWS CloudFront, Fastly, Google Cloud CDN.`,
      },
      {
        t: 'mcq', l: 1,
        q: 'Which content benefits MOST from a CDN?',
        o: ['Static assets like images, CSS, JS and videos', 'Database write operations from all regions', 'A user\'s private bank balance', 'Real-time stock trades'],
        a: 0,
        e: 'Static, widely-requested content is ideal for edge caching. Personalized or highly dynamic data usually is not cacheable (though CDNs can still accelerate dynamic traffic via optimized routes).',
      },
      {
        t: 'qa', l: 2,
        q: 'Push CDN vs Pull CDN: what is the difference?',
        e: `
**Pull CDN**
- Edge fetches content from origin on the **first request** (lazy), then caches it.
- **Pro:** Easy setup, only popular content is cached.
- **Con:** First user per edge gets slower response; origin must be available.
- Best for: high-traffic sites with lots of content.

**Push CDN**
- You **upload** content to the CDN proactively.
- **Pro:** Content is ready before requests; good for large files that rarely change.
- **Con:** You manage uploads/expiry; uses more storage.
- Best for: low-traffic sites, big downloads, video libraries.`,
      },
      {
        t: 'mcq', l: 2,
        q: 'You deployed a new version of app.js but users still get the old file from the CDN. What is the BEST long-term solution?',
        o: ['Set the TTL to 0 for every file', 'Disable the CDN for JavaScript files', 'Ask users to clear their browser cache after each deployment', 'Use fingerprinted file names (app.3f9a1c.js) with a long TTL'],
        a: 3,
        e: 'Cache busting with content hashes in file names makes every new build a new URL, so you can cache forever (immutable) and never serve stale assets. Purge/invalidation APIs are a short-term fix.',
      },
      {
        t: 'mcq', l: 2,
        q: 'Which HTTP header mainly tells a CDN and browsers how long to cache a response?',
        o: ['Cache-Control', 'Content-Type', 'Accept-Encoding', 'Authorization'],
        a: 0,
        e: 'Cache-Control (max-age, s-maxage for shared caches, public/private, no-store, immutable, stale-while-revalidate). ETag/Last-Modified enable revalidation.',
      },
      {
        t: 'qa', l: 2,
        q: 'How do you serve private or paid content (e.g. course videos) through a CDN securely?',
        e: `
- **Signed URLs / signed cookies:** your backend generates a URL with an expiry and signature (CloudFront signed URLs, Cloudflare tokens). The CDN validates the signature before serving.
- **Short expiry** (minutes) and optionally bind to IP/user.
- **Origin access control:** the bucket/origin only accepts requests from the CDN (not public).
- **Video:** HLS/DASH segments with tokenized URLs, plus DRM (Widevine/FairPlay) for premium content.
- Mark responses \`Cache-Control: private\` where content is user specific.`,
      },
      {
        t: 'qa', l: 3,
        q: 'What is edge computing in CDNs, and when would you use it?',
        e: `
CDNs can run code at edge locations: **Cloudflare Workers, Lambda@Edge / CloudFront Functions, Fastly Compute, Vercel Edge Functions**.

**Use cases**
- A/B testing and feature flags without hitting origin
- Auth/token validation at the edge, geo-blocking
- URL rewrites, redirects, header manipulation
- Image resizing/format conversion (WebP/AVIF) on the fly
- Personalization by country/device
- Edge rendering (SSR) for lower TTFB

**Limits:** short CPU time, limited runtime APIs, data access is far away unless you use edge KV/databases (Workers KV, D1, Durable Objects).`,
      },
      {
        t: 'scenario', l: 3,
        q: 'Scenario: Your origin went down. Can the CDN keep the site partially working?',
        e: `
Yes, if configured well:
- **stale-if-error:** \`Cache-Control: max-age=60, stale-if-error=86400\` lets the CDN serve expired cached content when the origin returns errors or is unreachable.
- **stale-while-revalidate:** serve stale content instantly while refreshing in the background (also hides origin slowness).
- **Origin shield / tiered caching:** a mid-tier cache reduces origin dependency and hit storms.
- **Origin failover:** configure a secondary origin (another region or a static S3 copy) in the CDN.
- **Static fallback pages** for APIs that are down ("we'll be right back").

Dynamic, uncached endpoints (checkout, login) will still fail, so pair with multi-region origins for true HA.`,
      },
    ],
  },
];
