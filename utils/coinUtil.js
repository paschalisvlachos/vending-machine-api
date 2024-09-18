const validCoins = [5, 10, 20, 50, 100];  // Valid coin denominations

// Function to validate if the deposited coins are valid
const isValidCoin = (coin) => validCoins.includes(coin);

// Function to calculate change in coins
const calculateChange = (changeAmount) => {
  const change = {};
  let remainingAmount = changeAmount;

  // Calculate the number of each coin denomination
  for (const coin of validCoins.reverse()) {
    change[coin] = Math.floor(remainingAmount / coin);
    remainingAmount = remainingAmount % coin;
  }

  return change;
};

module.exports = { isValidCoin, calculateChange };
