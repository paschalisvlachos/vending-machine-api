const Product = require('../models/productModel');
const User = require('../models/userModel');
const { isValidCoin, calculateChange } = require('../utils/coinUtil');

// Deposit coins (Buyer only)
const depositCoins = async (req, res) => {
  const { coins } = req.body;  // array of coins to deposit

  try {
    // Ensure all coins are valid
    if (!coins.every(isValidCoin)) {
      return res.status(400).json({ message: 'Invalid coin denomination' });
    }

    // Calculate the total deposit amount
    const totalDeposit = coins.reduce((sum, coin) => sum + coin, 0);

    // Add deposit to the user's account
    req.user.deposit += totalDeposit;
    await req.user.save();

    res.json({ message: 'Deposit successful', totalDeposit: req.user.deposit });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Buy products (Buyer only)
const buyProduct = async (req, res) => {
  const { productId, amount } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product || amount <= 0) {
      return res.status(400).json({ message: 'Invalid product or amount' });
    }

    // Check if there is enough stock
    if (product.amountAvailable < amount) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Calculate the total cost
    const totalCost = product.cost * amount;

    // Check if the user has enough deposit
    if (req.user.deposit < totalCost) {
      return res.status(400).json({ message: 'Insufficient deposit' });
    }

    // Deduct the amount from user's deposit
    req.user.deposit -= totalCost;

    // Update product stock
    product.amountAvailable -= amount;
    await product.save();

    // Calculate and return change if any
    const change = calculateChange(req.user.deposit);

    // Reset user's deposit to 0 after purchase
    req.user.deposit = 0;
    await req.user.save();

    res.json({
      message: 'Purchase successful',
      totalSpent: totalCost,
      productsPurchased: {
        productName: product.productName,
        amount,
      },
      change,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reset deposit (Buyer only)
const resetDeposit = async (req, res) => {
  try {
    req.user.deposit = 0;
    await req.user.save();

    res.json({ message: 'Deposit has been reset to 0' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { depositCoins, buyProduct, resetDeposit };
