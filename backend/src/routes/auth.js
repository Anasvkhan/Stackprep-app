const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect, signToken } = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const respond = (res, user, status = 200) =>
  res.status(status).json({ token: signToken(user), user });

// If the caller is currently a guest, return that guest so we can upgrade it in place
// (keeps their progress) instead of creating a brand new account.
async function currentGuest(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    return user && user.isGuest ? user : null;
  } catch {
    return null;
  }
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !name.trim()) throw new ApiError(400, 'Name is required');
    if (!email || !EMAIL_RE.test(email)) throw new ApiError(400, 'Valid email is required');
    if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

    const exists = await User.exists({ email: email.toLowerCase() });
    if (exists) throw new ApiError(409, 'Email is already registered');

    const guest = await currentGuest(req);
    const user = guest || new User();
    Object.assign(user, { name: name.trim(), email, password, isGuest: false });
    await user.save();
    respond(res, user, 201);
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) throw new ApiError(400, 'Email and password are required');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Incorrect email or password');
    }
    respond(res, user);
  })
);

router.post(
  '/guest',
  asyncHandler(async (req, res) => {
    const user = await User.create({ name: 'Guest', isGuest: true });
    respond(res, user, 201);
  })
);

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;
