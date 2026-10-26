const crypto = require('crypto');
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendMail, maskEmail } = require('../utils/mailer');
const { protect, signToken } = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password reset is a target for guessing and email spam: keep it tight per IP.
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many requests. Please try again in a few minutes.' },
});

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

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

// ----- Forgot password: 6-digit code sent by email -----

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_AFTER_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;
const RESET_FIELDS = '+resetCode.hash +resetCode.expiresAt +resetCode.sentAt +resetCode.attempts';
const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

// Same answer whether or not the email exists, so this can't be used to find accounts.
const SENT_MESSAGE = 'If this email is registered, a 6-digit code has been sent to it.';

// POST /api/auth/forgot-password  { email }
router.post(
  '/forgot-password',
  resetLimiter,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Valid email is required');

    const user = await User.findOne({ email }).select(RESET_FIELDS);
    const recentlySent = user?.resetCode?.sentAt && Date.now() - user.resetCode.sentAt.getTime() < RESEND_AFTER_MS;
    // Server-side only: the client always gets the same answer.
    if (!user) console.log(`[forgot-password] no account for ${maskEmail(email)}, nothing sent`);
    else if (recentlySent) console.log(`[forgot-password] code for ${maskEmail(email)} was sent under a minute ago, not resending`);
    if (user && !recentlySent) {
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      user.resetCode = {
        hash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
        sentAt: new Date(),
        attempts: 0,
      };
      await user.save();
      try {
        await sendMail({
          to: user.email,
          subject: `${code} is your StackPrep password reset code`,
          params: { to_name: user.name, code },
          text: `Hi ${user.name},\n\nYour StackPrep password reset code is ${code}.\nIt expires in 10 minutes.\n\nIf you didn't ask to reset your password, you can ignore this email.`,
          html: `<p>Hi ${escapeHtml(user.name)},</p><p>Your StackPrep password reset code is</p><p style="font-size:28px;font-weight:700;letter-spacing:6px;font-family:monospace">${code}</p><p>It expires in 10 minutes.</p><p style="color:#64748b">If you didn't ask to reset your password, you can ignore this email.</p>`,
        });
      } catch (err) {
        // The email never left: drop the code so the user can retry right away.
        user.resetCode = undefined;
        await user.save();
        throw err;
      }
    }
    res.json({ message: SENT_MESSAGE });
  })
);

// POST /api/auth/reset-password  { email, code, password }
router.post(
  '/reset-password',
  resetLimiter,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const code = String(req.body?.code || '').trim();
    const { password } = req.body || {};
    if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Valid email is required');
    if (!/^\d{6}$/.test(code)) throw new ApiError(400, 'Enter the 6-digit code from the email');
    if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

    const invalid = new ApiError(400, 'This code is invalid or has expired. Request a new one.');
    const user = await User.findOne({ email }).select(RESET_FIELDS);
    const rc = user?.resetCode;
    if (!rc?.hash || !rc.expiresAt || rc.expiresAt.getTime() < Date.now()) throw invalid;
    if (rc.attempts >= MAX_CODE_ATTEMPTS) {
      throw new ApiError(400, 'Too many wrong attempts. Request a new code.');
    }

    const given = Buffer.from(hashCode(code));
    if (!crypto.timingSafeEqual(given, Buffer.from(rc.hash))) {
      user.resetCode.attempts = rc.attempts + 1;
      await user.save();
      const left = MAX_CODE_ATTEMPTS - user.resetCode.attempts;
      throw new ApiError(400, left > 0 ? `Incorrect code. ${left} attempt(s) left.` : 'Too many wrong attempts. Request a new code.');
    }

    user.password = password;
    user.passwordChangedAt = new Date();
    user.resetCode = undefined;
    await user.save();
    res.json({ message: 'Password updated. Please login with your new password.' });
  })
);

module.exports = router;
