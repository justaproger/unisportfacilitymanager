const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with pagination and filtering)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { 
      role, 
      university, 
      search,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Filter by role if provided
    if (role) {
      query.role = role;
    }
    
    // Filter by university if provided
    if (university) {
      query.university = university;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // If university admin, only show users from their university
    if (req.user.role === 'admin' && req.user.university) {
      query.university = req.user.university;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Find users
    const users = await User.find(query)
      .populate('university', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('university', 'name address');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user is authorized to view this user
    if (
      req.user.role === 'user' && 
      req.user.id !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user'
      });
    }
    
    // If university admin, can only view users from their university
    if (
      req.user.role === 'admin' && 
      req.user.university &&
      user.university &&
      req.user.university.toString() !== user.university._id.toString() &&
      req.user.id !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view users from other universities'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (admin only)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      phone, 
      university 
    } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // If university admin, can only create users for their university
    if (
      req.user.role === 'admin' && 
      req.user.university &&
      university && 
      req.user.university.toString() !== university
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create users for other universities'
      });
    }
    
    // Regular admin can't create super-admin
    if (req.user.role === 'admin' && role === 'super-admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create super-admin users'
      });
    }
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user',
      phone,
      university
    });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
exports.updateUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Find user
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user is authorized to update this user
    if (
      req.user.role === 'user' && 
      req.user.id !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }
    
    // If university admin, can only update users from their university
    if (
      req.user.role === 'admin' && 
      req.user.university &&
      user.university &&
      req.user.university.toString() !== user.university.toString() &&
      req.user.id !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update users from other universities'
      });
    }
    
    // Regular users and admins can't change role or university
    if (req.user.role !== 'super-admin' && req.user.id !== req.params.id) {
      delete req.body.role;
      delete req.body.university;
    }
    
    // Regular users can only update their personal info
    if (req.user.role === 'user' && req.user.id === req.params.id) {
      delete req.body.role;
      delete req.body.university;
      delete req.body.isActive;
    }
    
    // Hash password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    
    // Update user
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (soft delete by setting isActive to false)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user is authorized to delete this user
    if (req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete users'
      });
    }
    
    // If university admin, can only delete users from their university
    if (
      req.user.role === 'admin' && 
      req.user.university &&
      user.university &&
      req.user.university.toString() !== user.university.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete users from other universities'
      });
    }
    
    // Regular admin can't delete super-admin
    if (req.user.role === 'admin' && user.role === 'super-admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete super-admin users'
      });
    }
    
    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private (Self only)
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    // Check if user is authorized
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user\'s password'
      });
    }
    
    // Find user
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password (admin)
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password is required'
      });
    }
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if admin is authorized
    if (req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reset passwords'
      });
    }
    
    // If university admin, can only reset passwords for users from their university
    if (
      req.user.role === 'admin' && 
      req.user.university &&
      user.university &&
      req.user.university.toString() !== user.university.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reset passwords for users from other universities'
      });
    }
    
    // Regular admin can't reset super-admin password
    if (req.user.role === 'admin' && user.role === 'super-admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reset super-admin password'
      });
    }
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get university administrators
// @route   GET /api/users/administrators/:universityId
// @access  Private (Admin)
exports.getUniversityAdmins = async (req, res, next) => {
  try {
    const { universityId } = req.params;
    
    // If university admin, can only view admins from their university
    if (
      req.user.role === 'admin' && 
      req.user.university &&
      req.user.university.toString() !== universityId
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view administrators from other universities'
      });
    }
    
    // Find administrators
    const admins = await User.find({
      university: universityId,
      role: 'admin',
      isActive: true
    }).select('firstName lastName email phone');
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};