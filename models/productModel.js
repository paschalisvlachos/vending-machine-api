const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  amountAvailable: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,  // in cents
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
