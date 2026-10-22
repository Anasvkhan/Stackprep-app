const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    track: String,
    topic: String,
    level: Number,
    total: Number,
    correct: Number,
    durationSec: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizSession', quizSessionSchema);
