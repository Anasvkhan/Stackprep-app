const router = require('express').Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Track = require('../models/Track');
const QuizSession = require('../models/QuizSession');

const QUIZ_FIELDS = { _id: 1, track: 1, topic: 1, type: 1, level: 1, question: 1, code: 1, options: 1, correctIndex: 1, answer: 1 };

// GET /api/practice/quiz?track=&topic=&level=&count=10&mode=mixed|new|mistakes
// Without a track, questions come from all tracks of the user's designation.
router.get(
  '/quiz',
  protect,
  asyncHandler(async (req, res) => {
    const count = Math.min(50, Math.max(1, parseInt(req.query.count, 10) || 10));
    const mode = req.query.mode || 'mixed';
    const match = { type: 'mcq' };

    if (req.query.track) {
      match.track = req.query.track;
    } else if (req.user.role) {
      const tracks = await Track.find({ roles: req.user.role }).select('slug').lean();
      match.track = { $in: tracks.map((t) => t.slug) };
    }
    if (req.query.topic) match.topic = req.query.topic;
    if (req.query.level && req.query.level !== 'all') match.level = Number(req.query.level);

    if (mode === 'new' || mode === 'mistakes') {
      const attFilter = { user: req.user._id, type: 'mcq' };
      if (mode === 'mistakes') attFilter.correct = false;
      const ids = await Attempt.find(attFilter).distinct('question');
      match._id = mode === 'new' ? { $nin: ids } : { $in: ids };
    }

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: count } },
      { $project: QUIZ_FIELDS },
    ]);

    if (!questions.length) {
      const msg = mode === 'mistakes'
        ? 'No mistakes to review yet. Great job!'
        : 'No questions found for this selection.';
      throw new ApiError(404, msg);
    }

    res.json({ questions: questions.map((q) => ({ ...q, id: String(q._id) })) });
  })
);

// POST /api/practice/sessions  { track, topic, level, total, correct, durationSec }
router.post(
  '/sessions',
  protect,
  asyncHandler(async (req, res) => {
    const { track, topic, level, total, correct, durationSec } = req.body || {};
    if (!Number.isFinite(total) || !Number.isFinite(correct)) {
      throw new ApiError(400, 'total and correct are required');
    }
    const session = await QuizSession.create({
      user: req.user._id, track, topic, level, total, correct, durationSec,
    });
    res.status(201).json({ session });
  })
);

module.exports = router;
