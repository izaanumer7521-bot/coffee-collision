const mongoose = require('mongoose');
module.exports = mongoose.model('Flavour', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  extraPrice: { type: Number, default: 0, min: 0 },
  color: { type: String, default: '#b98a64' },
  available: { type: Boolean, default: true },
}, { timestamps: true }));
