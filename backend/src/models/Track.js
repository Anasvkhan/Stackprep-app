const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const trackSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    category: { type: String, required: true, index: true },
    roles: { type: [String], index: true },
    icon: String,
    color: String,
    order: { type: Number, default: 0 },
    topics: [topicSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Track', trackSchema);
