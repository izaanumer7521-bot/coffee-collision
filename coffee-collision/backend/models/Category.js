const mongoose = require('mongoose');
module.exports = mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameAr: { type: String, default: '', trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  position: { type: Number, default: 0 },
}, { timestamps: true }));
