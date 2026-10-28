module.exports = {
  slug: 'vue',
  title: 'Vue.js',
  subtitle: 'Reactivity, Composition API, Pinia',
  description: 'Vue.js interview questions: reactivity system, Options vs Composition API, components, directives, lifecycle, Pinia, Vue Router, Nuxt and performance.',
  category: 'frameworks',
  roles: ['frontend', 'fullstack'],
  icon: 'view_quilt',
  color: '#42B883',
  order: 23,
  topics: [
    {
      slug: 'reactivity',
      title: 'Reactivity & Composition API',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does Vue 3 reactivity work?',
          e: `
Vue 3 wraps state in **ES6 Proxies** (\`reactive\`) or getter/setter objects (\`ref\`).
- When a component renders or a \`computed\`/\`watchEffect\` runs, Vue **tracks** which reactive properties were read.
- When a property is **set**, Vue **triggers** only the effects that depend on it.

This gives fine-grained updates without a manual dependency list. Vue 2 used \`Object.defineProperty\`, which couldn't detect added properties or array index changes – Proxies fixed that.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between ref and reactive?',
          o: ['ref wraps any value (.value in script); reactive makes objects deeply reactive', 'ref is only for template DOM elements, reactive is for all state', 'There is no difference; both deeply track objects and primitives in the same way', 'reactive is only for arrays, while ref is used for all other values'],
          a: 0,
          e: 'Destructuring a reactive object loses reactivity (use toRefs). Many teams default to ref for consistency.',
        },
        {
          t: 'mcq', l: 2,
          q: 'computed vs watch: when to use which?',
          o: ['They are identical; watch is the older name for computed', 'watch is cached and derives new values; computed is used to run side effects on changes', 'computed derives cached values; watch runs side effects on changes', 'computed can perform async API calls, watch cannot'],
          a: 2,
          e: 'computed recalculates only when dependencies change and is cached. watch/watchEffect are for side effects.',
        },
        {
          t: 'qa', l: 2,
          q: 'Options API vs Composition API?',
          e: `
**Options API:** organize code by option type (\`data\`, \`methods\`, \`computed\`, \`watch\`). Easy for beginners; logic for one feature is scattered across options.

**Composition API** (\`setup()\` / \`<script setup>\`): organize code by **feature** using \`ref\`, \`computed\`, \`watch\`, lifecycle functions.
- **Pro:** Better logic reuse via **composables** (\`useMouse()\`, \`useFetch()\`)
- **Pro:** Better TypeScript inference
- **Pro:** Scales better for large components

Both are supported; Composition API + \`<script setup>\` is the modern default.`,
        },
      ],
    },
    {
      slug: 'components',
      title: 'Components, Directives & Lifecycle',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between v-if and v-show?',
          o: ['v-if adds/removes the element from the DOM; v-show toggles CSS display', 'v-show removes the element from the DOM; v-if toggles CSS display', 'v-if only works with lists and v-for, while v-show works with single elements', 'There is no difference; both remove the element from the DOM'],
          a: 0,
          e: 'Use v-show for frequent toggling (cheaper), v-if when the condition rarely changes or to avoid rendering expensive subtrees.',
        },
        {
          t: 'mcq', l: 1,
          q: 'How does a child component send data to its parent in Vue?',
          o: ['Writing to global window variables', 'Using v-show on the parent element', 'Mutating the props it received', 'Emitting events with emit() / $emit'],
          a: 3,
          e: 'Props down, events up. v-model on components is sugar for a modelValue prop + update:modelValue event (or defineModel()).',
        },
        {
          t: 'qa', l: 2,
          q: 'What are slots in Vue?',
          e: `
Slots let a parent pass **template content** into a child component.
- **Default slot:** \`<slot />\`
- **Named slots:** \`<slot name="header" />\` used with \`<template #header>\`
- **Scoped slots:** child passes data back to the slot content: \`<slot :item="item" />\` -> \`<template #default="{ item }">\`

Great for reusable layout and list components (tables, modals, cards).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which lifecycle hook is the right place to access the rendered DOM?',
          o: ['onBeforeUnmount', 'onBeforeMount', 'setup (before return)', 'onMounted'],
          a: 3,
          e: 'The component is mounted and the DOM is available in onMounted. Clean up listeners/timers in onUnmounted.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is provide/inject used for?',
          o: ['Defining routes in a parent component and injecting them into deeply nested child views', 'Passing data from an ancestor to deep descendants without prop drilling', 'Sending HTTP requests from a parent and injecting the results', 'Providing mock data to components while running unit tests'],
          a: 1,
          e: 'Similar to React context. Provide a ref to keep it reactive.',
        },
      ],
    },
    {
      slug: 'ecosystem',
      title: 'Pinia, Router, Nuxt & Performance',
      questions: [
        {
          t: 'mcq', l: 2,
          q: 'What is Pinia?',
          o: ['A utility-first CSS framework for Vue components', 'A testing library for mounting and asserting on Vue components', 'The official Vue state management library (successor to Vuex)', 'A build tool that bundles Vue single-file components'],
          a: 2,
          e: 'Pinia stores have state, getters and actions, no mutations, and support the Composition API style (setup stores).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is Nuxt?',
          o: ['A Vue state management library, similar to Redux and Pinia', 'A full-stack Vue framework with SSR/SSG and file-based routing', 'A Vue testing tool for end-to-end browser tests', 'A CSS preprocessor designed for Vue components'],
          a: 1,
          e: 'Nuxt 3 uses the Nitro server engine and supports hybrid rendering per route.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you optimize Vue application performance?',
          e: `
- Lazy-load routes: \`component: () => import('./views/Admin.vue')\`
- \`defineAsyncComponent\` for heavy components
- Use \`v-show\` vs \`v-if\` appropriately, always set \`:key\` in \`v-for\`
- \`computed\` instead of methods in templates (cached)
- \`shallowRef\`/\`shallowReactive\` and \`markRaw\` for large, non-reactive data
- \`v-memo\` and \`v-once\` for static or rarely changing subtrees
- Virtual scrolling for long lists
- SSR/SSG with Nuxt; analyze bundles with Vite`,
        },
      ],
    },
  ],
};
