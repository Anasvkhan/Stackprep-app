/*
 * Syncs content/ into MongoDB.
 *   npm run seed            -> upsert tracks + questions, remove questions no longer in content
 *   npm run seed -- --check -> validate content only, no database writes
 */
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const { loadTracks } = require('../content');
const { ROLES, CATEGORIES } = require('../src/config/constants');
const Track = require('../src/models/Track');
const Question = require('../src/models/Question');
const Attempt = require('../src/models/Attempt');
const Bookmark = require('../src/models/Bookmark');

const TYPES = { mcq: 'mcq', qa: 'qa', scenario: 'scenario', sc: 'scenario' };
const roleIds = new Set(ROLES.map((r) => r.id));
const categoryIds = new Set(CATEGORIES.map((c) => c.id));

const keyFor = (track, topic, q, code) =>
  crypto.createHash('sha1').update(`${track}|${topic}|${q.trim()}${code ? `|${code.trim()}` : ''}`).digest('hex').slice(0, 20);

function normalize(tracks) {
  const errors = [];
  const trackDocs = [];
  const questionDocs = [];
  const seenKeys = new Set();
  const seenTracks = new Set();

  tracks.forEach((t, ti) => {
    const where = `track "${t.slug}"`;
    if (!t.slug || !t.title) errors.push(`track #${ti}: slug and title are required`);
    if (seenTracks.has(t.slug)) errors.push(`${where}: duplicate slug`);
    seenTracks.add(t.slug);
    if (!categoryIds.has(t.category)) errors.push(`${where}: unknown category "${t.category}"`);
    (t.roles || []).forEach((r) => !roleIds.has(r) && errors.push(`${where}: unknown role "${r}"`));

    const topicSlugs = new Set();
    trackDocs.push({
      slug: t.slug,
      title: t.title,
      subtitle: t.subtitle,
      description: t.description,
      category: t.category,
      roles: t.roles,
      icon: t.icon,
      color: t.color,
      order: t.order || 999,
      topics: (t.topics || []).map((tp, i) => {
        if (topicSlugs.has(tp.slug)) errors.push(`${where}: duplicate topic "${tp.slug}"`);
        topicSlugs.add(tp.slug);
        return { slug: tp.slug, title: tp.title, order: i };
      }),
    });

    (t.topics || []).forEach((tp) => {
      (tp.questions || []).forEach((q, qi) => {
        const at = `${t.slug}/${tp.slug} #${qi + 1}`;
        const type = TYPES[q.t];
        if (!type) errors.push(`${at}: bad type "${q.t}"`);
        if (![1, 2, 3].includes(q.l)) errors.push(`${at}: level must be 1, 2 or 3`);
        if (!q.q || !q.e) errors.push(`${at}: q and e are required`);
        if (type === 'mcq') {
          if (!Array.isArray(q.o) || q.o.length < 2) errors.push(`${at}: mcq needs options`);
          else if (!(q.a >= 0 && q.a < q.o.length)) errors.push(`${at}: answer index out of range`);
          else {
            // the right option must not give itself away by being much longer than every wrong one
            const longestWrong = Math.max(...q.o.filter((_, i) => i !== q.a).map((o) => o.length));
            if (q.o[q.a].length > 25 && q.o[q.a].length > 1.2 * longestWrong) {
              errors.push(`${at}: correct option is much longer than the others, make the wrong options as detailed`);
            }
          }
        }
        if (!q.q) return;
        const key = keyFor(t.slug, tp.slug, q.q, q.c);
        if (seenKeys.has(key)) {
          errors.push(`${at}: duplicate question "${q.q.slice(0, 60)}"`);
          return;
        }
        seenKeys.add(key);
        questionDocs.push({
          key,
          track: t.slug,
          topic: tp.slug,
          type,
          level: q.l,
          question: q.q.trim(),
          code: q.c ? q.c.replace(/^\n+|\s+$/g, '') : undefined,
          options: type === 'mcq' ? q.o : [],
          correctIndex: type === 'mcq' ? q.a : undefined,
          answer: q.e.replace(/^\n+|\s+$/g, ''),
          tags: q.tags || [],
          order: qi,
        });
      });
    });
  });

  // the right answer should be spread across A/B/C/D, not parked in one slot
  const mcqs = questionDocs.filter((q) => q.type === 'mcq');
  const slots = mcqs.reduce((m, q) => ({ ...m, [q.correctIndex]: (m[q.correctIndex] || 0) + 1 }), {});
  Object.entries(slots).forEach(([slot, n]) => {
    if (mcqs.length >= 20 && n > 0.4 * mcqs.length) {
      errors.push(`${n} of ${mcqs.length} MCQs have the answer at option ${'ABCD'[slot] || slot}; shuffle the options`);
    }
  });

  return { errors, trackDocs, questionDocs };
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const { errors, trackDocs, questionDocs } = normalize(loadTracks());

  const byType = questionDocs.reduce((m, q) => ({ ...m, [q.type]: (m[q.type] || 0) + 1 }), {});
  console.log(`Tracks: ${trackDocs.length}  Questions: ${questionDocs.length}`, byType);
  if (errors.length) {
    console.error(`\n${errors.length} content error(s):\n - ${errors.join('\n - ')}`);
    process.exit(1);
  }
  if (checkOnly) return;

  await connectDB();

  await Track.bulkWrite(
    trackDocs.map((doc) => ({ replaceOne: { filter: { slug: doc.slug }, replacement: doc, upsert: true } }))
  );
  await Track.deleteMany({ slug: { $nin: trackDocs.map((t) => t.slug) } });

  const BATCH = 500;
  for (let i = 0; i < questionDocs.length; i += BATCH) {
    await Question.bulkWrite(
      questionDocs.slice(i, i + BATCH).map((doc) => ({
        updateOne: { filter: { key: doc.key }, update: { $set: doc }, upsert: true },
      }))
    );
  }

  // Remove questions that were deleted from content, along with their attempts/bookmarks.
  const stale = await Question.find({ key: { $nin: questionDocs.map((q) => q.key) } }).distinct('_id');
  if (stale.length) {
    await Promise.all([
      Question.deleteMany({ _id: { $in: stale } }),
      Attempt.deleteMany({ question: { $in: stale } }),
      Bookmark.deleteMany({ question: { $in: stale } }),
    ]);
  }

  await Question.syncIndexes();
  console.log(`Seed complete. Removed ${stale.length} stale question(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
