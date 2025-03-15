const express = require('express');
const { body } = require('express-validator');
const { 
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  addAdministrator,
  removeAdministrator
} = require('../controllers/universityController');
const { protect, authorize, belongsToUniversity } = require('../middleware/auth');

const router = express.Router();

// University validation rules
const universityValidation = [
  body('name').notEmpty().withMessage('University name is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State/Province is required'),
  body('address.zipCode').notEmpty().withMessage('Zip/Postal code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('contact.email').isEmail().withMessage('Please include a valid email'),
  body('contact.phone').notEmpty().withMessage('Contact phone is required')
];

// Public routes
router.get('/', getUniversities);
router.get('/:id', getUniversity);

// Protected routes - Super Admin only
router.post(
  '/', 
  protect, 
  authorize('super-admin'), 
  universityValidation, 
  createUniversity
);

router.delete(
  '/:id', 
  protect, 
  authorize('super-admin'), 
  deleteUniversity
);

router.post(
  '/:id/administrators', 
  protect, 
  authorize('super-admin'), 
  addAdministrator
);

router.delete(
  '/:id/administrators/:userId', 
  protect, 
  authorize('super-admin'), 
  removeAdministrator
);

// Protected routes - University Admin or Super Admin
router.put(
  '/:id', 
  protect, 
  authorize('admin', 'super-admin'), 
  belongsToUniversity, 
  universityValidation, 
  updateUniversity
);

module.exports = router;