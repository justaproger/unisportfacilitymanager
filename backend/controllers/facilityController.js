const Facility = require('../models/Facility');
const University = require('../models/University');
const { validationResult } = require('express-validator');

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public
exports.getFacilities = async (req, res, next) => {
  try {
    const { university, type } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add university filter if provided
    if (university) {
      query.university = university;
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    const facilities = await Facility.find(query)
      .populate('university', 'name address.city logo');
    
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single facility
// @route   GET /api/facilities/:id
// @access  Public
exports.getFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('university', 'name address logo contact');
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new facility
// @route   POST /api/facilities
// @access  Private (Admin)
exports.createFacility = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Check if university exists
    const university = await University.findById(req.body.university);
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    // Create facility
    const facility = await Facility.create(req.body);
    
    // Notify clients about new facility
    const io = req.app.get('io');
    io.to(`university-${facility.university}`).emit('newFacility', facility);
    
    res.status(201).json({
      success: true,
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Private (Admin)
exports.updateFacility = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    let facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    // Update facility
    facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Notify clients about updated facility
    const io = req.app.get('io');
    io.to(`facility-${facility._id}`).emit('facilityUpdated', facility);
    
    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete facility (soft delete by setting isActive to false)
// @route   DELETE /api/facilities/:id
// @access  Private (Admin)
exports.deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    // Soft delete by setting isActive to false
    facility.isActive = false;
    await facility.save();
    
    // Notify clients about deleted facility
    const io = req.app.get('io');
    io.to(`university-${facility.university}`).emit('facilityDeleted', facility._id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get facilities by university
// @route   GET /api/facilities/university/:universityId
// @access  Public
exports.getFacilitiesByUniversity = async (req, res, next) => {
  try {
    const { universityId } = req.params;
    const { type } = req.query;
    
    // Build query
    const query = { 
      university: universityId,
      isActive: true 
    };
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    const facilities = await Facility.find(query);
    
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    next(error);
  }
};