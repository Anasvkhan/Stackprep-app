module.exports = {
  slug: 'web-security',
  title: 'Web Security',
  subtitle: 'OWASP Top 10, XSS, CSRF, injection',
  description: 'Web security interview questions: OWASP Top 10, XSS, CSRF, SQL injection, authentication flaws, CORS, CSP, secure headers, secrets and secure coding practices.',
  category: 'fundamentals',
  roles: ['backend', 'frontend', 'fullstack', 'devops'],
  icon: 'security',
  color: '#DC2626',
  order: 65,
  topics: [
    {
      slug: 'common-attacks',
      title: 'Common Attacks',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is XSS (Cross-Site Scripting) and how do you prevent it?',
          e: `
**XSS:** an attacker injects malicious JavaScript into pages viewed by other users, which runs with the victim's privileges (steal tokens, act as the user, deface pages).

**Types**
- **Stored:** script saved in the DB (comment, profile) and served to others
- **Reflected:** script in a URL parameter reflected in the response
- **DOM-based:** client-side JS writes untrusted data into the DOM (\`innerHTML\`)

**Prevention**
- **Output encoding/escaping** by default (React/Angular/Vue escape text automatically)
- Avoid \`innerHTML\`, \`dangerouslySetInnerHTML\`, \`v-html\` with user data; sanitize rich HTML with **DOMPurify**
- **Content-Security-Policy** to block inline/untrusted scripts
- **HttpOnly** cookies so scripts can't read session tokens
- Validate input (but escaping on output is the real defense)`,
        },
        {
          t: 'qa', l: 1,
          q: 'What is CSRF and how do you prevent it?',
          e: `
**CSRF (Cross-Site Request Forgery):** a malicious site makes the victim's browser send an authenticated request to your site (cookies are attached automatically), e.g. a hidden form that transfers money.

**Prevention**
- **SameSite cookies** (\`Lax\` or \`Strict\`) – modern default protection
- **CSRF tokens:** unpredictable token in forms/headers validated by the server (synchronizer token or double-submit cookie)
- Require custom headers for APIs (e.g. \`X-Requested-With\`) – simple cross-site forms can't set them
- Check \`Origin\`/\`Referer\` headers
- Use non-GET methods for state changes
- APIs using \`Authorization: Bearer\` tokens (not cookies) aren't vulnerable to classic CSRF`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which is the correct way to prevent SQL injection?',
          o: ['Escaping quotes manually', 'Parameterized queries / prepared statements (or a safe ORM/query builder)', 'Hiding error messages only', 'Using POST instead of GET'],
          a: 1,
          e: 'db.query("SELECT * FROM users WHERE email = $1", [email]) – user input is sent as data, never as SQL code.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is an IDOR (Insecure Direct Object Reference)?',
          o: ['A database index', 'Accessing another user\'s data by changing an identifier (e.g. /api/orders/1002) because the server does not check ownership', 'A type of XSS', 'A DNS attack'],
          a: 1,
          e: 'Always authorize per resource: verify the authenticated user owns or may access that object (Broken Access Control is #1 in OWASP Top 10).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is clickjacking and how is it prevented?',
          o: ['Stealing clicks via ads', 'Embedding your site in an invisible iframe to trick users into clicking; prevented with X-Frame-Options or CSP frame-ancestors', 'A CSS bug', 'A DDoS attack'],
          a: 1,
          e: 'Content-Security-Policy: frame-ancestors \'none\' (or \'self\') is the modern control.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your app has a "fetch image from URL" feature. What security risks exist and how do you mitigate them?',
          e: `
**Main risk: SSRF** – attackers supply URLs pointing to internal resources:
- \`http://169.254.169.254/latest/meta-data/\` (cloud credentials!)
- \`http://localhost:6379\`, internal admin panels, databases

**Mitigations**
- Allowlist domains/schemes (only \`https\`), reject IP literals and private/link-local ranges **after DNS resolution** (beware DNS rebinding – resolve once, connect to that IP)
- Disable redirects or re-validate each redirect
- Run fetchers in an isolated network segment with egress filtering
- Use IMDSv2 on AWS (requires session token)
- Limit response size/time, validate content type, re-encode images
- Log and rate limit`,
        },
      ],
    },
    {
      slug: 'owasp-auth',
      title: 'OWASP Top 10 & Authentication',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is the OWASP Top 10? Name the main categories.',
          e: `
The **OWASP Top 10** lists the most critical web application security risks (2021 edition):
1. **Broken Access Control** (IDOR, missing authorization)
2. **Cryptographic Failures** (weak encryption, plain-text sensitive data)
3. **Injection** (SQL, NoSQL, command, XSS)
4. **Insecure Design**
5. **Security Misconfiguration** (default creds, verbose errors, open buckets)
6. **Vulnerable and Outdated Components**
7. **Identification and Authentication Failures**
8. **Software and Data Integrity Failures** (unsigned updates, insecure CI/CD, deserialization)
9. **Security Logging and Monitoring Failures**
10. **Server-Side Request Forgery (SSRF)**`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which password hashing approach is correct?',
          o: ['SHA-256 without salt', 'MD5 with salt', 'bcrypt, scrypt or Argon2id (slow, salted, adaptive)', 'AES encryption'],
          a: 2,
          e: 'Fast hashes allow billions of guesses per second on GPUs. Adaptive algorithms let you raise the cost factor over time.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you secure a login system?',
          e: `
- Hash passwords with **Argon2id/bcrypt**; never store plaintext
- **Rate limit** and lock out/slow down after failed attempts; CAPTCHA after N failures
- **MFA** (TOTP, WebAuthn/passkeys)
- Generic error messages ("invalid email or password") to avoid user enumeration
- Secure session handling: HttpOnly/Secure/SameSite cookies, rotate session id on login, short-lived tokens + refresh rotation
- Check breached passwords (HaveIBeenPwned k-anonymity API); enforce reasonable length rather than odd complexity rules
- Secure password reset: single-use, short-lived random tokens; don't reveal whether the email exists
- Log and alert on suspicious activity (new device, impossible travel)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does a Content-Security-Policy header mainly protect against?',
          o: ['SQL injection', 'XSS and data injection by restricting which scripts, styles and resources the page can load', 'DDoS', 'Brute-force login'],
          a: 1,
          e: "e.g. Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; object-src 'none'.",
        },
        {
          t: 'mcq', l: 2,
          q: 'Encryption vs hashing vs encoding?',
          o: ['All are the same', 'Encryption is reversible with a key (confidentiality); hashing is one-way (integrity, passwords); encoding (Base64) is a reversible format change with no security', 'Base64 is encryption', 'Hashing is reversible'],
          a: 1,
          e: 'Never treat Base64 as protection; JWT payloads are encoded, not encrypted.',
        },
      ],
    },
    {
      slug: 'secure-practices',
      title: 'Secure Development Practices',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How should applications manage secrets?',
          e: `
- Never hard-code secrets or commit them (.env in .gitignore, secret scanning with push protection)
- Store in a **secret manager** (HashiCorp Vault, AWS Secrets Manager/SSM, GCP Secret Manager, Azure Key Vault) and inject at runtime
- Prefer **short-lived, automatically rotated credentials** (IAM roles, OIDC federation, dynamic DB credentials)
- Least privilege per service; separate secrets per environment
- Encrypt at rest with KMS; audit access
- Rotate immediately if leaked`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the principle of least privilege?',
          o: ['Give everyone admin to avoid blockers', 'Grant users and services only the minimum permissions they need to do their job', 'Use the fewest servers possible', 'Hide the login page'],
          a: 1,
          e: 'Limits the blast radius when an account or service is compromised.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a software supply chain attack?',
          o: ['Stealing delivery trucks', 'Compromising dependencies, build systems or packages (e.g. malicious npm package, typosquatting) to inject malicious code into applications', 'A DDoS on suppliers', 'Phishing emails only'],
          a: 1,
          e: 'Defenses: lockfiles, dependency review, SCA tools, signed artifacts (Sigstore), SBOMs, minimal dependencies, pinned CI actions.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: You are doing a security review of a new REST API before launch. What do you check?',
          e: `
- **AuthN:** every endpoint requires auth unless explicitly public; token validation (signature, expiry, audience)
- **AuthZ:** object-level checks (no IDOR), role checks, admin endpoints protected
- **Input validation:** schemas, size limits, type checks; parameterized queries; file upload validation
- **Output:** no sensitive fields leaked (password hashes, internal ids), generic error messages, no stack traces
- **Transport:** HTTPS only, HSTS, secure cookies
- **Headers:** CSP (for HTML), X-Content-Type-Options, CORS allowlist
- **Rate limiting** and abuse prevention
- **Secrets** in a secret manager; least-privilege DB/cloud credentials
- **Dependencies** scanned; containers non-root
- **Logging & monitoring** of security events; audit trails
- Run DAST (OWASP ZAP), SAST, and consider a pentest`,
        },
      ],
    },
  ],
};
