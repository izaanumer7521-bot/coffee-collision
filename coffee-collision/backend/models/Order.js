const mongoose = require('mongoose');
module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  milk: { type: String, default: 'whole' },
  sweetness: { type: Number, min: 0, max: 5, default: 2 },
  notes: { type: String, default: '' },
  total: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'brewing', 'ready', 'delivered', 'cancelled'], default: 'placed' },
}, { timestamps: true }));
