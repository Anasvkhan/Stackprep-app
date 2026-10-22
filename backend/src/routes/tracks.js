const router = require('express').Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Track = require('../models/Track');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

// Question counts grouped by `field` for the given match filter.
async function countBy(match, field) {
  const rows = await Question.aggregate([
    { $match: match },
    {
      $group: {
        _id: `$${field}`,
        total: { $sum: 1 },
        mcq: { $sum: { $cond: [{ $eq: ['$type', 'mcq'] }, 1, 0] } },
      },
    },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r]));
}

async function progressBy(userId, match, field) {
  const rows = await Attempt.aggregate([
    { $match: { user: userId, ...match } },
    {
      $group: {
        _id: `$${field}`,
        attempted: { $sum: 1 },
        correct: { $sum: { $cond: ['$correct', 1, 0] } },
      },
    },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r]));
}

const trackSummary = (t) => ({
  slug: t.slug,
  title: t.title,
  subtitle: t.subtitle,
  description: t.description,
  category: t.category,
  roles: t.roles,
  icon: t.icon,
  color: t.color,
});

// GET /api/tracks?role=backend   (role defaults to the user's designation; role=all returns everything)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const role = req.query.role || req.user.role;
    const filter = role && role !== 'all' ? { roles: role } : {};
    const tracks = await Track.find(filter).sort({ order: 1 }).lean();
    const slugs = tracks.map((t) => t.slug);
    const [counts, progress] = await Promise.all([
      countBy({ track: { $in: slugs } }, 'track'),
      progressBy(req.user._id, { track: { $in: slugs } }, 'track'),
    ]);

    res.json({
      tracks: tracks.map((t) => ({
        ...trackSummary(t),
        topicCount: t.topics.length,
        questionCount: counts[t.slug]?.total || 0,
        mcqCount: counts[t.slug]?.mcq || 0,
        attempted: progress[t.slug]?.attempted || 0,
        correct: progress[t.slug]?.correct || 0,
      })),
    });
  })
);

// GET /api/tracks/:slug  -> track with per-topic counts and progress
router.get(
  '/:slug',
  protect,
  asyncHandler(async (req, res) => {
    const track = await Track.findOne({ slug: req.params.slug }).lean();
    if (!track) throw new ApiError(404, 'Track not found');

    const [levelRows, counts, progress] = await Promise.all([
      Question.aggregate([
        { $match: { track: track.slug } },
        { $group: { _id: { topic: '$topic', level: '$level' }, n: { $sum: 1 } } },
      ]),
      countBy({ track: track.slug }, 'topic'),
      progressBy(req.user._id, { track: track.slug }, 'topic'),
    ]);

    const levels = {};
    for (const r of levelRows) {
      levels[r._id.topic] = levels[r._id.topic] || { 1: 0, 2: 0, 3: 0 };
      levels[r._id.topic][r._id.level] = r.n;
    }

    const topics = track.topics
      .sort((a, b) => a.order - b.order)
      .map((tp) => ({
        slug: tp.slug,
        title: tp.title,
        questionCount: counts[tp.slug]?.total || 0,
        mcqCount: counts[tp.slug]?.mcq || 0,
        levels: levels[tp.slug] || { 1: 0, 2: 0, 3: 0 },
        attempted: progress[tp.slug]?.attempted || 0,
        correct: progress[tp.slug]?.correct || 0,
      }));

    const sum = (k) => topics.reduce((s, t) => s + t[k], 0);
    res.json({
      track: {
        ...trackSummary(track),
        questionCount: sum('questionCount'),
        mcqCount: sum('mcqCount'),
        attempted: sum('attempted'),
        correct: sum('correct'),
        topics,
      },
    });
  })
);

module.exports = router;
