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
          o: ['For no reason', 'Security, thread safety, caching of hash codes and the String pool can safely share instances', 'To save CPU only', 'Because char arrays are immutable'],
          a: 1,
          e: 'Use StringBuilder for building strings in loops (StringBuffer is the synchronized version).',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between == and .equals() for objects?',
          o: ['Same', '== compares references; equals() compares logical equality (as defined by the class)', 'equals compares references', '== compares content for Strings always'],
          a: 1,
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
          o: ['No difference', 'Checked exceptions (IOException) must be declared or caught at compile time; unchecked (RuntimeException subclasses like NullPointerException) do not', 'Unchecked must be caught', 'Errors are checked'],
          a: 1,
          e: 'Errors (OutOfMemoryError) indicate serious problems and usually should not be caught.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "final" keyword do?',
          o: ['Only makes variables constant', 'final variable: cannot be reassigned; final method: cannot be overridden; final class: cannot be extended', 'Marks garbage collection', 'Makes methods static'],
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
          o: ['Same performance', 'ArrayList: O(1) random access, amortized O(1) append; LinkedList: O(1) insert/remove at known nodes but O(n) access and worse cache locality', 'LinkedList has O(1) random access', 'ArrayList is synchronized'],
          a: 1,
          e: 'ArrayList is the right default in almost all cases.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which map keeps keys sorted?',
          o: ['HashMap', 'LinkedHashMap', 'TreeMap', 'Hashtable'],
          a: 2,
          e: 'TreeMap (red-black tree, O(log n)). LinkedHashMap keeps insertion (or access) order – useful for LRU caches.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a ConcurrentModificationException?',
          o: ['A database error', 'Thrown when a collection is structurally modified while iterating over it with a fail-fast iterator', 'A thread deadlock', 'A compile error'],
          a: 1,
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
          o: ['Atomicity of count++', 'Visibility: writes to the variable are immediately visible to other threads (and prevents certain reorderings)', 'Mutual exclusion', 'Faster access'],
          a: 1,
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
          o: ['Identical', 'synchronized is built-in and simple; ReentrantLock adds tryLock with timeout, interruptible locking, fairness and multiple conditions', 'ReentrantLock is not reentrant', 'synchronized supports timeouts'],
          a: 1,
          e: 'Both are reentrant. Use ReadWriteLock/StampedLock for read-heavy shared data.',
        },
        {
          t: 'mcq', l: 3,
          q: 'Why is double-checked locking for a singleton broken without volatile?',
          o: ['It is never broken', 'Instruction reordering may publish a reference to a partially constructed object to another thread', 'synchronized is too slow', 'Static fields are not allowed'],
          a: 1,
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
