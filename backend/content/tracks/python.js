module.exports = {
  slug: 'python',
  title: 'Python',
  subtitle: 'Core language, OOP, async, GIL',
  description: 'Python interview questions: data types, mutability, comprehensions, decorators, generators, OOP, memory and GIL, concurrency with threads/processes/asyncio, and output-based questions.',
  category: 'languages',
  roles: ['backend', 'software-engineer', 'devops'],
  icon: 'code',
  color: '#3776AB',
  order: 14,
  topics: [
    {
      slug: 'core',
      title: 'Core Language',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What are mutable and immutable types in Python?',
          e: `
- **Immutable:** \`int\`, \`float\`, \`bool\`, \`str\`, \`tuple\`, \`frozenset\`, \`bytes\` – cannot change after creation; "modifying" creates a new object.
- **Mutable:** \`list\`, \`dict\`, \`set\`, \`bytearray\`, most user-defined objects.

Why it matters:
- Only immutable (hashable) objects can be **dict keys / set members**.
- Mutable objects passed to functions can be changed by the callee.
- Mutable default arguments are a classic bug (see next question).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the output?',
          c: `def add(item, items=[]):
    items.append(item)
    return items

print(add(1))
print(add(2))`,
          o: ['[1, 2] then [1, 2]', '[1] then [1, 2]', '[1] then [2]', 'Error'],
          a: 1,
          e: 'Default arguments are evaluated once at function definition, so the same list is shared across calls. Use items=None and create a new list inside.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between a list and a tuple?',
          o: ['Tuples are mutable, while lists are fixed once they are created and cannot change', 'Lists are mutable; tuples are immutable (hashable if their items are)', 'There is no difference; tuple is just the older name for list', 'Lists cannot hold mixed types, while tuples can hold any types'],
          a: 1,
          e: 'Tuples work as dict keys and signal "this should not change".',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between "is" and "=="?',
          o: ['"is" compares values; "==" compares identity', '"==" compares memory addresses of the two names', 'They are identical; "is" is just more readable', '"==" compares values; "is" compares identity'],
          a: 3,
          e: 'Use "is" for None checks (x is None). Small integers and interned strings may appear identical due to caching – never rely on that.',
        },
        {
          t: 'qa', l: 1,
          q: 'What are list, dict and set comprehensions?',
          e: `
Concise syntax to build collections:
~~~python
squares = [x * x for x in range(10) if x % 2 == 0]   # list
lookup  = {u.id: u for u in users}                    # dict
unique  = {w.lower() for w in words}                  # set
total   = sum(x * x for x in range(10**6))            # generator expression (lazy, low memory)
~~~
More readable and usually faster than equivalent loops with append. Avoid deeply nested comprehensions.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Shallow copy vs deep copy?',
          o: ['copy.deepcopy() shares nested objects, while copy.copy() copies all of them recursively', 'Plain assignment creates a deep copy, so copy.copy() is rarely needed', 'copy.copy() shares nested objects; copy.deepcopy() copies everything recursively', 'They are the same; both copy nested objects recursively'],
          a: 2,
          e: 'b = a just creates another reference to the same object.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What do *args and **kwargs mean?',
          o: ['*args collects extra positional args as a tuple; **kwargs extra keyword args as a dict', 'Type hints that tell mypy the function accepts arguments of any type, positional or keyword', 'Markers for required positional and keyword arguments', 'Pointers to the arguments, like * and ** in C'],
          a: 0,
          e: 'They also unpack: f(*my_list, **my_dict).',
        },
      ],
    },
    {
      slug: 'functions-advanced',
      title: 'Decorators, Generators & Context Managers',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is a decorator? Write a timing decorator.',
          e: `
A **decorator** is a function that takes a function and returns a new function that extends its behavior – without modifying the original code.

~~~python
import functools, time

def timed(fn):
    @functools.wraps(fn)            # preserve name/docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__} took {time.perf_counter() - start:.3f}s")
    return wrapper

@timed
def fetch_users(): ...
~~~
Used for logging, caching (\`@functools.lru_cache\`), auth checks (\`@login_required\`), routing (\`@app.get("/")\`), retries.`,
        },
        {
          t: 'qa', l: 2,
          q: 'What are generators and why are they memory efficient?',
          e: `
A **generator** is a function using \`yield\`; it returns an iterator that produces values **lazily**, one at a time, pausing between them.

~~~python
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

for line in read_large_file("huge.log"):   # never loads the whole file
    process(line)
~~~
Memory stays constant regardless of data size. Generators can be chained into pipelines; \`yield from\` delegates to sub-generators.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the "with" statement (context manager) guarantee?',
          o: ['Setup and cleanup (__enter__/__exit__) run reliably, even if an exception occurs', 'Lazy evaluation, so the block only runs when its result is used', 'Faster execution, since the block is compiled ahead of time', 'Thread safety, because only one thread can enter the block at a time, even across processes'],
          a: 0,
          e: 'Create your own with a class or @contextlib.contextmanager.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does @functools.lru_cache do?',
          o: ['Logs every call to the function together with its arguments', 'Runs the function in a background thread pool', 'Memoizes results by arguments, with a bounded LRU size', 'Makes the function\'s arguments immutable'],
          a: 2,
          e: 'Arguments must be hashable. @functools.cache is the unbounded version.',
        },
      ],
    },
    {
      slug: 'oop-memory-concurrency',
      title: 'OOP, Memory & Concurrency',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is the GIL and how does it affect concurrency?',
          e: `
The **Global Interpreter Lock** in CPython allows only **one thread to execute Python bytecode at a time** per process.

**Impact**
- **CPU-bound** work doesn't speed up with threads -> use **multiprocessing** (separate processes, each with its own GIL), C extensions (NumPy releases the GIL), or other runtimes.
- **I/O-bound** work benefits from threads or **asyncio**, because the GIL is released while waiting on I/O.

Python 3.13+ offers an experimental **free-threaded build (no GIL)**, making true multi-threaded parallelism possible.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'For downloading 1,000 web pages concurrently, which approach is most efficient in Python?',
          o: ['multiprocessing with 1,000 separate processes, one per URL', 'A single synchronous loop using requests', 'Recursion, with one call per page', 'asyncio with an async HTTP client, or a thread pool'],
          a: 3,
          e: 'The work is I/O-bound; async/threads overlap waiting time. Processes add overhead without benefit here.',
        },
        {
          t: 'qa', l: 2,
          q: 'Explain @staticmethod, @classmethod and instance methods.',
          e: `
~~~python
class User:
    count = 0
    def __init__(self, name):      # instance method: receives self
        self.name = name
        User.count += 1

    @classmethod
    def from_dict(cls, data):      # receives the class: alternative constructors, works with subclasses
        return cls(data["name"])

    @staticmethod
    def is_valid_name(name):       # no self/cls: utility grouped in the class
        return len(name) > 1
~~~`,
        },
        {
          t: 'mcq', l: 3,
          q: 'How does Python manage memory?',
          o: ['There is no garbage collection; memory is only freed when the interpreter process exits', 'Only a tracing GC that pauses the program to scan all objects', 'Reference counting plus a cyclic GC for reference cycles, on a private heap', 'Developers call malloc and free manually through the ctypes module'],
          a: 2,
          e: 'Objects are freed when their refcount hits zero; the gc module detects unreachable cycles.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What are dunder (magic) methods like __str__, __repr__, __eq__, __len__?',
          o: ['Special methods that let classes work with Python syntax and built-ins', 'Private methods that cannot be called from outside the class', 'Async methods that run on the event loop whenever the object is used', 'Deprecated methods kept only for Python 2 compatibility'],
          a: 0,
          e: '__repr__ is for developers (unambiguous), __str__ for users. @dataclass generates __init__, __repr__ and __eq__ automatically.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does MRO (Method Resolution Order) determine?',
          o: ['The order in which threads are scheduled and released by the GIL', 'The order base classes are searched for a method (C3 linearization)', 'The order in which objects are allocated in memory', 'The order in which modules are imported at startup'],
          a: 1,
          e: 'Inspect with ClassName.__mro__. super() follows the MRO.',
        },
      ],
    },
  ],
};
