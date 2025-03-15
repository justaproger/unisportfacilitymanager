const express = require('express');
const { body } = require('express-validator');
const { 
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  checkInBooking,
  getUserBookings,
  verifyBookingByCode,
  getAvailability
} = require('../controllers/bookingController');
const { protect, authorize, belongsToUniversity } = require('../middleware/auth');

const router = express.Router();

// Booking validation rules
const bookingValidation = [
  body('facilityId').isMongoId().withMessage('Valid facility ID is required'),
  body('universityId').isMongoId().withMessage('Valid university ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time is required (HH:MM format)'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid end time is required (HH:MM format)')
];

// Public routes
router.get('/availability/:facilityId/:date', getAvailability);

// Protected routes - Any authenticated user
router.get('/user', protect, getUserBookings);
router.post('/', protect, bookingValidation, createBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Protected routes - Admin only
router.get('/', protect, authorize('admin', 'super-admin'), getBookings);
router.get('/verify/:code', protect, authorize('admin', 'super-admin'), verifyBookingByCode);
router.put('/:id/status', protect, authorize('admin', 'super-admin'), updateBookingStatus);
router.put('/:id/check-in', protect, authorize('admin', 'super-admin'), checkInBooking);

// Routes accessible by booking owner or admin
router.get('/:id', protect, getBooking);

module.exports = router;