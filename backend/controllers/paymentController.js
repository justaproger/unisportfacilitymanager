const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create payment intent (Stripe)
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    
    // Validate booking ID
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }
    
    // Find booking
    const booking = await Booking.findById(bookingId).populate('facility', 'name');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to pay for this booking'
      });
    }
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already paid'
      });
    }
    
    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot pay for a cancelled booking'
      });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        facilityName: booking.facility.name
      }
    });
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId, paymentMethod } = req.body;
    
    // Validate required fields
    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID and Payment Intent ID are required'
      });
    }
    
    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to confirm payment for this booking'
      });
    }
    
    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: `Payment not successful. Status: ${paymentIntent.status}`
      });
    }
    
    // Check if payment matches booking
    if (paymentIntent.metadata.bookingId !== bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Payment does not match booking'
      });
    }
    
    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: booking.totalPrice,
      currency: booking.currency,
      paymentMethod: paymentMethod || 'credit_card',
      status: 'completed',
      transactionId: paymentIntentId,
      paymentProcessorResponse: paymentIntent
    });
    
    // Update booking
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = payment._id;
    await booking.save();
    
    // Notify clients about payment
    const io = req.app.get('io');
    io.to(`facility-${booking.facility}`).emit('bookingPaid', {
      bookingId: booking._id
    });
    
    res.status(200).json({
      success: true,
      data: {
        booking,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    // Check if payment belongs to user
    if (
      payment.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res, next) => {
  try {
    const { reason, amount } = req.body;
    
    // Find payment
    const payment = await Payment.findById(req.params.id)
      .populate('booking');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    // Check if payment is already refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: 'Payment is already refunded'
      });
    }
    
    // Determine refund amount
    const refundAmount = amount || payment.amount;
    
    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId,
      amount: Math.round(refundAmount * 100) // Convert to cents
    });
    
    // Update payment
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = reason || 'Refunded by administrator';
    payment.refundedAt = new Date();
    payment.refundTransactionId = refund.id;
    await payment.save();
    
    // Update booking
    const booking = payment.booking;
    booking.paymentStatus = 'refunded';
    
    // If booking is not completed, also mark as cancelled
    if (booking.status !== 'completed') {
      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user.id;
      booking.cancellationReason = 'Cancelled due to refund';
    }
    
    await booking.save();
    
    // Notify clients about refund
    const io = req.app.get('io');
    io.to(`facility-${booking.facility}`).emit('paymentRefunded', {
      bookingId: booking._id
    });
    
    res.status(200).json({
      success: true,
      data: {
        payment,
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payments
// @route   GET /api/payments/user
// @access  Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('booking', 'facility date startTime endTime')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook for Stripe events
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      // Add other event types as needed
    }
    
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// Helper function to handle successful payments
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No booking ID in payment intent metadata');
      return;
    }
    
    // Check if payment already processed
    const existingPayment = await Payment.findOne({
      transactionId: paymentIntent.id
    });
    
    if (existingPayment) {
      console.log('Payment already processed');
      return;
    }
    
    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error('Booking not found for payment intent');
      return;
    }
    
    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: booking.user,
      amount: booking.totalPrice,
      currency: booking.currency,
      paymentMethod: 'credit_card',
      status: 'completed',
      transactionId: paymentIntent.id,
      paymentProcessorResponse: paymentIntent
    });
    
    // Update booking
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = payment._id;
    await booking.save();
    
    // Notify clients about payment
    const io = require('../app').get('io');
    if (io) {
      io.to(`facility-${booking.facility}`).emit('bookingPaid', {
        bookingId: booking._id
      });
    }
  } catch (error) {
    console.error('Error handling payment succeeded webhook:', error);
  }
};

// Helper function to handle failed payments
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No booking ID in payment intent metadata');
      return;
    }
    
    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.error('Booking not found for payment intent');
      return;
    }
    
    // Create payment record for failed payment
    await Payment.create({
      booking: bookingId,
      user: booking.user,
      amount: booking.totalPrice,
      currency: booking.currency,
      paymentMethod: 'credit_card',
      status: 'failed',
      transactionId: paymentIntent.id,
      paymentProcessorResponse: paymentIntent
    });
    
    // Notify clients about payment failure
    const io = require('../app').get('io');
    if (io) {
      io.to(`user-${booking.user}`).emit('paymentFailed', {
        bookingId: booking._id,
        message: 'Payment failed. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error handling payment failed webhook:', error);
  }
};