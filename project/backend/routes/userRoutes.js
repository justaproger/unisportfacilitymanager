const express = require('express');
const { body } = require('express-validator');
const { 
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  resetPassword,
  getUniversityAdmins
} = require('../controllers/userController');
const { protect, authorize, belongsToUniversity } = require('../middleware/auth');

const router = express.Router();

// User validation rules
const userValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .optional({ nullable: true })
];

// Protected routes - Admin only
router.get('/', protect, authorize('admin', 'super-admin'), getUsers);
router.post(
  '/', 
  protect, 
  authorize('admin', 'super-admin'), 
  userValidation, 
  createUser
);
router.delete(
  '/:id', 
  protect, 
  authorize('admin', 'super-admin'), 
  deleteUser
);
router.put(
  '/:id/reset-password', 
  protect, 
  authorize('admin', 'super-admin'), 
  resetPassword
);
router.get(
  '/administrators/:universityId', 
  protect, 
  authorize('admin', 'super-admin'), 
  belongsToUniversity,
  getUniversityAdmins
);

// Protected routes - Self or Admin
router.get(
  '/:id', 
  protect, 
  getUser
);
router.put(
  '/:id', 
  protect, 
  userValidation.filter(rule => rule.path !== 'password'), 
  updateUser
);

// Protected routes - Self only
router.put(
  '/:id/password', 
  protect, 
  updatePassword
);

module.exports = router;