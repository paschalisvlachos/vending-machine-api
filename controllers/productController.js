const Product = require('../models/productModel');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a product (Seller only)
const createProduct = async (req, res) => {
  const { productName, amountAvailable, cost } = req.body;

  try {
    const product = new Product({
      productName,
      amountAvailable,
      cost,
      sellerId: req.user._id,  // sellerId is the logged-in seller
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update product (Seller only)
const updateProduct = async (req, res) => {
  const { productName, amountAvailable, cost } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the owner of the product
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    product.productName = productName || product.productName;
    product.amountAvailable = amountAvailable || product.amountAvailable;
    product.cost = cost || product.cost;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete product (Seller only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the owner of the product
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
