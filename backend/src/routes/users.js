const router = require('express').Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../config/constants');
const Attempt = require('../models/Attempt');
const Bookmark = require('../models/Bookmark');
const QuizSession = require('../models/QuizSession');

router.patch(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, role, level } = req.body || {};
    if (role !== undefined) {
      if (!ROLES.some((r) => r.id === role)) throw new ApiError(400, 'Unknown designation');
      req.user.role = role;
    }
    if (level !== undefined) {
      if (![1, 2, 3].includes(Number(level))) throw new ApiError(400, 'Level must be 1, 2 or 3');
      req.user.level = Number(level);
    }
    if (name !== undefined && name.trim()) req.user.name = name.trim();
    await req.user.save();
    res.json({ user: req.user });
  })
);

router.delete(
  '/me/progress',
  protect,
  asyncHandler(async (req, res) => {
    await Promise.all([
      Attempt.deleteMany({ user: req.user._id }),
      QuizSession.deleteMany({ user: req.user._id }),
      Bookmark.deleteMany({ user: req.user._id }),
    ]);
    res.json({ ok: true });
  })
);

module.exports = router;
