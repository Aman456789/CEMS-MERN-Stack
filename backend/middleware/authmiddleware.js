const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
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
      message: 'Access denied. No authentication token provided.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    return res.status(401).json({
      success: false,
      message: jwtError.name === 'TokenExpiredError' 
        ? 'Your session has expired. Please log in again.' 
        : 'Invalid authentication token. Please log in again.',
    });
  }

  const currentUser = await User.findById(decoded.id).select('-password');

  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'The account associated with this token no longer exists.',
    });
  }

  req.user = currentUser;

  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. Your role ('${req.user.role}') is not authorized to perform this action. Required: ${roles.join(' or ')}.`
      );
    }
    next();
  };
};

const optionalProtect = asyncHandler(async (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    req.user = null;
  }

  next();
});

module.exports = { protect, authorize, optionalProtect };