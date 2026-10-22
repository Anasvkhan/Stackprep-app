const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

// Bumps the user's daily streak when they practice. Saves only when it changes.
async function touchStreak(user) {
  const today = dayKey();
  const s = user.streak || {};
  if (s.lastActiveDay === today) return;
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  s.current = s.lastActiveDay === yesterday ? (s.current || 0) + 1 : 1;
  s.best = Math.max(s.best || 0, s.current);
  s.lastActiveDay = today;
  user.streak = s;
  await user.save();
}

module.exports = { touchStreak, dayKey };
