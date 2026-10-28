module.exports = {
  slug: 'nextjs',
  title: 'Next.js',
  subtitle: 'SSR, SSG, App Router, caching',
  description: 'Next.js interview questions: rendering strategies, App Router, server components, data fetching and caching, routing, middleware, SEO and deployment.',
  category: 'frameworks',
  roles: ['frontend', 'fullstack'],
  icon: 'rocket',
  color: '#111827',
  order: 21,
  topics: [
    {
      slug: 'rendering',
      title: 'Rendering Strategies',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain CSR, SSR, SSG and ISR.',
          e: `
- **CSR (Client-Side Rendering):** browser downloads JS, then renders and fetches data. **Pro:** Rich interactivity. **Con:** Slow first paint, weaker SEO.
- **SSR (Server-Side Rendering):** HTML is rendered **per request** on the server. **Pro:** Fresh data + SEO. **Con:** Server cost, slower TTFB than static.
- **SSG (Static Site Generation):** HTML generated **at build time**, served from a CDN. **Pro:** Fastest, cheap. **Con:** Data can be stale until rebuild.
- **ISR (Incremental Static Regeneration):** static pages regenerated in the background after a revalidate interval or on-demand. **Pro:** Static speed + reasonably fresh data.

Next.js lets you choose per route (and with the App Router, per fetch / segment). **Streaming SSR** with Suspense sends HTML progressively.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which rendering strategy is best for a marketing blog whose content changes a few times a day?',
          o: ['WebSockets pushing each new post live', 'SSR on every request with no caching', 'Pure CSR, fetching posts in useEffect', 'SSG with ISR or on-demand revalidation'],
          a: 3,
          e: 'Static pages are fastest and SEO-friendly; revalidation keeps them fresh without per-request rendering.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is hydration?',
          o: ['Attaching React event handlers and state to server-rendered HTML on the client', 'Fetching data on the server and streaming it into the page as JSON before React loads', 'Compressing images and fonts on the server before the page is sent', 'Caching API responses in the browser so revisits load instantly'],
          a: 0,
          e: 'Hydration errors occur when server HTML differs from the first client render (e.g. using Date.now() or window during render).',
        },
        {
          t: 'mcq', l: 3,
          q: 'What causes a hydration mismatch error?',
          o: ['Calling a Server Action from a form before the page has finished loading', 'Server and client rendering different output, e.g. Math.random(), new Date(), window checks', 'Using CSS modules, whose class names are hashed differently on the server and in the browser', 'Calling useState in a component that is also rendered on the server'],
          a: 1,
          e: 'Move browser-only logic into useEffect, use suppressHydrationWarning for intentional differences (timestamps), or render client-only components with dynamic(..., { ssr: false }).',
        },
      ],
    },
    {
      slug: 'app-router',
      title: 'App Router & Server Components',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are the key differences between the Pages Router and the App Router?',
          e: `
| | Pages Router (\`pages/\`) | App Router (\`app/\`) |
|---|---|---|
| Components | Client components by default | **Server Components** by default |
| Data fetching | getServerSideProps, getStaticProps | \`async\` components + \`fetch\` with caching options |
| Layouts | _app / _document | Nested \`layout.js\`, \`template.js\` |
| Loading/errors | Manual | \`loading.js\`, \`error.js\`, \`not-found.js\` |
| Mutations | API routes | **Server Actions** + Route Handlers |
| Streaming | Limited | Built-in with Suspense |

The App Router is the recommended approach for new projects.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'How do you mark a component as a Client Component in the App Router?',
          o: ['Export const client = true from the component file', 'Name the file Client.jsx so Next.js detects it', 'Wrap the component in a <Client> boundary element in layout', 'Add the "use client" directive at the top of the file'],
          a: 3,
          e: 'Needed when the component uses state, effects, event handlers or browser APIs. Everything it imports becomes part of the client bundle.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What are Server Actions?',
          o: ['Async functions marked "use server" that run on the server, callable for mutations', 'Edge middleware functions that run before every request reaches a page or an API route', 'Webhook handlers that receive events from external services like Stripe', 'Scheduled cron jobs defined in the app folder that run on the server'],
          a: 0,
          e: 'They remove the need for separate API routes for many mutations and work with progressive enhancement. Always validate input and check auth inside them.',
        },
        {
          t: 'qa', l: 2,
          q: 'How does file-based routing work in the App Router?',
          e: `
~~~
app/
  layout.tsx            -> root layout (html, body)
  page.tsx              -> /
  dashboard/
    layout.tsx          -> shared dashboard layout
    page.tsx            -> /dashboard
    loading.tsx         -> Suspense fallback
    error.tsx           -> error boundary
  blog/[slug]/page.tsx  -> /blog/:slug (dynamic segment)
  shop/[...path]/page.tsx -> catch-all
  (marketing)/about/page.tsx -> route group, URL is /about
  api/users/route.ts    -> Route Handler (GET, POST...)
~~~
Use \`generateStaticParams\` to pre-render dynamic routes at build time and \`generateMetadata\` for SEO tags.`,
        },
      ],
    },
    {
      slug: 'data-caching',
      title: 'Data Fetching & Caching',
      questions: [
        {
          t: 'qa', l: 3,
          q: 'Explain caching and revalidation in the Next.js App Router.',
          e: `
Next.js has several cache layers:
- **Request memoization:** identical \`fetch\` calls in one render are deduped.
- **Data cache:** results of \`fetch\` persisted across requests/deploys when opted in (\`cache: 'force-cache'\` or \`next: { revalidate: 60 }\`).
- **Full route cache:** statically rendered routes are cached as HTML/RSC payload.
- **Router cache (client):** visited segments cached in the browser during navigation.

**Revalidation**
- Time-based: \`fetch(url, { next: { revalidate: 3600 } })\` or \`export const revalidate = 3600\`
- On-demand: \`revalidatePath('/blog')\`, \`revalidateTag('posts')\` after a mutation
- Opt out: \`cache: 'no-store'\`, \`export const dynamic = 'force-dynamic'\`, or using \`cookies()\`/\`headers()\`

Defaults changed across versions (Next 15 made fetch uncached by default) – always check the version.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'After a user creates a post via a Server Action, how do you make the /posts page show it immediately?',
          o: ['Clear the user\'s browser cookies so the cache is skipped', 'Wrap the redirect in a setTimeout until the database write is complete', 'Call revalidatePath("/posts") or revalidateTag("posts") in the action', 'Restart the server so the page is rendered again'],
          a: 2,
          e: 'On-demand revalidation purges the cached data/route so the next request re-renders with fresh data.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does Next.js Middleware run on, and what is it good for?',
          o: ['It runs inside the database layer and is good for validating queries', 'It runs only at build time and is good for generating static pages', 'It runs before a request completes – good for auth redirects, rewrites, i18n, headers', 'It runs in the browser after the page loads and is good for animations and page transitions'],
          a: 2,
          e: 'Keep middleware fast; it executes on matching requests before rendering.',
        },
      ],
    },
    {
      slug: 'optimization-seo',
      title: 'Optimization, SEO & Deployment',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What does the next/image component provide?',
          o: ['Only lazy loading; resizing and formats must be handled by a CDN', 'Automatic resizing, modern formats (WebP/AVIF), lazy loading, no layout shift', 'SVG animations and sprite sheets generated automatically from regular PNG and JPEG images', 'In-browser image editing such as cropping, filters and rotation'],
          a: 1,
          e: 'It serves responsive images through an optimization pipeline and reserves space to prevent CLS.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you handle SEO in Next.js?',
          e: `
- Server-render or statically generate pages so crawlers get full HTML
- **Metadata API:** \`export const metadata = { title, description, openGraph }\` or \`generateMetadata()\` for dynamic pages
- \`sitemap.ts\` and \`robots.ts\` route files
- Semantic HTML, proper headings, canonical URLs
- Structured data (JSON-LD)
- Fast Core Web Vitals: next/image, next/font (no layout shift), code splitting
- Clean, descriptive URLs with dynamic routes`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is next/font recommended for loading fonts?',
          o: ['It self-hosts fonts at build time, avoids external requests and prevents layout shift', 'It converts fonts to images so text renders the same on every device', 'It bundles extra font families so you do not need Google Fonts', 'It is required for Tailwind CSS to apply font-family utility classes and load web fonts at runtime'],
          a: 0,
          e: 'Fonts are downloaded at build time and served with your assets, with size-adjust fallbacks to reduce CLS.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: An e-commerce product page must be SEO friendly, load fast, and show real-time stock. How do you render it in Next.js?',
          e: `
- **Product details** (title, description, images, price): statically generated with ISR / tag-based revalidation when the product is edited -> instant loads from CDN, great SEO.
- **Stock & personalized data** (cart, recommendations): rendered dynamically – either a **Client Component** fetching \`/api/stock\` with SWR polling, or a Suspense-wrapped dynamic server component streamed in (Partial Prerendering).
- **Images:** next/image with priority for the hero image (LCP).
- **Metadata:** generateMetadata with Open Graph + JSON-LD Product schema.
- **Add to cart:** Server Action with optimistic UI (\`useOptimistic\`).
- Cache API responses at the edge where possible.`,
        },
      ],
    },
  ],
};
