const router = require('express').Router();
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { protect, signToken } = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const respond = (res, user, status = 200) =>
  res.status(status).json({ token: signToken(user), user });

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !name.trim()) throw new ApiError(400, 'Name is required');
    if (!email || !EMAIL_RE.test(email)) throw new ApiError(400, 'Valid email is required');
    if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

    const exists = await User.exists({ email: email.toLowerCase() });
    if (exists) throw new ApiError(409, 'Email is already registered');

    const user = await User.create({ name: name.trim(), email, password });
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

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;
