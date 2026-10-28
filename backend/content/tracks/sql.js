module.exports = {
  slug: 'sql',
  title: 'SQL & Relational Databases',
  subtitle: 'Queries, joins, normalization, tuning',
  description: 'SQL interview questions: joins, aggregation, subqueries, window functions, normalization, keys and constraints, query optimization and classic query problems (PostgreSQL/MySQL).',
  category: 'databases',
  roles: ['backend', 'fullstack', 'software-engineer', 'devops'],
  icon: 'storage',
  color: '#336791',
  order: 40,
  topics: [
    {
      slug: 'queries-joins',
      title: 'Queries & Joins',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain the different types of SQL joins.',
          e: `
- **INNER JOIN:** rows with matches in both tables.
- **LEFT (OUTER) JOIN:** all rows from the left table + matches from the right (NULLs when no match).
- **RIGHT (OUTER) JOIN:** all rows from the right + matches from the left.
- **FULL OUTER JOIN:** all rows from both, NULLs where no match.
- **CROSS JOIN:** Cartesian product (every combination).
- **SELF JOIN:** a table joined with itself (e.g. employees and their managers).

~~~sql
SELECT u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;   -- users even without orders
~~~`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which query finds users who have NEVER placed an order?',
          o: ['SELECT * FROM orders o RIGHT JOIN users u ON o.user_id = u.id WHERE o.id = NULL', 'SELECT u.* FROM users u INNER JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL', 'SELECT u.* FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL', 'SELECT u.* FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.id IS NULL'],
          a: 2,
          e: 'Anti-join pattern. NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id) is equivalent and often clearer. Note "= NULL" never matches; use IS NULL.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the difference between WHERE and HAVING?',
          o: ['HAVING filters rows before grouping; WHERE filters groups after GROUP BY', 'There is no difference; both filter rows before grouping', 'WHERE filters rows before grouping; HAVING filters groups after GROUP BY', 'WHERE works only with numeric columns; HAVING works with any column'],
          a: 2,
          e: 'SELECT user_id, COUNT(*) FROM orders WHERE status = "paid" GROUP BY user_id HAVING COUNT(*) > 5.',
        },
        {
          t: 'qa', l: 1,
          q: 'What is the logical order of execution of a SQL SELECT query?',
          e: `
1. **FROM** / **JOIN**
2. **WHERE**
3. **GROUP BY**
4. **HAVING**
5. **SELECT** (expressions, aliases, window functions)
6. **DISTINCT**
7. **ORDER BY**
8. **LIMIT / OFFSET**

That's why you can't use a SELECT alias in WHERE (it doesn't exist yet), but you can in ORDER BY.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does COUNT(column) count compared to COUNT(*)?',
          o: ['COUNT(column) counts only distinct values; COUNT(*) counts all rows', 'COUNT(column) ignores NULLs in that column; COUNT(*) counts all rows', 'They are identical; both count every row in the table', 'COUNT(*) ignores NULLs; COUNT(column) counts all rows including NULLs'],
          a: 1,
          e: 'COUNT(DISTINCT column) counts unique non-null values.',
        },
        {
          t: 'mcq', l: 2,
          q: 'UNION vs UNION ALL?',
          o: ['UNION removes duplicates; UNION ALL keeps all rows and is faster', 'UNION only works when both queries read the same table', 'UNION ALL removes duplicates; UNION keeps all rows and is faster', 'They are identical; ALL is an optional keyword'],
          a: 0,
          e: 'Use UNION ALL unless you specifically need deduplication.',
        },
        {
          t: 'qa', l: 2,
          q: 'Write a query to find the second highest salary.',
          e: `
~~~sql
-- Option 1: subquery
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Option 2: DISTINCT + OFFSET
SELECT DISTINCT salary FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;

-- Option 3: window function (handles "Nth highest" and ties)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t WHERE rnk = 2 LIMIT 1;
~~~`,
        },
        {
          t: 'qa', l: 2,
          q: 'How do you find duplicate emails in a users table and delete duplicates keeping the lowest id?',
          e: `
~~~sql
-- find duplicates
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- delete duplicates (PostgreSQL), keep min id
DELETE FROM users u
USING users d
WHERE u.email = d.email AND u.id > d.id;

-- generic with window function
DELETE FROM users WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn FROM users
  ) t WHERE rn > 1
);
~~~
Then add a **UNIQUE constraint** on email to prevent it happening again.`,
        },
      ],
    },
    {
      slug: 'advanced-sql',
      title: 'Window Functions, CTEs & Subqueries',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What are window functions? Give examples.',
          e: `
Window functions compute values **across a set of related rows** without collapsing them like GROUP BY.

~~~sql
SELECT
  department, name, salary,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  AVG(salary)  OVER (PARTITION BY department)                       AS dept_avg,
  SUM(amount)  OVER (ORDER BY created_at)                           AS running_total,
  LAG(amount)  OVER (ORDER BY created_at)                           AS prev_amount
FROM employees;
~~~
- **ROW_NUMBER:** unique sequence (1,2,3,4)
- **RANK:** ties share rank, gaps after (1,1,3)
- **DENSE_RANK:** ties share rank, no gaps (1,1,2)
- **LAG/LEAD:** previous/next row values
- Classic use: "top 3 products per category", running totals, month-over-month growth.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'For salaries 100, 100, 90 ordered DESC, what do RANK() and DENSE_RANK() return for 90?',
          o: ['RANK 3, DENSE_RANK 3', 'RANK 3, DENSE_RANK 2', 'RANK 2, DENSE_RANK 2', 'RANK 2, DENSE_RANK 3'],
          a: 1,
          e: 'RANK leaves a gap after ties (1, 1, 3); DENSE_RANK does not (1, 1, 2).',
        },
        {
          t: 'qa', l: 2,
          q: 'What is a CTE? What is a recursive CTE used for?',
          e: `
A **Common Table Expression** (\`WITH\`) names a subquery for readability and reuse within a query.

~~~sql
WITH monthly AS (
  SELECT date_trunc('month', created_at) AS m, SUM(amount) AS revenue
  FROM orders GROUP BY 1
)
SELECT m, revenue, revenue - LAG(revenue) OVER (ORDER BY m) AS growth FROM monthly;
~~~
**Recursive CTE** – hierarchical data (org charts, category trees, threaded comments):
~~~sql
WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS depth FROM employees WHERE id = 42
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.depth + 1
  FROM employees e JOIN chain c ON e.id = c.manager_id
)
SELECT * FROM chain;  -- employee 42 and all their managers
~~~`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a correlated subquery?',
          o: ['A join between two subqueries that share the same column names', 'A subquery that references outer query columns and is evaluated per outer row', 'A subquery that always returns exactly one value, used in the SELECT list of the outer query', 'A subquery in the FROM clause that acts like a temporary table'],
          a: 1,
          e: 'e.g. SELECT * FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department = e.department). Can be slow; optimizers may rewrite it as a join.',
        },
        {
          t: 'mcq', l: 3,
          q: 'Why can "WHERE id NOT IN (SELECT user_id FROM orders)" return no rows unexpectedly?',
          o: ['The index on id is ignored by NOT IN, so the query times out', 'NOT IN only works with string columns, not numeric ids', 'NOT IN with a subquery is invalid SQL and returns an empty result', 'If the subquery returns any NULL, NOT IN is UNKNOWN for every row'],
          a: 3,
          e: 'Use NOT EXISTS or filter NULLs out of the subquery.',
        },
      ],
    },
    {
      slug: 'design-normalization',
      title: 'Schema Design & Normalization',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What are primary keys, foreign keys and unique constraints?',
          e: `
- **Primary key:** uniquely identifies each row; NOT NULL + UNIQUE; one per table (can be composite).
- **Foreign key:** column referencing another table's primary key; enforces **referential integrity** (\`ON DELETE CASCADE / SET NULL / RESTRICT\`).
- **Unique constraint:** no duplicate values (NULLs usually allowed); e.g. email.
- **Check constraint:** \`CHECK (price >= 0)\`.
- **NOT NULL**, **DEFAULT**.

Constraints are the last line of defense for data integrity – don't rely only on application validation.`,
        },
        {
          t: 'qa', l: 2,
          q: 'Explain normalization: 1NF, 2NF, 3NF, BCNF.',
          e: `
Normalization reduces redundancy and update anomalies.

- **1NF:** atomic values (no lists in a column), no repeating groups, each row unique.
- **2NF:** 1NF + no **partial dependency** – every non-key column depends on the **whole** composite key.
- **3NF:** 2NF + no **transitive dependency** – non-key columns depend only on the key (not on other non-key columns). *e.g. move zip -> city into a separate table.*
- **BCNF:** every determinant is a candidate key (stricter 3NF).

"The key, the whole key, and nothing but the key."

**Denormalization** is intentionally adding redundancy for read performance (reporting, read models) – a trade-off.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you model a many-to-many relationship between students and courses?',
          o: ['One students table with a separate column for each of 100 courses', 'Store course ids as a comma-separated string in the students table and split them in code', 'Duplicate each student row once for every course they take', 'A junction table enrollments(student_id, course_id) with foreign keys'],
          a: 3,
          e: 'Junction (join) tables can hold extra attributes too, like enrolled_at or grade.',
        },
        {
          t: 'mcq', l: 2,
          q: 'DELETE vs TRUNCATE vs DROP?',
          o: ['DELETE removes chosen rows (WHERE, triggers); TRUNCATE empties fast; DROP removes the table', 'All three are identical ways to remove rows from a table', 'TRUNCATE removes the table structure and its indexes; DROP removes only the data inside the table', 'DROP removes only selected rows; DELETE removes the whole table'],
          a: 0,
          e: 'TRUNCATE resets identity counters in many DBs and is minimally logged; it cannot have a WHERE clause.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between CHAR and VARCHAR?',
          o: ['VARCHAR is fixed-length; CHAR is variable-length', 'CHAR stores numbers, while VARCHAR stores text', 'CHAR is fixed-length (padded); VARCHAR is variable-length', 'There is no difference; both store variable-length text up to the limit'],
          a: 2,
          e: 'In PostgreSQL, TEXT and VARCHAR perform the same; use CHECK constraints for length rules.',
        },
      ],
    },
    {
      slug: 'performance',
      title: 'Performance & Optimization',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'How do you optimize a slow SQL query?',
          e: `
1. **EXPLAIN (ANALYZE)** – look for sequential scans on large tables, bad row estimates, expensive sorts/hash joins.
2. **Indexes** on columns used in WHERE, JOIN, ORDER BY; composite indexes in the right order; covering indexes.
3. **Make predicates sargable:** avoid functions on indexed columns, leading wildcards (\`LIKE '%x'\`), implicit type casts.
4. **Select only needed columns** (no \`SELECT *\`), limit rows, keyset pagination instead of large OFFSET.
5. **Avoid N+1 queries** from ORMs – use joins or batch loading.
6. **Rewrite** correlated subqueries as joins; use EXISTS instead of IN for large sets.
7. **Update statistics** (ANALYZE), vacuum (Postgres).
8. **Partition** huge tables; cache results; materialized views for heavy aggregations.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the N+1 query problem?',
          o: ['Fetching a list (1 query) then one extra query per item (N queries)', 'A syntax error when a query has one more column than the table', 'A replication issue where replicas are N+1 transactions behind', 'A query that contains N+1 joins and becomes slower as the joined tables grow'],
          a: 0,
          e: 'Common with ORMs and lazy loading. Fix with eager loading (include/populate/JOIN) or batch loaders.',
        },
        {
          t: 'mcq', l: 3,
          q: 'Which query can use an index on created_at efficiently?',
          o: ['WHERE CAST(created_at AS TEXT) LIKE \'2026%\'', 'WHERE created_at + INTERVAL \'1 day\' > \'2026-01-01\' AND created_at < now()', 'WHERE YEAR(created_at) = 2026', 'WHERE created_at >= \'2026-01-01\' AND created_at < \'2027-01-01\''],
          a: 3,
          e: 'Range predicates on the raw column are sargable. Wrapping the column in a function prevents index range scans (unless you create an expression index).',
        },
        {
          t: 'qa', l: 2,
          q: 'What are views, materialized views and stored procedures?',
          e: `
- **View:** a saved query that acts like a virtual table; always shows current data; used for abstraction/security.
- **Materialized view:** stores the query result physically; fast reads but must be **refreshed** (\`REFRESH MATERIALIZED VIEW CONCURRENTLY\`); great for dashboards/aggregations.
- **Stored procedure/function:** logic stored and executed in the DB; reduces round trips, but business logic in the DB is harder to version, test and scale.
- **Trigger:** code that runs automatically on INSERT/UPDATE/DELETE (audit logs, maintaining derived columns) – use sparingly, they hide behavior.`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: A reporting query joining orders (500M rows) with users takes 40 seconds and slows down the production database. What do you do?',
          e: `
- **Don't run heavy analytics on the OLTP primary:** move reporting to a **read replica** or, better, a **data warehouse** (BigQuery, Redshift, Snowflake, ClickHouse) fed by CDC/ETL.
- **Pre-aggregate:** materialized views or summary tables (daily revenue per user) updated incrementally.
- **Indexes/partitioning:** partition orders by month so date filters prune partitions; composite indexes matching filters.
- **Optimize the query:** EXPLAIN, select needed columns, filter early, avoid functions on indexed columns.
- **Schedule** heavy reports off-peak; cache results.
- Set **statement timeouts** to protect production.`,
        },
      ],
    },
  ],
};
