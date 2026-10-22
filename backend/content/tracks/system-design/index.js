module.exports = {
  slug: 'system-design',
  title: 'System Design',
  subtitle: 'HLD, scalability, distributed systems',
  description:
    'Everything asked in system design interviews: high level architecture, load balancing, caching, Redis, databases, sharding, queues, CAP, auth, rate limiting, resilience patterns and scenario based questions.',
  category: 'system-design',
  roles: ['backend', 'fullstack', 'software-engineer', 'devops', 'mobile', 'frontend'],
  icon: 'account_tree',
  color: '#6C5CE7',
  order: 1,
  topics: [
    ...require('./part1'),
    ...require('./part2'),
    ...require('./part3'),
    ...require('./part4'),
    ...require('./part5'),
    ...require('./part6'),
    ...require('./part7'),
  ],
};
