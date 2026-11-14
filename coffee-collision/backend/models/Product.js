const mongoose = require('mongoose');
module.exports = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },                         // URL shown on the site
  imageData: { type: String, select: false },                   // uploaded picture (data URL), served by /api/products/:id/image
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  flavours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flavour' }],
  featured: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
}, { timestamps: true }));
