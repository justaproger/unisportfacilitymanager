const express = require('express');
const { body } = require('express-validator');
const { 
  getFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  getFacilitiesByUniversity
} = require('../controllers/facilityController');
const { protect, authorize, belongsToUniversity } = require('../middleware/auth');

const router = express.Router();

// Facility validation rules
const facilityValidation = [
  body('name').notEmpty().withMessage('Facility name is required'),
  body('university').isMongoId().withMessage('Valid university ID is required'),
  body('type').isIn([
    'football_field',
    'basketball_court',
    'tennis_court',
    'swimming_pool',
    'gym',
    'track_field',
    'volleyball_court',
    'other'
  ]).withMessage('Invalid facility type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('capacity').isNumeric().withMessage('Capacity must be a number'),
  body('pricePerHour').isNumeric().withMessage('Price per hour must be a number')
];

// Public routes
router.get('/', getFacilities);
router.get('/university/:universityId', getFacilitiesByUniversity);
router.get('/:id', getFacility);

// Protected routes - Admin or Super Admin
router.post(
  '/', 
  protect, 
  authorize('admin', 'super-admin'), 
  belongsToUniversity,
  facilityValidation, 
  createFacility
);

router.put(
  '/:id', 
  protect, 
  authorize('admin', 'super-admin'), 
  belongsToUniversity,
  facilityValidation, 
  updateFacility
);

router.delete(
  '/:id', 
  protect, 
  authorize('admin', 'super-admin'), 
  belongsToUniversity,
  deleteFacility
);

module.exports = router;