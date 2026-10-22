module.exports = {
  slug: 'mongodb',
  title: 'MongoDB',
  subtitle: 'Documents, aggregation, indexes',
  description: 'MongoDB interview questions: document modeling, embedding vs referencing, CRUD, aggregation pipeline, indexes, transactions, replica sets, sharding and Mongoose.',
  category: 'databases',
  roles: ['backend', 'fullstack'],
  icon: 'database',
  color: '#13AA52',
  order: 41,
  topics: [
    {
      slug: 'basics-modeling',
      title: 'Basics & Data Modeling',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'What is MongoDB and when would you use it?',
          e: `
**MongoDB** is a document-oriented NoSQL database storing data as **BSON** (binary JSON) documents in collections.

**Strengths:** flexible schema, natural mapping to objects/JSON, rich queries & aggregation, secondary indexes, horizontal scaling (sharding), replica sets for HA.

**Good fits:** content management, catalogs with varying attributes, user profiles, event/IoT data, rapid prototyping.

**Less ideal:** highly relational data with many joins and complex multi-entity transactions (though multi-document transactions exist).`,
        },
        {
          t: 'qa', l: 2,
          q: 'Embedding vs referencing: how do you model relationships in MongoDB?',
          e: `
**Embed** (subdocuments/arrays) when:
- Data is accessed together (an order and its line items)
- One-to-few relationship, child doesn't make sense alone
- Bounded size (documents max **16 MB**)
- ✅ One read, atomic single-document updates

**Reference** (store ids) when:
- One-to-many with large/unbounded "many" (a user's millions of logs)
- Many-to-many
- Child is accessed independently or updated frequently by itself
- ✅ No huge documents, no duplication

**Rule:** model around **access patterns** ("data that is accessed together should be stored together"). Patterns: subset pattern, bucket pattern (time-series), extended reference, computed pattern.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the maximum size of a single MongoDB document?',
          o: ['1 MB', '16 MB', '64 MB', 'Unlimited'],
          a: 1,
          e: 'For larger binary files use GridFS or object storage (S3) and store references.',
        },
        {
          t: 'mcq', l: 2,
          q: 'A blog post can have thousands of comments. How should comments be stored?',
          o: ['Embed all comments in the post document', 'Separate comments collection referencing postId (optionally embed the latest few comments in the post)', 'One document per database', 'Store comments in a string field'],
          a: 1,
          e: 'Unbounded arrays grow documents toward 16 MB and make updates expensive. The subset pattern keeps recent comments embedded for fast display.',
        },
        {
          t: 'mcq', l: 1,
          q: 'What is the _id field?',
          o: ['An optional field', 'The required primary key of every document, by default an ObjectId containing a timestamp', 'An index on all fields', 'The collection name'],
          a: 1,
          e: 'ObjectId = 4-byte timestamp + 5-byte random + 3-byte counter, so ids are roughly sortable by creation time.',
        },
      ],
    },
    {
      slug: 'queries-aggregation',
      title: 'Queries & Aggregation',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'Which update operator adds an element to an array only if it does not already exist?',
          o: ['$push', '$addToSet', '$set', '$inc'],
          a: 1,
          e: '$push always appends; $pull removes matching elements; $inc increments numbers atomically.',
        },
        {
          t: 'qa', l: 2,
          q: 'What is the aggregation pipeline? Give an example.',
          e: `
The **aggregation pipeline** processes documents through stages, each transforming the stream.

~~~js
db.orders.aggregate([
  { $match: { status: 'paid', createdAt: { $gte: ISODate('2026-01-01') } } },
  { $group: { _id: '$userId', total: { $sum: '$amount' }, orders: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  { $project: { _id: 0, name: '$user.name', total: 1, orders: 1 } },
]);
~~~
Common stages: \`$match, $group, $project, $sort, $limit, $skip, $lookup (join), $unwind, $facet, $bucket, $addFields\`.

**Performance:** put \`$match\` and \`$sort\` early so they can use indexes and reduce documents.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which aggregation stage performs a left outer join with another collection?',
          o: ['$join', '$lookup', '$merge', '$unwind'],
          a: 1,
          e: '$lookup joins documents from another collection; $unwind flattens the resulting array.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Why is skip() with large values slow for pagination?',
          o: ['skip is not supported', 'MongoDB must walk through all skipped documents; use range-based pagination on an indexed field (e.g. _id > lastId)', 'It returns random results', 'It locks the collection'],
          a: 1,
          e: 'Keyset pagination: find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(20).',
        },
      ],
    },
    {
      slug: 'indexes-performance',
      title: 'Indexes & Performance',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What index types does MongoDB support?',
          e: `
- **Single field** and **compound** indexes (order matters – ESR rule)
- **Multikey** indexes on array fields
- **Text** indexes for basic full-text search (Atlas Search for advanced)
- **Geospatial** (2dsphere)
- **Hashed** indexes (hashed sharding)
- **TTL** indexes – auto-delete documents after a time (sessions, logs)
- **Unique**, **partial** (index a subset), **sparse**, **wildcard** indexes

Check with \`explain('executionStats')\`: \`IXSCAN\` vs \`COLLSCAN\`, \`totalDocsExamined\` vs \`nReturned\`.`,
        },
        {
          t: 'mcq', l: 3,
          q: 'What is the ESR rule for compound index field order?',
          o: ['Encrypt, Sort, Read', 'Equality fields first, then Sort fields, then Range fields', 'Sort first, then Equality, then Range', 'Range first always'],
          a: 1,
          e: 'For find({ status: "A", age: { $gt: 20 } }).sort({ createdAt: -1 }), the index { status: 1, createdAt: -1, age: 1 } follows ESR.',
        },
        {
          t: 'mcq', l: 2,
          q: 'How do you automatically delete session documents 24 hours after creation?',
          o: ['Run a cron job only', 'Create a TTL index: createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })', 'Use $unset', 'Capped collections only'],
          a: 1,
          e: 'A background task removes expired documents roughly every 60 seconds.',
        },
      ],
    },
    {
      slug: 'scaling-transactions',
      title: 'Replication, Sharding & Transactions',
      questions: [
        {
          t: 'qa', l: 2,
          q: 'What is a replica set?',
          e: `
A **replica set** is a group of mongod nodes holding the same data:
- One **primary** receives all writes; **secondaries** replicate the oplog asynchronously.
- If the primary fails, an **election** promotes a secondary (needs a majority) – automatic failover in seconds.
- Typically 3 nodes (or 2 + arbiter).

**Write concern** (\`w: 1\`, \`w: 'majority'\`) controls durability; **read preference** (\`primary\`, \`secondaryPreferred\`...) controls where reads go; **read concern** (\`local\`, \`majority\`, \`linearizable\`) controls consistency.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Which write concern ensures a write survives a primary failover?',
          o: ['w: 0', 'w: 1', 'w: "majority"', 'j: false'],
          a: 2,
          e: 'Writes acknowledged by a majority will not be rolled back after an election. w: 1 writes can be lost if the primary dies before replicating.',
        },
        {
          t: 'qa', l: 3,
          q: 'How does sharding work in MongoDB? How do you choose a shard key?',
          e: `
**Components:** shards (each a replica set), **config servers** (metadata), **mongos** routers (route queries).

Data is split into **chunks** by the **shard key**; the balancer moves chunks to even out shards.

**Strategies**
- **Ranged sharding:** good for range queries, risk of hot spots with monotonically increasing keys.
- **Hashed sharding:** even distribution, range queries go to all shards.
- **Zone sharding:** pin data to regions.

**Good shard key:** high cardinality, even frequency, not monotonically increasing (or hashed), and included in most queries (targeted vs scatter-gather). Since 5.0 you can reshard, but choose carefully.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'Are single-document operations in MongoDB atomic?',
          o: ['No, never', 'Yes, writes to a single document (including embedded arrays/subdocuments) are atomic', 'Only with transactions', 'Only on sharded clusters'],
          a: 1,
          e: 'This is why embedding related data reduces the need for multi-document transactions.',
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: Implement a money transfer between two wallet documents safely in MongoDB.',
          e: `
Use a **multi-document transaction** (replica set required):
~~~js
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const from = await Wallet.findOneAndUpdate(
    { _id: fromId, balance: { $gte: amount } },   // guard: sufficient funds
    { $inc: { balance: -amount } },
    { session, new: true },
  );
  if (!from) throw new Error('Insufficient funds');
  await Wallet.updateOne({ _id: toId }, { $inc: { balance: amount } }, { session });
  await Ledger.create([{ fromId, toId, amount, transferId }], { session }); // unique transferId => idempotent
}, { writeConcern: { w: 'majority' } });
session.endSession();
~~~
\`withTransaction\` retries on transient errors. The conditional update prevents negative balances; a unique \`transferId\` prevents double processing on client retries.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'In Mongoose, what does .lean() do?',
          o: ['Deletes unused fields', 'Returns plain JavaScript objects instead of full Mongoose documents, making reads faster and lighter', 'Enables transactions', 'Compresses data'],
          a: 1,
          e: 'Use lean() for read-only queries; you lose document methods, getters and save().',
        },
      ],
    },
  ],
};
