const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
  if (process.env.NODE_ENV === 'production' && secret === 'your_jwt_secret') {
    throw new Error('Default JWT_SECRET detected in production. Please use a secure secret.');
  }
  return secret;
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const jwtSecret = validateJWTSecret();
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
