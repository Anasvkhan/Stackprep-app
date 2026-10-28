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
          o: ['Arrays are reference types, so passing one to a function shares the data instead of copying it', 'Slices have a fixed size set at creation, while arrays grow with append', 'There is no difference; slice is just shorthand syntax for an array', 'Arrays have a fixed length that is part of the type; slices are dynamic views over an array'],
          a: 3,
          e: 'Appending beyond capacity allocates a new backing array; slices sharing a backing array can affect each other.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `s := []int{1, 2, 3}
t := s[:2]
t = append(t, 99)
fmt.Println(s)`,
          o: ['[1 2 3 99]', '[1 2 3]', '[1 2 99]', 'panic'],
          a: 2,
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
          o: ['By declaring them with the "implements" keyword on the struct', 'Implicitly: any type that has the required methods satisfies it', 'Through struct embedding, which inherits the interface\'s methods', 'Only structs can implement interfaces, and they must do so explicitly'],
          a: 1,
          e: 'Implicit satisfaction enables small, consumer-defined interfaces ("accept interfaces, return structs").',
        },
        {
          t: 'mcq', l: 3,
          q: 'Why can an interface holding a nil pointer be != nil?',
          o: ['Go converts nil pointers to zero values when storing them in interfaces', 'It is a known compiler bug that is fixed in newer Go versions', 'Interfaces cannot hold pointers directly, so the nil is wrapped in a new non-nil object', 'An interface value is (type, value); with a typed nil pointer the type is set'],
          a: 3,
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
          o: ['Selects a running goroutine to stop when the program is shutting down or out of memory', 'Waits on multiple channel operations and proceeds with whichever is ready', 'Sorts several channels by how many values are buffered in each', 'Selects rows from a database using the database/sql package'],
          a: 1,
          e: 'Common with timeouts: case <-time.After(2 * time.Second) or case <-ctx.Done().',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you wait for multiple goroutines to finish?',
          o: ['sync.WaitGroup (Add, Done, Wait) or errgroup', 'time.Sleep long enough for them to finish', 'runtime.Gosched in a loop until they are done', 'A for loop that polls a shared bool variable'],
          a: 0,
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
          o: ['Running more goroutines than the machine has CPU cores', 'Creating more channels than goroutines, so channels are never garbage collected', 'Goroutines blocked forever (e.g. on a channel nobody uses), consuming memory', 'A panic inside a goroutine that is not recovered and crashes the program'],
          a: 2,
          e: 'Always provide exit paths: cancellation via context, closing channels, buffered channels for fire-and-forget results.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you detect data races in Go?',
          o: ['Run tests or the program with the -race flag', 'It is impossible to detect them in Go', 'Run gofmt -s, which flags unsafe shared variable access', 'Run go vet, which reports all data races'],
          a: 0,
          e: 'go test -race ./... reports unsynchronized concurrent memory access.',
        },
      ],
    },
  ],
};
