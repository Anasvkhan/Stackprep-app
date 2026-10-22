const router = require('express').Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Attempt = require('../models/Attempt');
const Track = require('../models/Track');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const Bookmark = require('../models/Bookmark');

// GET /api/progress  -> overall stats, per-track breakdown, recent quizzes and streak
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const trackFilter = req.user.role ? { roles: req.user.role } : {};

    const [tracks, attemptRows, totals, sessions, bookmarkCount] = await Promise.all([
      Track.find(trackFilter).sort({ order: 1 }).select('slug title icon color category').lean(),
      Attempt.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$track',
            attempted: { $sum: 1 },
            correct: { $sum: { $cond: ['$correct', 1, 0] } },
          },
        },
      ]),
      Question.aggregate([{ $group: { _id: '$track', total: { $sum: 1 } } }]),
      QuizSession.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Bookmark.countDocuments({ user: userId }),
    ]);

    const att = Object.fromEntries(attemptRows.map((r) => [r._id, r]));
    const tot = Object.fromEntries(totals.map((r) => [r._id, r.total]));
    const attempted = attemptRows.reduce((s, r) => s + r.attempted, 0);
    const correct = attemptRows.reduce((s, r) => s + r.correct, 0);
    const titles = Object.fromEntries(tracks.map((t) => [t.slug, t.title]));

    res.json({
      overall: {
        attempted,
        correct,
        accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
        quizzes: await QuizSession.countDocuments({ user: userId }),
        bookmarks: bookmarkCount,
      },
      streak: req.user.streak,
      tracks: tracks.map((t) => ({
        slug: t.slug,
        title: t.title,
        icon: t.icon,
        color: t.color,
        category: t.category,
        total: tot[t.slug] || 0,
        attempted: att[t.slug]?.attempted || 0,
        correct: att[t.slug]?.correct || 0,
      })),
      recentSessions: sessions.map((s) => ({
        id: String(s._id),
        track: s.track,
        trackTitle: titles[s.track] || (s.track ? s.track : 'Mixed practice'),
        total: s.total,
        correct: s.correct,
        durationSec: s.durationSec,
        createdAt: s.createdAt,
      })),
    });
  })
);

module.exports = router;
