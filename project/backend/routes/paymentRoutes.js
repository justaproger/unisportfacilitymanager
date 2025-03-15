const express = require('express');
const { body } = require('express-validator');
const { 
  createPaymentIntent,
  confirmPayment,
  getPayment,
  processRefund,
  getUserPayments,
  handleWebhook
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public webhook route (Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes - Any authenticated user
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/user', protect, getUserPayments);

// Protected routes - Admin only
router.post(
  '/:id/refund',
  protect,
  authorize('admin', 'super-admin'),
  processRefund
);

// Routes accessible by payment owner or admin
router.get('/:id', protect, getPayment);

module.exports = router;