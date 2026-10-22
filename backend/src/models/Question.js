const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // stable id from content files
    track: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    type: { type: String, enum: ['mcq', 'qa', 'scenario'], required: true, index: true },
    level: { type: Number, enum: [1, 2, 3], required: true, index: true },
    question: { type: String, required: true },
    code: String, // optional code snippet shown with the question
    options: [String],
    correctIndex: Number,
    answer: { type: String, required: true }, // markdown explanation / model answer
    tags: [String],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

questionSchema.index({ track: 1, topic: 1, level: 1 });
questionSchema.index({ question: 'text', answer: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);
