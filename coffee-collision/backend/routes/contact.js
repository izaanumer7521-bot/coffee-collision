const router = require('express').Router();
const Message = require('../models/Message');
const log = require('../utils/activity');
const { protect, adminOnly } = require('../middleware/auth');
router.post('/', async (req, res) => {
  try { const m = await Message.create(req.body); log(null, 'created', 'message', m.name, m.email); res.status(201).json({ message: 'Message sent. We will reply by email.' }); }
  catch (e) { res.status(400).json({ message: 'Name, email and message are required.' }); }
});
router.get('/', protect, adminOnly, async (req, res) => res.json(await Message.find().sort('-createdAt')));
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const m = await Message.findByIdAndDelete(req.params.id);
  if (m) log(req.user, 'deleted', 'message', m.name);
  res.json({ message: 'Message deleted.' });
});
module.exports = router;
