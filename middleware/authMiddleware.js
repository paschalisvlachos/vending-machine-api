const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const dotenv = require('dotenv');

dotenv.config();

const protect = async (req, res, next) => {
  let token;

  // Check for the JWT in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from the decoded token
      req.user = await User.findById(decoded.id).select('-password');

      // Check if the token is in the active sessions list
      if (!req.user.activeSessions.includes(token)) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

module.exports = { protect };
