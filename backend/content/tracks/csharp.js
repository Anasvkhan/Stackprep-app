module.exports = {
  slug: 'csharp',
  title: 'C#',
  subtitle: 'Types, LINQ, async/await, memory',
  description: 'C# interview questions: value vs reference types, classes/structs/records, interfaces, delegates and events, LINQ, async/await, garbage collection and IDisposable.',
  category: 'languages',
  roles: ['backend', 'software-engineer'],
  icon: 'code',
  color: '#68217A',
  order: 17,
  topics: [
    {
      slug: 'core',
      title: 'Core Language',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Value types vs reference types in C#?',
          e: `
- **Value types** (\`int\`, \`double\`, \`bool\`, \`struct\`, \`enum\`): hold data directly; copied on assignment; usually live on the stack or inline in objects.
- **Reference types** (\`class\`, \`string\`, arrays, delegates, \`record class\`): variables hold a reference to an object on the managed heap; assignment copies the reference.

**Boxing:** converting a value type to \`object\` allocates on the heap (performance cost); unboxing extracts it back.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'class vs struct vs record?',
          o: ['struct supports inheritance like class does, while record cannot implement interfaces', 'All three are reference types; they differ only in naming conventions and IDE support', 'record is always a value type, struct is a reference type, and class instances are copied on every assignment', 'class: reference type; struct: value type (copied); record: value-based equality and concise immutable syntax'],
          a: 3,
          e: 'record Person(string Name, int Age); gets Equals/GetHashCode/ToString and with-expressions.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between const and readonly?',
          o: ['const is a compile-time constant; readonly can be set at declaration or in the constructor', 'const fields can be reassigned inside constructors, while readonly fields never can', 'There is no difference; both are compile-time constants that the compiler inlines', 'readonly is evaluated at compile time, while const is assigned at runtime in the constructor'],
          a: 0,
          e: 'static readonly is common for values computed at startup.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are delegates, events and lambdas?',
          e: `
- **Delegate:** a type-safe function pointer. Built-ins: \`Action<T>\` (no return), \`Func<T, TResult>\`, \`Predicate<T>\`.
- **Lambda:** inline anonymous function: \`x => x * 2\`.
- **Event:** a delegate-based publish/subscribe mechanism; only the declaring class can raise it.

~~~csharp
public class Order {
    public event EventHandler<OrderPlacedArgs>? Placed;
    public void Place() { /* ... */ Placed?.Invoke(this, new OrderPlacedArgs(Id)); }
}
order.Placed += (s, e) => SendEmail(e.OrderId);
~~~
Unsubscribe (\`-=\`) to avoid memory leaks from long-lived publishers.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "using" statement/declaration do?',
          o: ['It only imports namespaces so types can be used without their full names', 'It ensures Dispose() is called on an IDisposable when it goes out of scope, even on exceptions', 'It starts a new thread for the block and joins it automatically when the block exits, even on exceptions', 'It enables LINQ query syntax for any collection used inside the block'],
          a: 1,
          e: 'Used for files, DB connections, HTTP responses. "using var conn = ..." is the C# 8 declaration form.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What do nullable reference types (string?) add?',
          o: ['Compile-time warnings that help prevent NullReferenceExceptions by tracking nullability', 'Runtime null checks that throw ArgumentNullException before any null reference is dereferenced', 'They make strings mutable so that a null value can be replaced in place', 'Nothing at all; the ? suffix is ignored by the compiler for reference types'],
          a: 0,
          e: 'Enable with <Nullable>enable</Nullable>; use ?. and ?? operators for safe access.',
        },
      ],
    },
    {
      slug: 'linq-async',
      title: 'LINQ, Async & Memory',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is LINQ? IEnumerable vs IQueryable?',
          e: `
**LINQ** provides query operators over collections and data sources:
~~~csharp
var top = orders.Where(o => o.Total > 100)
                .OrderByDescending(o => o.Total)
                .Select(o => new { o.Id, o.Total })
                .Take(10)
                .ToList();
~~~
- **Deferred execution:** queries run when enumerated (ToList, foreach).
- **IEnumerable<T>:** in-memory iteration; LINQ operators run in your process.
- **IQueryable<T>:** builds an **expression tree** translated by a provider (Entity Framework -> SQL) and executed in the database.

Calling \`.ToList()\` too early on an IQueryable pulls all rows into memory before filtering.`,
        },
        {
          t: 'qa', l: 2,
          q: 'How does async/await work in C#? What are common pitfalls?',
          e: `
\`async\` methods return \`Task\`/\`Task<T>\`/\`ValueTask\`; \`await\` asynchronously waits without blocking the thread, which returns to the pool to serve other work.

~~~csharp
public async Task<User> GetUserAsync(int id, CancellationToken ct) {
    var res = await _http.GetAsync($"/users/{id}", ct);
    res.EnsureSuccessStatusCode();
    return await res.Content.ReadFromJsonAsync<User>(cancellationToken: ct);
}
~~~
**Pitfalls**
- **Blocking on async** (\`.Result\`, \`.Wait()\`) -> thread starvation or deadlocks (in UI/legacy ASP.NET contexts)
- \`async void\` (except event handlers) – exceptions can't be caught
- Not passing **CancellationToken**
- Forgetting to await (fire-and-forget losing exceptions)
- \`ConfigureAwait(false)\` in library code to avoid capturing context`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How does .NET garbage collection work?',
          o: ['There is no garbage collector; memory is reclaimed only when the process exits', 'Generational GC (Gen 0, 1, 2 + LOH) that compacts memory and collects young objects most often', 'Developers free objects manually with Dispose() or free(), similar to C++ delete', 'Pure reference counting, where each object is freed as soon as its count reaches zero, like in Swift'],
          a: 1,
          e: 'Large objects (> 85 KB) go to the LOH. Unmanaged resources need IDisposable/finalizers.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What are Span<T> and Memory<T> used for?',
          o: ['Inspecting types at runtime via reflection without loading the whole assembly into memory first', 'Coordinating threads by spanning a lock across multiple async operations', 'Working with contiguous memory slices without allocations or copies, e.g. in parsing and I/O', 'Laying out UI elements in WPF and MAUI using spans of rows and columns'],
          a: 2,
          e: 'Span<T> is a stack-only ref struct; Memory<T> can be stored on the heap and used across awaits.',
        },
      ],
    },
  ],
};
