const router = require('express').Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { touchStreak } = require('../utils/streak');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Bookmark = require('../models/Bookmark');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Adds `id`, `bookmarked` and `status` (new | correct | wrong) for the current user.
async function decorate(userId, questions) {
  const ids = questions.map((q) => q._id);
  const [bms, atts] = await Promise.all([
    Bookmark.find({ user: userId, question: { $in: ids } }).select('question').lean(),
    Attempt.find({ user: userId, question: { $in: ids } }).select('question correct').lean(),
  ]);
  const bmSet = new Set(bms.map((b) => String(b.question)));
  const attMap = new Map(atts.map((a) => [String(a.question), a.correct]));
  return questions.map((q) => {
    const id = String(q._id);
    let status = 'new';
    if (attMap.has(id)) status = attMap.get(id) ? 'correct' : 'wrong';
    return { ...q, id, bookmarked: bmSet.has(id), status };
  });
}

function buildFilter(query) {
  const filter = {};
  if (query.track) filter.track = query.track;
  if (query.topic) filter.topic = query.topic;
  if (query.level && query.level !== 'all') filter.level = Number(query.level);
  if (query.type && query.type !== 'all') {
    filter.type = query.type === 'theory' ? { $in: ['qa', 'scenario'] } : query.type;
  }
  if (query.q && query.q.trim()) {
    const re = new RegExp(escapeRe(query.q.trim()), 'i');
    filter.$or = [{ question: re }, { tags: re }];
  }
  return filter;
}

// GET /api/questions?track=&topic=&level=&type=&q=&page=&limit=
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const filter = buildFilter(req.query);
    const [items, total] = await Promise.all([
      Question.find(filter)
        .sort({ track: 1, topic: 1, order: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v -createdAt -updatedAt')
        .lean(),
      Question.countDocuments(filter),
    ]);
    res.json({
      questions: await decorate(req.user._id, items),
      page,
      total,
      hasMore: page * limit < total,
    });
  })
);

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const q = await Question.findById(req.params.id).select('-__v').lean();
    if (!q) throw new ApiError(404, 'Question not found');
    const [question] = await decorate(req.user._id, [q]);
    res.json({ question });
  })
);

// POST /api/questions/:id/attempt  { selectedIndex } for mcq, { knew: true|false } for theory
router.post(
  '/:id/attempt',
  protect,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid id');
    const q = await Question.findById(req.params.id).lean();
    if (!q) throw new ApiError(404, 'Question not found');

    let correct;
    let selectedIndex;
    if (q.type === 'mcq') {
      selectedIndex = Number(req.body.selectedIndex);
      if (Number.isNaN(selectedIndex)) throw new ApiError(400, 'selectedIndex is required');
      correct = selectedIndex === q.correctIndex;
    } else {
      correct = Boolean(req.body.knew);
    }

    await Attempt.findOneAndUpdate(
      { user: req.user._id, question: q._id },
      {
        $set: { track: q.track, topic: q.topic, type: q.type, correct, selectedIndex },
        $inc: { timesAttempted: 1, timesCorrect: correct ? 1 : 0 },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    await touchStreak(req.user);

    res.json({ correct, correctIndex: q.correctIndex, streak: req.user.streak });
  })
);

module.exports = router;
