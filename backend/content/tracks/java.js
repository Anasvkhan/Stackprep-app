module.exports = {
  slug: 'java',
  title: 'Java',
  subtitle: 'Core, collections, JVM, concurrency',
  description: 'Java interview questions: OOP in Java, strings, collections internals (HashMap), exceptions, JVM memory and GC, multithreading and concurrency, streams and modern Java features.',
  category: 'languages',
  roles: ['backend', 'software-engineer', 'mobile'],
  icon: 'coffee',
  color: '#E76F00',
  order: 15,
  topics: [
    {
      slug: 'core',
      title: 'Core Java',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is the difference between JDK, JRE and JVM?',
          e: `
- **JVM (Java Virtual Machine):** executes Java bytecode; provides memory management, GC, JIT compilation. Platform-specific.
- **JRE (Java Runtime Environment):** JVM + core libraries needed to **run** Java apps.
- **JDK (Java Development Kit):** JRE + development tools (javac compiler, debugger, jshell) needed to **build** Java apps.

"Write once, run anywhere": source -> bytecode (.class) -> runs on any JVM.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Why are Strings immutable in Java?',
          o: ['Because the underlying char arrays are immutable at the JVM level', 'Security, thread safety, cached hash codes, and the String pool can share instances', 'There is no real reason; it is a historical design choice from Java 1.0', 'Only to save CPU, since mutable strings need more instructions and memory per change'],
          a: 1,
          e: 'Use StringBuilder for building strings in loops (StringBuffer is the synchronized version).',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between == and .equals() for objects?',
          o: ['== always compares content for Strings, equals() never does', 'They are the same; both compare object references', 'equals() compares references; == compares content', '== compares references; equals() compares logical equality'],
          a: 3,
          e: 'If you override equals(), you must override hashCode() consistently.',
        },
        {
          t: 'qa', l: 2,
          q: 'Why must hashCode() be overridden when equals() is overridden?',
          e: `
Contract: **if \`a.equals(b)\` then \`a.hashCode() == b.hashCode()\`**.

Hash-based collections (\`HashMap\`, \`HashSet\`) first use \`hashCode()\` to find the bucket, then \`equals()\` within it. If equal objects have different hash codes, they land in different buckets: \`set.contains(equalObject)\` returns false and duplicates appear.

Use \`Objects.hash(fields...)\`, IDE generation, or **records** (Java 16+) which generate equals/hashCode/toString automatically.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Checked vs unchecked exceptions?',
          o: ['Checked (IOException) must be caught or declared; unchecked (RuntimeException) need not', 'Unchecked exceptions must always be caught or declared, while checked ones are optional', 'There is no difference; both must be declared in the method signature', 'Errors like OutOfMemoryError are checked and must be declared everywhere'],
          a: 0,
          e: 'Errors (OutOfMemoryError) indicate serious problems and usually should not be caught.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "final" keyword do?',
          o: ['It marks an object as ready for garbage collection as soon as the enclosing block finishes', 'final variable: no reassign; final method: no override; final class: no extending', 'It makes methods static, so they can be called without an instance', 'It only makes variables constant; methods and classes cannot use it'],
          a: 1,
          e: 'final on a reference does not make the object immutable.',
        },
      ],
    },
    {
      slug: 'collections',
      title: 'Collections & Streams',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How does HashMap work internally?',
          e: `
- Backed by an **array of buckets** (default capacity 16).
- \`put(key, value)\`: compute \`hash(key)\` (hashCode with spreading), index = \`hash & (n - 1)\`.
- **Collisions** stored as a linked list in the bucket; since Java 8, a bucket with > 8 entries converts to a **red-black tree** (O(log n) worst case instead of O(n)).
- \`get\` finds the bucket, then uses \`equals()\` to match the key.
- **Load factor 0.75:** when size > capacity × 0.75, the table **resizes** (doubles) and rehashes.
- Allows one null key; **not thread-safe** – use \`ConcurrentHashMap\` for concurrency.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'ArrayList vs LinkedList?',
          o: ['ArrayList is synchronized and thread-safe, while LinkedList is not', 'LinkedList has O(1) random access by index, while ArrayList needs O(n) to find an element at an index', 'ArrayList: O(1) random access; LinkedList: O(1) insert/remove at a node but O(n) access', 'They have the same performance for all operations; only the API differs'],
          a: 2,
          e: 'ArrayList is the right default in almost all cases.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which map keeps keys sorted?',
          o: ['TreeMap', 'LinkedHashMap', 'Hashtable', 'HashMap'],
          a: 0,
          e: 'TreeMap (red-black tree, O(log n)). LinkedHashMap keeps insertion (or access) order – useful for LRU caches.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a ConcurrentModificationException?',
          o: ['Thrown when a collection is structurally modified while iterating with a fail-fast iterator', 'A compile error raised when a final collection is modified inside a method or a lambda', 'Thrown when two threads deadlock while waiting on each other\'s locks', 'A database error thrown when two transactions update the same row'],
          a: 0,
          e: 'Use iterator.remove(), removeIf(), or concurrent collections.',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain Java Streams with an example.',
          e: `
Streams provide declarative, functional-style processing of collections (Java 8+):
~~~java
Map<String, Double> avgSalaryByDept = employees.stream()
    .filter(e -> e.getSalary() > 50_000)
    .collect(Collectors.groupingBy(Employee::getDepartment,
             Collectors.averagingDouble(Employee::getSalary)));

List<String> names = users.stream()
    .map(User::getName)
    .sorted()
    .distinct()
    .toList();
~~~
- **Intermediate ops** (map, filter, sorted) are **lazy**; **terminal ops** (collect, forEach, reduce) trigger execution.
- Streams can be consumed once.
- \`parallelStream()\` uses the ForkJoinPool – only for large CPU-bound workloads.`,
        },
      ],
    },
    {
      slug: 'jvm-concurrency',
      title: 'JVM, GC & Concurrency',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Explain JVM memory areas and garbage collection.',
          e: `
**Memory areas**
- **Heap:** objects; divided into **Young generation** (Eden + Survivor spaces) and **Old generation**
- **Stack:** per thread – frames, local variables, references
- **Metaspace:** class metadata (replaced PermGen)
- PC registers, native method stacks

**GC:** most objects die young -> frequent minor GCs in Young gen; survivors promoted to Old gen; major GCs are more expensive.

**Collectors:** G1 (default, region-based, balanced), ZGC and Shenandoah (low pause, large heaps), Parallel (throughput), Serial.

Tune with \`-Xms\`/\`-Xmx\`, choose collector by latency/throughput needs.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "volatile" keyword guarantee?',
          o: ['Atomicity of compound operations like count++', 'Mutual exclusion, like a synchronized block', 'Visibility: writes are immediately visible to other threads', 'Faster access, by keeping the value in a CPU register instead of RAM'],
          a: 2,
          e: 'volatile does not make compound actions atomic; use AtomicInteger or synchronization for count++.',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you create threads in Java and what is an ExecutorService?',
          e: `
- Extend \`Thread\` or implement \`Runnable\`/\`Callable\` – but managing raw threads is error-prone.
- **ExecutorService** manages a **thread pool**, reusing threads and queuing tasks:
~~~java
ExecutorService pool = Executors.newFixedThreadPool(8);
Future<Integer> f = pool.submit(() -> compute());
Integer result = f.get();
pool.shutdown();
~~~
- **CompletableFuture** composes async pipelines (\`thenApply\`, \`thenCompose\`, \`allOf\`).
- **Virtual threads** (Java 21): \`Executors.newVirtualThreadPerTaskExecutor()\` – lightweight threads that make blocking I/O code scale like async code.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'synchronized vs ReentrantLock?',
          o: ['They are identical; ReentrantLock is just the class behind synchronized', 'synchronized supports timeouts and fairness, while ReentrantLock does not', 'ReentrantLock is not actually reentrant, so the same thread cannot acquire it twice in a row', 'synchronized is simple; ReentrantLock adds tryLock, interruptible locking, fairness'],
          a: 3,
          e: 'Both are reentrant. Use ReadWriteLock/StampedLock for read-heavy shared data.',
        },
        {
          t: 'mcq', l: 3,
          q: 'Why is double-checked locking for a singleton broken without volatile?',
          o: ['synchronized is too slow, so the second check is skipped under load', 'Static fields are not allowed to hold singleton instances in Java', 'Reordering may publish a reference to a partially constructed object', 'It is never broken; the synchronized block already prevents all issues'],
          a: 2,
          e: 'Mark the instance volatile, or use the holder-class idiom / enum singleton.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which modern Java feature provides concise immutable data carriers?',
          o: ['Lambdas', 'Records', 'Annotations', 'Generics'],
          a: 1,
          e: 'record Point(int x, int y) {} generates constructor, accessors, equals, hashCode and toString. Also see sealed classes and pattern matching for switch.',
        },
      ],
    },
  ],
};
