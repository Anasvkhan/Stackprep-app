const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, required: true },
    password: { type: String, select: false },
    passwordChangedAt: Date, // tokens issued before this are rejected
    // Forgot-password one-time code (stored hashed, short-lived).
    resetCode: {
      hash: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      sentAt: { type: Date, select: false },
      attempts: { type: Number, default: 0, select: false },
    },
    role: { type: String, default: null }, // designation picked in onboarding
    level: { type: Number, enum: [1, 2, 3], default: 1 },
    streak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 },
      lastActiveDay: { type: String, default: null }, // YYYY-MM-DD
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password || '');
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetCode;
  delete obj.passwordChangedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
