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
          o: ['Restarting the computer to load a different operating system', 'Switching the language a program is compiled to at runtime', 'The OS saving one process/thread\'s state and loading another\'s', 'Moving a running process from one disk partition or swap file to another'],
          a: 2,
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
          o: ['Round Robin', 'None', 'FCFS', 'Shortest Job First (SJF)'],
          a: 3,
          e: 'Short jobs keep jumping ahead. Aging (gradually raising priority) prevents starvation. Round robin gives each process a time quantum.',
        },
        {
          t: 'mcq', l: 2,
          q: 'User-level threads vs kernel threads vs green threads/goroutines: what is true about goroutines?',
          o: ['Each goroutine is a separate OS process with its own memory', 'Goroutines are lightweight runtime-managed threads multiplexed onto OS threads', 'Goroutines cannot run in parallel, only one runs at a time', 'Each goroutine is a dedicated kernel thread with a fixed 1 MB stack, created by the OS'],
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
          o: ['A mutex allows one thread in (with ownership); a counting semaphore allows up to N', 'They are identical; both allow exactly one holder at a time', 'A semaphore is always binary, while a mutex can count up to N holders at the same time', 'Mutexes only work between processes, semaphores only between threads'],
          a: 0,
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
          o: ['A lock that is never released because the thread that owned it crashed or was killed', 'A thread that is blocked waiting for a slow I/O operation', 'Threads keep reacting to each other and changing state but make no progress', 'A deadlock that happens only in production systems'],
          a: 2,
          e: 'Unlike deadlock, threads are active. Randomized backoff helps.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the producer-consumer problem typically use?',
          o: ['A bounded buffer with synchronization (mutex + conditions, or a blocking queue)', 'Only atomic counters, with no buffer between the two sides', 'A single global variable shared without any locks', 'Recursion, where the consumer calls the producer directly each time it needs a new item'],
          a: 0,
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
          o: ['Heap is faster than stack because it is always kept in CPU cache', 'Stack: automatic, LIFO frames and locals, fast and small; Heap: dynamic, longer-lived', 'They are the same region; the names are used interchangeably', 'Stack stores only objects and is managed by the GC, while heap stores only primitive local values'],
          a: 1,
          e: 'Stack overflow happens with deep recursion; memory leaks happen on the heap.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What causes thrashing?',
          o: ['Process working sets exceed physical memory, so the system mostly swaps pages', 'Too few processes are running, so the CPU keeps switching between them and their caches constantly', 'Fast SSDs that make swapping cheaper than using RAM', 'Too much free RAM, so the OS keeps moving pages around'],
          a: 0,
          e: 'Fix by reducing memory usage, adding RAM, or running fewer processes.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a memory leak in garbage-collected languages?',
          o: ['Declaring too many local variables in a function, so the stack fills up and memory is never released', 'The GC deleting objects that are still in use by the program', 'A stack overflow caused by deep recursion in the program', 'Objects no longer needed but still referenced (caches, listeners), so GC can\'t free them'],
          a: 3,
          e: 'GC frees unreachable objects only; unintended references keep memory growing.',
        },
      ],
    },
  ],
};
