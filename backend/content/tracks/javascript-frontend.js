module.exports = {
  slug: 'javascript-frontend',
  title: 'JavaScript (Frontend)',
  subtitle: 'Core JS + browser, DOM, events',
  description:
    'JavaScript as asked in frontend interviews: scope, closures, this, prototypes, async, event loop in the browser, DOM, events, storage and output-based questions.',
  category: 'languages',
  roles: ['frontend', 'fullstack'],
  icon: 'javascript',
  color: '#EAB308',
  order: 10,
  topics: [
    {
      slug: 'basics-types',
      title: 'Basics, Types & Coercion',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What is the output?',
          c: `console.log(typeof null);
console.log(typeof undefined);
console.log(typeof NaN);`,
          o: ['"null", "undefined", "number"', '"object", "undefined", "number"', '"object", "undefined", "NaN"', '"null", "object", "number"'],
          a: 1,
          e: '`typeof null` is "object" (a historic bug kept for compatibility). `typeof undefined` is "undefined" and `NaN` is of type "number".',
        },
        {
          t: 'qa', l: 1,
          q: 'What are the primitive data types in JavaScript?',
          e: `
There are **7 primitives**: \`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\`.

Everything else is an **object** (arrays, functions, dates, maps...).

- Primitives are **immutable** and compared **by value**.
- Objects are compared **by reference**: \`{} === {}\` is \`false\`.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between == and ===?',
          o: ['There is no difference', '== compares values after type coercion; === compares value and type without coercion', '=== is only for numbers', '== is faster and always recommended'],
          a: 1,
          e: '`0 == "0"` is true (coercion) but `0 === "0"` is false. Prefer `===` to avoid surprising coercion rules. `x == null` is a common exception to check for both null and undefined.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the output?',
          c: `console.log(1 + '2' + 3);
console.log(1 + 2 + '3');`,
          o: ['"123" and "33"', '6 and 6', '"123" and "123"', '"15" and "33"'],
          a: 0,
          e: '`+` is evaluated left to right. `1 + "2"` -> "12" (string concatenation) then "123". In the second, `1 + 2` = 3, then `3 + "3"` = "33".',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which values are falsy in JavaScript?',
          o: ['false, 0, "", null, undefined, NaN (and -0, 0n)', 'false, 0, "0", null', 'false, [], {}, ""', 'Only false and null'],
          a: 0,
          e: 'The falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else, including `"0"`, `[]` and `{}`, is truthy.',
        },
        {
          t: 'qa', l: 1,
          q: 'Explain var, let and const.',
          e: `
| | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisting | Hoisted, initialized as \`undefined\` | Hoisted but in **TDZ** until declared | Hoisted, TDZ |
| Re-declare | Allowed | Not allowed | Not allowed |
| Re-assign | Allowed | Allowed | Not allowed |

\`const\` prevents **re-assignment**, not mutation: \`const arr = []; arr.push(1)\` works.

Use \`const\` by default, \`let\` when you need to re-assign, avoid \`var\`.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `console.log(a);
var a = 5;
console.log(b);
let b = 10;`,
          o: ['undefined, then ReferenceError', '5, then 10', 'ReferenceError immediately', 'undefined, undefined'],
          a: 0,
          e: '`var a` is hoisted and initialized to `undefined`. `let b` is hoisted but sits in the Temporal Dead Zone, so accessing it before the declaration throws a ReferenceError.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does NaN === NaN return, and how should you check for NaN?',
          o: ['true; use ===', 'false; use Number.isNaN(value)', 'false; use typeof value === "NaN"', 'true; use isNaN only'],
          a: 1,
          e: 'NaN is the only value not equal to itself. `Number.isNaN()` is reliable; the global `isNaN()` coerces first (`isNaN("abc")` is true).',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output of 0.1 + 0.2 === 0.3?',
          o: ['true', 'false', 'TypeError', 'undefined'],
          a: 1,
          e: 'Numbers are IEEE-754 doubles; 0.1 + 0.2 = 0.30000000000000004. Compare with a tolerance (`Math.abs(a - b) < Number.EPSILON`) or use integers (cents) for money.',
        },
      ],
    },
    {
      slug: 'scope-closures-this',
      title: 'Scope, Closures & this',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is a closure? Give a practical example.',
          e: `
A **closure** is a function that **remembers the variables of its outer (lexical) scope** even after the outer function has returned.

~~~js
function createCounter() {
  let count = 0;               // private state
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const c = createCounter();
c.increment(); c.increment();
c.get(); // 2  – count is not accessible directly
~~~
**Uses:** data privacy/encapsulation, function factories, memoization, debounce/throttle, event handlers keeping state, React hooks rely on closures.

**Pitfall:** closures keep variables alive -> possible memory leaks; stale closures in React hooks.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
          o: ['0 1 2', '3 3 3', '0 0 0', 'undefined x3'],
          a: 1,
          e: '`var` is function-scoped, so all callbacks share one `i`, which is 3 when they run. Using `let` creates a new binding per iteration and prints 0 1 2.',
        },
        {
          t: 'qa', l: 2,
          q: 'How is the value of "this" determined in JavaScript?',
          e: `
\`this\` depends on **how a function is called** (except arrow functions):

1. **new binding:** \`new Foo()\` -> \`this\` is the new object.
2. **Explicit binding:** \`fn.call(obj)\`, \`fn.apply(obj)\`, \`fn.bind(obj)\` -> \`obj\`.
3. **Implicit binding:** \`obj.method()\` -> \`obj\`.
4. **Default binding:** plain \`fn()\` -> \`undefined\` in strict mode, \`globalThis\` (window) in sloppy mode.

**Arrow functions** don't have their own \`this\`; they capture \`this\` from the enclosing lexical scope (can't be changed by call/bind).

**DOM event handlers** (regular functions): \`this\` is the element (\`event.currentTarget\`).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `const user = {
  name: 'Ali',
  greet() { return 'Hi ' + this.name; },
};
const fn = user.greet;
console.log(fn());`,
          o: ['"Hi Ali"', '"Hi undefined" (or TypeError in strict mode modules)', '"Hi "', 'ReferenceError'],
          a: 1,
          e: 'Extracting the method loses its implicit binding. Called plainly, `this` is undefined in strict mode (TypeError reading name) or window in sloppy mode (window.name is usually ""/undefined). Fix with `user.greet.bind(user)`.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between call, apply and bind?',
          o: ['They are identical', 'call and apply invoke immediately (call takes args individually, apply takes an array); bind returns a new function with bound this', 'bind invokes immediately', 'apply only works with arrow functions'],
          a: 1,
          e: '`fn.call(ctx, a, b)`, `fn.apply(ctx, [a, b])`, `const g = fn.bind(ctx, a); g(b)`.',
        },
        {
          t: 'qa', l: 2,
          q: 'What is lexical scope and the scope chain?',
          e: `
**Lexical scope:** a function's accessible variables are determined by **where it is written** in the code, not where it is called.

**Scope chain:** when a variable is referenced, JS looks in the current scope, then the outer scope, and so on up to the global scope. If not found -> \`ReferenceError\`.

~~~js
const a = 1;
function outer() {
  const b = 2;
  function inner() { return a + b; } // finds b in outer, a in global
  return inner();
}
~~~`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the output?',
          c: `const obj = {
  value: 42,
  regular: function () { return () => this.value; },
  arrow: () => this?.value,
};
console.log(obj.regular()());
console.log(obj.arrow());`,
          o: ['42 and 42', '42 and undefined', 'undefined and 42', 'undefined and undefined'],
          a: 1,
          e: 'The arrow inside `regular` captures `this` of `regular`, which is `obj` -> 42. `arrow` is defined in the module/global scope, so its `this` is not `obj` -> undefined.',
        },
        {
          t: 'qa', l: 2,
          q: 'Implement debounce and explain where you use it.',
          e: `
**Debounce** delays running a function until it hasn't been called for \`wait\` ms. Classic for search-as-you-type, window resize, autosave.

~~~js
function debounce(fn, wait = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
input.addEventListener('input', debounce((e) => search(e.target.value), 400));
~~~
**Throttle** (different) runs the function at most once per interval – good for scroll handlers.

~~~js
function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) { last = now; fn(...args); }
  };
}
~~~`,
        },
      ],
    },
    {
      slug: 'prototypes-classes',
      title: 'Prototypes, Classes & Objects',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain prototypal inheritance.',
          e: `
Every object has an internal link \`[[Prototype]]\` (accessible via \`Object.getPrototypeOf(obj)\` or \`__proto__\`). When a property isn't found on the object, JS looks up the **prototype chain** until \`null\`.

~~~js
const animal = { speak() { return 'sound'; } };
const dog = Object.create(animal);
dog.speak(); // 'sound' – found on the prototype
~~~
- Functions have a \`prototype\` property used as the prototype of objects created with \`new\`.
- ES6 \`class\` is syntactic sugar over prototypes: methods live on \`Class.prototype\`.
- Chain: \`dog -> animal -> Object.prototype -> null\`.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "new" keyword do?',
          o: ['Only allocates memory', 'Creates an empty object, links its prototype to Constructor.prototype, calls the constructor with this = new object, and returns it (unless the constructor returns an object)', 'Copies the constructor function', 'Makes the object immutable'],
          a: 1,
          e: 'These four steps are exactly what `new` performs.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which creates a shallow copy of an object?',
          o: ['const b = a', 'const b = { ...a } or Object.assign({}, a)', 'const b = a.copy()', 'const b = JSON.parse(a)'],
          a: 1,
          e: 'Spread and Object.assign copy top-level properties; nested objects are still shared. For deep copies use `structuredClone(a)`.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the best built-in way to deep clone an object containing Dates, Maps and nested objects?',
          o: ['JSON.parse(JSON.stringify(obj))', 'structuredClone(obj)', '{ ...obj }', 'Object.freeze(obj)'],
          a: 1,
          e: '`structuredClone` handles Dates, Maps, Sets, typed arrays and circular references. The JSON trick loses Dates (become strings), undefined, functions, Maps and fails on cycles.',
        },
        {
          t: 'qa', l: 2,
          q: 'What is the difference between Object.freeze, Object.seal and const?',
          e: `
- **const**: the variable can't be re-assigned; the object itself is still mutable.
- **Object.seal(obj)**: can't add or delete properties; **can modify** existing ones.
- **Object.freeze(obj)**: can't add, delete or modify properties (shallow – nested objects can still change).

In strict mode, violating freeze/seal throws a TypeError; otherwise it fails silently.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the output?',
          c: `class A { static create() { return new this(); } hello() { return 'A'; } }
class B extends A { hello() { return 'B' + super.hello(); } }
console.log(B.create().hello());`,
          o: ['"A"', '"B"', '"BA"', 'TypeError'],
          a: 2,
          e: 'Static methods are inherited; inside `B.create()`, `this` is B, so it creates a B. B.hello calls super.hello() -> "BA".',
        },
      ],
    },
    {
      slug: 'async-event-loop',
      title: 'Async JS & Event Loop (Browser)',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain the event loop in the browser: call stack, task queue, microtask queue and rendering.',
          e: `
JavaScript runs on a **single thread** with one **call stack**.

1. Synchronous code runs on the call stack.
2. Async APIs (setTimeout, fetch, DOM events) are handled by the browser (Web APIs). When done, their callbacks are queued.
3. **Macrotask (task) queue:** setTimeout/setInterval, DOM events, MessageChannel, I/O.
4. **Microtask queue:** Promise callbacks (\`.then\`), \`queueMicrotask\`, \`await\` continuations, MutationObserver.

**Loop order:**
- Run one macrotask (e.g. the main script)
- Run **all** microtasks until the queue is empty
- **Render** if needed (requestAnimationFrame callbacks -> style -> layout -> paint), ~every 16.6ms
- Next macrotask

Long synchronous tasks (>50ms) block rendering and input -> janky UI. Use Web Workers, chunking, or \`scheduler.yield()\`.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output order?',
          c: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
          o: ['1 2 3 4', '1 4 3 2', '1 4 2 3', '1 3 4 2'],
          a: 1,
          e: 'Synchronous logs first (1, 4). Then microtasks (promise -> 3). Then the next macrotask (setTimeout -> 2).',
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the output order?',
          c: `async function f() {
  console.log('A');
  await null;
  console.log('B');
}
console.log('C');
f();
console.log('D');`,
          o: ['C A B D', 'C A D B', 'A C D B', 'C D A B'],
          a: 1,
          e: 'f runs synchronously until the first `await` (prints A). The rest after await is scheduled as a microtask, so D prints before B.',
        },
        {
          t: 'qa', l: 1,
          q: 'What is a Promise? Explain its states.',
          e: `
A **Promise** represents the eventual result of an async operation.

**States:** \`pending\` -> \`fulfilled\` (resolved with a value) or \`rejected\` (with a reason). Once settled, it never changes.

~~~js
fetch('/api/user')
  .then((res) => res.json())
  .then((user) => render(user))
  .catch((err) => showError(err))
  .finally(() => hideSpinner());
~~~
With async/await:
~~~js
try {
  const user = await (await fetch('/api/user')).json();
} catch (e) { showError(e); }
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which Promise combinator resolves as soon as ANY promise fulfills, ignoring rejections unless all reject?',
          o: ['Promise.all', 'Promise.race', 'Promise.any', 'Promise.allSettled'],
          a: 2,
          e: '`all`: all must fulfill (fails fast on first reject). `allSettled`: waits for all, never rejects. `race`: first to settle (fulfill or reject). `any`: first to fulfill; rejects with AggregateError if all reject.',
        },
        {
          t: 'mcq', l: 2,
          q: 'You need to call 3 independent APIs. Which is the fastest correct approach?',
          o: ['await each one sequentially', 'await Promise.all([a(), b(), c()])', 'Use setTimeout for each', 'Use synchronous XHR'],
          a: 1,
          e: 'Sequential awaits take the sum of latencies; Promise.all runs them concurrently, taking about the time of the slowest one.',
        },
        {
          t: 'qa', l: 3,
          q: 'How do you cancel a fetch request? Why is this important in UIs?',
          e: `
Use **AbortController**:
~~~js
const controller = new AbortController();
fetch('/api/search?q=re', { signal: controller.signal })
  .then((r) => r.json())
  .catch((e) => { if (e.name !== 'AbortError') throw e; });

controller.abort(); // cancel
~~~
**Why it matters**
- **Race conditions:** in search-as-you-type, an older slow response can arrive after a newer one and overwrite results. Abort the previous request when a new one starts.
- Avoid setting state on unmounted components (React effect cleanup).
- Save bandwidth on navigation.

\`AbortSignal.timeout(5000)\` gives a built-in timeout signal.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'Which API runs a callback right before the browser\'s next repaint, ideal for animations?',
          o: ['setTimeout(fn, 16)', 'requestAnimationFrame(fn)', 'requestIdleCallback(fn)', 'queueMicrotask(fn)'],
          a: 1,
          e: 'rAF syncs with the display refresh rate and pauses in background tabs. requestIdleCallback runs when the browser is idle (low-priority work).',
        },
      ],
    },
    {
      slug: 'dom-events-browser',
      title: 'DOM, Events & Browser APIs',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain event bubbling, capturing and delegation.',
          e: `
When an event happens on an element, it travels in 3 phases:
1. **Capturing:** from \`window\` down to the target
2. **Target**
3. **Bubbling:** from the target back up to \`window\` (default for addEventListener)

~~~js
el.addEventListener('click', handler, { capture: true }); // capture phase
e.stopPropagation(); // stop further propagation
e.preventDefault();  // stop default browser action (e.g. form submit)
~~~

**Event delegation:** attach **one** listener to a parent and use \`event.target\` to handle children – efficient and works for dynamically added elements.
~~~js
list.addEventListener('click', (e) => {
  const item = e.target.closest('li');
  if (item) select(item.dataset.id);
});
~~~`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between event.target and event.currentTarget?',
          o: ['They are always the same', 'target is the element that triggered the event; currentTarget is the element whose listener is running', 'currentTarget is the deepest element', 'target is always document'],
          a: 1,
          e: 'With delegation, currentTarget is the parent with the listener while target is the clicked child.',
        },
        {
          t: 'qa', l: 1,
          q: 'Compare localStorage, sessionStorage and cookies.',
          e: `
| | localStorage | sessionStorage | Cookies |
|---|---|---|---|
| Capacity | ~5-10 MB | ~5 MB | ~4 KB each |
| Lifetime | Until cleared | Until tab closes | Expiry date / session |
| Sent to server | No | No | **Yes, with every request** |
| Accessible from JS | Yes | Yes | Yes unless \`HttpOnly\` |
| Scope | Origin | Origin + tab | Domain/path |

**Security:** don't store auth tokens in localStorage (XSS can read it). Use \`HttpOnly; Secure; SameSite\` cookies for sessions. For large structured data use **IndexedDB**.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which is the most efficient way to add 1000 list items to the DOM?',
          o: ['Append each li directly to the live list in a loop', 'Build them in a DocumentFragment (or one innerHTML/append call) and insert once', 'Use document.write', 'Use setTimeout per item'],
          a: 1,
          e: 'Inserting once minimizes layout/reflow work. For very long lists, virtualize (render only visible rows).',
        },
        {
          t: 'qa', l: 2,
          q: 'What are reflow (layout) and repaint? How do you avoid layout thrashing?',
          e: `
- **Reflow/Layout:** browser recalculates positions and sizes (triggered by changing width, adding nodes, font changes...). Expensive.
- **Repaint:** redrawing pixels without layout change (color, visibility).
- **Composite-only** changes (\`transform\`, \`opacity\`) are cheapest – GPU accelerated.

**Layout thrashing:** interleaving DOM writes and reads forces synchronous layouts repeatedly:
~~~js
// bad
items.forEach((el) => { el.style.width = box.offsetWidth + 'px'; });
// good – read once, then write
const w = box.offsetWidth;
items.forEach((el) => { el.style.width = w + 'px'; });
~~~
Batch reads then writes, use requestAnimationFrame, animate with transform/opacity, use \`will-change\` sparingly.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which observer API efficiently detects when an element enters the viewport (e.g. lazy loading, infinite scroll)?',
          o: ['MutationObserver', 'IntersectionObserver', 'ResizeObserver', 'PerformanceObserver'],
          a: 1,
          e: 'IntersectionObserver notifies asynchronously when visibility changes, avoiding expensive scroll listeners with getBoundingClientRect.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "defer" attribute do on a script tag?',
          o: ['Blocks HTML parsing until the script runs', 'Downloads in parallel and executes after HTML parsing, in document order', 'Executes as soon as downloaded, in any order', 'Prevents the script from running'],
          a: 1,
          e: '`defer`: parallel download, runs after parsing, keeps order. `async`: parallel download, runs as soon as ready (order not guaranteed) – good for independent scripts like analytics.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Your page freezes for 2 seconds when filtering a list of 50,000 items. How do you fix it?',
          e: `
1. **Measure** with the Performance panel: is it JS (filtering) or rendering (DOM nodes)?
2. **Rendering:** don't render 50K nodes – use **list virtualization** (react-window / TanStack Virtual) to render only visible rows.
3. **Input handling:** debounce the filter input; in React use \`useDeferredValue\` / \`startTransition\` so typing stays responsive.
4. **Heavy computation:** move filtering/sorting to a **Web Worker**; or chunk work with \`requestIdleCallback\` / \`scheduler.yield()\`.
5. **Algorithm:** pre-index data (lowercased fields, maps) instead of recomputing on every keystroke.
6. **Server-side:** paginate/filter on the API for very large datasets.`,
        },
      ],
    },
    {
      slug: 'modern-es6',
      title: 'ES6+ Features & Array Methods',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'What is the output?',
          c: `const [a, , b = 5] = [1, 2];
const { x, y: z = 3 } = { x: 10 };
console.log(a, b, x, z);`,
          o: ['1 2 10 3', '1 5 10 3', '1 undefined 10 undefined', 'TypeError'],
          a: 1,
          e: 'Array destructuring skips the second item; the third is missing so its default 5 is used. `y` is renamed to `z` with default 3.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which array method returns a NEW array without modifying the original?',
          o: ['push', 'splice', 'map', 'sort'],
          a: 2,
          e: '`map`, `filter`, `slice`, `concat` and the newer `toSorted`, `toReversed`, `toSpliced`, `with` return new arrays. `push`, `splice`, `sort`, `reverse` mutate.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `console.log([1, 2, 3, 4].reduce((acc, n) => acc + n, 0));
console.log([10, 1, 5].sort());`,
          o: ['10 and [1, 5, 10]', '10 and [1, 10, 5]', '24 and [1, 5, 10]', '10 and [10, 5, 1]'],
          a: 1,
          e: 'Default `sort()` compares as strings: "1" < "10" < "5". Use `sort((a, b) => a - b)` for numbers.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are optional chaining (?.) and nullish coalescing (??)?',
          e: `
- **Optional chaining** \`a?.b?.c\` returns \`undefined\` instead of throwing if \`a\` or \`b\` is null/undefined. Also \`fn?.()\` and \`arr?.[0]\`.
- **Nullish coalescing** \`a ?? b\` returns \`b\` only when \`a\` is \`null\` or \`undefined\`.

~~~js
const count = 0;
count || 10; // 10 – || treats 0 as falsy
count ?? 10; // 0  – ?? only checks null/undefined
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'When should you use a Map instead of a plain object?',
          o: ['Never', 'When keys are not strings (objects as keys), you need insertion order guarantees, frequent add/delete, or easy size', 'Only for numbers', 'When you need JSON serialization'],
          a: 1,
          e: 'Map accepts any key type, has `size`, is iterable in insertion order and is optimized for frequent mutations. WeakMap holds object keys weakly (good for caches/private data).',
        },
        {
          t: 'qa', l: 3,
          q: 'What are generators and iterators?',
          e: `
An **iterator** is an object with a \`next()\` method returning \`{ value, done }\`. An object is **iterable** if it has \`[Symbol.iterator]\` (arrays, strings, Maps, Sets) – usable with \`for...of\` and spread.

A **generator** (\`function*\`) produces an iterator and can pause with \`yield\`:
~~~js
function* idGen() {
  let id = 1;
  while (true) yield id++;
}
const ids = idGen();
ids.next().value; // 1
ids.next().value; // 2
~~~
Uses: lazy sequences, infinite streams, custom iteration, async generators (\`for await\`) for paginated APIs/streams; redux-saga is built on generators.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between ES modules (import/export) and CommonJS (require)?',
          o: ['No difference', 'ESM is static (analyzable, tree-shakable), supports top-level await and async loading; CommonJS is dynamic and synchronous', 'CommonJS works only in browsers', 'ESM cannot export functions'],
          a: 1,
          e: 'ES modules are the standard in browsers and modern Node. Static imports enable bundlers to remove unused code (tree shaking).',
        },
      ],
    },
  ],
};
