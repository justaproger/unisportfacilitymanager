const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const qrCode = require('qrcode');
const { validationResult } = require('express-validator');
const { calculateTotalPrice, checkAvailability } = require('../services/bookingService.js');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getBookings = async (req, res, next) => {
  try {
    const { 
      university, 
      facility, 
      status, 
      date, 
      user: userId,
      startDate,
      endDate
    } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by university if provided
    if (university) {
      query.university = university;
    }
    
    // Filter by facility if provided
    if (facility) {
      query.facility = facility;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date if provided
    if (date) {
      // Get bookings for specific date
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    } else if (startDate && endDate) {
      // Get bookings within date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
    }
    
    // Filter by user if provided
    if (userId) {
      query.user = userId;
    }
    
    // If regular user, only show their own bookings
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    
    // If university admin, only show bookings from their university
    if (req.user.role === 'admin' && req.user.university) {
      query.university = req.user.university;
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('facility', 'name type')
      .populate('university', 'name')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('facility', 'name type description images location')
      .populate('university', 'name address contact');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view the booking
    if (
      req.user.role === 'user' && 
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super-admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
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
      facilityId, 
      universityId, 
      date, 
      startTime, 
      endTime 
    } = req.body;
    
    // Check if facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    // Parse date and time strings
    const bookingDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Calculate duration in minutes
    const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }
    
    // Check availability
    const isAvailable = await checkAvailability(
      facilityId,
      bookingDate,
      startTime,
      endTime
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }
    
    // Calculate total price
    const totalPrice = calculateTotalPrice(facility.pricePerHour, duration);
    
    // Create booking object
    const bookingData = {
      user: req.user.id,
      facility: facilityId,
      university: universityId || facility.university,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalPrice,
      currency: facility.currency,
      status: 'pending',
      paymentStatus: 'unpaid'
    };
    
    // Create booking
    const booking = await Booking.create(bookingData);
    
    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      facility: facility.name,
      date: bookingDate.toISOString().split('T')[0],
      time: `${startTime} - ${endTime}`
    });
    
    const qrCodeImage = await qrCode.toDataURL(qrData);
    
    // Update booking with QR code
    booking.qrCode = qrCodeImage;
    await booking.save();
    
    // Notify clients about new booking
    const io = req.app.get('io');
    io.to(`facility-${facilityId}`).emit('newBooking', {
      facilityId,
      date: bookingDate,
      startTime,
      endTime
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required'
      });
    }
    
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Update booking status
    booking.status = status;
    
    // If cancelling, add cancellation details
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user.id;
      booking.cancellationReason = req.body.cancellationReason || 'Cancelled by administrator';
    }
    
    // If completing, mark as checked in if not already
    if (status === 'completed' && !booking.checkedIn) {
      booking.checkedIn = true;
      booking.checkedInAt = new Date();
      booking.checkedInBy = req.user.id;
    }
    
    await booking.save();
    
    // Notify clients about updated booking
    const io = req.app.get('io');
    io.to(`facility-${booking.facility}`).emit('bookingUpdated', {
      bookingId: booking._id,
      status
    });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (by user)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user is authorized to cancel the booking
    if (
      req.user.role === 'user' && 
      booking.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Completed bookings cannot be cancelled'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.id;
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    
    await booking.save();
    
    // Notify clients about cancelled booking
    const io = req.app.get('io');
    io.to(`facility-${booking.facility}`).emit('bookingCancelled', {
      bookingId: booking._id
    });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in booking
// @route   PUT /api/bookings/:id/check-in
// @access  Private (Admin)
exports.checkInBooking = async (req, res, next) => {
  try {
    const { bookingCode } = req.body;
    
    // Find booking by ID or booking code
    const query = req.params.id.length === 24 
      ? { _id: req.params.id }
      : { bookingCode: req.params.id };
    
    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Verify booking code if provided
    if (bookingCode && booking.bookingCode !== bookingCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking code'
      });
    }
    
    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: `Cannot check in a booking with status: ${booking.status}`
      });
    }
    
    // Check if payment is completed
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment must be completed before check-in'
      });
    }
    
    // Update booking
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user.id;
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Get upcoming bookings
    if (upcoming === 'true') {
      const now = new Date();
      query.date = { $gte: now };
      query.status = { $in: ['pending', 'confirmed'] };
    }
    
    const bookings = await Booking.find(query)
      .populate('facility', 'name type images')
      .populate('university', 'name')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify booking by code
// @route   GET /api/bookings/verify/:code
// @access  Private (Admin)
exports.verifyBookingByCode = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingCode: req.params.code })
      .populate('user', 'firstName lastName email phone')
      .populate('facility', 'name type')
      .populate('university', 'name');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Invalid booking code'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a facility on a specific date
// @route   GET /api/bookings/availability/:facilityId/:date
// @access  Public
exports.getAvailability = async (req, res, next) => {
  try {
    const { facilityId, date } = req.params;
    
    // Check if facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    // Parse date
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    // Get day of the week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[searchDate.getDay()];
    
    // Check if facility is open on this day
    if (!facility.operatingHours[dayOfWeek].isOpen) {
      return res.status(200).json({
        success: true,
        message: 'Facility is closed on this day',
        data: {
          isOpen: false,
          availableSlots: []
        }
      });
    }
    
    // Get schedule for this date
    let schedule = await Schedule.findOne({
      facility: facilityId,
      date: searchDate
    });
    
    // If no schedule exists, create one based on operating hours
    if (!schedule) {
      const operatingHours = facility.operatingHours[dayOfWeek];
      
      // Generate time slots based on operating hours (1-hour slots)
      const slots = [];
      const [openHour, openMinute] = operatingHours.open.split(':').map(Number);
      const [closeHour, closeMinute] = operatingHours.close.split(':').map(Number);
      
      let currentHour = openHour;
      let currentMinute = openMinute;
      
      while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
        const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Advance by 1 hour
        currentMinute += 60;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
        
        // Skip if we've gone past closing time
        if (currentHour > closeHour || (currentHour === closeHour && currentMinute > closeMinute)) {
          break;
        }
        
        const endTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          startTime,
          endTime,
          isAvailable: true
        });
      }
      
      // Create schedule
      schedule = await Schedule.create({
        facility: facilityId,
        date: searchDate,
        slots
      });
    }
    
    // Get existing bookings for this date
    const bookings = await Booking.find({
      facility: facilityId,
      date: {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Mark slots as unavailable based on bookings
    const updatedSlots = schedule.slots.map(slot => {
      const isBooked = bookings.some(booking => {
        return (
          (booking.startTime <= slot.startTime && booking.endTime > slot.startTime) ||
          (booking.startTime < slot.endTime && booking.endTime >= slot.endTime) ||
          (booking.startTime >= slot.startTime && booking.endTime <= slot.endTime)
        );
      });
      
      return {
        ...slot.toObject(),
        isAvailable: slot.isAvailable && !isBooked
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        date: searchDate,
        isOpen: true,
        availableSlots: updatedSlots
      }
    });
  } catch (error) {
    next(error);
  }
};