const University = require('../models/University');
const { validationResult } = require('express-validator');

// @desc    Get all universities
// @route   GET /api/universities
// @access  Public
exports.getUniversities = async (req, res, next) => {
  try {
    const universities = await University.find({ isActive: true })
      .select('name address.city address.country logo');
    
    res.status(200).json({
      success: true,
      count: universities.length,
      data: universities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single university
// @route   GET /api/universities/:id
// @access  Public
exports.getUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id)
      .populate({
        path: 'facilities',
        select: 'name type description images pricePerHour'
      });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new university
// @route   POST /api/universities
// @access  Private (Super Admin)
exports.createUniversity = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Create university
    const university = await University.create(req.body);
    
    res.status(201).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private (Super Admin, University Admin)
exports.updateUniversity = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    let university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    // Regular admin can't update administrators list
    if (req.user.role === 'admin' && req.body.administrators) {
      delete req.body.administrators;
    }
    
    // Update university
    university = await University.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete university (soft delete by setting isActive to false)
// @route   DELETE /api/universities/:id
// @access  Private (Super Admin)
exports.deleteUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    // Soft delete by setting isActive to false
    university.isActive = false;
    await university.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add university administrator
// @route   POST /api/universities/:id/administrators
// @access  Private (Super Admin)
exports.addAdministrator = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    // Check if user is already an administrator
    if (university.administrators.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already an administrator for this university'
      });
    }
    
    // Add user to administrators array
    university.administrators.push(userId);
    await university.save();
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove university administrator
// @route   DELETE /api/universities/:id/administrators/:userId
// @access  Private (Super Admin)
exports.removeAdministrator = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    // Remove user from administrators array
    university.administrators = university.administrators.filter(
      admin => admin.toString() !== req.params.userId
    );
    
    await university.save();
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};