const University = require('../models/University');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

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

// Process form data for multipart/form-data requests
const processFormData = (req) => {
  // Create a new object to store processed data
  const processedData = {};
  
  // Copy basic fields
  for (const key in req.body) {
    if (!key.includes('.') && !key.includes('[') && key !== 'administrators[]') {
      processedData[key] = req.body[key];
    }
  }
  
  // Handle nested address fields
  processedData.address = {
    street: req.body['address.street'] || req.body['address[street]'] || '',
    city: req.body['address.city'] || req.body['address[city]'] || '',
    state: req.body['address.state'] || req.body['address[state]'] || '',
    zipCode: req.body['address.zipCode'] || req.body['address[zipCode]'] || '',
    country: req.body['address.country'] || req.body['address[country]'] || ''
  };
  
  // Handle nested contact fields
  processedData.contact = {
    email: req.body['contact.email'] || req.body['contact[email]'] || '',
    phone: req.body['contact.phone'] || req.body['contact[phone]'] || '',
    website: req.body['contact.website'] || req.body['contact[website]'] || ''
  };
  
  // Handle administrators array
  if (req.body.administrators) {
    processedData.administrators = Array.isArray(req.body.administrators) 
      ? req.body.administrators 
      : [req.body.administrators];
  } else if (req.body['administrators[]']) {
    processedData.administrators = Array.isArray(req.body['administrators[]']) 
      ? req.body['administrators[]'] 
      : [req.body['administrators[]']];
  }
  
  // Handle isActive boolean field
  if (req.body.isActive !== undefined) {
    // Convert string to boolean
    processedData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  }
  
  // Add logo file path if uploaded
  if (req.file) {
    // Create file URL
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    processedData.logo = logoUrl;
  }
  
  return processedData;
};

// @desc    Create new university
// @route   POST /api/universities
// @access  Private (Super Admin)
exports.createUniversity = async (req, res, next) => {
  try {
    // For multipart/form-data requests, process the data
    const universityData = processFormData(req);
    
    // Check for validation errors only for non-multipart requests
    if (!req.file) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
    }
    
    // Create university
    const university = await University.create(universityData);
    
    res.status(201).json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Error creating university:', error);
    next(error);
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private (Super Admin, University Admin)
exports.updateUniversity = async (req, res, next) => {
  try {
    // For multipart/form-data requests, process the data
    const updateData = processFormData(req);
    
    // Check for validation errors only for non-multipart requests
    if (!req.file) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
    }
    
    let university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found'
      });
    }
    
    // Regular admin can't update administrators list
    if (req.user.role === 'admin' && updateData.administrators) {
      delete updateData.administrators;
    }
    
    // If uploading a new logo, remove the old one if it exists
    if (req.file && university.logo) {
      try {
        const oldLogoPath = path.join(__dirname, '..', university.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      } catch (err) {
        console.error('Error removing old logo:', err);
      }
    }
    
    // Update university
    university = await University.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Error updating university:', error);
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