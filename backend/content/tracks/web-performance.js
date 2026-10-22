module.exports = {
  slug: 'web-performance',
  title: 'Browser & Web Performance',
  subtitle: 'Rendering pipeline, Core Web Vitals',
  description: 'How browsers work and how to make websites fast: critical rendering path, Core Web Vitals, caching, bundling, images and performance debugging.',
  category: 'fundamentals',
  roles: ['frontend', 'fullstack'],
  icon: 'speed',
  color: '#F97316',
  order: 62,
  topics: [
    {
      slug: 'how-browsers-work',
      title: 'How Browsers Work',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain the critical rendering path.',
          e: `
Steps from bytes to pixels:
1. **Parse HTML -> DOM**
2. **Parse CSS -> CSSOM** (CSS is **render-blocking**)
3. **Execute JS** (parser-blocking unless \`defer\`/\`async\`)
4. **Render tree** = DOM + CSSOM (visible nodes only)
5. **Layout** – compute geometry
6. **Paint** – fill pixels into layers
7. **Composite** – GPU combines layers

**Optimizations:** inline critical CSS, defer non-critical JS, minimize render-blocking resources, preload key assets (\`<link rel="preload">\`), reduce DOM size.`,
        },
        {
          t: 'qa', l: 2,
          q: 'What happens when you type a URL and press Enter? (full answer)',
          e: `
1. **URL parsing**, HSTS check, browser cache / service worker check
2. **DNS resolution** (browser -> OS -> resolver -> root -> TLD -> authoritative)
3. **TCP handshake** (or QUIC for HTTP/3) and **TLS handshake** (certificate validation, key exchange)
4. **HTTP request** sent (cookies, headers); may hit CDN edge, load balancer, app server
5. **Server processing** -> response (HTML) with status, headers, caching directives
6. **Browser parses HTML**, discovers CSS/JS/images (preload scanner), fetches them in parallel
7. **Critical rendering path:** DOM, CSSOM, JS execution, layout, paint, composite
8. **Interactive:** JS hydrates/attaches handlers; further fetches (XHR/fetch)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which resource type is render-blocking by default?',
          o: ['Images', 'CSS stylesheets in the head', 'Fonts with font-display: swap', 'Scripts with async'],
          a: 1,
          e: 'The browser will not render until CSSOM is built (to avoid unstyled flashes). Inline critical CSS and load the rest asynchronously.',
        },
      ],
    },
    {
      slug: 'core-web-vitals',
      title: 'Core Web Vitals & Optimization',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What are the Core Web Vitals?',
          e: `
Google's user-centric performance metrics:
- **LCP (Largest Contentful Paint):** loading – when the largest image/text block renders. Good: **≤ 2.5s**.
- **INP (Interaction to Next Paint):** responsiveness – latency of user interactions (replaced FID in 2024). Good: **≤ 200ms**.
- **CLS (Cumulative Layout Shift):** visual stability – unexpected layout movement. Good: **≤ 0.1**.

Other useful metrics: TTFB, FCP, TBT. Measure in the field (CrUX, web-vitals library, RUM) and in the lab (Lighthouse).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Images without width/height attributes load and push content down. Which metric does this hurt?',
          o: ['LCP', 'INP', 'CLS', 'TTFB'],
          a: 2,
          e: 'Reserve space with width/height or aspect-ratio. Same for ads, embeds and late-loading fonts (use font-display and size-adjust).',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you improve LCP?',
          e: `
- **Fast server response (TTFB):** CDN, caching, SSR/SSG, edge rendering
- **Prioritize the LCP resource:** \`<link rel="preload">\` or \`fetchpriority="high"\` on the hero image; never lazy-load the LCP image
- **Optimize images:** modern formats (AVIF/WebP), correct sizes with srcset, compression
- **Remove render-blocking resources:** critical CSS inline, defer JS
- **Reduce JS** so client-side rendering doesn't delay content
- Preconnect to required origins (\`<link rel="preconnect">\`)`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you improve INP (responsiveness)?',
          e: `
- **Break up long tasks** (> 50ms): yield to the main thread (\`scheduler.yield()\`, \`setTimeout\`), chunk work
- **Reduce JS execution:** code split, remove unused code, avoid heavy third-party scripts
- **Move heavy work to Web Workers**
- Avoid expensive re-renders on input (debounce, React transitions, virtualization)
- Avoid layout thrashing in event handlers
- Show immediate visual feedback, then do the heavy work`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does loading="lazy" on an <img> do?',
          o: ['Compresses the image', 'Defers loading offscreen images until they are near the viewport', 'Loads the image first', 'Converts the image to WebP'],
          a: 1,
          e: 'Great for below-the-fold images; never use it on the LCP/hero image.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is tree shaking?',
          o: ['Removing unused CSS classes at runtime', 'Eliminating unused exports from the JS bundle during build, based on static ES module imports', 'Shaking the DOM tree', 'Lazy loading routes'],
          a: 1,
          e: 'Bundlers (Webpack, Rollup, Vite/esbuild) remove dead code. CommonJS and side-effectful modules limit it.',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain browser HTTP caching for static assets.',
          e: `
- **Fingerprinted assets** (\`app.3f9a1c.js\`): \`Cache-Control: public, max-age=31536000, immutable\` – cache forever, new deploys change the file name.
- **HTML:** \`Cache-Control: no-cache\` (always revalidate) so users get new asset references after deploys.
- **Validation:** \`ETag\` / \`Last-Modified\` -> browser sends \`If-None-Match\` -> server replies \`304 Not Modified\`.
- **Service workers** can cache assets for offline/PWA use (stale-while-revalidate strategies).
- CDN caching for global delivery.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Lighthouse scores your React SPA 35 on mobile. Walk through your optimization plan.',
          e: `
1. **Analyze** Lighthouse/Performance panel + bundle analyzer: huge JS bundle? slow LCP? long tasks?
2. **JS:** route-based code splitting, lazy-load heavy components (charts, editors), remove/replace large libraries (moment -> date-fns), tree-shake, enable minification/compression (brotli).
3. **Rendering:** SSR/SSG (Next.js) or prerender the landing page for fast FCP/LCP.
4. **Images:** responsive, AVIF/WebP, lazy-load below the fold, preload the hero.
5. **Fonts:** self-host, \`font-display: swap\`, preload, subset.
6. **Third-party scripts:** defer, load after interaction, or move to web workers (Partytown).
7. **Caching:** long-lived immutable assets, CDN.
8. **Main thread:** fix long tasks, memoize expensive renders, virtualize lists.
9. **Monitor** real users (web-vitals -> analytics) and set performance budgets in CI.`,
        },
      ],
    },
  ],
};
