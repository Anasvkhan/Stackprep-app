module.exports = {
  slug: 'computer-networks',
  title: 'Computer Networks',
  subtitle: 'OSI, TCP/IP, HTTP, TLS',
  description: 'Networking interview questions: OSI and TCP/IP models, TCP vs UDP, handshakes, IP addressing, HTTP/HTTPS, TLS, WebSockets and common protocols.',
  category: 'fundamentals',
  roles: ['software-engineer', 'backend', 'devops', 'fullstack'],
  icon: 'lan',
  color: '#0284C7',
  order: 64,
  topics: [
    {
      slug: 'models-transport',
      title: 'OSI Model, TCP & UDP',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the OSI model layers.',
          e: `
| # | Layer | Purpose | Examples |
|---|---|---|---|
| 7 | Application | Network services to apps | HTTP, DNS, SMTP, FTP |
| 6 | Presentation | Encoding, encryption, compression | TLS (often placed here), JPEG |
| 5 | Session | Sessions/dialogs | RPC sessions |
| 4 | Transport | End-to-end delivery, ports | TCP, UDP |
| 3 | Network | Routing between networks, logical addressing | IP, ICMP |
| 2 | Data link | Frames on a local link, MAC addresses | Ethernet, Wi-Fi, switches |
| 1 | Physical | Bits over the medium | Cables, radio |

The practical **TCP/IP model** has 4 layers: Application, Transport, Internet, Link.`,
        },
        {
          t: 'qa', l: 1,
          q: 'TCP vs UDP?',
          e: `
| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (handshake) | Connectionless |
| Reliability | Guaranteed delivery, retransmissions | Best effort, may lose packets |
| Ordering | In order | No ordering |
| Flow/congestion control | Yes | No |
| Overhead | Higher (20+ byte header, ACKs) | Low (8 byte header) |
| Use cases | Web (HTTP/1-2), email, file transfer, databases | Video calls, gaming, DNS, streaming, QUIC/HTTP3 |`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the TCP three-way handshake and connection termination.',
          e: `
**Handshake (open)**
1. Client -> **SYN** (seq = x)
2. Server -> **SYN-ACK** (seq = y, ack = x + 1)
3. Client -> **ACK** (ack = y + 1) -> connection established

**Termination (four-way)**
1. A -> FIN; 2. B -> ACK; 3. B -> FIN; 4. A -> ACK, then A waits in **TIME_WAIT** (2 × MSL) to handle delayed packets.

Why it matters: each new connection costs a round trip (plus TLS), so **keep-alive** and connection pooling improve latency. SYN floods exploit half-open connections (mitigated by SYN cookies).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which mechanism prevents a fast sender from overwhelming a slow receiver in TCP?',
          o: ['The three-way handshake', 'Congestion control (congestion window)', 'Checksum verification on each segment', 'Flow control (receiver window)'],
          a: 3,
          e: 'Flow control protects the receiver (advertised window). Congestion control (slow start, AIMD, BBR) protects the network.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which port does HTTPS use by default?',
          o: ['80', '22', '8080', '443'],
          a: 3,
          e: 'HTTP 80, HTTPS 443, SSH 22, DNS 53, SMTP 25/587, PostgreSQL 5432, MySQL 3306, Redis 6379, MongoDB 27017.',
        },
      ],
    },
    {
      slug: 'ip-routing',
      title: 'IP, Subnets & Routing',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is CIDR notation? How many IPs are in a /24 and a /16?',
          e: `
**CIDR** writes an IP range as \`address/prefix-length\`; the prefix is the number of fixed network bits.

- \`10.0.1.0/24\` -> 32 - 24 = 8 host bits -> 2⁸ = **256 addresses**
- \`10.0.0.0/16\` -> 2¹⁶ = **65,536 addresses**
- \`/32\` = single IP; \`0.0.0.0/0\` = everything

In AWS, 5 addresses per subnet are reserved. **Private ranges (RFC 1918):** 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does NAT (Network Address Translation) do?',
          o: ['Encrypts traffic between the private network and the internet', 'Maps private IP addresses to a public IP (and ports) so many devices share one address', 'Resolves domain names to IP addresses for devices on the local network and caches them on the router', 'Assigns unique MAC addresses to devices when they join the network'],
          a: 1,
          e: 'Home routers and cloud NAT gateways let private hosts reach the internet without being directly reachable.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which protocol automatically assigns IP addresses to devices on a network?',
          o: ['DNS', 'ARP', 'DHCP', 'FTP'],
          a: 2,
          e: 'ARP maps IP addresses to MAC addresses on a local network; DNS maps names to IPs.',
        },
        {
          t: 'mcq', l: 2,
          q: 'IPv4 vs IPv6?',
          o: ['IPv6 uses 32-bit addresses, while IPv4 uses 128-bit addresses', 'Both use 64-bit addresses; IPv6 only adds built-in encryption', 'IPv4 uses 32-bit addresses; IPv6 uses 128-bit addresses, removing the need for NAT', 'IPv6 is a mobile-only protocol with 128-bit addresses, while IPv4 is used for all wired networks'],
          a: 2,
          e: 'IPv4 exhaustion is why NAT is ubiquitous.',
        },
      ],
    },
    {
      slug: 'http-tls',
      title: 'HTTP, HTTPS & TLS',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does HTTPS / TLS work?',
          e: `
**HTTPS = HTTP over TLS**, providing confidentiality, integrity and server authentication.

**TLS 1.3 handshake (simplified, 1 round trip)**
1. **ClientHello:** supported ciphers + key share (ECDHE public key).
2. **ServerHello:** chosen cipher + its key share, **certificate** and signature, Finished.
3. Client **verifies the certificate** chain up to a trusted CA, checks hostname and validity.
4. Both derive the same **symmetric session keys** from the ECDHE exchange (**forward secrecy**).
5. Application data is encrypted with fast symmetric encryption (AES-GCM/ChaCha20).

Asymmetric crypto is used to authenticate and agree on keys; symmetric crypto encrypts the bulk data. TLS 1.3 also supports 0-RTT resumption.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why does TLS use both asymmetric and symmetric encryption?',
          o: ['Asymmetric crypto establishes and authenticates keys; symmetric is much faster for bulk data', 'Asymmetric crypto is faster for bulk data, so symmetric is used only for the initial handshake and signing', 'Only for backward compatibility with old browsers that lack asymmetric support', 'Symmetric crypto is more secure, so asymmetric is used only for logging'],
          a: 0,
          e: 'Public-key operations are expensive, so they are used only during the handshake.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is HSTS?',
          o: ['A certificate type that covers all subdomains of a site and forces them to use TLS', 'A response header telling browsers to always use HTTPS for the domain', 'A hashing algorithm used to sign TLS certificates', 'A DNS record that points a domain to its HTTPS server'],
          a: 1,
          e: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are cookies and their security attributes?',
          e: `
Cookies are small key-value data the server sets via \`Set-Cookie\`; the browser sends them back automatically on matching requests.

~~~
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
~~~
- **HttpOnly:** not accessible from JavaScript (protects against XSS theft)
- **Secure:** only sent over HTTPS
- **SameSite:** \`Strict\` / \`Lax\` / \`None\` – controls cross-site sending (CSRF protection); \`None\` requires Secure
- **Domain/Path:** scope
- **Expires/Max-Age:** persistence (otherwise session cookie)`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is HTTP keep-alive and why does it matter for performance?',
          o: ['It reuses a TCP (and TLS) connection for many requests, avoiding repeated handshakes', 'It caches full responses on the client so repeat requests skip the network and the server entirely', 'It keeps the server process alive between deployments', 'It keeps cookies alive forever so users never have to log in again'],
          a: 0,
          e: 'Persistent connections cut latency significantly; HTTP/2 multiplexes many requests over one connection.',
        },
      ],
    },
  ],
};
