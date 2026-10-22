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
          o: ['[1] then [2]', '[1] then [1, 2]', '[1, 2] then [1, 2]', 'Error'],
          a: 1,
          e: 'Default arguments are evaluated once at function definition, so the same list is shared across calls. Use items=None and create a new list inside.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between a list and a tuple?',
          o: ['No difference', 'Lists are mutable; tuples are immutable (hashable if their items are), slightly faster and used for fixed records', 'Tuples are mutable', 'Lists cannot hold mixed types'],
          a: 1,
          e: 'Tuples work as dict keys and signal "this should not change".',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between "is" and "=="?',
          o: ['Identical', '"==" compares values; "is" compares identity (same object in memory)', '"is" compares values', '"==" compares memory addresses'],
          a: 1,
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
          o: ['Same thing', 'copy.copy() copies the outer container but shares nested objects; copy.deepcopy() recursively copies everything', 'deepcopy is shallower', 'Assignment creates a deep copy'],
          a: 1,
          e: 'b = a just creates another reference to the same object.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What do *args and **kwargs mean?',
          o: ['Pointers', '*args collects extra positional arguments as a tuple; **kwargs collects extra keyword arguments as a dict', 'Required arguments', 'Type hints'],
          a: 1,
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
          o: ['Faster execution', 'Setup and cleanup (__enter__/__exit__) run reliably, e.g. files closed and locks released even if an exception occurs', 'Thread safety', 'Lazy evaluation'],
          a: 1,
          e: 'Create your own with a class or @contextlib.contextmanager.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What does @functools.lru_cache do?',
          o: ['Logs function calls', 'Memoizes function results based on arguments, with a bounded LRU size', 'Runs the function in a thread', 'Makes arguments immutable'],
          a: 1,
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
          o: ['multiprocessing with 1,000 processes', 'asyncio with an async HTTP client (aiohttp/httpx) or a thread pool', 'A single synchronous loop', 'Recursion'],
          a: 1,
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
          o: ['Manual malloc/free only', 'Reference counting plus a cyclic garbage collector for reference cycles, with a private heap and object allocators', 'Only a tracing GC', 'No garbage collection'],
          a: 1,
          e: 'Objects are freed when their refcount hits zero; the gc module detects unreachable cycles.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What are dunder (magic) methods like __str__, __repr__, __eq__, __len__?',
          o: ['Private methods', 'Special methods that let classes integrate with Python syntax and built-ins (printing, comparison, len(), iteration, operators)', 'Deprecated methods', 'Async methods'],
          a: 1,
          e: '__repr__ is for developers (unambiguous), __str__ for users. @dataclass generates __init__, __repr__ and __eq__ automatically.',
        },
        {
          t: 'mcq', l: 3,
          q: 'What does MRO (Method Resolution Order) determine?',
          o: ['Memory allocation order', 'The order in which base classes are searched for a method in multiple inheritance (C3 linearization)', 'Import order', 'Thread scheduling'],
          a: 1,
          e: 'Inspect with ClassName.__mro__. super() follows the MRO.',
        },
      ],
    },
  ],
};
