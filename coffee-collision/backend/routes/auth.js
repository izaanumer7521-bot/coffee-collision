const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const log = require('../utils/activity');
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'That email is already registered.' });
    const user = await User.create({ name, email, password });
    log(user, 'registered', 'account', user.name, user.email);
    res.status(201).json({ token: sign(user), user: out(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await user.matches(req.body.password || ''))) return res.status(401).json({ message: 'Wrong email or password.' });
    if (user.role === 'admin') await log(user, 'signed-in', 'account', user.name, 'Admin sign in');
    res.json({ token: sign(user), user: out(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', protect, (req, res) => res.json({ user: out(req.user) }));

// change name / email (needs the current password)
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, currentPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matches(currentPassword || ''))) return res.status(401).json({ message: 'Current password is wrong.' });
    const changes = [];
    if (name && name.trim() && name.trim() !== user.name) { user.name = name.trim(); changes.push('name'); }
    if (email && email.toLowerCase().trim() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ message: 'That email is already used by another account.' });
      user.email = email.toLowerCase().trim(); changes.push('email');
    }
    if (!changes.length) return res.json({ user: out(user), message: 'Nothing to change.' });
    await user.save();
    log(user, changes.includes('email') ? 'email' : 'updated', 'account', user.name, `Changed ${changes.join(' and ')}`);
    res.json({ user: out(user), message: 'Profile updated.' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    const user = await User.findById(req.user._id);
    if (!(await user.matches(currentPassword || ''))) return res.status(401).json({ message: 'Current password is wrong.' });
    user.password = newPassword;
    await user.save();
    log(user, 'password', 'account', user.name, 'Password changed');
    res.json({ message: 'Password changed.' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
