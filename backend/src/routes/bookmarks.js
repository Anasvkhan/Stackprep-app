const router = require('express').Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Bookmark = require('../models/Bookmark');
const Question = require('../models/Question');

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const bms = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'question', select: '-__v -createdAt -updatedAt' })
      .lean();
    const questions = bms
      .filter((b) => b.question)
      .map((b) => ({ ...b.question, id: String(b.question._id), bookmarked: true }));
    res.json({ questions });
  })
);

// POST /api/bookmarks/:questionId  -> toggles the bookmark
router.post(
  '/:questionId',
  protect,
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    if (!mongoose.isValidObjectId(questionId)) throw new ApiError(400, 'Invalid id');
    if (!(await Question.exists({ _id: questionId }))) throw new ApiError(404, 'Question not found');

    const removed = await Bookmark.findOneAndDelete({ user: req.user._id, question: questionId });
    if (removed) return res.json({ bookmarked: false });
    await Bookmark.create({ user: req.user._id, question: questionId });
    res.json({ bookmarked: true });
  })
);

module.exports = router;
