const mongoose = require('mongoose');

// One document per (user, question). Updated on every new attempt.
const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    track: { type: String, required: true },
    topic: { type: String, required: true },
    type: String,
    // mcq: whether the selected option was correct
    // qa/scenario: self assessment ("I knew it" = true, "Need revision" = false)
    correct: { type: Boolean, required: true },
    selectedIndex: Number,
    timesAttempted: { type: Number, default: 1 },
    timesCorrect: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, question: 1 }, { unique: true });
attemptSchema.index({ user: 1, track: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
