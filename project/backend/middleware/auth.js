const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - only authenticated users can access
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'User account is inactive'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user belongs to university
exports.belongsToUniversity = async (req, res, next) => {
  const universityId = req.params.universityId || req.body.universityId;
  
  if (!universityId) {
    return next();
  }
  
  // Super-admin has access to all universities
  if (req.user.role === 'super-admin') {
    return next();
  }
  
  // Check if user is an admin of the university
  if (req.user.role === 'admin' && req.user.university && 
      req.user.university.toString() === universityId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Not authorized to access resources from this university'
  });
};