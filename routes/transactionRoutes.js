const express = require('express');
const { depositCoins, buyProduct, resetDeposit } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Deposit coins (Buyer only)
router.post('/deposit', protect, authorizeRoles('buyer'), depositCoins);

// Buy product (Buyer only)
router.post('/buy', protect, authorizeRoles('buyer'), buyProduct);

// Reset deposit (Buyer only)
router.post('/reset', protect, authorizeRoles('buyer'), resetDeposit);

module.exports = router;
