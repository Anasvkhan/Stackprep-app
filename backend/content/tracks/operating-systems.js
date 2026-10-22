module.exports = {
  slug: 'operating-systems',
  title: 'Operating Systems & Concurrency',
  subtitle: 'Processes, threads, memory, locks',
  description: 'OS interview questions: processes vs threads, scheduling, concurrency, deadlocks, synchronization primitives, memory management and virtual memory.',
  category: 'fundamentals',
  roles: ['software-engineer', 'backend', 'devops'],
  icon: 'memory',
  color: '#64748B',
  order: 63,
  topics: [
    {
      slug: 'processes-threads',
      title: 'Processes & Threads',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is the difference between a process and a thread?',
          e: `
| | Process | Thread |
|---|---|---|
| Definition | Independent program in execution | Unit of execution inside a process |
| Memory | Own address space | **Shares** the process memory (heap, globals) |
| Creation cost | Heavy | Light |
| Communication | IPC (pipes, sockets, shared memory) | Shared variables (needs synchronization) |
| Crash impact | Isolated | A crashing thread can bring down the whole process |

Each thread has its own stack, registers and program counter.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is a context switch?',
          o: ['Changing programming languages', 'The OS saving the state of one process/thread and loading another\'s so the CPU can run it', 'Switching git branches', 'Restarting the computer'],
          a: 1,
          e: 'Context switches have overhead (saving registers, cache/TLB effects); thread switches are cheaper than process switches.',
        },
        {
          t: 'qa', l: 2,
          q: 'Concurrency vs parallelism?',
          e: `
- **Concurrency:** dealing with many tasks at once by **interleaving** them – progress on multiple tasks over overlapping time periods (possible on a single core). *Node.js event loop.*
- **Parallelism:** **executing** multiple tasks at the **same instant** on multiple cores/CPUs.

"Concurrency is about structure, parallelism is about execution." A concurrent program may or may not run in parallel.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which CPU scheduling algorithm can cause starvation of long jobs?',
          o: ['Round Robin', 'Shortest Job First (SJF)', 'FCFS', 'None'],
          a: 1,
          e: 'Short jobs keep jumping ahead. Aging (gradually raising priority) prevents starvation. Round robin gives each process a time quantum.',
        },
        {
          t: 'mcq', l: 2,
          q: 'User-level threads vs kernel threads vs green threads/goroutines: what is true about goroutines?',
          o: ['Each goroutine is an OS process', 'Goroutines are lightweight runtime-managed threads multiplexed onto a small number of OS threads (M:N scheduling)', 'Goroutines cannot run in parallel', 'They use 1 MB stacks each'],
          a: 1,
          e: 'Goroutines start with small (~2-8 KB) growable stacks, so you can run hundreds of thousands. Java virtual threads use the same idea.',
        },
      ],
    },
    {
      slug: 'synchronization',
      title: 'Synchronization & Deadlocks',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is a race condition and how do you prevent it?',
          e: `
A **race condition** occurs when the result depends on the unpredictable timing of threads accessing shared data, and at least one writes.

~~~
counter = counter + 1   // read, add, write – not atomic
Thread A reads 5, Thread B reads 5, both write 6 -> one increment lost
~~~
**Prevention**
- **Mutex/locks** around critical sections
- **Atomic operations** (compare-and-swap, AtomicInteger)
- **Immutable data** and message passing (actors, channels)
- **Thread confinement** (data owned by one thread)
- Database-level: transactions, row locks, optimistic concurrency`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Mutex vs semaphore?',
          o: ['Identical', 'A mutex allows one thread into a critical section (with ownership); a counting semaphore allows up to N concurrent holders', 'A semaphore is always binary', 'Mutexes are only for processes'],
          a: 1,
          e: 'Semaphores are useful for limiting concurrency, e.g. a pool of 10 DB connections.',
        },
        {
          t: 'qa', l: 2,
          q: 'What are the four necessary conditions for deadlock (Coffman conditions)? How do you prevent deadlocks?',
          e: `
All four must hold:
1. **Mutual exclusion** – resources can't be shared
2. **Hold and wait** – a thread holds one resource while waiting for another
3. **No preemption** – resources can't be forcibly taken
4. **Circular wait** – a cycle of threads each waiting on the next

**Prevention/handling**
- Break circular wait: **acquire locks in a global order**
- Acquire all locks at once or use \`tryLock\` with **timeouts** and back off
- Keep critical sections small
- Detection + recovery (databases detect cycles and abort a victim)
- Banker's algorithm (avoidance – rarely used in practice)`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is a livelock?',
          o: ['A deadlock in a live system', 'Threads keep changing state in response to each other but make no progress (like two people repeatedly stepping aside in a hallway)', 'A lock that never releases', 'A thread waiting for I/O'],
          a: 1,
          e: 'Unlike deadlock, threads are active. Randomized backoff helps.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the producer-consumer problem typically use?',
          o: ['A single global variable without locks', 'A bounded buffer with synchronization (mutex + condition variables or semaphores, or a blocking queue)', 'Recursion', 'Only atomic counters'],
          a: 1,
          e: 'Producers block when the buffer is full, consumers block when empty. Message queues are the distributed version.',
        },
      ],
    },
    {
      slug: 'memory',
      title: 'Memory Management',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is virtual memory and paging?',
          e: `
**Virtual memory** gives each process the illusion of a large, private, contiguous address space, mapped by the OS + MMU to physical RAM (and disk).

- Memory is divided into fixed-size **pages** (e.g. 4 KB) mapped to physical **frames** via **page tables**.
- **TLB** caches recent translations for speed.
- **Page fault:** accessed page not in RAM -> OS loads it from disk (swap). Too many faults = **thrashing**.

**Benefits:** process isolation/security, programs larger than RAM, memory sharing (shared libraries), copy-on-write (fork).`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Stack vs heap memory?',
          o: ['Same thing', 'Stack: automatic, LIFO, function frames and local variables, fast and limited; Heap: dynamic allocations with longer lifetimes, managed manually or by GC', 'Heap is faster than stack', 'Stack stores objects only'],
          a: 1,
          e: 'Stack overflow happens with deep recursion; memory leaks happen on the heap.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What causes thrashing?',
          o: ['Too much free RAM', 'The working set of processes exceeds physical memory, so the system spends most time swapping pages', 'Fast SSDs', 'Too few processes'],
          a: 1,
          e: 'Fix by reducing memory usage, adding RAM, or running fewer processes.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a memory leak in garbage-collected languages?',
          o: ['GC deleting live objects', 'Objects that are no longer needed but are still referenced (caches, listeners, globals), so the GC cannot free them', 'Using too many variables', 'Stack overflow'],
          a: 1,
          e: 'GC frees unreachable objects only; unintended references keep memory growing.',
        },
      ],
    },
  ],
};
