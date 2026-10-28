module.exports = {
  slug: 'react',
  title: 'React',
  subtitle: 'Hooks, rendering, state, performance',
  description: 'React interview questions: virtual DOM, reconciliation, hooks, state management, performance optimization, React 18/19 features, patterns and testing.',
  category: 'frameworks',
  roles: ['frontend', 'fullstack'],
  icon: 'web',
  color: '#0EA5E9',
  order: 20,
  topics: [
    {
      slug: 'fundamentals',
      title: 'Fundamentals & Rendering',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is the Virtual DOM and how does reconciliation work?',
          e: `
The **Virtual DOM** is a lightweight JS representation of the UI. On every state change React:
1. Re-renders components to produce a **new virtual tree**
2. **Diffs** it with the previous tree (reconciliation)
3. Applies the **minimal set of real DOM updates** (commit phase)

**Diffing heuristics (O(n))**
- Different element types -> tear down and rebuild the subtree
- Same type -> update changed props/attributes only
- Lists use **keys** to match children between renders

**Fiber** (React 16+) splits rendering into interruptible units of work, enabling concurrent features (transitions, Suspense).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Why are keys important when rendering lists?',
          o: ['They are required by screen readers to announce each list item', 'They apply unique styles to each list item without extra class names', 'They help React identify which items changed, were added or removed', 'They make lists sortable by letting React reorder items by key'],
          a: 2,
          e: 'Keys must be stable and unique among siblings (e.g. database ids).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is using the array index as a key problematic?',
          o: ['When items are reordered or inserted, indexes shift and state attaches to the wrong row', 'It causes infinite re-render loops whenever the list changes', 'React does not allow numbers as keys and throws a warning', 'Indexes are converted to strings on every render, which makes reconciling long lists slower'],
          a: 0,
          e: 'Index keys are fine only for static lists that never reorder.',
        },
        {
          t: 'qa', l: 1,
          q: 'What is the difference between state and props?',
          e: `
| | Props | State |
|---|---|---|
| Owner | Passed from parent | Owned by the component |
| Mutability | Read-only in the child | Updated via setState/useState setter |
| Purpose | Configure a component | Data that changes over time (user input, fetched data) |

Changing either triggers a re-render. Data flows **down** via props; events flow **up** via callback props.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'When does a React component re-render?',
          o: ['On every animation frame, about 60 times a second, even if nothing changed', 'Only when forceUpdate is called', 'Only when its props change', 'When its state changes, its parent re-renders, or a used context changes'],
          a: 3,
          e: 'A parent re-render re-renders all children by default, even if their props did not change, unless they are memoized (React.memo).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output after clicking the button once?',
          c: `function Counter() {
  const [count, setCount] = useState(0);
  const handle = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  return <button onClick={handle}>{count}</button>;
}`,
          o: ['1', '2', '3', '0'],
          a: 0,
          e: 'All three calls use the same stale `count` (0) from the render closure, so the state becomes 1. Use the updater form `setCount(c => c + 1)` to get 3.',
        },
        {
          t: 'qa', l: 2,
          q: 'Controlled vs uncontrolled components?',
          e: `
**Controlled:** form value lives in React state; every change goes through \`onChange\`.
~~~jsx
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />
~~~
**Pro:** Single source of truth, instant validation. **Con:** Re-render per keystroke.

**Uncontrolled:** the DOM keeps the value; read it with a ref when needed.
~~~jsx
const ref = useRef();
<input defaultValue="" ref={ref} />  // ref.current.value on submit
~~~
**Pro:** Less code, fewer renders (React Hook Form uses this approach). **Con:** Harder to react to every change.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is JSX?',
          o: ['A new JavaScript runtime that replaces Node.js for React', 'A CSS preprocessor for writing styles inside components', 'Syntax sugar that compiles to React.createElement / jsx() calls', 'A templating language that the browser understands and runs natively'],
          a: 2,
          e: 'Babel/TypeScript/SWC transform JSX into function calls that create React elements (plain objects).',
        },
      ],
    },
    {
      slug: 'hooks',
      title: 'Hooks',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What are the rules of hooks?',
          e: `
1. **Only call hooks at the top level** – not inside loops, conditions or nested functions. React relies on the **call order** to associate state with each hook.
2. **Only call hooks from React function components or custom hooks** (names starting with \`use\`).

The \`eslint-plugin-react-hooks\` plugin enforces these rules and checks effect dependency arrays.`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain useEffect: dependency array, cleanup and common mistakes.',
          e: `
\`useEffect(fn, deps)\` runs **after** the render is committed to the screen – for side effects (fetching, subscriptions, timers, DOM APIs).

- No deps array -> runs after **every** render
- \`[]\` -> runs once after mount (twice in development StrictMode to surface bugs)
- \`[a, b]\` -> runs when \`a\` or \`b\` change

**Cleanup** runs before the next effect and on unmount:
~~~jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(\`/api/users/\${id}\`, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [id]);
~~~
**Common mistakes**
- Missing dependencies -> stale values
- Objects/functions created each render in deps -> infinite loops
- Using effects for derived state (compute during render instead)
- Fetching without cancellation -> race conditions`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between useMemo and useCallback?',
          o: ['useMemo memoizes a computed value; useCallback memoizes a function reference', 'They are identical; useCallback is an alias for useMemo', 'useCallback memoizes values; useMemo memoizes function references', 'useMemo runs side effects after render, while useCallback runs them before the render'],
          a: 0,
          e: 'useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). Both are useful mainly when passing to memoized children or as effect dependencies.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is useRef commonly used for?',
          o: ['Accessing DOM nodes and keeping mutable values across renders without re-rendering', 'Triggering a re-render whenever the stored value changes', 'Fetching data once on mount and caching the response so later renders can reuse it', 'Sharing global state between components without a context provider'],
          a: 0,
          e: 'Changing ref.current does not re-render. Good for timers, previous values, DOM focus, and imperative APIs.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the difference between useEffect and useLayoutEffect?',
          o: ['useLayoutEffect only runs on the server during server-side rendering', 'There is no difference; both run after the browser paints', 'useEffect blocks painting until it finishes, while useLayoutEffect runs later in the background', 'useLayoutEffect runs after DOM mutations but before paint; useEffect runs after paint'],
          a: 3,
          e: 'Use useLayoutEffect for measuring layout and synchronously adjusting the DOM to avoid flicker. It blocks paint, so use sparingly.',
        },
        {
          t: 'qa', l: 2,
          q: 'When would you use useReducer instead of useState?',
          e: `
Use **useReducer** when:
- State is an object with multiple related fields
- The next state depends on the previous in complex ways
- Many event types update the same state (clear "actions")
- You want logic testable outside the component

~~~jsx
function reducer(state, action) {
  switch (action.type) {
    case 'added': return { ...state, items: [...state.items, action.item] };
    case 'removed': return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    default: return state;
  }
}
const [state, dispatch] = useReducer(reducer, { items: [] });
~~~`,
        },
        {
          t: 'qa', l: 2,
          q: 'Write a custom hook to fetch data with loading and error states.',
          e: `
~~~jsx
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => { if (error.name !== 'AbortError') setState({ data: null, loading: false, error }); });
    return () => controller.abort();
  }, [url]);

  return state;
}
~~~
In real apps prefer **TanStack Query / SWR**: caching, deduping, retries, background refetch, pagination.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is a "stale closure" in React hooks?',
          o: ['A memory leak caused by closures inside components that the browser never garbage collects', 'A callback or effect capturing old state/props because dependencies were not updated', 'A WebSocket connection that was closed but is still referenced in state', 'A component that never unmounts because a closure still references it'],
          a: 1,
          e: 'e.g. setInterval inside useEffect with [] always sees the initial state. Fix with correct deps, updater functions, or refs.',
        },
      ],
    },
    {
      slug: 'state-management',
      title: 'State Management & Context',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is the Context API and when should you NOT use it?',
          e: `
**Context** passes data deeply without prop drilling: theme, locale, authenticated user.

~~~jsx
const ThemeContext = createContext('light');
<ThemeContext.Provider value={theme}><App /></ThemeContext.Provider>
const theme = useContext(ThemeContext);
~~~
**Avoid for frequently changing, large global state:** every consumer re-renders when the value changes (no selectors). Mitigate by splitting contexts, memoizing the value, or use a state library (Zustand, Redux Toolkit, Jotai) with selectors.

**Server state** (API data) belongs in TanStack Query/SWR, not in context.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What are the three core principles of Redux?',
          o: ['Mutable state, many stores, and async reducers', 'Single source of truth, read-only state, pure reducers', 'Two-way data binding between the store and the UI', 'Components own all of their state and sync it to the store'],
          a: 1,
          e: 'Redux Toolkit is now the recommended way to write Redux (createSlice, Immer-powered "mutating" syntax, RTK Query).',
        },
        {
          t: 'qa', l: 2,
          q: 'Client state vs server state: why treat them differently?',
          e: `
**Client state:** UI-only data owned by the browser – modals open, form inputs, selected tab, theme. Use useState, context, Zustand.

**Server state:** data that lives on the server and is cached on the client – users, products, orders. Challenges: caching, deduping requests, staleness, background refetching, pagination, optimistic updates, invalidation after mutations.

Libraries like **TanStack Query, SWR, RTK Query, Apollo** solve server state; putting API data into Redux manually leads to lots of boilerplate and stale data bugs.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'A Context provider value is an object created inline: value={{ user, setUser }}. What problem does this cause?',
          o: ['It throws an error, since inline objects are not allowed in JSX props', 'Context stops working, because providers only accept primitive values', 'None; React deep-compares the object\'s contents before deciding to update the consumers', 'A new object each render makes all consumers re-render even if user is unchanged'],
          a: 3,
          e: 'Wrap it in useMemo(() => ({ user, setUser }), [user]) or split state and dispatch into separate contexts.',
        },
      ],
    },
    {
      slug: 'performance',
      title: 'Performance Optimization',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you optimize performance in a React application?',
          e: `
**Avoid unnecessary renders**
- \`React.memo\` for pure components, \`useMemo\`/\`useCallback\` for stable props (or React Compiler auto-memoization)
- Keep state close to where it is used; split contexts

**Reduce work**
- **Virtualize** long lists (react-window, TanStack Virtual)
- Debounce expensive inputs; \`useDeferredValue\` / \`startTransition\` for non-urgent updates

**Reduce bundle size**
- **Code splitting** with \`React.lazy\` + \`Suspense\`, route-based splitting
- Tree shaking, import only what you need, analyze bundles

**Loading**
- Lazy load images, use proper sizes/formats, prefetch routes
- SSR/SSG (Next.js) for faster first paint; server components

**Measure first:** React DevTools Profiler, Lighthouse, Web Vitals.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does React.memo do?',
          o: ['Stores component state in localStorage', 'Skips re-rendering when props are shallowly equal', 'Caches API responses made by the component', 'Memoizes all hooks used inside the component across renders'],
          a: 1,
          e: 'Shallow comparison means new object/array/function props break memoization unless they are stable.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which API marks a state update as non-urgent so typing stays responsive while a big list re-renders?',
          o: ['useLayoutEffect with a priority flag', 'startTransition / useTransition', 'flushSync', 'useEffect'],
          a: 1,
          e: 'Concurrent rendering lets React interrupt the transition render to handle urgent updates like keystrokes.',
        },
        {
          t: 'mcq', l: 1,
          q: 'How do you lazy load a component in React?',
          o: ['Render it inside a setTimeout so the module loads after the first paint', 'Call import("./Comp") inside useEffect and store it in state', 'Load it with require("./Comp") inside the render function', 'const Comp = React.lazy(() => import("./Comp")) inside <Suspense>'],
          a: 3,
          e: 'The component code is split into a separate chunk and loaded when first rendered.',
        },
      ],
    },
    {
      slug: 'modern-react',
      title: 'React 18/19, Patterns & Testing',
      questions: [
        {
          t: 'qa', l: 3,
          q: 'What are React Server Components (RSC)?',
          e: `
**Server Components** render **only on the server**; their code is never sent to the browser.

- Can be **async** and access databases/files directly
- Zero client JS for that component -> smaller bundles
- Can't use state, effects or browser APIs
- **Client Components** (\`'use client'\`) handle interactivity and can be nested inside server components

Used in Next.js App Router. Benefits: less JS, faster loads, data fetching close to the data source, secrets stay on the server.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does automatic batching in React 18 mean?',
          o: ['Multiple state updates in timeouts, promises and handlers become one re-render', 'CSS changes from several components are batched into one style recalculation per frame', 'Components are rendered in batches of 10 to keep the UI responsive', 'Network requests made during render are batched to the server'],
          a: 0,
          e: 'Before React 18 only updates inside React event handlers were batched.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is an Error Boundary?',
          o: ['A CSS boundary that stops styles leaking into child components', 'A try/catch block placed inside useEffect', 'A component that catches render errors in its child tree and shows a fallback', 'A server middleware that catches rendering errors before the page is sent'],
          a: 2,
          e: 'They are class components (componentDidCatch / getDerivedStateFromError) or via libraries like react-error-boundary. They do not catch errors in event handlers or async code.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are common React component patterns?',
          e: `
- **Container/presentational:** data-fetching logic separated from pure UI components.
- **Custom hooks:** reuse stateful logic (\`useAuth\`, \`useDebounce\`).
- **Compound components:** \`<Tabs><Tabs.List/><Tabs.Panel/></Tabs>\` sharing implicit state via context.
- **Render props:** pass a function to render (\`<DataSource render={(d) => ...} />\`).
- **Higher-order components (HOC):** \`withAuth(Component)\` – largely replaced by hooks.
- **Controlled/uncontrolled props** (like inputs) for flexible components.
- **Composition over inheritance:** \`children\` and slot props.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which is the recommended library for testing React components from the user\'s perspective?',
          o: ['Selenium only', 'Mocha only', 'React Testing Library', 'Enzyme'],
          a: 2,
          e: 'RTL encourages querying by role/label/text and testing behavior rather than implementation details. Use Playwright/Cypress for E2E.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: A dashboard re-renders the entire page on every keystroke in a search box at the top. How do you diagnose and fix it?',
          e: `
**Diagnose:** React DevTools Profiler -> "Highlight updates" and record a keystroke; see which components render and why ("props changed", "parent rendered").

**Likely cause:** the search state lives in the top-level page component, so every keystroke re-renders all widgets.

**Fixes**
1. **Move state down** – keep the input state inside a \`SearchBox\` component; only lift the debounced value.
2. **Debounce** the value that triggers filtering/fetching.
3. Wrap heavy widgets in \`React.memo\` and pass stable props (\`useCallback\`, \`useMemo\`).
4. Use \`useDeferredValue(query)\` for the expensive results list.
5. Split context so consumers subscribe only to what they need.
6. Virtualize large tables.`,
        },
      ],
    },
  ],
};
