module.exports = {
  slug: 'dsa',
  title: 'Data Structures & Algorithms',
  subtitle: 'Complexity, patterns, classic problems',
  description: 'DSA interview questions: Big-O, arrays, strings, hashing, linked lists, stacks/queues, trees, graphs, heaps, sorting, searching, dynamic programming and problem-solving patterns.',
  category: 'fundamentals',
  roles: ['software-engineer', 'backend', 'frontend', 'fullstack', 'mobile'],
  icon: 'functions',
  color: '#14B8A6',
  order: 60,
  topics: [
    {
      slug: 'complexity',
      title: 'Big-O & Complexity',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is Big-O notation? List common complexities from fastest to slowest.',
          e: `
**Big-O** describes how an algorithm's time or space grows as input size \`n\` grows (upper bound, worst case usually), ignoring constants.

| Complexity | Name | Example |
|---|---|---|
| O(1) | Constant | Hash map lookup, array index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Loop through array |
| O(n log n) | Linearithmic | Merge sort, heap sort |
| O(n²) | Quadratic | Nested loops, bubble sort |
| O(2ⁿ) | Exponential | Naive recursive Fibonacci, subsets |
| O(n!) | Factorial | All permutations |`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the time complexity of this code?',
          c: `for (let i = 0; i < n; i++) {
  for (let j = i; j < n; j++) {
    sum += arr[j];
  }
}`,
          o: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
          a: 2,
          e: 'Inner loop runs n + (n-1) + ... + 1 = n(n+1)/2 times, which is O(n²).',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the time complexity of binary search on a sorted array?',
          o: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
          a: 1,
          e: 'Each step halves the search space.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the time complexity of this loop?',
          c: `let i = 1;
while (i < n) {
  i = i * 2;
}`,
          o: ['O(n)', 'O(log n)', 'O(√n)', 'O(n²)'],
          a: 1,
          e: 'i doubles each iteration, so it runs log₂(n) times.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the space complexity of a recursive function with recursion depth n and O(1) work per call?',
          o: ['O(1)', 'O(log n)', 'O(n) due to the call stack', 'O(n²)'],
          a: 2,
          e: 'Each pending call occupies a stack frame. Deep recursion can cause stack overflow; iterative solutions use O(1) extra space.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Amortized time complexity of push() on a dynamic array (JS array / ArrayList)?',
          o: ['O(n)', 'O(1) amortized', 'O(log n)', 'O(n²)'],
          a: 1,
          e: 'Occasional resizes copy all elements (O(n)), but doubling capacity makes the average cost per push constant.',
        },
      ],
    },
    {
      slug: 'arrays-strings-hashing',
      title: 'Arrays, Strings & Hashing',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Two Sum: find indices of two numbers that add up to a target. Give an optimal solution.',
          e: `
**Brute force:** check all pairs – O(n²).

**Optimal: hash map** – O(n) time, O(n) space.
~~~js
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
~~~
If the array is **sorted**, use two pointers (left/right) for O(1) space.`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the sliding window technique with an example.',
          e: `
**Sliding window** maintains a window over a contiguous subarray/substring and moves its ends instead of recomputing from scratch – turns O(n²) into O(n).

**Example: longest substring without repeating characters**
~~~js
function lengthOfLongestSubstring(s) {
  const last = new Map();
  let start = 0, best = 0;
  for (let end = 0; end < s.length; end++) {
    if (last.has(s[end]) && last.get(s[end]) >= start) start = last.get(s[end]) + 1;
    last.set(s[end], end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}
// "abcabcbb" -> 3 ("abc")
~~~
Use for: max sum subarray of size k, smallest subarray with sum ≥ target, anagram finding, longest substring with k distinct chars.`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain the two pointers technique.',
          e: `
Use two indices moving through the data, typically from both ends or at different speeds.

**Examples**
- **Sorted pair sum:** left at start, right at end; move based on sum vs target.
- **Remove duplicates in-place** from a sorted array (slow/fast pointers).
- **Valid palindrome:** compare characters from both ends.
- **Container with most water**, **3Sum** (sort + fix one + two pointers -> O(n²)).
- **Fast & slow pointers** on linked lists: detect cycles, find the middle.

~~~js
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = s.length - 1;
  while (l < r) if (s[l++] !== s[r--]) return false;
  return true;
}
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which approach finds the maximum subarray sum in O(n)?',
          o: ['Sort the array', "Kadane's algorithm", 'Binary search', 'Recursion over all subarrays'],
          a: 1,
          e: "Kadane: current = max(x, current + x); best = max(best, current).",
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the average time complexity of insert/lookup in a hash table?',
          o: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
          a: 1,
          e: 'Worst case is O(n) with many collisions, but good hash functions and resizing keep the average O(1).',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you check if two strings are anagrams? And group anagrams?',
          e: `
**Check:** count character frequencies – O(n).
~~~js
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const ch of a) count[ch] = (count[ch] || 0) + 1;
  for (const ch of b) { if (!count[ch]) return false; count[ch]--; }
  return true;
}
~~~
**Group anagrams:** use a canonical key (sorted string or a 26-letter count signature) in a hash map.
~~~js
function groupAnagrams(words) {
  const map = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(w);
  }
  return [...map.values()];
}
~~~`,
        },
      ],
    },
    {
      slug: 'linked-lists-stacks-queues',
      title: 'Linked Lists, Stacks & Queues',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Reverse a singly linked list.',
          e: `
Iterative, O(n) time, O(1) space:
~~~js
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;  // save next
    curr.next = prev;        // reverse pointer
    prev = curr;             // move prev forward
    curr = next;             // move curr forward
  }
  return prev;
}
~~~
Recursive version uses O(n) stack space.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you detect a cycle in a linked list with O(1) extra space?',
          o: ['Store visited nodes in a set', "Floyd's tortoise and hare (slow and fast pointers)", 'Sort the list', 'Reverse the list twice'],
          a: 1,
          e: 'If fast (2 steps) ever meets slow (1 step), there is a cycle. A set works too but uses O(n) space.',
        },
        {
          t: 'qa', l: 1,
          q: 'Valid parentheses: check if a string of brackets is balanced.',
          e: `
Use a **stack** – O(n):
~~~js
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
~~~`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which data structure follows LIFO (Last In, First Out)?',
          o: ['Queue', 'Stack', 'Heap', 'Graph'],
          a: 1,
          e: 'Stacks: undo, call stack, DFS, expression parsing. Queues (FIFO): BFS, task scheduling.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Linked list vs array: which is true?',
          o: ['Linked lists have O(1) random access', 'Arrays have O(1) index access; linked lists have O(1) insert/delete at a known node but O(n) access by index', 'Arrays always use less memory', 'Linked lists are always faster'],
          a: 1,
          e: 'Arrays also benefit from CPU cache locality, which makes them faster in practice for most workloads.',
        },
        {
          t: 'qa', l: 3,
          q: 'Design an LRU cache with O(1) get and put.',
          e: `
Combine a **hash map** (key -> node) with a **doubly linked list** ordered by recency (most recent at head).
- \`get\`: lookup in the map, move node to head.
- \`put\`: update/insert at head; if over capacity, remove the tail node and its key.

In JavaScript, \`Map\` preserves insertion order, giving a compact implementation:
~~~js
class LRUCache {
  constructor(capacity) { this.cap = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key); this.map.set(key, val); // mark as most recent
    return val;
  }
  put(key, val) {
    this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value); // evict LRU
  }
}
~~~`,
        },
      ],
    },
    {
      slug: 'trees-graphs',
      title: 'Trees, Graphs & Heaps',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain tree traversals: inorder, preorder, postorder and level order.',
          e: `
**DFS traversals** (recursive or with a stack):
- **Preorder:** root -> left -> right (copy a tree, serialize)
- **Inorder:** left -> root -> right (**sorted order in a BST**)
- **Postorder:** left -> right -> root (delete a tree, evaluate expressions)

**BFS / level order:** visit level by level using a **queue**.
~~~js
function levelOrder(root) {
  const res = [], queue = root ? [root] : [];
  while (queue.length) {
    const level = [];
    for (let i = queue.length; i > 0; i--) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}
~~~`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the time complexity of search in a balanced Binary Search Tree?',
          o: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          a: 1,
          e: 'An unbalanced BST (e.g. inserting sorted data) degrades to O(n). Self-balancing trees (AVL, Red-Black) guarantee O(log n).',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which algorithm finds the shortest path in an unweighted graph?',
          o: ['DFS', 'BFS', 'Dijkstra only', 'Kruskal'],
          a: 1,
          e: 'BFS explores in order of distance. Dijkstra handles non-negative weights; Bellman-Ford handles negative weights.',
        },
        {
          t: 'qa', l: 2,
          q: 'BFS vs DFS: when do you use each?',
          e: `
**BFS (queue)**
- Shortest path in unweighted graphs, level-order processing, nearest neighbors
- Memory: O(width) – can be large for wide graphs

**DFS (stack/recursion)**
- Path existence, cycle detection, topological sort, connected components, backtracking (permutations, N-Queens), flood fill
- Memory: O(depth)

Both are O(V + E) with an adjacency list.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which data structure efficiently gives the k largest elements from a stream?',
          o: ['Sorted array re-sorted on each insert', 'A min-heap of size k', 'A stack', 'A linked list'],
          a: 1,
          e: 'Keep a min-heap of size k; if a new element is bigger than the root, replace it. O(n log k).',
        },
        {
          t: 'mcq', l: 3,
          q: 'Which algorithm orders tasks with dependencies (e.g. course prerequisites, build order)?',
          o: ['Binary search', 'Topological sort (Kahn\'s algorithm or DFS) on a DAG', 'Quick sort', 'Prim\'s algorithm'],
          a: 1,
          e: 'If a topological order cannot include all nodes, the graph has a cycle (impossible schedule).',
        },
        {
          t: 'qa', l: 2,
          q: 'Number of islands: count connected groups of "1"s in a grid.',
          e: `
Traverse each cell; when you find unvisited land, increment the count and **flood fill** (DFS/BFS) to mark the whole island visited. O(rows × cols).
~~~js
function numIslands(grid) {
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] === '1') { count++; sink(r, c); }
  return count;
}
~~~`,
        },
      ],
    },
    {
      slug: 'sorting-dp',
      title: 'Sorting, Searching & Dynamic Programming',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'Compare common sorting algorithms.',
          e: `
| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble/Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |
| **Merge sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| **Quick sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting/Radix | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes |

Insertion sort is great for small or nearly sorted arrays. JS engines use **TimSort** (merge + insertion, stable).`,
        },
        {
          t: 'mcq', l: 2,
          q: 'When does quicksort hit its O(n²) worst case?',
          o: ['Random data', 'When pivots are consistently the smallest or largest element (e.g. already sorted input with first-element pivot)', 'Small arrays', 'Never'],
          a: 1,
          e: 'Random or median-of-three pivots make the worst case very unlikely.',
        },
        {
          t: 'qa', l: 2,
          q: 'What is dynamic programming? Explain memoization vs tabulation.',
          e: `
**Dynamic programming** solves problems with **overlapping subproblems** and **optimal substructure** by storing results of subproblems instead of recomputing them.

**Memoization (top-down):** recursion + cache.
~~~js
const memo = new Map();
function fib(n) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const v = fib(n - 1) + fib(n - 2);
  memo.set(n, v);
  return v;
}
~~~
**Tabulation (bottom-up):** fill a table iteratively.
~~~js
function fibTab(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;   // O(n) time, O(1) space
}
~~~
Classic DP problems: climbing stairs, coin change, longest common subsequence, 0/1 knapsack, edit distance, house robber, longest increasing subsequence.`,
        },
        {
          t: 'qa', l: 3,
          q: 'Coin change: minimum number of coins to make an amount.',
          e: `
\`dp[x]\` = minimum coins to make amount \`x\`. Transition: \`dp[x] = min(dp[x - coin] + 1)\` for each coin.
~~~js
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++)
    for (const c of coins)
      if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}
// coins [1,2,5], amount 11 -> 3 (5+5+1)
~~~
Time O(amount × coins), space O(amount). Greedy fails for coin sets like [1, 3, 4] with amount 6.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the time complexity of naive recursive Fibonacci fib(n) = fib(n-1) + fib(n-2)?',
          o: ['O(n)', 'O(n log n)', 'O(2ⁿ) (roughly O(1.618ⁿ))', 'O(n²)'],
          a: 2,
          e: 'Exponential due to recomputing the same subproblems; memoization reduces it to O(n).',
        },
        {
          t: 'qa', l: 2,
          q: 'Find the first and last position of a target in a sorted array (binary search variant).',
          e: `
Run binary search twice – once biased left, once biased right. O(log n).
~~~js
function searchRange(nums, target) {
  const find = (leftmost) => {
    let lo = 0, hi = nums.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] === target) { ans = mid; leftmost ? (hi = mid - 1) : (lo = mid + 1); }
      else if (nums[mid] < target) lo = mid + 1;
      else hi = mid - 1;
    }
    return ans;
  };
  return [find(true), find(false)];
}
~~~`,
        },
      ],
    },
  ],
};
