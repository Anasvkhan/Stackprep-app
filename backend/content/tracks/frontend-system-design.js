module.exports = {
  slug: 'frontend-system-design',
  title: 'Frontend System Design',
  subtitle: 'Architecture of large web apps',
  description: 'Frontend system design: component architecture, state, data fetching, rendering strategy, performance, offline support and classic design questions (news feed, autocomplete, chat UI).',
  category: 'system-design',
  roles: ['frontend', 'fullstack'],
  icon: 'view_quilt',
  color: '#EC4899',
  order: 3,
  topics: [
    {
      slug: 'framework',
      title: 'Approach & Architecture',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you approach a frontend system design interview?',
          e: `
A useful framework (**RADIO**):
1. **R – Requirements:** features, devices, users, offline needs, accessibility, i18n, scale of data.
2. **A – Architecture:** high-level components (view, controller/state, client store, API layer, service worker) and how they interact.
3. **D – Data model:** client-side entities, normalized store shape, what is server state vs UI state.
4. **I – Interface (API):** endpoints/GraphQL queries between client and server, pagination, real-time channels.
5. **O – Optimizations & deep dives:** performance (rendering, bundle, network), accessibility, security (XSS, CSRF), error handling, testing, monitoring.`,
        },
        {
          t: 'qa', l: 3,
          q: 'What are micro-frontends? When are they a good idea?',
          e: `
**Micro-frontends** split a large web app into independently developed and deployed frontend pieces owned by different teams (e.g. checkout, search, account).

**Integration approaches**
- Build-time packages (simple, but coupled deploys)
- Runtime: **Module Federation** (Webpack/Rspack), import maps, web components, iframes
- Server-side/edge composition

**Pros:** team autonomy, independent deploys, incremental migration from legacy.
**Cons:** duplicated dependencies (bundle size), inconsistent UX, shared state/routing complexity, operational overhead.

Use only for large orgs with many teams; a well-structured monorepo is often enough.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Why normalize data in a client-side store (e.g. { users: { byId, allIds } })?',
          o: ['To use less CSS', 'To avoid duplicated entities so an update in one place is reflected everywhere and lookups are O(1)', 'Because JSON requires it', 'To enable SSR'],
          a: 1,
          e: 'Nested duplicated data leads to inconsistent UI after updates. Redux Toolkit createEntityAdapter and Apollo cache normalize automatically.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which is the best protection against XSS in a frontend app?',
          o: ['Hiding the source code', 'Escaping/encoding output by default (frameworks do this), avoiding dangerouslySetInnerHTML/innerHTML with user input or sanitizing with DOMPurify, plus a strict Content-Security-Policy', 'Using HTTPS only', 'Minifying JavaScript'],
          a: 1,
          e: 'XSS injects scripts via untrusted content. Framework auto-escaping, sanitization and CSP form defense in depth.',
        },
      ],
    },
    {
      slug: 'design-questions',
      title: 'Classic Frontend Design Questions',
      questions: [
        {
          t: 'scenario', l: 3,
          q: 'Design a news feed UI (like Facebook/Twitter) with infinite scroll.',
          e: `
**Requirements:** infinite scroll, post creation, likes/comments, images/videos, new posts indicator, works on slow networks.

**Architecture**
- \`FeedPage\` -> \`FeedList\` (virtualized) -> \`PostCard\` (header, media, actions)
- Server state via TanStack Query/Apollo with **cursor-based pagination** (\`GET /feed?cursor=...&limit=20\`)
- Normalized cache so a like updates the post wherever it appears

**Key techniques**
- **IntersectionObserver** sentinel to load the next page before reaching the end
- **List virtualization** to keep DOM small for thousands of posts
- **Optimistic updates** for likes; rollback on error
- **Lazy-load media** with placeholders/blurhash; reserve aspect ratio (no CLS)
- **New posts:** poll or SSE/WebSocket -> show "N new posts" pill instead of shifting content
- **Restore scroll position** when navigating back
- Accessibility: feed role, keyboard navigation; error and empty states`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Design an autocomplete / typeahead component.',
          e: `
**Requirements:** suggestions as user types, keyboard navigation, accessible, fast, handles slow networks.

**Behavior**
- **Debounce** input (~200-300ms); minimum query length
- **Cancel stale requests** (AbortController) or ignore out-of-order responses
- **Cache** results per query in memory (LRU) – instant results on backspace
- Show loading, empty and error states

**Accessibility (WAI-ARIA combobox)**
- \`role="combobox"\`, \`aria-expanded\`, \`aria-controls\`, \`aria-activedescendant\`
- Listbox \`role="listbox"\` with \`role="option"\` items
- Arrow keys, Enter to select, Escape to close

**Performance**
- Highlight matched text efficiently, limit results (~10)
- Virtualize if many results

**API:** \`GET /search/suggest?q=iph&limit=10\` backed by a trie/Elasticsearch completion suggester.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Design the frontend of a chat application (like WhatsApp Web).',
          e: `
**Components:** ConversationList, ChatWindow (virtualized MessageList, Composer), presence indicators, notifications.

**Real-time:** a single **WebSocket** connection with reconnection (exponential backoff + jitter), heartbeats, and resync of missed messages using the last message id after reconnect.

**Data**
- Normalized store: conversations, messages by conversation (paginated upward), users
- **Optimistic send:** show message immediately with \`clientId\` and status (sending -> sent -> delivered -> read); reconcile with server id
- Persist recent chats in **IndexedDB** for instant load and offline reading; queue outgoing messages offline

**UX/perf**
- Reverse infinite scroll for history; keep scroll anchored when older messages load
- Typing indicators throttled; unread counts; tab title/notifications API
- Media upload via pre-signed URLs with progress`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you make a web app work offline?',
          e: `
- **Service Worker** intercepts network requests:
  - Cache-first for static assets (app shell)
  - Network-first or stale-while-revalidate for API data
- **Cache Storage API** for responses, **IndexedDB** for structured data
- **Background Sync** to replay queued writes when back online
- Show online/offline status (\`navigator.onLine\`, events) and conflict resolution strategy
- Web App Manifest for installable **PWA**
- Tools: Workbox simplifies caching strategies.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'For a dashboard showing live stock prices that only flow from server to client, which transport is simplest?',
          o: ['Long polling every 100ms', 'Server-Sent Events (EventSource)', 'WebRTC', 'Email'],
          a: 1,
          e: 'SSE is one-way, over HTTP, auto-reconnects and is easy to scale through proxies.',
        },
      ],
    },
  ],
};
