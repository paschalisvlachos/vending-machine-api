const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public route: Get all products
router.get('/', getProducts);

// Public route: Get product by ID
router.get('/:id', getProductById);

// Seller routes (authenticated)
router.post('/', protect, authorizeRoles('seller'), createProduct);
router.put('/:id', protect, authorizeRoles('seller'), updateProduct);
router.delete('/:id', protect, authorizeRoles('seller'), deleteProduct);

module.exports = router;
