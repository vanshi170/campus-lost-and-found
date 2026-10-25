const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect private routes requiring valid JWT authentication.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'campus_lost_found_jwt_secret_key_2024';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account for this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
};

/**
 * Optional authentication: if a Bearer token is provided, attach req.user,
 * but do not throw 401 if unauthenticated. Used for public routes that reveal
 * extra info (like poster contact details) to logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'campus_lost_found_jwt_secret_key_2024';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
