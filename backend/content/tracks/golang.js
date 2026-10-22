module.exports = {
  slug: 'golang',
  title: 'Go (Golang)',
  subtitle: 'Goroutines, channels, interfaces',
  description: 'Go interview questions: types, slices and maps internals, interfaces, error handling, goroutines, channels, select, sync primitives, context and memory.',
  category: 'languages',
  roles: ['backend', 'devops'],
  icon: 'code',
  color: '#00ADD8',
  order: 16,
  topics: [
    {
      slug: 'basics',
      title: 'Language Basics',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Why is Go popular for backend and cloud development?',
          e: `
- **Simple language:** small spec, fast to learn, consistent formatting (\`gofmt\`)
- **Compiled to a single static binary** – easy deployment, small containers
- **Fast compile times** and good runtime performance
- **Concurrency built in:** goroutines and channels
- Strong **standard library** (net/http, encoding/json, testing)
- Garbage collected with low pause times

Used by Docker, Kubernetes, Terraform, Prometheus, etcd and many microservices.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between an array and a slice in Go?',
          o: ['No difference', 'Arrays have a fixed length that is part of the type; slices are dynamic views (pointer, length, capacity) over an underlying array', 'Slices are fixed size', 'Arrays are reference types'],
          a: 1,
          e: 'Appending beyond capacity allocates a new backing array; slices sharing a backing array can affect each other.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `s := []int{1, 2, 3}
t := s[:2]
t = append(t, 99)
fmt.Println(s)`,
          o: ['[1 2 3]', '[1 2 99]', '[1 2 3 99]', 'panic'],
          a: 1,
          e: 't has capacity 3, so append writes into the shared backing array, overwriting s[2].',
        },
        {
          t: 'qa', l: 2,
          q: 'How does error handling work in Go?',
          e: `
Go uses **explicit error values** instead of exceptions:
~~~go
user, err := repo.FindUser(ctx, id)
if err != nil {
    return nil, fmt.Errorf("find user %s: %w", id, err)   // wrap with context
}
~~~
- \`errors.Is(err, ErrNotFound)\` checks for a sentinel error in the chain
- \`errors.As(err, &target)\` extracts a specific error type
- \`panic\`/\`recover\` are for truly unrecoverable situations (programmer bugs), not normal control flow
- \`defer\` runs cleanup at function exit (LIFO order)`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How are interfaces implemented in Go?',
          o: ['With the "implements" keyword', 'Implicitly: any type that has the required methods satisfies the interface', 'Through inheritance', 'Only structs can implement interfaces explicitly'],
          a: 1,
          e: 'Implicit satisfaction enables small, consumer-defined interfaces ("accept interfaces, return structs").',
        },
        {
          t: 'mcq', l: 3,
          q: 'Why can an interface holding a nil pointer be != nil?',
          o: ['It is a compiler bug', 'An interface value is (type, value); with a typed nil pointer the type is set, so the interface itself is not nil', 'nil is not allowed in Go', 'Interfaces cannot hold pointers'],
          a: 1,
          e: 'Returning a typed nil *MyError as error produces a non-nil error. Return a literal nil instead.',
        },
      ],
    },
    {
      slug: 'concurrency',
      title: 'Goroutines, Channels & Sync',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are goroutines and channels?',
          e: `
**Goroutines** are lightweight threads managed by the Go runtime (start with ~2-8 KB stacks), multiplexed onto OS threads (M:N scheduler). Start with \`go f()\`.

**Channels** are typed conduits for communicating between goroutines:
~~~go
results := make(chan int, 10)   // buffered
go func() { results <- compute() }()
v := <-results
~~~
- **Unbuffered** channels synchronize sender and receiver.
- **Buffered** channels allow sends until the buffer is full.
- \`close(ch)\` signals no more values; \`for v := range ch\` reads until closed.

"Don't communicate by sharing memory; share memory by communicating."`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the select statement do?',
          o: ['Selects a database row', 'Waits on multiple channel operations and proceeds with whichever is ready (with optional default for non-blocking)', 'Selects a goroutine to kill', 'Sorts channels'],
          a: 1,
          e: 'Common with timeouts: case <-time.After(2 * time.Second) or case <-ctx.Done().',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you wait for multiple goroutines to finish?',
          o: ['time.Sleep', 'sync.WaitGroup (Add, Done, Wait) or errgroup.Group', 'runtime.Gosched', 'A for loop checking a bool'],
          a: 1,
          e: 'errgroup also propagates the first error and cancels a shared context.',
        },
        {
          t: 'qa', l: 3,
          q: 'What is context.Context used for?',
          e: `
\`context.Context\` carries **cancellation signals, deadlines and request-scoped values** across API boundaries and goroutines.

~~~go
ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
defer cancel()
rows, err := db.QueryContext(ctx, "SELECT ...")
~~~
- When the HTTP client disconnects or the timeout fires, \`ctx.Done()\` closes and downstream calls (DB, HTTP) abort – freeing resources.
- Pass ctx as the **first parameter**; don't store it in structs.
- Use context values only for request-scoped data (trace ids), not optional parameters.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is a goroutine leak?',
          o: ['Too many CPUs', 'Goroutines blocked forever (e.g. waiting on a channel nobody writes to or reads from), consuming memory', 'A panic in a goroutine', 'Using too many channels'],
          a: 1,
          e: 'Always provide exit paths: cancellation via context, closing channels, buffered channels for fire-and-forget results.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you detect data races in Go?',
          o: ['go vet only', 'Run tests or the program with the -race flag (race detector)', 'gofmt', 'It is impossible'],
          a: 1,
          e: 'go test -race ./... reports unsynchronized concurrent memory access.',
        },
      ],
    },
  ],
};
