module.exports = {
  slug: 'typescript',
  title: 'TypeScript',
  subtitle: 'Types, generics, utility types',
  description: 'TypeScript interview questions: type system basics, interfaces vs types, generics, narrowing, utility types, advanced types and configuration.',
  category: 'languages',
  roles: ['frontend', 'backend', 'fullstack'],
  icon: 'data_object',
  color: '#3178C6',
  order: 12,
  topics: [
    {
      slug: 'basics',
      title: 'Type System Basics',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is TypeScript and why use it?',
          e: `
**TypeScript** is a typed superset of JavaScript that compiles to plain JS.

**Benefits**
- Catch bugs at **compile time** (typos, wrong arguments, null access)
- Great **IDE support**: autocomplete, refactoring, go-to-definition
- Self-documenting code and safer large-scale refactors
- Gradual adoption (\`allowJs\`, \`any\`)

Types are **erased** at runtime – TypeScript does not validate API data at runtime (use zod/io-ts for that).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between any and unknown?',
          o: ['They are the same; unknown is just a newer alias for any', 'any disables type checking; unknown is type-safe and must be narrowed first', 'unknown disables type checking entirely; any is type-safe and must be narrowed before use', 'unknown is only used for caught errors, any for everything else'],
          a: 1,
          e: 'Prefer unknown for values of uncertain type (e.g. JSON.parse results, catch errors) and narrow with typeof/instanceof/type guards.',
        },
        {
          t: 'qa', l: 1,
          q: 'Interface vs type alias: what is the difference?',
          e: `
Both describe object shapes and are mostly interchangeable.

**interface**
- Can be **extended** (\`extends\`) and **merged** (declaration merging – useful for augmenting libraries)
- Only for object shapes

**type**
- Can represent **unions, intersections, primitives, tuples, mapped and conditional types**
- Cannot be re-opened/merged

~~~ts
interface User { id: string; name: string }
type Status = 'active' | 'banned';
type Admin = User & { permissions: string[] };
~~~
Common convention: \`interface\` for public object contracts, \`type\` for unions and complex compositions.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the type of x?',
          c: `const x = ['a', 1];`,
          o: ['readonly ["a", 1]', '[string, number]', 'any[]', '(string | number)[]'],
          a: 3,
          e: 'Arrays are inferred as union arrays. Use `as const` to get readonly ["a", 1] or annotate a tuple type explicitly.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "never" type represent?',
          o: ['The null value, used when nothing is returned', 'An empty string returned from a function', 'A value that never occurs, e.g. a function that always throws', 'The same as void, used for functions that do not return anything'],
          a: 2,
          e: 'Useful for exhaustive checks: assigning the remaining union value to never causes a compile error if a case is unhandled.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "strict" flag in tsconfig enable?',
          o: ['A family of strict checks (strictNullChecks, noImplicitAny, ...)', 'ESLint-style linting rules for code style', 'ES5 output with "use strict" added to every file and stricter linting', 'Only noImplicitAny, nothing else'],
          a: 0,
          e: 'Always enable strict for new projects; strictNullChecks alone catches a huge class of bugs.',
        },
      ],
    },
    {
      slug: 'narrowing-generics',
      title: 'Narrowing & Generics',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is type narrowing? Show discriminated unions.',
          e: `
**Narrowing** refines a broad type to a more specific one inside a code path using checks TypeScript understands: \`typeof\`, \`instanceof\`, \`in\`, equality, truthiness, and custom **type guards**.

**Discriminated union:** each member has a common literal field.
~~~ts
type Result =
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };

function handle(r: Result) {
  switch (r.status) {
    case 'success': return r.data.name;   // r is the success member
    case 'error':   return r.error;
    default: const _exhaustive: never = r; // compile error if a case is missing
  }
}
~~~
Custom type guard:
~~~ts
function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null && 'id' in v;
}
~~~`,
        },
        {
          t: 'qa', l: 2,
          q: 'What are generics? Give an example with constraints.',
          e: `
**Generics** let you write reusable code that works with many types while keeping type safety.

~~~ts
function first<T>(arr: T[]): T | undefined { return arr[0]; }
first([1, 2]);      // number | undefined
first(['a']);       // string | undefined

// constraint
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProp({ id: 1, name: 'A' }, 'name'); // string
getProp({ id: 1 }, 'age');             // compile error

interface ApiResponse<T> { data: T; error?: string }
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does "keyof" return for type User = { id: number; name: string }?',
          o: ['"id" | "name"', 'string', 'User[]', 'number | string'],
          a: 0,
          e: 'keyof produces a union of property names. typeof obj gets the type of a value; T[K] is an indexed access type.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the result type?',
          c: `type IsString<T> = T extends string ? 'yes' : 'no';
type R = IsString<string | number>;`,
          o: ['never', '"no"', '"yes"', '"yes" | "no"'],
          a: 3,
          e: 'Conditional types distribute over unions when T is a naked type parameter: IsString<string> | IsString<number>.',
        },
      ],
    },
    {
      slug: 'utility-advanced',
      title: 'Utility & Advanced Types',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain common utility types.',
          e: `
~~~ts
interface User { id: string; name: string; email?: string }

Partial<User>            // all optional – update payloads
Required<User>           // all required
Readonly<User>           // immutable
Pick<User, 'id' | 'name'>
Omit<User, 'email'>
Record<'admin' | 'user', string[]>   // object with given keys
Exclude<'a' | 'b' | 'c', 'a'>       // 'b' | 'c'
Extract<'a' | 'b', 'a' | 'z'>       // 'a'
NonNullable<string | null>          // string
ReturnType<typeof fn>
Parameters<typeof fn>
Awaited<Promise<User>>              // User
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which utility type creates a type for a PATCH request body where all User fields are optional?',
          o: ['Partial<User>', 'Readonly<User>', 'Required<User>', 'Pick<User>'],
          a: 0,
          e: 'Partial<T> makes every property optional.',
        },
        {
          t: 'qa', l: 3,
          q: 'What are mapped types and template literal types?',
          e: `
**Mapped types** transform each property of a type:
~~~ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
// Getters<{ name: string }> -> { getName: () => string }
~~~
**Template literal types** build string types:
~~~ts
type Event = 'click' | 'focus';
type Handler = \`on\${Capitalize<Event>}\`;  // 'onClick' | 'onFocus'
~~~
Used heavily in typed routers, ORMs and event emitters.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What does the "satisfies" operator do?',
          o: ['Defines a constraint on a generic type parameter', 'Runs validation at runtime and throws an error when the value does not match the type', 'Checks an expression matches a type without widening its inferred type', 'Casts a value to a type without any checking'],
          a: 2,
          e: 'const routes = { home: "/" } satisfies Record<string, string> keeps the literal key types while ensuring the shape is valid.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is "as" (type assertion) considered risky?',
          o: ['It converts values at runtime to the target type, which can silently change the data', 'It tells the compiler to trust you without checking, hiding real type errors', 'It slows down the compiler on large codebases', 'It is not valid TypeScript and only works in .js files'],
          a: 1,
          e: 'Prefer narrowing, type guards or runtime validation (zod) for external data.',
        },
      ],
    },
  ],
};
